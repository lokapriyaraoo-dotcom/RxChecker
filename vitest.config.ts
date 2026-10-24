import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // fail loudly if a security test file is accidentally emptied or skipped
    passWithNoTests: false,
  },
});
