import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import 'dotenv/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],

  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // Accept self-signed certificates
      },
    },
  },
});
