import 'dotenv/config'; // Make sure this is at the very top
import http from 'http';
import https from 'https';
import app from './src/app.js';
import fs from 'fs'; // Import fs module
import path from 'path'; // Import path module
import connectDB from './src/config/db.js'; // Import connectDB

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();
  
  if (NODE_ENV === 'development') {
    console.log('Development mode: Starting HTTPS server with mkcert...');
    try {
      // مسیر فایل‌های گواهی‌نامه mkcert (در ریشه سرور)
      const certPath = path.resolve('localhost.pem');
      const keyPath = path.resolve('localhost-key.pem');

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error(
          'mkcert certificates not found! Run "mkcert localhost 127.0.0.1 ::1" in the server directory.'
        );
        process.exit(1);
      }

      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      const httpsServer = https.createServer(options, app);
      httpsServer.listen(PORT, () => {
        console.log(
          `🚀 HTTPS Server (mkcert) is running on https://localhost:${PORT}`
        );
      });
    } catch (certError) {
      console.error('Error loading mkcert certificates:', certError);
      process.exit(1);
    }
  } else {
    // Production HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 HTTP Server is running on http://localhost:${PORT}`);
    });
  }
};
startServer();