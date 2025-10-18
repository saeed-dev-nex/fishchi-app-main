import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first
  token = req.cookies.token;

  // If no token in cookies, check Authorization header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('توکن وجود ندارد');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('کاربری پیدا نشد');
    }
    next();
  } catch (error) {
    console.log('Auth error:', error);
    res.status(401);
    throw new Error('توکن نامعتبر است');
  }
});

export { protect };
