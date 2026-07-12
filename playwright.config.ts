import { defineConfig, devices } from '@playwright/test'

/** Optional smoke — not part of `quality:gate` (keeps CI ~60s). Run: npm run build && npm run test:e2e */
export default defineConfig({
  testDir: 'e2e',
  testMatch: 'play-smoke.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173/Chess-of-Kings/',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173/Chess-of-Kings/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
