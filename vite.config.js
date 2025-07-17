import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all API requests to the DOMjudge backend
      '/api': {
        target: 'https://test1.indiaicpc.in/',
        changeOrigin: true,
        secure: false,
        // rewrite: path => path.replace(/^\/api/, ''), // Remove /api prefix if needed
      },
    },
  },
});