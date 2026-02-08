import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Base path for GitHub Pages: https://<user>.github.io/PeriodicTable/
  // Use './' for mobile builds to support Capacitor's file:// protocol or local server
  base: process.env.VITE_APP_TARGET === 'mobile' ? './' : '/PeriodicTable/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      maxParallelFileReads: 2,
    },
  },
}))
