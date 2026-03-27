import { describe, expect, it, beforeEach } from 'vitest'
import { clearSave, loadSave, writeSave } from './storage'

describe('storage v3 migration and defaults', () => {
  beforeEach(() => {
    clearSave()
    localStorage.clear()
  })

  it('loads minimal legacy-like payload with safe defaults', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 1,
        sceneIndex: 2,
        highestUnlockedChapter: 1,
      }),
    )
    const s = loadSave()
    expect(s).not.toBeNull()
    expect(s?.version).toBe(3)
    expect(s?.cosmetics.selectedPieceSkin).toBe('classic-royal')
    expect(s?.unlockedDuelVariantIds).toContain('alexion-mentor')
  })

  it('sanitizes invalid skin selections', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        cosmetics: { unlockedPieceSkins: ['invalid-skin'], selectedPieceSkin: 'bad' },
      }),
    )
    const s = loadSave()
    expect(s?.cosmetics.selectedPieceSkin).toBe('classic-royal')
    expect(s?.cosmetics.unlockedPieceSkins[0]).toBe('classic-royal')
  })

  it('round-trips v3 save payload', () => {
    const save = loadSave() ?? {
      version: 3 as const,
      chapterIndex: 0,
      sceneIndex: 0,
      highestUnlockedChapter: 0,
      lastScreen: 'title' as const,
      chapter1Complete: false,
      completedSceneIds: [],
      completedPuzzleIds: [],
      stratarchiaUnlocked: false,
      duelUnlockedOpponentIds: ['amara'],
      unlockedDuelVariantIds: ['alexion-mentor'],
      codexUnlocks: [],
      titleUnlocks: [],
      chronicleEchoes: [],
      rankPoints: 42,
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' as const },
      tendencies: { flankPawnPushes: 1, earlyQueenMoves: 2, repeatedChecksWithoutGain: 0 },
      matchHistory: [],
      rivalMemory: {},
      inProgress: null,
    }
    writeSave(save)
    const loaded = loadSave()
    expect(loaded?.rankPoints).toBe(save.rankPoints)
  })

  it('accepts match history replay snippets when valid', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        matchHistory: [
          {
            id: 'h1',
            timestamp: Date.now(),
            mode: 'duel',
            sourceId: 'alexion-mentor',
            opponentId: 'alexion',
            opponentLabel: 'Alexion',
            outcome: 'win',
            moves: 42,
            styleGrade: 'A',
            turningPointSan: 'Qh7+',
            replaySans: ['Qh7+', 'Kxh7', 'Rh1+'],
            replayStartFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          },
        ],
      }),
    )
    const s = loadSave()
    expect(s?.matchHistory[0]?.replaySans?.length).toBe(3)
    expect(s?.matchHistory[0]?.replayStartFen?.includes(' w ')).toBe(true)
  })

  it('deduplicates and sanitizes string arrays', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        codexUnlocks: [' codex-a ', 'codex-a', 42, '', 'codex-b'],
        cosmetics: {
          unlockedPieceSkins: ['high-contrast'],
          selectedPieceSkin: 'obsidian-neon',
        },
      }),
    )
    const s = loadSave()
    expect(s?.codexUnlocks).toEqual(['codex-a', 'codex-b'])
    expect(s?.cosmetics.unlockedPieceSkins).toContain('obsidian-neon')
  })

  it('loads in-progress snapshot for dev-server restarts', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        inProgress: {
          mode: 'match',
          chapterIndex: 0,
          sceneIndex: 0,
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          history: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'],
          sanLog: ['e4'],
          sanQuality: ['good'],
          playerColor: 'w',
          calibrationMoves: 0,
          scriptedMoveIndex: 0,
          sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 1, repeatedChecksWithoutGain: 0 },
        },
      }),
    )
    const s = loadSave()
    expect(s?.inProgress?.mode).toBe('match')
    expect(s?.inProgress?.sanLog[0]).toBe('e4')
  })
})
