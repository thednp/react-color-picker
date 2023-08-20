import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import svg from "@svgx/vite-plugin-react";

export default defineConfig({
  plugins: [
    react(), svg(),
  ],
  server: {
    port: 4000,
  },
  build: {
    target: 'esnext',
  },
});
