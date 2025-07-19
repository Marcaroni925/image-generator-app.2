import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access
    port: 5173,
    strictPort: false, // Try other ports if 5173 is busy
    open: false, // Don't auto-open browser
    cors: true, // Enable CORS
    hmr: {
      port: 24678 // Use different port for HMR
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
