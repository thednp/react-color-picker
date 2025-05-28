import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react';
import svg from 'vite-plugin-svgr';
import path from "node:path";

export default defineConfig({
  plugins: [react(), svg()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
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
      provider: 'playwright', // or 'webdriverio'
      enabled: true,
      headless: true,
      instances: [
        { browser: 'chromium' }
      ]
    },
  },  
});
