import { test, expect } from '@playwright/test'

test('title → chapter → advance opens the lab simulation', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).not.toBeEmpty()
})

test('duel archive lists rivals after entering the archive', async ({ page }) => {
  await page.goto('./')
  await page.locator('#btn-enter-archive').click({ timeout: 15_000 })
  await page.locator('#btn-duel').click()
  await expect(page.locator('.duel-row').first()).toBeVisible()
  await page.locator('.duel-row').first().click()
  await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
  await expect(page.locator('#duel-panel')).toContainText('Archive rating:')
  await expect(page.locator('#duel-band-status')).toBeVisible()
})

test('settings toggles for AI thread and visual quality persist', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-title-ai-worker')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-title-ai-worker').click()
  await expect(page.locator('#btn-title-ai-worker')).toContainText('Worker')
  await page.locator('#btn-title-visual').click()
  await expect(page.locator('#btn-title-visual')).toContainText('Full')
  await page.reload()
  await expect(page.locator('#btn-title-ai-worker')).toContainText('Worker', { timeout: 15_000 })
  await expect(page.locator('#btn-title-visual')).toContainText('Full')
})

test('seeded save unlocks Lukas from scene history without explicit duel ids', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 1,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c1-match-lukas', 'c1-match-marius', 'c2-reflection'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: ['alexion-mentor'],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 80,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1100, peak: 1100, rated: 1 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-duel').click({ timeout: 15_000 })
  await expect(page.locator('.duel-row[data-op="lukas"]:not(.duel-row--sealed)')).toBeVisible()
  await page.locator('.duel-row[data-op="lukas"]').click()
  await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
  await expect(page.locator('#duel-panel')).toContainText('Archive rating:')
})

test('seeded save unlocks Lukas in the duel archive and shows Chapter III', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 3,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c1-match-lukas', 'c1-match-marius', 'c2-reflection', 'c3-intro'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['amara', 'lukas', 'marius', 'edred', 'alexion', 'rowan', 'vega'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'lukas-phalanx',
        'marius-patience',
        'amara-initiate',
        'edred-guard',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 120,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1200, peak: 1200, rated: 2 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await expect(page.locator('#btn-resume')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-chapters').click()
  await expect(page.locator('.chapter-btn', { hasText: 'Chapter III' })).toBeVisible()
  await page.locator('#btn-duel').click()
  await expect(page.locator('.duel-row[data-op="lukas"]')).toBeVisible()
  await page.locator('.duel-row[data-op="lukas"]').click()
  await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
  await expect(page.locator('#duel-panel')).toContainText('Lukas')
  await expect(page.locator('#duel-panel')).toContainText('Lens suggests')
})
