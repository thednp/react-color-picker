/// <reference types="./vite-env-override.d.ts" />
/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    // svg({ exportAsDefault: true })
    svg(),
  ],
  server: {
    port: 4000,
  },
  build: {
    target: 'esnext',
  },
});
