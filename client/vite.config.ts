import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import 'dotenv/config';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    https: {
      key: fs.readFileSync('../server/localhost-key.pem'),
      cert: fs.readFileSync('../server/localhost.pem'),
    },
    proxy: {
      '/api/v1': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // Accept self-signed certificates
      },
    },
  },
});