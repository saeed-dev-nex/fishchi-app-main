import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('کاربری پیدا نشد');
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error('توکن نامعتبر است');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('توکن وجود ندارد');
  }
});

export { protect };
