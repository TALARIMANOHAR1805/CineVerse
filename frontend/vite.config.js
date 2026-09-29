/**
 * vite.config.js v2 — CineVerse Vite configuration.
 *
 * Features:
 *  - API proxy to backend during local development
 *  - Path aliases for cleaner imports
 *  - Optimized chunk splitting for production
 *
 * Author: Koushik-31368
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // ── Dev server proxy ─────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      // Forward /api calls to the Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },

  // ── Build optimisation ────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // manualChunks must be a function, not an object (Rollup requirement)
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
        },
      },
    },
    // Warn when chunks exceed 500kB
    chunkSizeWarningLimit: 500,
  },

  // ── Preview ───────────────────────────────────────────────
  preview: {
    port: 4173,
  },
});
