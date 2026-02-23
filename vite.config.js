import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'rewrite-static-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanPaths = ['/privacy', '/about', '/how-it-works', '/glossary', '/history', '/site-index'];
          if (cleanPaths.includes(req.url)) {
            req.url += '.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const cleanPaths = ['/privacy', '/about', '/how-it-works', '/glossary', '/history', '/site-index'];
          if (cleanPaths.includes(req.url)) {
            req.url += '.html';
          }
          next();
        });
      }
    }
  ],
  // Base path for GitHub Pages: https://<user>.github.io/PeriodicTable/
  // Use './' for mobile builds to support Capacitor's file:// protocol or local server
  // base: process.env.VITE_APP_TARGET === 'mobile' ? './' : '/PeriodicTable/',

  // Base path for deployment (Use '/' for custom domains/AWS root, './' for mobile)
  base: process.env.VITE_APP_TARGET === 'mobile' ? './' : '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      maxParallelFileReads: 2,
    },
  },
  preview: {
    allowedHosts: ['periodictable.travel-tracker.org', 'localhost'],
    port: 3004,
    host: true,
  },
}))
