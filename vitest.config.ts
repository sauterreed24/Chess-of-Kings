import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
    pool: 'forks',
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
      hooks: 'list',
      setupFiles: 'list',
    },
  },
})
