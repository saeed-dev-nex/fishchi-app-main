import asyncHandler from 'express-async-handler';
import otpGenerator from 'otp-generator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.model.js';
import ApiResponse from '../utils/apiResponse.js';
import sendEmail from '../utils/sendEmail.js';
import { activationEmailTemplate } from '../utils/activationEmailTemplate.js';
import generateToken from '../utils/generateToken.js';

// <-------------- Register Handler --------------------->
/**
 * @desc Register new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  console.log('------- register user begin ---------');

  const { name, email, password } = req.body;
  console.log('name', name);
  console.log('email', email);
  console.log('password', password);
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('لطفاً تمام اطلاعات خواسته شده را پر کنید');
  }
  const userExists = await User.findOne({ email });
  console.log('userExists', userExists);
  if (userExists) {
    res.status(400);
    throw new Error('ایمیل قبلاً ثبت شده است');
  }
  const user = new User({ name, email, password });
  const code = otpGenerator.generate(8, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  user.verificationCode = code;
  user.verificationCodeExpires = Date.now() + 60 * 60 * 1000; // 10 Min Valid code
  await user.save();

  sendEmail({
    to: user.email,
    subject: 'کد فعالسازی',
    text: `کد فعالسازی شما: ${code}`,
    html: activationEmailTemplate(user.name, user.email, code),
  });

  ApiResponse.success(
    res,
    null,
    'حساب کاربری شما با موفقیت ایجاد شد لطفا برای کد فعالسازی به ایمیل خود مراجعه کنید',
    201
  );
});

// <-------------- Verify Email Handler --------------------->
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400);
    throw new Error('ایمیل و کد فعالسازی الزامی است');
  }
  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() },
  }).select('+verificationCode, +verificationCodeExpires');
  if (!user) {
    res.status(400);
    throw new Error('کد فعالسازی نا معتبر یا منقضی شده است');
  }
  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;

  const token = generateToken(user._id);
  await user.save();
  res.cookie('token', token, {
    httpOnly: true, //Anti XSS blocking access to js
    secure: process.env.NODE_ENV === 'production', // in Product mode only send HTTPS
    sameSite: 'strict', //Anti CSRF Attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    // maxAge: 10 * 60 * 1000, // 10 minutes
  });
  ApiResponse.success(
    res,
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    'حساب کاربری شما با موفقیت فعال شد'
  );
});
// <-------------- Login Handler --------------------->

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('لطفاً تمام اطلاعات خواسته شده را پر کنید');
  }
  const user = await User.findOne({ email }).select('+isVerified');
  if (!user) {
    res.status(400);
    throw new Error('ایمیل یا رمز عبور اشتباه است');
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(400);
    throw new Error('ایمیل یا رمز عبور اشتباه است');
  }
  if (user && isMatch) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error(
        'حساب کاربری شما فعال نشده است لطفاً ایمیل خود را بررسی کنید'
      );
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    ApiResponse.success(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      'Login successful'
    );
  }
});

// @desc    دریافت پروفایل کاربر
// @route   GET /api/users/profile
// @access  Private (خصوصی)
const getUserProfile = asyncHandler(async (req, res) => {
  // middleware ما قبلاً کاربر را پیدا کرده و در req.user قرار داده است
  const user = req.user;

  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  ApiResponse.success(res, {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    university: user.university,
    fieldOfStudy: user.fieldOfStudy,
    degree: user.degree,
    bio: user.bio,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  });
});

// @desc    بروزرسانی پروفایل کاربر
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, university, fieldOfStudy, degree, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  // Update fields
  if (name) user.name = name;
  if (university !== undefined) user.university = university;
  if (fieldOfStudy !== undefined) user.fieldOfStudy = fieldOfStudy;
  if (degree !== undefined) user.degree = degree;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  ApiResponse.success(
    res,
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      university: user.university,
      fieldOfStudy: user.fieldOfStudy,
      degree: user.degree,
      bio: user.bio,
      isVerified: user.isVerified,
    },
    'پروفایل با موفقیت بروزرسانی شد'
  );
});

// @desc    تغییر رمز عبور
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('رمز عبور فعلی و جدید الزامی است');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('رمز عبور فعلی اشتباه است');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'رمز عبور با موفقیت تغییر کرد');
});

// @desc    آپلود عکس پروفایل
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('فایل عکس الزامی است');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  // Delete old avatar if exists
  if (user.avatar) {
    const oldAvatarPath = path.join(
      process.cwd(),
      'uploads',
      'avatars',
      user.avatar
    );
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  // Update avatar path
  user.avatar = req.file.filename;
  await user.save();

  ApiResponse.success(
    res,
    {
      avatar: user.avatar,
      avatarUrl: `/uploads/avatars/${user.avatar}`,
    },
    'عکس پروفایل با موفقیت آپلود شد'
  );
});

// @desc    حذف عکس پروفایل
// @route   DELETE /api/users/avatar
// @access  Private
const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  // Delete avatar file if exists
  if (user.avatar) {
    const avatarPath = path.join(
      process.cwd(),
      'uploads',
      'avatars',
      user.avatar
    );
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
  }

  // Remove avatar from user
  user.avatar = null;
  await user.save();

  ApiResponse.success(res, null, 'عکس پروفایل با موفقیت حذف شد');
});

// <-------------- Forgot Password Handler --------------------->
/**
 * @desc Send reset password code to user email
 * @route POST /api/v1/users/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('ایمیل الزامی است');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('کاربری با این ایمیل یافت نشد');
  }

  // Generate reset code
  const resetCode = otpGenerator.generate(8, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // Set reset code and expiration (10 minutes)
  user.resetPasswordCode = resetCode;
  user.resetPasswordCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send email with reset code
  sendEmail({
    to: user.email,
    subject: 'کد بازیابی رمز عبور',
    text: `کد بازیابی رمز عبور شما: ${resetCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">بازیابی رمز عبور</h2>
        <p>سلام ${user.name}،</p>
        <p>درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شده است.</p>
        <p>کد بازیابی شما:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
          ${resetCode}
        </div>
        <p>این کد تا ۱۰ دقیقه معتبر است.</p>
        <p>اگر شما این درخواست را نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">این ایمیل به صورت خودکار ارسال شده است.</p>
      </div>
    `,
  });

  ApiResponse.success(res, null, 'کد بازیابی رمز عبور به ایمیل شما ارسال شد');
});

// <-------------- Reset Password Handler --------------------->
/**
 * @desc Reset user password with verification code
 * @route POST /api/v1/users/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error('ایمیل، کد و رمز عبور جدید الزامی است');
  }

  const user = await User.findOne({
    email,
    resetPasswordCode: code,
    resetPasswordCodeExpires: { $gt: Date.now() },
  }).select('+resetPasswordCode, +resetPasswordCodeExpires');

  if (!user) {
    res.status(400);
    throw new Error('کد بازیابی نامعتبر یا منقضی شده است');
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordCode = null;
  user.resetPasswordCodeExpires = null;
  await user.save();

  ApiResponse.success(res, null, 'رمز عبور با موفقیت تغییر کرد');
});

// <-------------- Logout Handler --------------------->
/**
 * @desc Logout user
 * @route POST /api/v1/users/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  // Since we're using httpOnly cookies, we just need to clear the cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  ApiResponse.success(res, null, 'کاربر با موفقیت خارج شد');
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  forgotPassword,
  resetPassword,
};
