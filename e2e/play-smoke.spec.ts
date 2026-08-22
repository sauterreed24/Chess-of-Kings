import { test, expect, type Page } from '@playwright/test'

test('calibration board registers a pawn move from skip-ahead', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('#chess-root .sq-facet')).toHaveCount(64)
  await expect(page.locator('[data-square="e2"] .sq-facet-lamp')).toBeVisible()
  await expect(page.locator('[data-square="e4"] .sq-facet-shade')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-carve')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-collar')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-plinth')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-waist')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-rim')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-neck')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-flute')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-umbra')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-cup')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-orb')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .piece-spark')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .pawn-globe')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .pawn-ring')).toBeVisible()
  const calOrb = await page.locator('[data-square="e2"] .piece-orb').boundingBox()
  expect(calOrb?.width ?? 0).toBeGreaterThanOrEqual(4)
  expect(calOrb?.height ?? 0).toBeGreaterThanOrEqual(4)
  const calSpark = await page.locator('[data-square="e2"] .piece-spark').boundingBox()
  expect(calSpark?.width ?? 0).toBeGreaterThanOrEqual(2.4)
  expect(calSpark?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  const calPearl = await page.locator('[data-square="d1"] .piece-pearl').first().boundingBox()
  expect(calPearl?.width ?? 0).toBeGreaterThanOrEqual(3.5)
  expect(calPearl?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="d1"] .queen-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="d1"] .queen-orb')).toHaveCount(5)
  const calQueenCup = await page.locator('[data-square="d1"] .piece-cup').boundingBox()
  expect(calQueenCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  const calCross = await tallestCrossBox(page, 'e1')
  expect(calCross.w).toBeGreaterThanOrEqual(2)
  const calCrossBar = await widestOverlayBox(page, 'e1', '.piece-cross')
  expect(calCrossBar.h).toBeGreaterThanOrEqual(2.6)
  const calKingCup = await page.locator('[data-square="e1"] .piece-cup').boundingBox()
  expect(calKingCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-cross-stem')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-cross-bar')).toBeVisible()
  const calCleft = await tallestOverlayBox(page, 'c1', '.piece-cleft')
  expect(calCleft.w).toBeGreaterThanOrEqual(2)
  const calCleftBar = await widestOverlayBox(page, 'c1', '.piece-cleft')
  expect(calCleftBar.h).toBeGreaterThanOrEqual(2.6)
  await expect(page.locator('[data-square="c1"] .bishop-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="c1"] .bishop-cleft-stem')).toBeVisible()
  const calMerlon = await deepestOverlayBox(page, 'a1', '.piece-merlon')
  expect(calMerlon.h).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="a1"] .rook-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="a1"] .rook-crenel')).toHaveCount(2)
  const calRookCup = await page.locator('[data-square="a1"] .piece-cup').boundingBox()
  expect(calRookCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="e2"] .piece-ferrule')).toBeVisible()
  const calFerrule = await page.locator('[data-square="e2"] .piece-ferrule').boundingBox()
  expect(calFerrule?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  await expect(page.locator('[data-square="b1"] .piece-eye')).toBeVisible()
  await expect(page.locator('[data-square="b1"] .knight-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="b1"] .knight-iris')).toBeVisible()
  const calEye = await page.locator('[data-square="b1"] .piece-eye').boundingBox()
  expect(calEye?.width ?? 0).toBeGreaterThanOrEqual(2.4)
  expect(calEye?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  await expect(page.locator('[data-square="e2"] feSpecularLighting')).toHaveCount(2)
  await expect(page.locator('[data-square="e2"] fePointLight')).toHaveCount(3)
  await expect(page.locator('[data-square="e2"] feDiffuseLighting')).toHaveCount(1)
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
  await expect(page.locator('#board-guide')).toContainText(/four White moves|Archive reply/)
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

async function overlayBoxes(page: Page, square: string, sel: string): Promise<Array<{ w: number; h: number }>> {
  return page.locator(`[data-square="${square}"] ${sel}`).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect()
      return { w: r.width, h: r.height }
    }),
  )
}

async function tallestOverlayBox(page: Page, square: string, sel: string): Promise<{ w: number; h: number }> {
  const boxes = await overlayBoxes(page, square, sel)
  const stem = boxes.filter((b) => b.h > b.w).sort((a, b) => b.h - a.h)[0]
  return stem ?? { w: 0, h: 0 }
}

async function deepestOverlayBox(page: Page, square: string, sel: string): Promise<{ w: number; h: number }> {
  const boxes = await overlayBoxes(page, square, sel)
  return [...boxes].sort((a, b) => b.h - a.h)[0] ?? { w: 0, h: 0 }
}

async function widestOverlayBox(page: Page, square: string, sel: string): Promise<{ w: number; h: number }> {
  const boxes = await overlayBoxes(page, square, sel)
  return [...boxes].sort((a, b) => b.w - a.w)[0] ?? { w: 0, h: 0 }
}

async function tallestCrossBox(page: Page, square: string): Promise<{ w: number; h: number }> {
  return tallestOverlayBox(page, square, '.piece-cross')
}

async function expectPhoneHintProveHitTargets(page: Page) {
  const hintBox = await page.locator('#btn-hint').boundingBox()
  const nextBox = await page.locator('#btn-next').boundingBox()
  expect(hintBox).toBeTruthy()
  expect(nextBox).toBeTruthy()
  expect(nextBox!.x).toBeGreaterThan(hintBox!.x + 80)
  expect(Math.abs(nextBox!.y - hintBox!.y)).toBeLessThan(16)
  expect(nextBox!.height).toBeLessThan(52)
  expect(nextBox!.height).toBeGreaterThanOrEqual(44)
  expect(nextBox!.width).toBeGreaterThanOrEqual(44)
  expect(hintBox!.height).toBeGreaterThanOrEqual(44)
  expect(hintBox!.width).toBeGreaterThanOrEqual(44)
}

function seedChapterIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 1,
    sceneIndex: 0,
    highestUnlockedChapter: 1,
    lastScreen: 'title',
    chapter1Complete: false,
    chapter2Complete: false,
    completedSceneIds: [],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion'],
    unlockedDuelVariantIds: ['alexion-mentor'],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 0,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1100, peak: 1100, rated: 0 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterIIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 2,
    sceneIndex: 0,
    highestUnlockedChapter: 2,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: false,
    completedSceneIds: [],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion'],
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
    ladder: { rating: 1180, peak: 1180, rated: 1 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterIIIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 3,
    sceneIndex: 0,
    highestUnlockedChapter: 3,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: ['c2-reflection', 'c2-freeplay'],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion'],
    unlockedDuelVariantIds: ['alexion-mentor'],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 100,
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
}

function seedChapterIVUnlocked() {
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
}

/** Mid-age Chapter IV save: after Nysa, parked on `c4-before-cassian` (scene 9). */
function seedChapterIVAfterNysa() {
  const save = {
    version: 3,
    chapterIndex: 4,
    sceneIndex: 9,
    highestUnlockedChapter: 4,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-intro',
      'c4-codex-paradox',
      'c4-puzzle-fianchetto',
      'c4-puzzle-overreach',
      'c4-puzzle-battery',
      'c4-after-puzzles',
      'c4-before-nysa',
      'c4-match-nysa',
      'c4-after-nysa',
    ],
    completedPuzzleIds: ['c4-puzzle-fianchetto', 'c4-puzzle-overreach', 'c4-puzzle-battery'],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa'],
    unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law', 'nysa-frontier'],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 135,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1235, peak: 1235, rated: 3 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterVUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 5,
    sceneIndex: 0,
    highestUnlockedChapter: 5,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: ['c3-reflection', 'c3-freeplay', 'c4-reflection', 'c4-freeplay'],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian'],
    unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law', 'nysa-frontier', 'cassian-paradox'],
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
}

/** Mid-age Chapter V save: after Gage, parked on `c5-before-helia` (scene 9). */
function seedChapterVAfterGage() {
  const save = {
    version: 3,
    chapterIndex: 5,
    sceneIndex: 9,
    highestUnlockedChapter: 5,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-intro',
      'c5-codex-discipline',
      'c5-puzzle-luft',
      'c5-puzzle-conversion',
      'c5-puzzle-squeeze',
      'c5-after-puzzles',
      'c5-before-gage',
      'c5-match-gage',
      'c5-after-gage',
    ],
    completedPuzzleIds: ['c5-puzzle-luft', 'c5-puzzle-conversion', 'c5-puzzle-squeeze'],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 150,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1260, peak: 1260, rated: 4 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterVIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 6,
    sceneIndex: 0,
    highestUnlockedChapter: 6,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: ['c3-reflection', 'c3-freeplay', 'c4-reflection', 'c4-freeplay', 'c5-reflection', 'c5-freeplay'],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 160,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1280, peak: 1280, rated: 4 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

/** Mid-age Chapter VI save: after Prax, parked on `c6-before-iota` (scene 9). */
function seedChapterVIAfterPrax() {
  const save = {
    version: 3,
    chapterIndex: 6,
    sceneIndex: 9,
    highestUnlockedChapter: 6,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-intro',
      'c6-codex-ledger',
      'c6-puzzle-outpost',
      'c6-puzzle-precision',
      'c6-puzzle-backrank',
      'c6-after-puzzles',
      'c6-before-prax',
      'c6-match-prax',
      'c6-after-prax',
    ],
    completedPuzzleIds: ['c6-puzzle-outpost', 'c6-puzzle-precision', 'c6-puzzle-backrank'],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 165,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1290, peak: 1290, rated: 5 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterVIIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 7,
    sceneIndex: 0,
    highestUnlockedChapter: 7,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-reflection',
      'c6-freeplay',
    ],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
      'iota-threshold',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 180,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1310, peak: 1310, rated: 5 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

/** Mid-age Chapter VII save: after Mira, parked on `c7-before-soren` (scene 9). */
function seedChapterVIIAfterMira() {
  const save = {
    version: 3,
    chapterIndex: 7,
    sceneIndex: 9,
    highestUnlockedChapter: 7,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-reflection',
      'c6-freeplay',
      'c7-intro',
      'c7-codex-synthesis',
      'c7-puzzle-switch',
      'c7-puzzle-wing',
      'c7-puzzle-smother',
      'c7-after-puzzles',
      'c7-before-mira',
      'c7-match-mira',
      'c7-after-mira',
    ],
    completedPuzzleIds: ['c7-puzzle-switch', 'c7-puzzle-wing', 'c7-puzzle-smother'],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: [
      'alexion',
      'kallistos',
      'nysa',
      'cassian',
      'gage',
      'helia',
      'prax',
      'iota',
      'mira',
    ],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
      'iota-threshold',
      'mira-practical',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 185,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1320, peak: 1320, rated: 6 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterVIIIUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 8,
    sceneIndex: 0,
    highestUnlockedChapter: 8,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-reflection',
      'c6-freeplay',
      'c7-reflection',
      'c7-freeplay',
    ],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota', 'mira', 'soren'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
      'iota-threshold',
      'mira-practical',
      'soren-answer',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 200,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1340, peak: 1340, rated: 6 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

/** Mid-age Chapter VIII save: after Voss, parked on `c8-before-elara` (scene 9). */
function seedChapterVIIIAfterVoss() {
  const save = {
    version: 3,
    chapterIndex: 8,
    sceneIndex: 9,
    highestUnlockedChapter: 8,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-reflection',
      'c6-freeplay',
      'c7-reflection',
      'c7-freeplay',
      'c8-intro',
      'c8-codex-board',
      'c8-puzzle-exchange',
      'c8-puzzle-fork',
      'c8-puzzle-file',
      'c8-after-puzzles',
      'c8-before-voss',
      'c8-match-voss',
      'c8-after-voss',
    ],
    completedPuzzleIds: ['c8-puzzle-exchange', 'c8-puzzle-fork', 'c8-puzzle-file'],
    stratarchiaUnlocked: false,
    duelUnlockedOpponentIds: [
      'alexion',
      'kallistos',
      'nysa',
      'cassian',
      'gage',
      'helia',
      'prax',
      'iota',
      'mira',
      'soren',
      'voss',
    ],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
      'iota-threshold',
      'mira-practical',
      'soren-answer',
      'voss-exchange',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 205,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1350, peak: 1350, rated: 7 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

function seedChapterIXUnlocked() {
  const save = {
    version: 3,
    chapterIndex: 9,
    sceneIndex: 0,
    highestUnlockedChapter: 9,
    lastScreen: 'title',
    chapter1Complete: true,
    chapter2Complete: true,
    completedSceneIds: [
      'c3-reflection',
      'c3-freeplay',
      'c4-reflection',
      'c4-freeplay',
      'c5-reflection',
      'c5-freeplay',
      'c6-reflection',
      'c6-freeplay',
      'c7-reflection',
      'c7-freeplay',
      'c8-reflection',
      'c8-freeplay',
    ],
    completedPuzzleIds: [],
    stratarchiaUnlocked: true,
    duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota', 'mira', 'soren', 'voss', 'elara'],
    unlockedDuelVariantIds: [
      'alexion-mentor',
      'kallistos-law',
      'nysa-frontier',
      'cassian-paradox',
      'gage-discipline',
      'helia-machine',
      'prax-precision',
      'iota-threshold',
      'mira-practical',
      'soren-answer',
      'voss-exchange',
      'elara-fork',
    ],
    codexUnlocks: [],
    titleUnlocks: [],
    chronicleEchoes: [],
    rankPoints: 220,
    cosmetics: {
      unlockedPieceSkins: ['classic-royal'],
      selectedPieceSkin: 'classic-royal',
    },
    tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    matchHistory: [],
    rivalMemory: {},
    ladder: { rating: 1370, peak: 1370, rated: 7 },
    inProgress: null,
  }
  localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
}

async function enterChapterI(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="1"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
}

async function skipToHangingKnight(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Develop your pieces|opening theory|Ancient Laws/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d4"]')).toBeVisible()
}

async function playBxd4(page: Page) {
  await page.locator('[data-square="c3"]').click()
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToCastlePuzzle(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/You saw it|forcing moves|tempo/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
}

async function playCastleKingside(page: Page) {
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="g1"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToMatePuzzle(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/rooks are now connected|two things at once|tempo matters/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e5"]')).toBeVisible()
}

async function playQh8Mate(page: Page) {
  await page.locator('[data-square="e5"]').click()
  await page.locator('[data-square="h8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#board-status')).toBeVisible()
  await expect(page.locator('.instrument-header')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function walkChapterITeachingToMate(page: Page) {
  await enterChapterI(page)
  await skipToHangingKnight(page)
  await playBxd4(page)
  await advanceToCastlePuzzle(page)
  await playCastleKingside(page)
  await advanceToMatePuzzle(page)
}

async function advanceToAmaraMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Amara|Egyptian symmetry|initiate/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterII(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="2"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter II\b/)
}

async function walkChapterIIDrillToMate(page: Page) {
  await enterChapterII(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Romantic Laws|Initiative|gambit/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="g7"]')).toBeVisible()
}

async function playQg8Mate(page: Page) {
  await page.locator('[data-square="g7"]').click()
  await page.locator('[data-square="g8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToRowanMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Rowan|restraint|chandeliers/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/King's Gambit|messy|Fire spreads/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="f4"]')).toBeVisible()
}

async function enterChapterIII(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="3"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter III\b/)
}

async function walkChapterIIIDrillToMate(page: Page) {
  await enterChapterIII(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Professor's Law|prophylaxis|Weak squares/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
}

async function advanceToDemetriosReturnMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Demetrios|waiting again|classical discipline/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Patience is the trap|nothing is on fire|writes law/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterIV(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="4"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter IV\b/)
}

async function walkChapterIVDrillsToMate(page: Page) {
  await enterChapterIV(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Fianchetto|Bactrian Frontier/)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="f1"]')).toBeVisible()
  await page.locator('[data-square="f1"]').click()
  await page.locator('[data-square="g2"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="g2"]')).toBeVisible()
  await page.locator('[data-square="g2"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="h3"]')).toBeVisible()
}

async function playQc8Mate(page: Page) {
  await page.locator('[data-square="h3"]').click()
  await page.locator('[data-square="c8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToNysaMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Nysa|frontier/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Take the center|waiting is a frontier|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function advanceToCassianMatch(page: Page) {
  await expect(page.locator('#narrative-body')).toContainText(/I do not need the center|diagonals stay hungry|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterV(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="5"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter V\b/)
}

async function walkChapterVDrillsToMate(page: Page) {
  await enterChapterV(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Luft|prophylaxis|Discipline colleges/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="h2"]')).toBeVisible()
  await page.locator('[data-square="h2"]').click()
  await page.locator('[data-square="h3"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d1"]')).toBeVisible()
  await page.locator('[data-square="d1"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="a1"]')).toBeVisible()
}

async function advanceToGageMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Gage|pause/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/pause is not fear|whole machine|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function advanceToHeliaMatch(page: Page) {
  await expect(page.locator('#narrative-body')).toContainText(/Advantage that is not converted|ugly facts|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterVI(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VI' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VI')
}

async function walkChapterVIDrillsToMate(page: Page) {
  await enterChapterVI(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Outpost|ledger|Precision/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="c3"]')).toBeVisible()
  await page.locator('[data-square="c3"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e3"]')).toBeVisible()
  await page.locator('[data-square="e3"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
}

async function playRe8Mate(page: Page) {
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="e8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToPraxMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Prax|public line|hole/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/line is already there|Follow it|ugly lines/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function advanceToIotaMatch(page: Page) {
  await expect(page.locator('#narrative-body')).toContainText(/plus of one pawn|finish it uglier|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterVII(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VII' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VII')
}

async function walkChapterVIIDrillsToMate(page: Page) {
  await enterChapterVII(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/School switch|Safer wing|Human Synthesis/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e4"]')).toBeVisible()
  await page.locator('[data-square="e4"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="c1"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e5"]')).toBeVisible()
}

async function playNf7Mate(page: Page) {
  await page.locator('[data-square="e5"]').click()
  await page.locator('[data-square="f7"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToMiraMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Mira|tool|switch/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/school that fits|drop it cheaper|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function advanceToSorenMatch(page: Page) {
  await expect(page.locator('#narrative-body')).toContainText(/Play a school|keep the first costume|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterVIII(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VIII' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VIII')
}

async function walkChapterVIIIDrillsToMate(page: Page) {
  await enterChapterVIII(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Sovereign exchange|Temporal fork|Alexandrine Board/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d2"]')).toBeVisible()
  await page.locator('[data-square="d2"]').click()
  await page.locator('[data-square="a5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d5"]')).toBeVisible()
  await page.locator('[data-square="d5"]').click()
  await page.locator('[data-square="c7"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="c3"]')).toBeVisible()
}

async function playQxg7Mate(page: Page) {
  await page.locator('[data-square="c3"]').click()
  await page.locator('[data-square="g7"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToVossMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Voss|office|exchange/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/office that hangs|budgeting a war|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function advanceToElaraMatch(page: Page) {
  await expect(page.locator('#narrative-body')).toContainText(/Two futures|file both|Begin/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
}

async function enterChapterIX(page: Page) {
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter IX' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter IX')
}

async function walkChapterIXDrillsToMate(page: Page) {
  await enterChapterIX(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Habit census|Compiled school|Apotheosis Engine/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await page.locator('[data-square="e6"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e4"]')).toBeVisible()
  await page.locator('[data-square="e4"]').click()
  await page.locator('[data-square="d6"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="a1"]')).toBeVisible()
}

async function playRa8Mate(page: Page) {
  await page.locator('[data-square="a1"]').click()
  await page.locator('[data-square="a8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
}

async function advanceToWrenMatch(page: Page) {
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Wren|census/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/captures you delay|file is wrong|underlined/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
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

test('widening a sealed phone calibration keeps Hint hidden', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
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
  await expect(page.locator('.calibration-rail__label')).toContainText('4 / 4')
  await expect(page.locator('#btn-hint')).toBeHidden()
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#btn-hint')).toBeHidden()
  await expect(page.locator('#btn-hint')).toBeDisabled()
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

test('compact calibration docks Prove and hides the duplicate manuscript', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('#chess-root .sq-facet')).toHaveCount(64)
  await expect(page.locator('[data-square="e2"] .sq-facet-lamp')).toBeVisible()
  const phoneOrb = await page.locator('[data-square="e2"] .piece-orb').boundingBox()
  expect(phoneOrb?.width ?? 0).toBeGreaterThanOrEqual(4)
  expect(phoneOrb?.height ?? 0).toBeGreaterThanOrEqual(4)
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .pawn-globe')).toBeVisible()
  await expect(page.locator('[data-square="e2"] .pawn-ring')).toBeVisible()
  const phonePearl = await page.locator('[data-square="d1"] .piece-pearl').first().boundingBox()
  expect(phonePearl?.width ?? 0).toBeGreaterThanOrEqual(3.5)
  expect(phonePearl?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="d1"] .queen-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="d1"] .queen-orb')).toHaveCount(5)
  const phoneQueenCup = await page.locator('[data-square="d1"] .piece-cup').boundingBox()
  expect(phoneQueenCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  const phoneCross = await tallestCrossBox(page, 'e1')
  expect(phoneCross.w).toBeGreaterThanOrEqual(2)
  const phoneCrossBar = await widestOverlayBox(page, 'e1', '.piece-cross')
  expect(phoneCrossBar.h).toBeGreaterThanOrEqual(2.6)
  const phoneKingCup = await page.locator('[data-square="e1"] .piece-cup').boundingBox()
  expect(phoneKingCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-cross-stem')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-cross-bar')).toBeVisible()
  const phoneCleft = await tallestOverlayBox(page, 'c1', '.piece-cleft')
  expect(phoneCleft.w).toBeGreaterThanOrEqual(2)
  const phoneCleftBar = await widestOverlayBox(page, 'c1', '.piece-cleft')
  expect(phoneCleftBar.h).toBeGreaterThanOrEqual(2.6)
  await expect(page.locator('[data-square="c1"] .bishop-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="c1"] .bishop-cleft-stem')).toBeVisible()
  const phoneMerlon = await deepestOverlayBox(page, 'a1', '.piece-merlon')
  expect(phoneMerlon.h).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="a1"] .rook-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="a1"] .rook-crenel')).toHaveCount(2)
  const phoneRookCup = await page.locator('[data-square="a1"] .piece-cup').boundingBox()
  expect(phoneRookCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="e2"] .piece-spark')).toBeVisible()
  const phoneSpark = await page.locator('[data-square="e2"] .piece-spark').boundingBox()
  expect(phoneSpark?.width ?? 0).toBeGreaterThanOrEqual(2.4)
  expect(phoneSpark?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  const phoneFerrule = await page.locator('[data-square="e2"] .piece-ferrule').boundingBox()
  expect(phoneFerrule?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  const phoneEye = await page.locator('[data-square="b1"] .piece-eye').boundingBox()
  expect(phoneEye?.width ?? 0).toBeGreaterThanOrEqual(2.4)
  expect(phoneEye?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  await expect(page.locator('[data-square="b1"] .knight-silhouette')).toBeVisible()
  await expect(page.locator('.screen-play--board-scene .play-crawl .chapter-label')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText('four White moves')
  await expect(page.locator('#lab-era-label')).toHaveText(/prologue/i)
  await expect(page.locator('#lab-era-label')).not.toContainText(/alexandrine/i)
  await expect(page.locator('#mobile-tips')).toBeHidden()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.move-ledger-wrap')).toBeHidden()
  await expect(page.locator('.instrument-toggles')).toBeHidden()
  await expect(page.locator('#lesson-note')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#btn-hint')).toBeHidden()
  const boardBox = await page.locator('#board-panel').boundingBox()
  const crawlBox = await page.locator('.play-crawl').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  expect(crawlBox?.height ?? 99).toBeLessThan(72)
  await page.locator('[data-square="e2"]').click()
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 20_000 })
  await expect(page.locator('.move-ledger-wrap')).toBeHidden()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#tactical-pulse')).toBeHidden()
  await expect(page.locator('#coach-tip')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#btn-hint')).toBeHidden()
  await expect(page.locator('#btn-reset')).toBeVisible()
  const proveBox = await page.locator('#btn-next').boundingBox()
  const resetBox = await page.locator('#btn-reset').boundingBox()
  expect(proveBox).toBeTruthy()
  expect(resetBox).toBeTruthy()
  expect(resetBox!.x).toBeGreaterThan(proveBox!.x + 80)
  expect(Math.abs(resetBox!.y - proveBox!.y)).toBeLessThan(16)
  expect(proveBox!.height).toBeGreaterThanOrEqual(44)
  expect(proveBox!.width).toBeGreaterThanOrEqual(44)
  expect(resetBox!.height).toBeGreaterThanOrEqual(44)
  expect(resetBox!.width).toBeGreaterThanOrEqual(44)
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  const toolsBox = await page.locator('.board-tools').boundingBox()
  expect(toolsBox?.height ?? 99).toBeLessThan(52)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(page.locator('#btn-hint')).toBeVisible()
  await expect(page.locator('#btn-hint')).toBeEnabled()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
})

test('phone duel after calibration keeps the dossier visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await page.locator('#btn-vestibule').click()
  const leaveOk = page.locator('#confirm-overlay:not(.hidden) #btn-confirm-ok')
  if (await leaveOk.isVisible()) await leaveOk.click()
  await expect(page.locator('#lab-overlay')).not.toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-duel').click()
  await page.locator('.duel-row').first().click()
  await page.locator('#btn-start-duel').click()
  const replaceOk = page.locator('#confirm-overlay:not(.hidden) #btn-confirm-ok')
  if (await replaceOk.isVisible()) await replaceOk.click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#narrative-body')).not.toHaveAttribute('data-calibration-lesson')
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toContainText(/Duel/)
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
})

test('hanging knight goal stays short on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterI(page)
  await skipToHangingKnight(page)
  const guide = page.locator('#board-guide')
  await expect(guide).toBeVisible()
  await expect(guide).toBeInViewport()
  await expect(guide).toContainText(/loose knight on d4/i)
  expect((await guide.innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeHidden()
  await expect(page.locator('.move-ledger-wrap')).toBeHidden()
  await expect(page.locator('.instrument-toggles')).toBeHidden()
  await expect(page.locator('#lesson-note')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.teaching-more')).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.lesson-lead')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('#narrative-kbd-hint')).toBeHidden()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeVisible()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter i/i)
  await expect(page.locator('#lab-era-label')).not.toContainText(/scholarly/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-undo')).toBeHidden()
  await expect(page.locator('#btn-reset')).toBeHidden()
  await expect(page.locator('#btn-hint')).toBeVisible()
  await expect(page.locator('#ai-persona')).toBeHidden()
  await expect(page.locator('#ai-persona')).not.toContainText(/Counterplay Engine|Court dossier/)
  await expect(page.locator('[data-square="c3"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-plinth')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-waist')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-rim')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-neck')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-flute')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-umbra')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-cup')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .piece-ferrule')).toBeVisible()
  const hkFerrule = await page.locator('[data-square="c3"] .piece-ferrule').boundingBox()
  expect(hkFerrule?.height ?? 0).toBeGreaterThanOrEqual(2.4)
  await expect(page.locator('[data-square="c3"] .piece-cleft').first()).toBeVisible()
  await expect(page.locator('[data-square="c3"] .bishop-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="c3"] .bishop-cleft-stem')).toBeVisible()
  const hkCleft = await tallestOverlayBox(page, 'c3', '.piece-cleft')
  expect(hkCleft.w).toBeGreaterThanOrEqual(2)
  const hkCleftBar = await widestOverlayBox(page, 'c3', '.piece-cleft')
  expect(hkCleftBar.h).toBeGreaterThanOrEqual(2.6)
  await expect(page.locator('[data-square="d1"] .piece-cross').first()).toBeVisible()
  const hkCross = await tallestCrossBox(page, 'd1')
  expect(hkCross.w).toBeGreaterThanOrEqual(2)
  const hkCrossBar = await widestOverlayBox(page, 'd1', '.piece-cross')
  expect(hkCrossBar.h).toBeGreaterThanOrEqual(2.6)
  const hkKingCup = await page.locator('[data-square="d1"] .piece-cup').boundingBox()
  expect(hkKingCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('[data-square="d4"] .piece-ferrule')).toBeVisible()
  await expect(page.locator('[data-square="d4"] .piece-mane')).toBeVisible()
  await expect(page.locator('[data-square="d4"] .piece-eye')).toBeVisible()
  await expect(page.locator('[data-square="d4"] .knight-silhouette')).toBeVisible()
  const hkEye = await page.locator('[data-square="d4"] .piece-eye').boundingBox()
  expect(hkEye?.width ?? 0).toBeGreaterThanOrEqual(2.4)
  await expect(page.locator('[data-square="c3"] feSpecularLighting')).toHaveCount(2)
  await expect(page.locator('[data-square="c3"] fePointLight')).toHaveCount(3)
  await expect(page.locator('[data-square="c3"] feDiffuseLighting')).toHaveCount(1)
  await page.locator('[data-square="c3"]').click()
  await expect(guide).toContainText(/loose knight on d4/i)
  await expect(page.locator('[data-square="d4"]')).toHaveClass(/sq-legal-capture/)
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#btn-undo')).toBeVisible()
  await expect(page.locator('#btn-reset')).toBeHidden()
  const advanceBox = await page.locator('#btn-next').boundingBox()
  const undoBox = await page.locator('#btn-undo').boundingBox()
  expect(advanceBox).toBeTruthy()
  expect(undoBox).toBeTruthy()
  expect(undoBox!.x).toBeGreaterThan(advanceBox!.x + 80)
  expect(Math.abs(undoBox!.y - advanceBox!.y)).toBeLessThan(16)
  const toolsBox = await page.locator('.board-tools').boundingBox()
  expect(toolsBox?.height ?? 99).toBeLessThan(52)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#tactical-pulse')).toBeHidden()
  await expect(page.locator('#coach-tip')).toBeHidden()
  await expect(guide).toContainText(/proof sealed/i)
  await expect(page.locator('#live-announcer')).toContainText(/proof sealed/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/You saw it|forcing moves|tempo/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('castle puzzle marks kingside as a castle destination', async ({ page }) => {
  await page.addInitScript(seedChapterIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await enterChapterI(page)
  await skipToHangingKnight(page)
  await playBxd4(page)
  await advanceToCastlePuzzle(page)
  await expect(page.locator('#board-guide')).toContainText(/Castle kingside/i)
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
  await expect(page.locator('[data-square="h1"] .piece-merlon').first()).toBeVisible()
  await expect(page.locator('[data-square="h1"] .rook-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  const castleMerlon = await deepestOverlayBox(page, 'h1', '.piece-merlon')
  expect(castleMerlon.h).toBeGreaterThanOrEqual(3.5)
  const castleRookCup = await page.locator('[data-square="h1"] .piece-cup').boundingBox()
  expect(castleRookCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('.story-beat')).toBeVisible()
  await expect(page.locator('.lesson-lead')).toBeVisible()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('.teaching-card').filter({ hasText: 'Your goal' })).toBeVisible()
  await page.locator('[data-square="e1"]').click()
  await expect(page.locator('[data-square="g1"]')).toHaveClass(/sq-legal-castle/)
  await expect(page.locator('#board-guide')).toContainText(/castle kingside to g1/i)
  await page.locator('[data-square="g1"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
})

test('mate-in-one puzzle seals with queen to h8', { timeout: 90_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterITeachingToMate(page)
  await expect(page.locator('[data-square="e5"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e5"] .piece-pearl').first()).toBeVisible()
  await expect(page.locator('[data-square="e5"] .queen-silhouette')).toBeVisible()
  const mateQueenCup = await page.locator('[data-square="e5"] .piece-cup').boundingBox()
  expect(mateQueenCup?.height ?? 0).toBeGreaterThanOrEqual(3.5)
  await expect(page.locator('#board-guide')).toContainText(/Checkmate in one/i)
  await page.locator('[data-square="e5"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Checkmate in one/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="h8"]')).toHaveClass(/sq-legal/)
  await page.locator('[data-square="h8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#board-status')).toBeVisible()
  await expect(page.locator('.instrument-header')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
})

test('first Chapter I match lets Reed open against Amara', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterITeachingToMate(page)
  await playQh8Mate(page)
  await advanceToAmaraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Amara')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Open the center/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Open the center/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+\S+/, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter I match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterITeachingToMate(page)
  await playQh8Mate(page)
  await advanceToAmaraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Amara')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/Open the center/)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+\S+/, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter II king hunt solves on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterIIUnlocked)
  await page.goto('./')
  await walkChapterIIDrillToMate(page)
  await playQg8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Rowan|restraint|chandeliers/i)
})

test('Chapter II king hunt stays board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="2"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter II\b/)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Romantic Laws|Initiative|gambit/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="g7"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/eighth rank/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter ii\b/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('[data-square="g7"] .queen-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="d8"] .king-silhouette')).toBeVisible()
  await page.locator('[data-square="g7"]').click()
  await page.locator('[data-square="g8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Rowan|restraint|chandeliers/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter II match lets Reed open against Rowan', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterIIDrillToMate(page)
  await playQg8Mate(page)
  await advanceToRowanMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Rowan')
  await expect(page.locator('[data-square="f4"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/poisoned pawn/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="g1"]').click()
  await expect(page.locator('#board-guide')).toContainText(/poisoned pawn/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="f3"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="f3"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*Nf3/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*Nf3[!?]*\s+exf4/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter II match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterIIDrillToMate(page)
  await playQg8Mate(page)
  await advanceToRowanMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Rowan')
  await expect(page.locator('[data-square="f4"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/poisoned pawn/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="g1"]').click()
  await expect(page.locator('[data-square="f3"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="f3"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*Nf3/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*Nf3[!?]*\s+exf4/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter III prophylaxis solves on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterIIIUnlocked)
  await page.goto('./')
  await walkChapterIIIDrillToMate(page)
  await playRe8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Demetrios|waiting again|classical discipline/i)
})

test('Chapter III prophylaxis stays board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterIIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="3"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter III\b/)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Professor's Law|prophylaxis|Weak squares/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/e-file/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter iii\b/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('[data-square="e1"] .rook-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="g8"] .king-silhouette')).toBeVisible()
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="e8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Demetrios|waiting again|classical discipline/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter III match lets Reed open against Demetrios', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIIIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterIIIDrillToMate(page)
  await playRe8Mate(page)
  await advanceToDemetriosReturnMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Demetrios')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/quiet threats|pawn tempi/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/quiet threats|pawn tempi/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter III match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterIIIDrillToMate(page)
  await playRe8Mate(page)
  await advanceToDemetriosReturnMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Demetrios')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/quiet threats|pawn tempi/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('title honor guard shows carved ivory and lapis', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('#title-honor .title-honor__piece')).toHaveCount(10)
  await expect(page.locator('#title-honor .piece-carve').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-lit').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-collar').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-plinth').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-waist').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-rim').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-neck').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-flute').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-umbra').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-cup').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-ferrule').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-mane').first()).toBeVisible()
  await expect(page.locator('#title-honor .piece-eye')).toHaveCount(2)
  await expect(page.locator('#title-honor .knight-silhouette')).toHaveCount(2)
  await expect(page.locator('#title-honor .bishop-silhouette')).toHaveCount(2)
  await expect(page.locator('#title-honor .queen-silhouette')).toHaveCount(2)
  await expect(page.locator('#title-honor .rook-silhouette')).toHaveCount(2)
  await expect(page.locator('#title-honor .pawn-silhouette')).toHaveCount(0)
  await expect(page.locator('#title-honor .king-silhouette')).toHaveCount(2)
  await expect(page.locator('#title-honor .king-cross-stem')).toHaveCount(2)
  await expect(page.locator('#title-honor .king-cross-bar')).toHaveCount(2)
  await expect(page.locator('#title-honor .rook-crenel')).toHaveCount(4)
  await expect(page.locator('#title-honor .queen-orb')).toHaveCount(10)
  await expect(page.locator('#title-honor .bishop-cleft-stem')).toHaveCount(2)
  await expect(page.locator('#title-honor .piece-pearl')).toHaveCount(10)
  await expect(page.locator('#title-honor .piece-merlon')).toHaveCount(4)
  await expect(page.locator('#title-honor .piece-cleft')).toHaveCount(4)
  await expect(page.locator('#title-honor .piece-cross')).toHaveCount(4)
  await expect(page.locator('#title-honor .piece-orb')).toHaveCount(0)
  await expect(page.locator('#title-honor .piece-spark')).toHaveCount(0)
  await expect(page.locator('#title-honor .piece-ground').first()).toBeVisible()
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
  await expect(page.locator('#lab-era-label')).toContainText(/Prologue · Present/i)
  const boardBox = await page.locator('#board-panel').boundingBox()
  const manuscriptBox = await page.locator('#manuscript-panel').boundingBox()
  const wrapBox = await page.locator('.board-wrap').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(manuscriptBox).toBeTruthy()
  expect(wrapBox).toBeTruthy()
  expect(boardBox!.x).toBeGreaterThan(manuscriptBox!.x)
  expect(Math.abs(boardBox!.y - manuscriptBox!.y)).toBeLessThan(80)
  expect(wrapBox!.width).toBeGreaterThanOrEqual(240)
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

test('starting a duel registers e2-e4 and an archive reply', { timeout: 90_000 }, async ({ page }) => {
  await page.goto('./')
  await page.locator('#btn-enter-archive').click({ timeout: 15_000 })
  await page.locator('#btn-duel').click()
  await page.locator('.duel-row').first().click()
  await page.locator('#btn-start-duel').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/accountable|loose pieces/i)
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/accountable|loose pieces/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText('e4')
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+\S+/, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('[data-square="e2"] .piece-lit, [data-square="e4"] .piece-lit').first()).toBeVisible()
  await page.locator('[data-square="g1"]').click()
  await expect(page.locator('[data-square="f3"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="f3"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/Nf3|Nxf3/i)
  await expect(page.locator('#move-ledger')).toContainText(/2\.\s*\S+/, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await page.locator('[data-square="d2"]').click()
  await expect(page.locator('[data-square="d4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/d4/)
  await expect(page.locator('#move-ledger')).toContainText(/3\.\s*\S+/, { timeout: 25_000 })
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

test('post-Chapter IV chapters screen invites the Machine of Discipline', async ({ page }) => {
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
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-machine')).toBeVisible()
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
  await expect(page.locator('.chapter-btn, .chapter-locked').filter({ hasText: 'Paradox Masters' })).toBeVisible()
  await expect(page.locator('.doctrine-atlas')).toContainText('Machine')
  await expect(page.locator('.doctrine-atlas')).toContainText('Silicon')
  await page.locator('#btn-plateau-machine').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter V')
  await expect(page.locator('#narrative-body')).toContainText(/Gage|Helia|pause|discipline/i)
})

test('post-Chapter V chapters screen invites the Silicon Threshold', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 5,
      sceneIndex: 0,
      highestUnlockedChapter: 5,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-freeplay',
        'c4-reflection',
        'c4-freeplay',
        'c5-reflection',
        'c5-match-helia',
        'c5-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'nysa-frontier',
        'cassian-paradox',
        'gage-discipline',
        'helia-machine',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 160,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1280, peak: 1280, rated: 4 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-silicon')).toBeVisible()
  await expect(page.locator('#btn-plateau-machine')).toHaveCount(0)
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
  await expect(page.locator('.doctrine-atlas')).toContainText('Silicon')
  await expect(page.locator('.doctrine-atlas')).toContainText('Synthesis')
  await page.locator('#btn-plateau-silicon').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VI')
  await expect(page.locator('#narrative-body')).toContainText(/Prax|Iota|ledger|outpost/i)
})

test('post-Chapter VI chapters screen invites the Human Synthesis', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 6,
      sceneIndex: 0,
      highestUnlockedChapter: 6,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-freeplay',
        'c4-reflection',
        'c4-freeplay',
        'c5-reflection',
        'c5-freeplay',
        'c6-reflection',
        'c6-match-iota',
        'c6-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'nysa-frontier',
        'cassian-paradox',
        'gage-discipline',
        'helia-machine',
        'prax-precision',
        'iota-threshold',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 180,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1310, peak: 1310, rated: 5 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-synthesis')).toBeVisible()
  await expect(page.locator('#btn-plateau-silicon')).toHaveCount(0)
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
  await expect(page.locator('.doctrine-atlas')).toContainText('Synthesis')
  await page.locator('#btn-plateau-synthesis').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VII')
  await expect(page.locator('#narrative-body')).toContainText(/Mira|Soren|switch|school/i)
})

test('post-Chapter VII chapters screen invites the Alexandrine Board', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 7,
      sceneIndex: 0,
      highestUnlockedChapter: 7,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-freeplay',
        'c4-reflection',
        'c4-freeplay',
        'c5-reflection',
        'c5-freeplay',
        'c6-reflection',
        'c6-freeplay',
        'c7-reflection',
        'c7-match-soren',
        'c7-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota', 'mira', 'soren'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'nysa-frontier',
        'cassian-paradox',
        'gage-discipline',
        'helia-machine',
        'prax-precision',
        'iota-threshold',
        'mira-practical',
        'soren-answer',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 200,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1340, peak: 1340, rated: 6 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-alexandrine')).toBeVisible()
  await expect(page.locator('#btn-plateau-synthesis')).toHaveCount(0)
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
  await expect(page.locator('.doctrine-atlas')).toContainText('Board')
  await page.locator('#btn-plateau-alexandrine').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VIII')
  await expect(page.locator('#narrative-body')).toContainText(/Voss|Elara|exchange|fork/i)
})

test('post-Chapter VIII chapters screen invites the Apotheosis Engine', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 8,
      sceneIndex: 0,
      highestUnlockedChapter: 8,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-freeplay',
        'c4-reflection',
        'c4-freeplay',
        'c5-reflection',
        'c5-freeplay',
        'c6-reflection',
        'c6-freeplay',
        'c7-reflection',
        'c7-freeplay',
        'c8-reflection',
        'c8-match-elara',
        'c8-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: true,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota', 'mira', 'soren', 'voss', 'elara'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'nysa-frontier',
        'cassian-paradox',
        'gage-discipline',
        'helia-machine',
        'prax-precision',
        'iota-threshold',
        'mira-practical',
        'soren-answer',
        'voss-exchange',
        'elara-fork',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 220,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1370, peak: 1370, rated: 7 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('A new age is open')
  await expect(page.locator('#btn-plateau-apotheosis')).toBeVisible()
  await expect(page.locator('#btn-plateau-alexandrine')).toHaveCount(0)
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
  await expect(page.locator('.doctrine-atlas')).toContainText('Apex')
  await page.locator('#btn-plateau-apotheosis').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter IX')
  await expect(page.locator('#narrative-body')).toContainText(/Wren|Bram|census/i)
})

test('post-Chapter IX chapters screen shows mastery plateau hub', async ({ page }) => {
  await page.addInitScript(() => {
    const save = {
      version: 3,
      chapterIndex: 9,
      sceneIndex: 0,
      highestUnlockedChapter: 9,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-freeplay',
        'c4-reflection',
        'c4-freeplay',
        'c5-reflection',
        'c5-freeplay',
        'c6-reflection',
        'c6-freeplay',
        'c7-reflection',
        'c7-freeplay',
        'c8-reflection',
        'c8-freeplay',
        'c9-reflection',
        'c9-match-bram',
        'c9-freeplay',
      ],
      completedPuzzleIds: [],
      stratarchiaUnlocked: true,
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian', 'gage', 'helia', 'prax', 'iota', 'mira', 'soren', 'voss', 'elara', 'wren', 'bram'],
      unlockedDuelVariantIds: [
        'alexion-mentor',
        'kallistos-law',
        'nysa-frontier',
        'cassian-paradox',
        'gage-discipline',
        'helia-machine',
        'prax-precision',
        'iota-threshold',
        'mira-practical',
        'soren-answer',
        'voss-exchange',
        'elara-fork',
        'wren-census',
        'bram-fused',
      ],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 240,
      cosmetics: {
        unlockedPieceSkins: ['classic-royal'],
        selectedPieceSkin: 'classic-royal',
      },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: { rating: 1400, peak: 1400, rated: 8 },
      inProgress: null,
    }
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify(save))
  })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.plateau-hub')).toBeVisible()
  await expect(page.locator('.plateau-hub')).toContainText('Mastery plateau')
  await expect(page.locator('.plateau-hub')).toContainText('I–IX are sealed')
  await expect(page.locator('#btn-plateau-duel')).toBeVisible()
  await expect(page.locator('#btn-plateau-apotheosis')).toHaveCount(0)
  await expect(page.locator('.roadmap-teaser')).toHaveCount(0)
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
  await page.addInitScript(seedChapterIVUnlocked)
  await page.goto('./')
  await walkChapterIVDrillsToMate(page)
  await playQc8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Nysa|frontier/i)
})

test('Chapter IV drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterIVUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="4"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter IV\b/)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Fianchetto|Bactrian Frontier/)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="f1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/bishop on g2/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter iv\b/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('[data-square="f1"] .bishop-silhouette')).toBeVisible()
  await page.locator('[data-square="f1"]').click()
  await page.locator('[data-square="g2"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="g2"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="g2"] .bishop-silhouette')).toBeVisible()
  await page.locator('[data-square="g2"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="h3"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await page.locator('[data-square="h3"]').click()
  await page.locator('[data-square="c8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Nysa|frontier/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter IV match lets Reed open against Nysa', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIVUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterIVDrillsToMate(page)
  await playQc8Mate(page)
  await advanceToNysaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Nysa')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/defend twice/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/defend twice/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+g6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter IV match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIVUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterIVDrillsToMate(page)
  await playQc8Mate(page)
  await advanceToNysaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Nysa')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/defend twice/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+g6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('second Chapter IV match lets Reed open against Cassian', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIVAfterNysa)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.chapter-btn[data-idx="4"] .chapter-btn__state')).toHaveText('Resume')
  await page.locator('.chapter-btn[data-idx="4"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter IV\b/)
  await advanceToCassianMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Cassian')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Hold the center|long diagonal/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Hold the center|long diagonal/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+Nf6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('second Chapter IV match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIVAfterNysa)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterIV(page)
  await advanceToCassianMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Cassian')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Hold the center|long diagonal/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+Nf6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter V drills solve on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterVUnlocked)
  await page.goto('./')
  await walkChapterVDrillsToMate(page)
  await playRa8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Gage|pause/i)
})

test('Chapter V drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterVUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn[data-idx="5"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter V\b/)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Luft|prophylaxis|Discipline colleges/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="h2"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/h-pawn to h3|luft/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter v\b/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('[data-square="h2"] .pawn-silhouette')).toBeVisible()
  await page.locator('[data-square="h2"]').click()
  await page.locator('[data-square="h3"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="d1"] .queen-silhouette')).toBeVisible()
  await page.locator('[data-square="d1"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="a1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="a1"] .rook-silhouette')).toBeVisible()
  await page.locator('[data-square="a1"]').click()
  await page.locator('[data-square="a8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Gage|pause/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter V match lets Reed open against Gage', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterVDrillsToMate(page)
  await playRa8Mate(page)
  await advanceToGageMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Gage')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Gage wants named|refuse the square/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Gage wants named|refuse the square/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+d6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter V match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterVDrillsToMate(page)
  await playRa8Mate(page)
  await advanceToGageMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Gage')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Gage wants named|refuse the square/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+d6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('second Chapter V match lets Reed open against Helia', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVAfterGage)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.chapter-btn[data-idx="5"] .chapter-btn__state')).toHaveText('Resume')
  await page.locator('.chapter-btn[data-idx="5"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter V\b/)
  await advanceToHeliaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Helia')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Cash what you win|donate counterplay/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Cash what you win|donate counterplay/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+e6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('second Chapter V match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVAfterGage)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterV(page)
  await advanceToHeliaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Helia')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Cash what you win|donate counterplay/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+e6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter VI drills solve on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterVIUnlocked)
  await page.goto('./')
  await walkChapterVIDrillsToMate(page)
  await playRe8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Prax|public line|hole/i)
})

test('Chapter VI drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterVIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VI' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VI')
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Outpost|ledger|Precision/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="c3"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/outpost|d5/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter vi/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await expect(page.locator('[data-square="c3"] .knight-silhouette')).toBeVisible()
  await page.locator('[data-square="c3"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e3"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="e3"] .knight-silhouette')).toBeVisible()
  await page.locator('[data-square="e3"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="e8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Prax|public line|hole/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter VI match lets Reed open against Prax', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterVIDrillsToMate(page)
  await playRe8Mate(page)
  await advanceToPraxMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Prax')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Occupy the hole/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Occupy the hole/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+c5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter VI match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterVIDrillsToMate(page)
  await playRe8Mate(page)
  await advanceToPraxMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Prax')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Occupy the hole/)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+c5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('second Chapter VI match lets Reed open against Iota', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIAfterPrax)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.chapter-btn[data-idx="6"] .chapter-btn__state')).toHaveText('Resume')
  await page.locator('.chapter-btn[data-idx="6"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter VI\b/)
  await advanceToIotaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Iota')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Finish the plus|back rank/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Finish the plus|back rank/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+c6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('second Chapter VI match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIAfterPrax)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterVI(page)
  await advanceToIotaMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Iota')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Finish the plus|back rank/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+c6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter VII drills solve on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterVIIUnlocked)
  await page.goto('./')
  await walkChapterVIIDrillsToMate(page)
  await playNf7Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Mira|tool|switch/i)
})

test('Chapter VII drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterVIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VII' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VII')
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/School switch|Safer wing|Human Synthesis/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e4"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/hanging knight|d5/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter vii/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await page.locator('[data-square="e4"]').click()
  await page.locator('[data-square="d5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await page.locator('[data-square="e1"]').click()
  await page.locator('[data-square="c1"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e5"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="e5"] .knight-silhouette')).toBeVisible()
  await page.locator('[data-square="e5"]').click()
  await page.locator('[data-square="f7"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Mira|tool|switch/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter VII match lets Reed open against Mira', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterVIIDrillsToMate(page)
  await playNf7Mate(page)
  await advanceToMiraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Mira')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Take what hangs/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Take what hangs/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter VII match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterVIIDrillsToMate(page)
  await playNf7Mate(page)
  await advanceToMiraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Mira')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Take what hangs/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('second Chapter VII match lets Reed open against Soren', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIAfterMira)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.chapter-btn[data-idx="7"] .chapter-btn__state')).toHaveText('Resume')
  await page.locator('.chapter-btn[data-idx="7"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter VII\b/)
  await advanceToSorenMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Soren')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/Meet the reply school|first costume/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/Meet the reply school|first costume/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+g6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('second Chapter VII match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIAfterMira)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterVII(page)
  await advanceToSorenMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Soren')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/Meet the reply school|first costume/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+g6/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter VIII drills solve on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterVIIIUnlocked)
  await page.goto('./')
  await walkChapterVIIIDrillsToMate(page)
  await playQxg7Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Voss|office|exchange/i)
})

test('Chapter VIII drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterVIIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter VIII' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter VIII')
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Sovereign exchange|Temporal fork|Alexandrine Board/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d2"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/hanging queen|a5/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter viii/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await page.locator('[data-square="d2"]').click()
  await page.locator('[data-square="a5"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="d5"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="d5"] .knight-silhouette')).toBeVisible()
  await page.locator('[data-square="d5"]').click()
  await page.locator('[data-square="c7"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="c3"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await page.locator('[data-square="c3"]').click()
  await page.locator('[data-square="g7"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Voss|office|exchange/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter VIII match lets Reed open against Voss', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIIUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterVIIIDrillsToMate(page)
  await playQxg7Mate(page)
  await advanceToVossMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Voss')
  await expect(page.locator('[data-square="d2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/vacant office/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="d2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/vacant office/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="d4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*d4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*d4!?\s+d5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter VIII match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIIUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterVIIIDrillsToMate(page)
  await playQxg7Mate(page)
  await advanceToVossMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Voss')
  await expect(page.locator('[data-square="d2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/vacant office/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="d2"]').click()
  await expect(page.locator('[data-square="d4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*d4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*d4!?\s+d5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('second Chapter VIII match lets Reed open against Elara', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIIAfterVoss)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await expect(page.locator('.chapter-btn[data-idx="8"] .chapter-btn__state')).toHaveText('Resume')
  await page.locator('.chapter-btn[data-idx="8"]').click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toHaveText(/Chapter VIII\b/)
  await advanceToElaraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Elara')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/File both futures|second office/i)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/File both futures|second office/i)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+c5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('second Chapter VIII match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterVIIIAfterVoss)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterChapterVIII(page)
  await advanceToElaraMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Elara')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/File both futures|second office/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4[!?]*\s+c5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
})

test('Chapter IX drills solve on the live board', async ({ page }) => {
  await page.addInitScript(seedChapterIXUnlocked)
  await page.goto('./')
  await walkChapterIXDrillsToMate(page)
  await playRa8Mate(page)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Wren|census/i)
})

test('Chapter IX drills stay board-first on the phone instrument', async ({ page }) => {
  await page.addInitScript(seedChapterIXUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.locator('#btn-chapters').click({ timeout: 15_000 })
  await page.locator('.chapter-btn', { hasText: 'Chapter IX' }).click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await expect(page.locator('#play-chapter-label')).toContainText('Chapter IX')
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toContainText(/Habit census|Compiled school|Apotheosis Engine/i)
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#narrative-body')).toBeHidden()
  await expect(page.locator('.teaching').first()).toBeHidden()
  await expect(page.locator('.story-beat')).toBeHidden()
  await expect(page.locator('.top-bar')).toBeHidden()
  await expect(page.locator('#btn-vestibule')).toBeVisible()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#btn-next')).toBeInViewport()
  await expect(page.locator('#btn-next-hint')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('.instrument-header')).toBeHidden()
  await expect(page.locator('#board-guide')).toBeVisible()
  await expect(page.locator('#board-guide')).toBeInViewport()
  await expect(page.locator('#board-guide')).toContainText(/pinned knight|e6/i)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  await expect(page.locator('#lab-era-label')).toHaveText(/chapter ix/i)
  expect(
    await page.locator('#lab-era-label').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expectPhoneHintProveHitTargets(page)
  await page.locator('[data-square="e2"]').click()
  await page.locator('[data-square="e6"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="e4"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('.board-tools #btn-next')).toBeVisible()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await expect(page.locator('[data-square="e4"] .knight-silhouette')).toBeVisible()
  await page.locator('[data-square="e4"]').click()
  await page.locator('[data-square="d6"]').click()
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('[data-square="a1"]')).toBeVisible()
  await expect(page.locator('#manuscript-panel')).toBeHidden()
  await expect(page.locator('#turn-pulse')).toBeHidden()
  await page.locator('[data-square="a1"]').click()
  await page.locator('[data-square="a8"]').click()
  await expect(page.locator('#board-status')).toContainText(/Checkmate/i)
  await expect(page.locator('#btn-next')).toBeEnabled({ timeout: 20_000 })
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).toBeVisible()
  await expect(page.locator('#narrative-body')).toContainText(/Wren|census/i)
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#manuscript-panel #btn-next')).toBeVisible()
})

test('first Chapter IX match lets Reed open against Wren', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIXUnlocked)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await walkChapterIXDrillsToMate(page)
  await playRa8Mate(page)
  await advanceToWrenMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Wren')
  await expect(page.locator('[data-square="e2"] .piece-lit')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  await expect(page.locator('#board-guide')).toContainText(/census circled/)
  await expect(page.locator('#board-status')).toBeHidden()
  await expect(page.locator('.play-crawl')).toBeVisible()
  await expect(page.locator('.move-ledger-wrap')).toBeVisible()
  await expect(page.locator('.instrument-toggles')).toBeVisible()
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('#board-guide')).toContainText(/census circled/)
  await expect(page.locator('#board-guide')).not.toContainText(/legal targets/i)
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
})

test('first Chapter IX match stays board-first on the phone instrument', { timeout: 120_000 }, async ({ page }) => {
  await page.addInitScript(seedChapterIXUnlocked)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await walkChapterIXDrillsToMate(page)
  await playRa8Mate(page)
  await advanceToWrenMatch(page)
  await expect(page.locator('#narrative-body .match-card__name')).toContainText('Wren')
  await expect(page.locator('[data-square="e2"] .pawn-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e1"] .king-silhouette')).toBeVisible()
  await expect(page.locator('[data-square="e8"] .king-silhouette')).toBeVisible()
  await expect(page.locator('#chess-root .piece')).toHaveCount(32)
  const boardBox = await page.locator('#board-panel').boundingBox()
  expect(boardBox).toBeTruthy()
  expect(boardBox!.width).toBeGreaterThan(300)
  expect(boardBox!.y).toBeLessThan(220)
  await expect(page.locator('#board-panel')).toBeInViewport()
  await expect(page.locator('#manuscript-panel')).toBeVisible()
  await expect(page.locator('#board-guide')).toContainText(/census circled/)
  expect((await page.locator('#board-guide').innerText()).trim().length).toBeLessThan(80)
  expect(
    await page.locator('#board-guide').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false)
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.locator('[data-square="e2"]').click()
  await expect(page.locator('[data-square="e4"]')).toHaveClass(/sq-legal-dot/)
  await page.locator('[data-square="e4"]').click()
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4/i)
  await expect(page.locator('#move-ledger')).toContainText(/1\.\s*e4!?\s+e5/i, { timeout: 25_000 })
  await expect(page.locator('#turn-pulse')).toContainText(/White turn/i, { timeout: 25_000 })
  await expect(page.locator('#btn-reset')).toBeVisible()
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await expect(page.locator('#btn-hint')).toBeVisible()
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('resize'))
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
  expect(await page.locator('#btn-reset').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
  expect(await page.locator('#btn-hint').evaluate((el) => getComputedStyle(el).minHeight)).toBe('44px')
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
