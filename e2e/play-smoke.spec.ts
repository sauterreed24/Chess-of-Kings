import { test, expect } from '@playwright/test'

test('calibration board registers a pawn move from skip-ahead', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-carve')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-shade')).toBeVisible()
  await expect(page.locator('.play-state-readouts')).toBeHidden()
  await expect(page.locator('#board-guide')).toContainText(/four White moves|Archive reply/)
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText('e4')
  await expect(page.locator('#move-counter')).toContainText('1/4')
  await expect(page.locator('.calibration-rail__label')).toContainText('1 / 4')
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4\s+\S+/, { timeout: 20_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i)
  await expect(page.locator('#board-guide')).toContainText(/four White moves|Archive reply|e2 pawn selected/)
  await page.locator('#btn-duel').click()
  await expect(page.locator('#confirm-title')).toContainText('Open the Duel Archive?')
  await page.locator('#btn-confirm-ok').click()
  await expect(page.locator('#screen-duel')).toBeVisible()
  await expect(page.locator('.duel-row').first()).toBeVisible()
})

async function playIfLegal(
  page: import('@playwright/test').Page,
  from: string,
  to: string,
): Promise<boolean> {
  await page.locator(`[data-square="${from}"]`).click()
  const dest = page.locator(`[data-square="${to}"]`)
  const cls = (await dest.getAttribute('class')) ?? ''
  if (!/sq-legal-dot|sq-legal-capture/.test(cls)) {
    await page.locator(`[data-square="${from}"]`).click()
    return false
  }
  await dest.click()
  return true
}

test('calibration prove completes after four developing white moves', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()

  const developing: Array<[string, string]> = [
    ['e2', 'e4'],
    ['g1', 'f3'],
    ['d2', 'd4'],
    ['b1', 'c3'],
    ['c2', 'c3'],
    ['a2', 'a3'],
  ]
  let played = 0
  for (const [from, to] of developing) {
    if (played >= 4) break
    if (!(await playIfLegal(page, from, to))) continue
    played += 1
    await expect(page.locator('#turn-pulse')).toContainText(/White turn|Sealed/i, { timeout: 20_000 })
  }
  expect(played).toBeGreaterThanOrEqual(4)
  await expect(page.locator('#btn-next')).toBeEnabled()
  await expect(page.locator('.calibration-rail__label')).toContainText('4 / 4')
})

test('calibration teaching keeps the goal fully readable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await page.locator('#btn-skip-ahead').click()
  const goal = page.locator('.teaching-card').filter({ hasText: 'Your goal' })
  await expect(goal).toContainText('Complete four White moves')
  await expect(goal).toContainText('wait for the Archive reply')
  await expect(goal.locator('.teach-body')).toBeInViewport()
  await expect(page.locator('.teaching-more')).not.toHaveAttribute('open')
  await page.locator('.teaching-more > summary').click()
  await expect(page.locator('.teaching-more')).toContainText('Every move should have a reason')
})

test('compact calibration stacks the board above the manuscript', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('.screen-play--board-scene .play-crawl .chapter-label')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText('four White moves')
  await expect(page.locator('#mobile-tips')).toBeHidden()
  const boardBox = await page.locator('#board-panel').boundingBox()
  const manuscriptBox = await page.locator('#manuscript-panel').boundingBox()
  const crawlBox = await page.locator('.play-crawl').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(manuscriptBox).toBeTruthy()
  expect(boardBox!.y).toBeLessThan(manuscriptBox!.y)
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  expect(crawlBox?.height ?? 99).toBeLessThan(72)
})

test('title honor guard shows carved ivory and lapis', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('#title-honor .title-honor__piece')).toHaveCount(10)
  await expect(page.locator('#title-honor .piece-carve').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece--w')).toHaveCount(5)
  await expect(page.locator('#title-honor .piece--b')).toHaveCount(5)
})

test('short lab keeps title chapters duel nav', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 })
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('[data-square="e2"]')).toBeInViewport()
  await expect(page.locator('[data-square="e4"]')).toBeInViewport()
  await expect(page.locator('#btn-title')).toBeVisible()
  await expect(page.locator('#btn-chapters')).toBeVisible()
  await expect(page.locator('#btn-duel')).toBeVisible()
})

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

test('starting a duel registers e2-e4 and an archive reply', async ({ page }) => {
  await page.goto('./')
  await page.locator('#btn-enter-archive').click({ timeout: 15_000 })
  await page.locator('#btn-duel').click()
  await page.locator('.duel-row').first().click()
  await page.locator('#btn-start-duel').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText('e4')
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+\S+/, { timeout: 25_000 })
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

test('post-Chapter IV chapters screen shows mastery plateau hub', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 4,
      sceneIndex: 0,
      highestUnlockedChapter: 4,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-match-kallistos',
        'c1-match-lukas',
        'c3-freeplay',
        'c4-reflection',
        'c4-match-cassian',
        'c4-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'lukas', 'nysa', 'cassian'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'lukas-phalanx',
        'nysa-frontier',
        'cassian-paradox',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 140,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1250, peak: 1250, rated: 3 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('Mastery plateau')
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('.roadmap-teaser').first()).toContainText(/Systems over inspiration|long squeeze/i)
  await expect(page.locator('.chapter-btn, .chapter-locked').filter({ hasText: 'Paradox Masters' })).toBeVisible()
  await page.locator('#btn-plateau-duel').click()
  await expect(page.locator('#screen-duel')).toBeVisible()
  await expect(page.locator('.duel-row').first()).toBeVisible()
})

test('Chapter III survivors are invited into the Paradox Masters', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 3,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c3-reflection', 'c3-match-kallistos', 'c3-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos'],
      unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law'],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 130,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1220, peak: 1220, rated: 2 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-paradox')).toBeVisible()
  await expect(page.locator('.doctrine-atlas')).toContainText('Paradox')
  await page.locator('#btn-plateau-paradox').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter IV')
  await expect(page.locator('#narrative-body')).toContainText(/committee|Bactrian|school-flexible/i)
})

test('Chapter IV drills solve on the live board', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 4,
      sceneIndex: 0,
      highestUnlockedChapter: 4,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c3-reflection', 'c3-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos'],
      unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law'],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 130,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1220, peak: 1220, rated: 2 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter IV' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter IV')
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Fianchetto|Bactrian Frontier/)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="f1"]')).toBeVisible()
  await page.locator('[data-square="f1"]').click()
  await page.locator('[data-square="g2"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/invoice|diagonal|knight/i)
  await page.locator('[data-square="g2"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled()
  await page.locator('#btn-next').click()
  await page.locator('[data-square="h3"]').click()
  await page.locator('[data-square="c8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Nysa|frontier/i)
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
