import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Optional live / local regression suite for recovery + plateau honesty.
 * Default CI e2e stays on play-smoke.spec.ts.
 *
 * Local:  npx playwright test -c playwright.live.config.ts
 * Live:   LIVE_PAGES_URL=https://sauterreed24.github.io/Chess-of-Kings/ npx playwright test -c playwright.live.config.ts
 */
const LIVE = process.env.LIVE_PAGES_URL || 'http://127.0.0.1:4173/Chess-of-Kings/'
const OUT = '/opt/cursor/artifacts/playtest'
fs.mkdirSync(OUT, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true })
}

const SAVE_MID_CALIBRATION = {
  version: 3,
  chapterIndex: 0,
  sceneIndex: 4,
  highestUnlockedChapter: 0,
  lastScreen: 'chapters',
  chapter1Complete: false,
  chapter2Complete: false,
  completedSceneIds: [] as string[],
  completedPuzzleIds: [] as string[],
  stratarchiaUnlocked: false,
  duelUnlockedOpponentIds: [] as string[],
  unlockedDuelVariantIds: ['alexion-mentor'],
  codexUnlocks: [] as string[],
  titleUnlocks: [] as string[],
  chronicleEchoes: [] as string[],
  rankPoints: 10,
  cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
  tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
  matchHistory: [] as unknown[],
  rivalMemory: {},
  ladder: { rating: 1100, peak: 1100, rated: 0 },
  inProgress: {
    mode: 'calibration',
    chapterIndex: 0,
    sceneIndex: 4,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    sanLog: ['e4', 'e5', 'Nf3'],
    sanQuality: ['good', 'ok', 'good'],
    playerColor: 'w',
    history: [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    ],
    sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    calibrationMoves: 2,
    scriptedMoveIndex: 0,
  },
}

const SAVE_POST_REFLECTION = {
  ...SAVE_MID_CALIBRATION,
  chapterIndex: 3,
  sceneIndex: 0,
  highestUnlockedChapter: 3,
  lastScreen: 'chapters',
  chapter1Complete: true,
  chapter2Complete: true,
  completedSceneIds: ['c1-reflection', 'c2-reflection', 'c3-reflection', 'c3-match-kallistos'],
  duelUnlockedOpponentIds: ['alexion', 'kallistos', 'lukas'],
  unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law', 'lukas-phalanx'],
  rankPoints: 160,
  ladder: { rating: 1280, peak: 1300, rated: 4 },
  inProgress: null,
  matchHistory: [
    {
      id: 'echo-loss-1',
      timestamp: 1700000000000,
      mode: 'duel',
      sourceId: 'alexion-mentor',
      opponentId: 'alexion',
      opponentLabel: 'Alexion',
      outcome: 'loss',
      moves: 42,
      styleGrade: 'C',
      turningPointSan: 'Qh5',
      replaySans: ['e4', 'e5', 'Qh5', 'Nc6'],
      replayStartFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
  ],
}

test.describe('Recovery + plateau continuity', () => {
  test.use({ baseURL: LIVE })

  test('chapter click confirms before discarding recoverable calibration', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_MID_CALIBRATION)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-chapters').click()
    await expect(page.locator('#btn-resume-recovered')).toBeVisible()
    await shot(page, 'p8-chapters-recoverable')

    await page.locator('.chapter-btn').first().click()
    await expect(page.locator('#confirm-overlay')).not.toHaveClass(/hidden/)
    await page.locator('#btn-confirm-cancel').click()
    const afterCancel = await page.evaluate(() => {
      const raw = localStorage.getItem('calculus-of-kings-progress-v3')
      return raw ? JSON.parse(raw).inProgress : null
    })
    expect(afterCancel).toBeTruthy()
  })

  test('soft plateau after reflection before freeplay finish', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_POST_REFLECTION)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-chapters').click()
    await expect(page.locator('.plateau-hub')).toBeVisible()
    await expect(page.locator('.plateau-hub')).toContainText(/Almost sealed/i)
    await expect(page.locator('.plateau-hub')).not.toContainText(/I–III are sealed/i)
    await shot(page, 'p8-soft-plateau')
  })

  test('loss echoes open by default in dossier', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_POST_REFLECTION)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-duel').click()
    await page.locator('[data-op="alexion"]').click()
    await expect(page.locator('#duel-panel')).toContainText('Defeat')
    await expect(page.locator('#duel-panel')).toContainText('Qh5')
    await shot(page, 'p8-echoes-open')
  })
})
