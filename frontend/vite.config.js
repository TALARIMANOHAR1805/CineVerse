/**
 * vite.config.js v3 — CineVerse Vite configuration.
 *
 * Vercel-compatible: no node:path dependency, clean build config.
 * Author: Koushik-31368
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ── Dev server proxy ────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      // Forward /api calls to the Spring Boot backend (local dev only)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // ── Build optimisation ───────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // manualChunks must be a function (Rollup requirement)
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  // ── Preview ─────────────────────────────────────────────────
  preview: {
    port: 4173,
  },
});
