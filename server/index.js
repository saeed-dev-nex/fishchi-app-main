import "dotenv/config"; // Make sure this is at the very top
import http from "http";
import https from "https";
import app from "./src/app.js";
import fs from "fs"; // Import fs module
import path from "path"; // Import path module
import connectDB from "./src/config/db.js"; // Import connectDB

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Check for HTTP_MODE environment variable for debugging
  const USE_HTTP = process.env.HTTP_MODE === "true";

  if (NODE_ENV === "development" && !USE_HTTP) {
    console.log("Development mode: Starting HTTPS server with mkcert...");
    try {
      // مسیر فایل‌های گواهی‌نامه mkcert (در ریشه سرور)
      const certPath = path.resolve("localhost.pem");
      const keyPath = path.resolve("localhost-key.pem");

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error(
          'mkcert certificates not found! Run "mkcert localhost 127.0.0.1 ::1" in the server directory.',
        );
        console.log(
          "💡 To use HTTP for debugging, set HTTP_MODE=true environment variable",
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
          `🚀 HTTPS Server (mkcert) is running on https://localhost:${PORT}`,
        );
        console.log(
          "💡 If you have connection issues, try HTTP_MODE=true for debugging",
        );
      });
    } catch (certError) {
      console.error("Error loading mkcert certificates:", certError);
      console.log(
        "💡 To use HTTP for debugging, set HTTP_MODE=true environment variable",
      );
      process.exit(1);
    }
  } else if (NODE_ENV === "development" && USE_HTTP) {
    // Development HTTP server for debugging connection issues
    console.log(
      "🔧 DEBUG MODE: Starting HTTP server (NOT SECURE - for debugging only!)",
    );
    console.log("⚠️  This should NEVER be used in production!");

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(
        `🚀 HTTP Server (DEBUG) is running on http://localhost:${PORT}`,
      );
      console.log("🔒 Remember to switch back to HTTPS for production!");
    });
  } else {
    // Production HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 HTTP Server is running on http://localhost:${PORT}`);
    });
  }
};
startServer();
