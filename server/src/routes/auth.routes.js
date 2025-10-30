import express from 'express';
import passport from '../config/passport.js';
import generateToken from '../utils/generateToken.js';
import ApiResponse from '../utils/apiResponse.js';
// --- NEW: Import pendingLogins from app.js ---
import { pendingLogins } from '../app.js';

const router = express.Router();

// Test endpoint... (unchanged)
router.get('/test', (req, res) => {
  res.json({
    google: {
      configured: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      callbackUrl: 'https://localhost:3000/api/v1/auth/google/callback',
    },
    github: {
      configured: !!(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
      clientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
      callbackUrl: 'https://localhost:3000/api/v1/auth/github/callback',
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
  // ---  Pass session_id as state ---
  (req, res, next) => {
    const { session_id } = req.query;
    const authOptions = {
      scope: ['profile', 'email'],
      session: false, // Ensure session is false
    };
    // If session_id exists, pass it as 'state'
    if (session_id) {
      authOptions.state = session_id;
    }
    passport.authenticate('google', authOptions)(req, res, next);
  }
  // --- END  ---
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(res, user._id);

      // --- MODIFIED: Check for session_id (from state) ---
      const sessionId = req.query.state;

      if (sessionId) {
        // This is an add-in login flow
        console.log(`Completing add-in login for session: ${sessionId}`);

        // Store the token for the polling mechanism
        pendingLogins.set(sessionId, token);

        // Set a timeout to clear this entry after 5 minutes
        setTimeout(() => {
          pendingLogins.delete(sessionId);
          console.log(`Cleared expired OAuth login session: ${sessionId}`);
        }, 5 * 60 * 1000); // 5 minutes

        // Send a simple HTML response to close the window
        return res.status(200).send(
          `
          <html lang="fa" dir="rtl">
            <head><title>ورود موفق</title></head>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
              <h2>ورود با موفقیت انجام شد!</h2>
              <p>می‌توانید این پنجره را ببندید و به Microsoft Word بازگردید.</p>
              <script>window.close();</script>
            </body>
          </html>
          `
        );
      } else {
        // This is a normal web login flow
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        // Redirect to frontend with success
        res.redirect(`${process.env.CLIENT_URL}/app?oauth=success`);
      }
      // --- END MODIFIED ---
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
  // --- MODIFIED: Pass session_id as state ---
  (req, res, next) => {
    const { session_id } = req.query;
    const authOptions = {
      scope: ['user:email'],
      session: false, // Ensure session is false
    };
    // If session_id exists, pass it as 'state'
    if (session_id) {
      authOptions.state = session_id;
    }
    passport.authenticate('github', authOptions)(req, res, next);
  }
  // --- END MODIFIED ---
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(res, user._id);

      // --- MODIFIED: Check for session_id (from state) ---
      const sessionId = req.query.state;

      if (sessionId) {
        // This is an add-in login flow
        console.log(`Completing add-in login for session: ${sessionId}`);

        // Store the token for the polling mechanism
        pendingLogins.set(sessionId, token);

        // Set a timeout to clear this entry after 5 minutes
        setTimeout(() => {
          pendingLogins.delete(sessionId);
          console.log(`Cleared expired OAuth login session: ${sessionId}`);
        }, 5 * 60 * 1000); // 5 minutes

        // Send a simple HTML response to close the window
        return res.status(200).send(
          `
          <html lang="fa" dir="rtl">
            <head><title>ورود موفق</title></head>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
              <h2>ورود با موفقیت انجام شد!</h2>
              <p>می‌توانید این پنجره را ببندید و به Microsoft Word بازگردید.</p>
              <script>window.close();</script>
            </body>
          </html>
          `
        );
      } else {
        // This is a normal web login flow
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        // Redirect to frontend with success
        res.redirect(`${process.env.CLIENT_URL}/app?oauth=success`);
      }
      // --- END MODIFIED ---
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// OAuth success/failure endpoints (unchanged)
router.get('/success', (req, res) => {
  ApiResponse.success(
    res,
    { message: 'OAuth authentication successful' },
    'ورود با موفقیت انجام شد'
  );
});

router.get('/failure', (req, res) => {
  ApiResponse.error(res, 'OAuth authentication failed', 401);
});

// Endpoint for local login flow (from LoginPage)
router.post('/complete-login/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // --- THIS IS THE FIX: Read 'token' cookie, not 'jwt' ---
  const token = req.cookies.token;
  // --- END OF FIX ---

  if (!sessionId || !token) {
    // If there's no cookie or no session ID, it's a bad request
    return res
      .status(400)
      .json({ message: 'Session ID or token cookie are missing.' });
  }

  // Store the token mapped to the session ID
  pendingLogins.set(sessionId, token);
  console.log(`Completing add-in login (local) for session: ${sessionId}`);

  // Set a timeout to clear this entry after 5 minutes
  setTimeout(() => {
    pendingLogins.delete(sessionId);
    console.log(`Cleared expired local login session: ${sessionId}`);
  }, 5 * 60 * 1000); // 5 minutes

  res
    .status(200)
    .json({ message: 'Login complete. You can close this window.' });
});

// ---  Add-in Polling Endpoint (FIX for 404 error) ---
// This is the route the Word Add-in calls repeatedly to check for a token
router.get('/poll-login/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (pendingLogins.has(sessionId)) {
    // Found it! Get the token.
    const token = pendingLogins.get(sessionId);

    // Delete it from the map (it's a one-time use token)
    pendingLogins.delete(sessionId);

    // Send the token to the add-in
    console.log(`Token sent to add-in for session: ${sessionId}`);
    // Return 200 OK with the token
    res.status(200).json({ token: token });
  } else {
    // Not found yet.
    // Return 200 OK, but with no token.
    // The add-in (App.tsx) will see 'data.token' is null/undefined
    // and log "Polling... token not ready." and try again.
    res.status(200).json({ token: null, message: 'Token not ready yet.' });
  }
});
// --- -------- ---

export default router;
