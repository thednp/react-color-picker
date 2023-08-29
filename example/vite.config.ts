import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svg(),
  ],
  server: {
    port: 4000,
  },
  build: {
    target: 'esnext',
  },
});
