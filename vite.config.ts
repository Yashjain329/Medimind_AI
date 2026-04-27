import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  // vitest config — requires the test runner to interpret this field
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
} as UserConfig & { test: object });
