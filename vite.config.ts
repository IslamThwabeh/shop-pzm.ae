import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'redirect-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove trailing slashes
          if (req.url.endsWith('/') && req.url.length > 1) {
            res.writeHead(301, { Location: req.url.slice(0, -1) });
            res.end();
            return;
          }

          // Handle SPA routing
          if (req.url.startsWith('/services/') || req.url === '/blog' || req.url === '/blog-post') {
            req.url = '/';
          }

          next();
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
    watch: {
      usePolling: true
    }
  }
});