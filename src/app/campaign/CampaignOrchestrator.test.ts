import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { defaultLadderRating } from '../../game/rating'
import {
  CampaignOrchestrator,
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
      expect(campaign.progress.chapterIndex).toBe(1)
      expect(campaign.progress.sceneIndex).toBe(0)
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
