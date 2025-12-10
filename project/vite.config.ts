import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./css/main.css";`
      }
    }
  },
  server: {
    open: true,
    watch: {
      usePolling: true
    }
  }
});