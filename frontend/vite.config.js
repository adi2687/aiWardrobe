import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    include: ['axios', 'three', 'three-stdlib'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://api.gemini.com',
    },
  },
});
