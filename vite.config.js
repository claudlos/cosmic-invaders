import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      // WebGPU renderer is dynamically imported with try/catch fallback
      external: ['three/src/renderers/webgpu/WebGPURenderer.js'],
    },
  },
});
