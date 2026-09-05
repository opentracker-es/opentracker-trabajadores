import { defineConfig } from 'vitest/config';

// Config propia para tests: no carga vite.config.ts (evita el plugin PWA).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
