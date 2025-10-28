// Import needed Libraries
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from './config/passport.js';
import mainRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

// Initialize Express app
const app = express();

// use Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL,
  // 'https://fishchi.ir',
  // 'https://www.fishchi.ir',
  'https://localhost:3500', //Word addins Address
  'https://localhost:3000', //Client Address
];
app.use(
  cors({
    origin: function (origin, callback) {
      // اجازه دادن به درخواست‌های بدون origin (مانند Postman) و افزونه‌ها
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith('chrome-extension://')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser());

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Fishchi API</h1>
    <p>Version 1.0.0</p>
    `);
});

app.use('/api/v1', mainRouter);

app.use(notFound);
// errorHandler most be last layer for handle all errors
app.use(errorHandler);

// Export the app
export default app;
