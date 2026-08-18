/**
 * Vitest configuration.
 *
 * - Node environment (we test pure functions and server-only modules).
 * - Path alias `@/*` -> `./src/*` matches tsconfig.json.
 * - Test files live under src (test files named *.test.ts or *.test.tsx).
 * - scripts/verify-golden.ts is a hand-rolled runnable script, not a
 *   vitest test, and is excluded - it has its own bun run entry.
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'examples', 'skills', '.next'],
  },
});
