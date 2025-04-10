import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    include: ['axios', 'three', 'three-stdlib'], // Add 'three' and 'three-stdlib'
  },
  server: {
    proxy: {
      '/api': 'https://api.gemini.com', // Adjust this to match your backend API
    },
  },
});
