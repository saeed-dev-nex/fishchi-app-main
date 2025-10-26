import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      '/api/v1': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // Accept self-signed certificates
      },
    },
  },
});
