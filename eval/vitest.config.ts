import { defineConfig } from 'vitest/config'

/* Evaluator config: plays the real GameFlow with seeded bots. Kept apart
   from the unit-test config so `npm test` never pays for bot games. */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['eval/**/*.eval.ts'],
    pool: 'forks',
    testTimeout: 3_600_000,
    hookTimeout: 60_000,
  },
})
