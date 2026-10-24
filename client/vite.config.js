import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDirectory, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'script.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (asset) => asset.name?.endsWith('.css')
          ? 'style.css'
          : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
