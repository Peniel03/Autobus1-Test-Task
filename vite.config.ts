import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';


export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL('./index.html', import.meta.url)))
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