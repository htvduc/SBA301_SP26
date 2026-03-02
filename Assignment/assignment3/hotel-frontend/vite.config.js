import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Chạy FE ở http://localhost:5173, proxy API sang backend 8080
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});