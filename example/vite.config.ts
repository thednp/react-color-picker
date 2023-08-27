/// <reference types="./vite-env-override.d.ts" />
/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    // svg({ defaultImport: 'component' })
    svg({ exportAsDefault: true }),
  ],
  server: {
    port: 4000,
  },
  build: {
    target: 'esnext',
  },
});
