import 'dotenv/config';
import { defineConfig } from 'vitest/config';

// Ensure NODE_ENV is 'test' when not set in .env (so config defaults CLEARNODE_WSS_URL to Yellow sandbox).
if (process.env['NODE_ENV'] === undefined) {
  process.env['NODE_ENV'] = 'test';
}

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    globals: true,
    environment: 'node',
    hookTimeout: 30_000,
    // Yellow sandbox WebSocket tests may need extra time on slow networks.
    testTimeout: 20_000,
  },
});
