// Import needed Libraries
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

// Initialize Express app
const app = express();

// use Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser());
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
