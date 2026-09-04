import { defineConfig } from 'vitest/config';
import path from 'path';

// Explicit project config so vitest never climbs up to an unrelated root
// config. Integration tests run against a dedicated test database.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/redis.setup.ts'],
    // Test files share one database and reset it in before/afterAll, so they
    // must run sequentially to avoid cross-suite data races.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://postgres:postgresql@127.0.0.1:5432/dukastock_test?schema=public',
      PORT: '4100',
      CLIENT_URL: 'http://localhost:5173',
      SESSION_SECRET: 'test-session-secret',
      COOKIE_SECRET: 'test-cookie-secret',
      COOKIE_SECURE: 'false',
    },
    resolve: {
      alias: {
        '@@server': path.resolve(__dirname),
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
