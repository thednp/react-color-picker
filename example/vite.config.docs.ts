import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from 'vite-react-svg';

export default defineConfig({
  base: './',
  plugins: [react(), svg()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: '../docs',
    emptyOutDir: true,
  },
});
