import { CHAPTER_CLEAR_REWARDS } from '../../data/rewards'
import type { Chapter, RewardDefinition, Scene } from '../../types'
import type { SaveData } from '../storage'

export type CampaignProgress = {
  chapterIndex: number
  sceneIndex: number
  highestUnlockedChapter: number
  chapter1Complete: boolean
  chapter2Complete: boolean
  completedSceneIds: string[]
  completedPuzzleIds: string[]
  stratarchiaUnlocked: boolean
}

export type AdvanceResult =
  | { kind: 'next-scene' }
  | { kind: 'chapter-complete'; chapter: Chapter; rewards: RewardDefinition[] }
  | { kind: 'campaign-finished' }

export type BoardAdvanceContext = {
  aiThinking: boolean
  mode: 'idle' | 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel'
  scene: Scene
  puzzleSolved: boolean
  calibrationSolved: boolean
  chessTurn: 'w' | 'b'
  playerColor: 'w' | 'b'
  isCheckmate: boolean
  isStalemate: boolean
  isInsufficientMaterial: boolean
  isBareKingLockmate: boolean
  isDominanceSealedStalemate: boolean
}

export function defaultCampaignProgress(): CampaignProgress {
  return {
    chapterIndex: 0,
    sceneIndex: 0,
    highestUnlockedChapter: 0,
    chapter1Complete: false,
    chapter2Complete: false,
    completedSceneIds: [],
    completedPuzzleIds: [],
    stratarchiaUnlocked: false,
  }
}

export function canAdvanceNarrativeScene(scene: Scene): boolean {
  return (
    scene.type === 'dialogue' ||
    scene.type === 'interlude' ||
    scene.type === 'codex' ||
    scene.type === 'freeplay'
  )
}

export function canAdvanceBoardScene(ctx: BoardAdvanceContext): boolean {
  if (ctx.aiThinking || ctx.mode === 'duel') return false
  const sc = ctx.scene
  if (canAdvanceNarrativeScene(sc)) return true
  if (sc.type === 'calibration') return ctx.calibrationSolved
  if (sc.type === 'puzzle') return ctx.puzzleSolved
  if (sc.type === 'match') {
    if (ctx.isCheckmate) return ctx.chessTurn !== ctx.playerColor
    if (ctx.isBareKingLockmate) return ctx.chessTurn !== ctx.playerColor
    if (ctx.isDominanceSealedStalemate) return ctx.chessTurn !== ctx.playerColor
    if (ctx.isStalemate) return false
    if (ctx.isInsufficientMaterial) return false
    return false
  }
  return false
}

/**
 * Owns chapter/scene indices, unlock flags, and completion bookkeeping.
 * GameFlow retains chess/board orchestration and calls into this seam.
 */
export class CampaignOrchestrator {
  readonly chapters: Chapter[]
  readonly progress: CampaignProgress

  constructor(chapters: Chapter[], progress: CampaignProgress = defaultCampaignProgress()) {
    this.chapters = chapters
    this.progress = progress
  }

  static hydrateFromSave(chapters: Chapter[], save: SaveData | null): CampaignOrchestrator {
    const progress = defaultCampaignProgress()
    if (save) {
      progress.chapterIndex = Math.min(save.chapterIndex, chapters.length - 1)
      const ch = chapters[progress.chapterIndex]!
      progress.sceneIndex = Math.min(save.sceneIndex, ch.scenes.length - 1)
      progress.highestUnlockedChapter = Math.min(save.highestUnlockedChapter, chapters.length - 1)
      progress.chapter1Complete = save.chapter1Complete
      progress.chapter2Complete = save.chapter2Complete
      progress.completedSceneIds = [...save.completedSceneIds]
      progress.completedPuzzleIds = [...save.completedPuzzleIds]
      progress.stratarchiaUnlocked = save.stratarchiaUnlocked
    }
    return new CampaignOrchestrator(chapters, progress)
  }

  currentChapter(): Chapter {
    return this.chapters[this.progress.chapterIndex]!
  }

  currentScene(): Scene {
    return this.currentChapter().scenes[this.progress.sceneIndex]!
  }

  recordLeavingScene(scene: Scene) {
    const id = scene.id
    if (!this.progress.completedSceneIds.includes(id)) {
      this.progress.completedSceneIds.push(id)
    }
    if (scene.type === 'puzzle' && !this.progress.completedPuzzleIds.includes(id)) {
      this.progress.completedPuzzleIds.push(id)
    }
  }

  markReflectionFlags(sceneId: string) {
    if (sceneId === 'c1-reflection') this.progress.chapter1Complete = true
    if (sceneId === 'c2-reflection') this.progress.chapter2Complete = true
  }

  /**
   * Advances campaign indices after the current scene is recorded as visited.
   * Returns what the orchestrator layer should announce (chapter rewards, finished).
   */
  advanceAfterLeaving(leaving: Scene): AdvanceResult {
    this.recordLeavingScene(leaving)
    this.markReflectionFlags(leaving.id)

    const ch = this.currentChapter()
    if (this.progress.sceneIndex < ch.scenes.length - 1) {
      this.progress.sceneIndex++
      return { kind: 'next-scene' }
    }

    const rewards = CHAPTER_CLEAR_REWARDS[ch.id] ?? []
    if (this.progress.chapterIndex < this.chapters.length - 1) {
      this.progress.chapterIndex++
      this.progress.sceneIndex = 0
      this.progress.highestUnlockedChapter = Math.max(
        this.progress.highestUnlockedChapter,
        this.progress.chapterIndex,
      )
      return { kind: 'chapter-complete', chapter: ch, rewards }
    }

    return { kind: 'campaign-finished' }
  }

  canAdvance(ctx: BoardAdvanceContext): boolean {
    return canAdvanceBoardScene(ctx)
  }

  canJumpToChapter(index: number): boolean {
    return index >= 0 && index <= this.progress.highestUnlockedChapter && index < this.chapters.length
  }

  applyJumpToChapter(index: number): boolean {
    if (!this.canJumpToChapter(index)) return false
    this.progress.chapterIndex = index
    this.progress.sceneIndex = 0
    return true
  }

  canJumpToScene(chapterIndex: number, sceneIndex: number): boolean {
    if (!this.canJumpToChapter(chapterIndex)) return false
    const ch = this.chapters[chapterIndex]!
    return sceneIndex >= 0 && sceneIndex < ch.scenes.length
  }

  applyJumpToScene(chapterIndex: number, sceneIndex: number): boolean {
    if (!this.canJumpToScene(chapterIndex, sceneIndex)) return false
    this.progress.chapterIndex = chapterIndex
    this.progress.sceneIndex = sceneIndex
    return true
  }

  resetProgress() {
    Object.assign(this.progress, defaultCampaignProgress())
  }
}
