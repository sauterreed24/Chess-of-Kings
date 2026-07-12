import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const LIVE = process.env.LIVE_PAGES_URL || 'https://sauterreed24.github.io/Chess-of-Kings/'
const OUT = '/opt/cursor/artifacts/playtest'
fs.mkdirSync(OUT, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true })
}

const SAVE_MID_MATCH = {
  version: 3,
  chapterIndex: 0,
  sceneIndex: 5,
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
    kind: 'campaign',
    chapterIndex: 0,
    sceneIndex: 5,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    sanLog: ['e4', 'e5', 'Nf3'],
    playerColor: 'w',
    mode: 'match',
    history: [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    ],
    sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    calibrationMoves: 0,
    scriptedMoveIndex: 0,
  },
}

const SAVE_POST_REFLECTION = {
  ...SAVE_MID_MATCH,
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

test.describe('Live Pages rigorous playtest', () => {
  test.use({ baseURL: LIVE })

  test('fresh title → chapter → lab → duel dossier', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

    await page.goto('./', { waitUntil: 'networkidle' })
    await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 20000 })
    await shot(page, '01-title-fresh')
    await expect(page).toHaveTitle(/Calculus of Kings/i)

    await page.locator('#btn-enter-archive').click()
    await expect(page.locator('.chapter-btn').first()).toBeVisible()
    await expect(page.locator('.plateau-hub')).toHaveCount(0)
    await shot(page, '02-chapters-fresh')

    await page.locator('.chapter-btn').first().click()
    await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
    await shot(page, '03-lab-prologue')

    for (let i = 0; i < 6; i++) {
      const next = page.locator('#btn-next:not([disabled])')
      if (!(await next.count())) break
      await next.click()
      await page.waitForTimeout(250)
    }
    await shot(page, '04-after-advances')

    await page.locator('#btn-vestibule').click()
    await page.locator('#btn-duel').click()
    await page.locator('.duel-row').first().click()
    await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
    await expect(page.locator('#duel-panel')).toContainText('Archive rating')
    await shot(page, '06-duel-dossier')

    await page.locator('#btn-start-duel').click()
    await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
    await shot(page, '07-duel-started')
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('chapter click wipes recoverable session without confirm (P0 probe)', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_MID_MATCH)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-chapters').click()
    await shot(page, '10-chapters-recoverable')

    const before = await page.evaluate(() => {
      const raw = localStorage.getItem('calculus-of-kings-progress-v3')
      return raw ? JSON.parse(raw).inProgress : null
    })
    expect(before).toBeTruthy()

    await page.locator('.chapter-btn').first().click()
    await page.waitForTimeout(700)
    await shot(page, '11-after-chapter-click')

    const after = await page.evaluate(() => {
      const raw = localStorage.getItem('calculus-of-kings-progress-v3')
      return raw ? JSON.parse(raw).inProgress : null
    })
    // Document current bug: wiped without confirm. Assertion records the defect for the fix PR.
    expect(after, 'P0: recoverable inProgress should survive or require confirm before wipe').toBeTruthy()
  })

  test('plateau after reflection but before freeplay is premature (P1 probe)', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_POST_REFLECTION)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-chapters').click()
    await expect(page.locator('.plateau-hub')).toBeVisible()
    await shot(page, '20-plateau-post-reflection')
    const hub = await page.locator('.plateau-hub').textContent()
    const hasFreeplay = await page.evaluate(() => {
      const raw = localStorage.getItem('calculus-of-kings-progress-v3')
      const ids = raw ? JSON.parse(raw).completedSceneIds : []
      return ids.includes('c3-freeplay')
    })
    expect(hasFreeplay).toBe(false)
    // Soft copy preferred until campaign finish
    expect(hub || '', 'P1: should not claim Chapters I–III sealed before freeplay finish').not.toMatch(/I–III are sealed/i)
  })

  test('loss echoes and mobile dossier on live build', async ({ page }) => {
    await page.addInitScript((save) => {
      localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
    }, SAVE_POST_REFLECTION)
    await page.goto('./', { waitUntil: 'networkidle' })
    await page.locator('#btn-duel').click()
    await page.locator('[data-op="alexion"]').click()
    await page.locator('.dossier-fold', { hasText: 'Chronicle Echoes' }).locator('summary').click()
    await expect(page.locator('#duel-panel')).toContainText('Defeat')
    await expect(page.locator('#duel-panel')).toContainText('Qh5')
    await shot(page, '22-echoes-open')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.locator('[data-op="alexion"]').click()
    await shot(page, '23-mobile-dossier')
    await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
  })
})
