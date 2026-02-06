import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    globals: true,
    environment: 'node',
    hookTimeout: 30_000,
    testTimeout: 15_000,
  },
});
