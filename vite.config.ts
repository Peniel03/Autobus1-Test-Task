import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';


export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Removed additionalData to avoid duplicate and incorrect imports
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});