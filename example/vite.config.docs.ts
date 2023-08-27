/// <reference types="./vite-env-override.d.ts" />
/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import svg from '@svgx/vite-plugin-react';
import svg from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // svg({ defaultImport: 'component' })
    svg({ exportAsDefault: true })
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: '../docs',
    emptyOutDir: true,
  },
});
