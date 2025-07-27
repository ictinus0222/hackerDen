/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          dnd: ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend'],
          socket: ['socket.io-client'],
        },
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Enable source maps for production debugging (disable for production)
    sourcemap: mode === 'development',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: mode === 'production' ? 'terser' : false,
    // Target modern browsers for production
    target: mode === 'production' ? 'es2020' : 'esnext',
    // Optimize for production
    reportCompressedSize: mode === 'production',
    // Output directory
    outDir: 'dist',
    // Clean output directory before build
    emptyOutDir: true,
  },
  // Environment-specific configuration
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
  },
  // Optimize dev server
  server: {
    // Enable HTTP/2 for better performance
    https: false,
    // Optimize HMR
    hmr: {
      overlay: false,
    },
    // Dev server port
    port: 5173,
    // Open browser automatically
    open: false,
  },
  // Preview server configuration (for production testing)
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-dnd',
      'react-dnd-html5-backend',
      'react-dnd-touch-backend',
      'socket.io-client',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
