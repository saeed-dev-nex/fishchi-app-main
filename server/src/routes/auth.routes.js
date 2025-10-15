import express from 'express';
import passport from '../config/passport.js';
import generateToken from '../utils/generateToken.js';
import ApiResponse from '../utils/apiResponse.js';

const router = express.Router();

// Test endpoint to check OAuth configuration
router.get('/test', (req, res) => {
  res.json({
    google: {
      configured: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      callbackUrl: 'http://localhost:3000/api/v1/auth/google/callback',
    },
    github: {
      configured: !!(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
      clientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
      callbackUrl: 'http://localhost:3000/api/v1/auth/github/callback',
    },
    clientUrl: process.env.CLIENT_URL,
  });
});

// Google OAuth Routes
router.get(
  '/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({
        status: 'error',
        message:
          'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      });
    }
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/app?oauth=success`);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// GitHub OAuth Routes
router.get(
  '/github',
  (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(400).json({
        status: 'error',
        message:
          'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.',
      });
    }
    next();
  },
  passport.authenticate('github', {
    scope: ['user:email'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/app?oauth=success`);
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// OAuth success endpoint
router.get('/success', (req, res) => {
  ApiResponse.success(
    res,
    { message: 'OAuth authentication successful' },
    'ورود با موفقیت انجام شد'
  );
});

// OAuth failure endpoint
router.get('/failure', (req, res) => {
  ApiResponse.error(res, 'OAuth authentication failed', 401);
});

export default router;
