import asyncHandler from 'express-async-handler';
import otpGenerator from 'otp-generator';
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
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('لطفاً تمام اطلاعات خواسته شده را پر کنید');
  }
  const userExists = await User.findOne({ email });
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

  if (user) {
    ApiResponse.success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    });
  } else {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
});

export { registerUser, verifyEmail, loginUser, getUserProfile };
