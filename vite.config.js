import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/simple-reflector': {
        target: 'http://localhost:5174',
        rewrite: (path) => path.replace(/^\/simple-reflector/, '/src/simple-reflector')
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        simpleReflector: resolve(__dirname, 'src/simple-reflector/index.html'),
      },
    },
  },
});
