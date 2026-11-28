/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Данные о сборке. Показываются в настройках только при VITE_BUILD_ENV=internal
const env = process.env;
const build = {
  env: env.VITE_BUILD_ENV ?? '',
  version: env.VERSION_NAME && env.VERSION_CODE ? `${env.VERSION_NAME} (${env.VERSION_CODE})` : (env.VERSION_NAME ?? 'dev'),
  date: new Date().toISOString(),
};

export default defineConfig({
  base: './',
  define: { __BUILD_INFO__: JSON.stringify(build) },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' },
  plugins: [
    react(),
  ],
});
