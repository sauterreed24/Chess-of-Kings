import { describe, expect, it, beforeEach, vi } from 'vitest'
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
      chapter2Complete: false,
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
      ladder: { rating: 800, peak: 800, rated: 0 },
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

  it('preserves duplicate SAN entries and pads in-progress move quality slots', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        inProgress: {
          mode: 'calibration',
          chapterIndex: 0,
          sceneIndex: 0,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          history: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'],
          sanLog: [' Nf3 ', 'Nf6', 'Nf3'],
          sanQuality: ['good'],
          playerColor: 'w',
          calibrationMoves: 0,
          scriptedMoveIndex: 0,
          sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
        },
      }),
    )
    const s = loadSave()
    expect(s?.inProgress?.sanLog).toEqual(['Nf3', 'Nf6', 'Nf3'])
    expect(s?.inProgress?.sanQuality).toEqual(['good', null, null])
  })

  it('defaults the ladder rating for legacy saves and sanitizes bad values', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({ chapterIndex: 0, sceneIndex: 0 }),
    )
    const legacy = loadSave()
    expect(legacy?.ladder).toEqual({ rating: 800, peak: 800, rated: 0 })

    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        ladder: { rating: 99999, peak: -5, rated: -3.7 },
      }),
    )
    const sanitized = loadSave()
    expect(sanitized?.ladder.rating).toBe(3000)
    expect(sanitized?.ladder.peak).toBeGreaterThanOrEqual(sanitized!.ladder.rating)
    expect(sanitized?.ladder.rated).toBe(0)
  })

  it('round-trips a persisted ladder rating', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        ladder: { rating: 912, peak: 940, rated: 14 },
      }),
    )
    const s = loadSave()
    expect(s?.ladder).toEqual({ rating: 912, peak: 940, rated: 14 })
  })

  it('writeSave does not throw when storage setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() =>
      writeSave({
        version: 3,
        chapterIndex: 0,
        sceneIndex: 0,
        highestUnlockedChapter: 0,
        lastScreen: 'title',
        chapter1Complete: false,
        chapter2Complete: false,
        completedSceneIds: [],
        completedPuzzleIds: [],
        stratarchiaUnlocked: false,
        duelUnlockedOpponentIds: [],
        unlockedDuelVariantIds: ['alexion-mentor'],
        codexUnlocks: [],
        titleUnlocks: [],
        chronicleEchoes: [],
        rankPoints: 0,
        cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
        tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
        matchHistory: [],
        rivalMemory: {},
        ladder: { rating: 800, peak: 800, rated: 0 },
        inProgress: null,
      }),
    ).not.toThrow()
    spy.mockRestore()
  })

  it('hydrates rival memory calibration rating with safe defaults', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        rivalMemory: {
          amara: {
            games: 3,
            wins: 1,
            losses: 2,
            draws: 0,
            avgMoves: 40,
            punishedFlankPushes: 0,
            punishedEarlyQueen: 0,
            punishedCheckSpam: 0,
          },
          edred: {
            games: 2,
            wins: 0,
            losses: 2,
            draws: 0,
            avgMoves: 35,
            punishedFlankPushes: 1,
            punishedEarlyQueen: 0,
            punishedCheckSpam: 0,
            calibrationRating: 1780,
          },
        },
      }),
    )
    const s = loadSave()
    expect(s?.rivalMemory.amara?.calibrationRating).toBe(1500)
    expect(s?.rivalMemory.edred?.calibrationRating).toBe(1780)
  })

  it('clearSave does not throw when storage removeItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('privacy mode block')
    })
    expect(() => clearSave()).not.toThrow()
    spy.mockRestore()
  })
})
