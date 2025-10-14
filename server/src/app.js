// Import needed Libraries
import express from 'express';
import cors from 'cors';
import path from 'path';
import mainRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

// Initialize Express app
const app = express();

// use Middlewares
const allowedOrigins = ['http://localhost:3000'];
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
