import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { defaultLadderRating } from '../../game/rating'
import {
  CampaignOrchestrator,
  backfillSuccessorUnlocks,
  canAdvanceBoardScene,
  canAdvanceNarrativeScene,
  defaultCampaignProgress,
} from './CampaignOrchestrator'
import type { BoardAdvanceContext } from './CampaignOrchestrator'

describe('CampaignOrchestrator', () => {
  it('hydrates indices from save bounds', () => {
    const ch = PLAYABLE_CHAPTERS
    const campaign = CampaignOrchestrator.hydrateFromSave(ch, {
      version: 3,
      chapterIndex: 99,
      sceneIndex: 99,
      highestUnlockedChapter: 99,
      lastScreen: 'play',
      chapter1Complete: true,
      chapter2Complete: false,
      completedSceneIds: [],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.chapterIndex).toBe(ch.length - 1)
    expect(campaign.progress.sceneIndex).toBeLessThan(ch[ch.length - 1]!.scenes.length)
  })

  it('advances within a chapter then completes chapter', () => {
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS)
    const first = campaign.currentScene()
    let result = campaign.advanceAfterLeaving(first)
    expect(result.kind).toBe('next-scene')
    expect(campaign.progress.sceneIndex).toBe(1)

    const ch = campaign.currentChapter()
    while (campaign.progress.sceneIndex < ch.scenes.length - 1) {
      const leaving = campaign.currentScene()
      result = campaign.advanceAfterLeaving(leaving)
      expect(result.kind).toBe('next-scene')
    }
    const last = campaign.currentScene()
    result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.chapter.id).toBe(ch.id)
      expect(result.campaignFinished).toBeFalsy()
      expect(campaign.progress.chapterIndex).toBe(1)
      expect(campaign.progress.sceneIndex).toBe(0)
    }
  })

  it('opens Chapter IV when Chapter III seals', () => {
    const ch3Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch3')
    expect(ch3Index).toBeGreaterThanOrEqual(0)
    const ch3 = PLAYABLE_CHAPTERS[ch3Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch3Index,
      sceneIndex: ch3.scenes.length - 1,
      highestUnlockedChapter: ch3Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c3-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch3')
      expect(result.rewards.some((r) => r.id === 'rw-title-classical-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch3Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch4')
    }
  })

  it('opens Chapter V when Chapter IV seals', () => {
    const ch4Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch4')
    expect(ch4Index).toBeGreaterThanOrEqual(0)
    const ch4 = PLAYABLE_CHAPTERS[ch4Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch4Index,
      sceneIndex: ch4.scenes.length - 1,
      highestUnlockedChapter: ch4Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c4-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch4')
      expect(result.rewards.some((r) => r.id === 'rw-title-hypermodern-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch4Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch5')
    }
  })

  it('opens Chapter VI when Chapter V seals', () => {
    const ch5Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch5')
    expect(ch5Index).toBeGreaterThanOrEqual(0)
    const ch5 = PLAYABLE_CHAPTERS[ch5Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch5Index,
      sceneIndex: ch5.scenes.length - 1,
      highestUnlockedChapter: ch5Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c5-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch5')
      expect(result.rewards.some((r) => r.id === 'rw-title-discipline-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch5Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch6')
    }
  })

  it('opens Chapter VII when Chapter VI seals', () => {
    const ch6Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch6')
    expect(ch6Index).toBeGreaterThanOrEqual(0)
    const ch6 = PLAYABLE_CHAPTERS[ch6Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch6Index,
      sceneIndex: ch6.scenes.length - 1,
      highestUnlockedChapter: ch6Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c6-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch6')
      expect(result.rewards.some((r) => r.id === 'rw-title-ledger-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch6Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch7')
    }
  })

  it('opens Chapter VIII when Chapter VII seals', () => {
    const ch7Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch7')
    expect(ch7Index).toBeGreaterThanOrEqual(0)
    const ch7 = PLAYABLE_CHAPTERS[ch7Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch7Index,
      sceneIndex: ch7.scenes.length - 1,
      highestUnlockedChapter: ch7Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c7-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch7')
      expect(result.rewards.some((r) => r.id === 'rw-title-synthesis-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch7Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch8')
    }
  })

  it('opens Chapter IX when Chapter VIII seals', () => {
    const ch8Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch8')
    expect(ch8Index).toBeGreaterThanOrEqual(0)
    const ch8 = PLAYABLE_CHAPTERS[ch8Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch8Index,
      sceneIndex: ch8.scenes.length - 1,
      highestUnlockedChapter: ch8Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c8-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBeFalsy()
      expect(result.chapter.id).toBe('ch8')
      expect(result.rewards.some((r) => r.id === 'rw-title-alexandrine-seal')).toBe(true)
      expect(campaign.progress.chapterIndex).toBe(ch8Index + 1)
      expect(PLAYABLE_CHAPTERS[campaign.progress.chapterIndex]?.id).toBe('ch9')
    }
  })

  it('grants Chapter IX clear rewards when the final chapter seals', () => {
    const ch9Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch9')
    expect(ch9Index).toBeGreaterThanOrEqual(0)
    const ch9 = PLAYABLE_CHAPTERS[ch9Index]!
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapterIndex: ch9Index,
      sceneIndex: ch9.scenes.length - 1,
      highestUnlockedChapter: ch9Index,
      chapter1Complete: true,
      chapter2Complete: true,
    })
    const last = campaign.currentScene()
    expect(last.id).toBe('c9-freeplay')
    const result = campaign.advanceAfterLeaving(last)
    expect(result.kind).toBe('chapter-complete')
    if (result.kind === 'chapter-complete') {
      expect(result.campaignFinished).toBe(true)
      expect(result.chapter.id).toBe('ch9')
      expect(result.rewards.some((r) => r.id === 'rw-title-apotheosis-seal')).toBe(true)
      expect(result.rewards.some((r) => r.id === 'rw-chronicle-echo-ch9')).toBe(true)
    }
  })

  it('records puzzle and scene completion ids', () => {
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS)
    const puzzle = PLAYABLE_CHAPTERS[0]!.scenes.find((s) => s.type === 'puzzle')
    if (!puzzle) return
    campaign.recordLeavingScene(puzzle)
    expect(campaign.progress.completedSceneIds).toContain(puzzle.id)
    expect(campaign.progress.completedPuzzleIds).toContain(puzzle.id)
  })

  it('unlocks Chapter IV for chronicles that sealed Chapter III before the paradox age existed', () => {
    const ch4Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch4')
    expect(ch4Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 3,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c3-reflection', 'c3-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch4Index)
    expect(campaign.canJumpToChapter(ch4Index)).toBe(true)
  })

  it('does not invent a paradox unlock from an unfinished classical chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 3,
      completedSceneIds: ['c3-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(3)
  })

  it('unlocks Chapter V for chronicles that sealed Chapter IV before the discipline age existed', () => {
    const ch5Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch5')
    expect(ch5Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 4,
      sceneIndex: 0,
      highestUnlockedChapter: 4,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c4-reflection', 'c4-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch5Index)
    expect(campaign.canJumpToChapter(ch5Index)).toBe(true)
  })

  it('does not invent a machine unlock from an unfinished paradox chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 4,
      completedSceneIds: ['c4-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(4)
  })

  it('unlocks Chapter VI for chronicles that sealed Chapter V before the ledger age existed', () => {
    const ch6Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch6')
    expect(ch6Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 5,
      sceneIndex: 0,
      highestUnlockedChapter: 5,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c5-reflection', 'c5-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch6Index)
    expect(campaign.canJumpToChapter(ch6Index)).toBe(true)
  })

  it('does not invent a silicon unlock from an unfinished discipline chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 5,
      completedSceneIds: ['c5-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(5)
  })

  it('unlocks Chapter VII for chronicles that sealed Chapter VI before the synthesis age existed', () => {
    const ch7Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch7')
    expect(ch7Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 6,
      sceneIndex: 0,
      highestUnlockedChapter: 6,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c6-reflection', 'c6-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch7Index)
    expect(campaign.canJumpToChapter(ch7Index)).toBe(true)
  })

  it('does not invent a synthesis unlock from an unfinished ledger chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 6,
      completedSceneIds: ['c6-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(6)
  })

  it('unlocks Chapter VIII for chronicles that sealed Chapter VII before the Alexandrine age existed', () => {
    const ch8Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch8')
    expect(ch8Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 7,
      sceneIndex: 0,
      highestUnlockedChapter: 7,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c7-reflection', 'c7-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch8Index)
    expect(campaign.canJumpToChapter(ch8Index)).toBe(true)
  })

  it('does not invent an Alexandrine unlock from an unfinished synthesis chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 7,
      completedSceneIds: ['c7-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(7)
  })

  it('unlocks Chapter IX for chronicles that sealed Chapter VIII before the Apotheosis age existed', () => {
    const ch9Index = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch9')
    expect(ch9Index).toBeGreaterThanOrEqual(0)
    const campaign = CampaignOrchestrator.hydrateFromSave(PLAYABLE_CHAPTERS, {
      version: 3,
      chapterIndex: 8,
      sceneIndex: 0,
      highestUnlockedChapter: 8,
      lastScreen: 'title',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c8-reflection', 'c8-freeplay'],
      completedPuzzleIds: [],
      stratarchiaUnlocked: true,
      duelUnlockedOpponentIds: [],
      unlockedDuelVariantIds: [],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 0,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      ladder: defaultLadderRating(),
      inProgress: null,
    })
    expect(campaign.progress.highestUnlockedChapter).toBe(ch9Index)
    expect(campaign.canJumpToChapter(ch9Index)).toBe(true)
  })

  it('does not invent an Apotheosis unlock from an unfinished Alexandrine chapter', () => {
    const progress = {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 8,
      completedSceneIds: ['c8-intro'],
    }
    backfillSuccessorUnlocks(progress, PLAYABLE_CHAPTERS)
    expect(progress.highestUnlockedChapter).toBe(8)
  })

  it('gates chapter jumps by highest unlocked chapter', () => {
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      highestUnlockedChapter: 0,
    })
    expect(campaign.canJumpToChapter(1)).toBe(false)
    expect(campaign.applyJumpToChapter(1)).toBe(false)
    expect(campaign.applyJumpToChapter(0)).toBe(true)
    expect(campaign.progress.sceneIndex).toBe(0)
  })

  it('resetProgress clears completion flags', () => {
    const campaign = new CampaignOrchestrator(PLAYABLE_CHAPTERS, {
      ...defaultCampaignProgress(),
      chapter1Complete: true,
      completedSceneIds: ['x'],
    })
    campaign.resetProgress()
    expect(campaign.progress.chapter1Complete).toBe(false)
    expect(campaign.progress.completedSceneIds).toEqual([])
  })
})

describe('canAdvance helpers', () => {
  it('allows narrative scenes without board context', () => {
    const dialogue = PLAYABLE_CHAPTERS[0]!.scenes.find((s) => s.type === 'dialogue')
    if (!dialogue) return
    expect(canAdvanceNarrativeScene(dialogue)).toBe(true)
  })

  it('blocks match advance until player wins', () => {
    const match = PLAYABLE_CHAPTERS[0]!.scenes.find((s) => s.type === 'match')
    if (!match || match.type !== 'match') return
    const ctx: BoardAdvanceContext = {
      aiThinking: false,
      mode: 'match',
      scene: match,
      puzzleSolved: false,
      calibrationSolved: false,
      chessTurn: 'b',
      playerColor: 'w',
      isCheckmate: true,
      isStalemate: false,
      isInsufficientMaterial: false,
      isBareKingLockmate: false,
      isDominanceSealedStalemate: false,
    }
    expect(canAdvanceBoardScene(ctx)).toBe(true)
    ctx.chessTurn = 'w'
    expect(canAdvanceBoardScene(ctx)).toBe(false)
  })
})
