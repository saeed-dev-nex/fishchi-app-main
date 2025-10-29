import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; //

const protect = async (req, res, next) => {
  let token;

  // --- START MODIFICATION ---
  // Strategy 1: Check for httpOnly Cookie (for Web App)
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Strategy 2: Check for Bearer Token Header (for Word Add-in / API clients)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer 12345...")
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
      res.status(401);
      throw new Error('توکن هدر به درستی فرمت نشده است');
    }
  }
  // --- END MODIFICATION ---

  if (!token) {
    res.status(401);
    // Use the original error message
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token ID (excluding password)
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('کاربر یافت نشد');
    }

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error.message);
    res.status(401);
    // Use the original error message
    throw new Error('توکن نامعتبر است');
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
