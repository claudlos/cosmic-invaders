import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': '/src',
    },
  },
});
