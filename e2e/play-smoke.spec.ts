import { test, expect, type Page } from '@playwright/test'

test('calibration board registers a pawn move from skip-ahead', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-skip-ahead').click()
  await expect(page.locator('[data-square="e2"]')).toBeVisible()
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
  await expect(page.locator('[data-square="e2"] .piece-ferrule')).toBeVisible()
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
  await expect(page.locator('#lab-era-label')).toHaveText(/prologue/i)
  await expect(page.locator('#lab-era-label')).not.toContainText(/alexandrine/i)
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
  const hintBox = await page.locator('#btn-hint').boundingBox()
  const nextBox = await page.locator('#btn-next').boundingBox()
  expect(hintBox).toBeTruthy()
  expect(nextBox).toBeTruthy()
  expect(nextBox!.x).toBeGreaterThan(hintBox!.x + 80)
  expect(Math.abs(nextBox!.y - hintBox!.y)).toBeLessThan(16)
  expect(nextBox!.height).toBeLessThan(52)
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
  await expect(page.locator('[data-square="c3"] .piece-cleft').first()).toBeVisible()
  await expect(page.locator('[data-square="d1"] .piece-cross').first()).toBeVisible()
  await expect(page.locator('[data-square="d4"] .piece-ferrule')).toBeVisible()
  await expect(page.locator('[data-square="d4"] .piece-mane')).toBeVisible()
  await expect(page.locator('[data-square="c3"] feSpecularLighting')).toHaveCount(2)
  await expect(page.locator('[data-square="c3"] fePointLight')).toHaveCount(3)
  await expect(page.locator('[data-square="c3"] feDiffuseLighting')).toHaveCount(1)
  await page.locator('[data-square="c3"]').click()
  await expect(guide).toContainText(/loose knight on d4/i)
  await expect(page.locator('[data-square="d4"]')).toHaveClass(/sq-legal-capture/)
  await page.locator('[data-square="d4"]').click()
  await expect(page.locator('#btn-undo')).toBeVisible()
  await expect(page.locator('#btn-reset')).toBeVisible()
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
  await expect(page.locator('#title-honor .piece-pearl')).toHaveCount(10)
  await expect(page.locator('#title-honor .piece-merlon')).toHaveCount(4)
  await expect(page.locator('#title-honor .piece-cleft')).toHaveCount(4)
  await expect(page.locator('#title-honor .piece-cross')).toHaveCount(4)
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
