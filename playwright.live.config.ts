import { defineConfig, devices } from '@playwright/test'

/** Live GitHub Pages playtest. Run:
 *  LIVE_PAGES_URL=https://sauterreed24.github.io/Chess-of-Kings/ npx playwright test -c playwright.live.config.ts
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: 'live-pages-playtest.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.LIVE_PAGES_URL || 'https://sauterreed24.github.io/Chess-of-Kings/',
  },
})
