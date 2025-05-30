import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react';
import svg from 'vite-react-svg';
import path from "node:path";

export default defineConfig({
  plugins: [react(), svg()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 4173,
  },
  test: {
    css: true,
    globals: true,
    coverage: {
      provider: "istanbul",
      reporter: ["html", "text", "lcov"],
      enabled: true,
      include: ["src/**/*.{ts,tsx}"],
    },
    browser: {
      provider: 'preview', // or 'webdriverio'
      enabled: true,
      headless: false,
      instances: [
        { browser: 'chromium' }
      ]
      // enableUI: true
    },
  },
});
