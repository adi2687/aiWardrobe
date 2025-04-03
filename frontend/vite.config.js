import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    include: ['axios']
  },
  build: {
    rollupOptions: {
      external: ['axios']
    }
  }
});
