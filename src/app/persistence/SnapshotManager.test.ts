import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import {
  SnapshotManager,
  buildInProgressSnapshot,
  PERSIST_DEBOUNCE_MS,
  type SnapshotBuildContext,
} from './SnapshotManager'
import type { InProgressSnapshot } from '../../types'

vi.mock('../storage', () => ({
  writeSave: vi.fn(() => true),
}))

import { writeSave } from '../storage'
import { defaultLadderRating } from '../../game/rating'

const defaultCtx = (): SnapshotBuildContext => ({
  mode: 'match',
  chapterIndex: 0,
  sceneIndex: 0,
  usesBoard: true,
  history: [
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
  ],
  sanLog: ['e4'],
  sanQuality: ['good'],
  playerColor: 'w',
  calibrationMoves: 0,
  scriptedMoveIndex: 0,
  sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
  duel: null,
})

const saveBase = () => ({
  chapterIndex: 0,
  sceneIndex: 0,
  highestUnlockedChapter: 0,
  lastScreen: 'title' as const,
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
  rankPoints: 0,
  cosmetics: {
    unlockedPieceSkins: ['classic-royal'],
    selectedPieceSkin: 'classic-royal',
  },
  tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
  matchHistory: [],
  rivalMemory: {},
  ladder: defaultLadderRating(),
})

describe('SnapshotManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(writeSave).mockReset().mockReturnValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and clears pending snapshot', () => {
    const mgr = new SnapshotManager({ syncIo: true })
    const snap = { mode: 'match', chapterIndex: 0, sceneIndex: 0 } as unknown as InProgressSnapshot

    expect(mgr.getPendingSnapshot()).toBeNull()
    mgr.setPendingSnapshot(snap)
    expect(mgr.getPendingSnapshot()).toBe(snap)
    mgr.clearPendingSnapshot()
    expect(mgr.getPendingSnapshot()).toBeNull()
  })

  it('flushes synchronously when syncIo is enabled', () => {
    const mgr = new SnapshotManager({ syncIo: true })
    mgr.persist(() => saveBase(), defaultCtx)
    expect(writeSave).toHaveBeenCalledTimes(1)
    const data = vi.mocked(writeSave).mock.calls[0]![0]
    expect(data.version).toBe(3)
    expect(data.inProgress?.sanLog).toEqual(['e4'])
  })

  it('debounces writes in async mode', () => {
    const mgr = new SnapshotManager({ syncIo: false, debounceMs: PERSIST_DEBOUNCE_MS })
    mgr.persist(() => saveBase(), defaultCtx)
    expect(writeSave).not.toHaveBeenCalled()
    vi.advanceTimersByTime(PERSIST_DEBOUNCE_MS - 1)
    expect(writeSave).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(writeSave).toHaveBeenCalledTimes(1)
  })

  it('coalesces rapid persist calls into one write', () => {
    const mgr = new SnapshotManager({ syncIo: false, debounceMs: 100 })
    mgr.persist(() => saveBase(), defaultCtx)
    mgr.persist(() => saveBase(), defaultCtx)
    mgr.persist(() => saveBase(), defaultCtx)
    vi.advanceTimersByTime(100)
    expect(writeSave).toHaveBeenCalledTimes(1)
  })

  it('flushPersist cancels pending debounce and writes immediately', () => {
    const mgr = new SnapshotManager({ syncIo: false, debounceMs: 500 })
    mgr.persist(() => saveBase(), defaultCtx)
    mgr.flushPersist(() => saveBase(), defaultCtx)
    expect(writeSave).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(500)
    expect(writeSave).toHaveBeenCalledTimes(1)
  })

  it('invokes onPersistFailure when writeSave returns false', () => {
    let failed = false
    vi.mocked(writeSave).mockReturnValue(false)
    const mgr = new SnapshotManager({
      syncIo: true,
      onPersistFailure: () => {
        failed = true
      },
    })
    mgr.persist(() => saveBase(), defaultCtx)
    expect(failed).toBe(true)
  })

  it('persists null inProgress when build context is idle', () => {
    const mgr = new SnapshotManager({ syncIo: true })
    const ctx = defaultCtx()
    ctx.mode = 'idle'
    mgr.persist(() => saveBase(), () => ctx)
    const data = vi.mocked(writeSave).mock.calls[0]![0]
    expect(data.inProgress).toBeNull()
  })
})

describe('buildInProgressSnapshot', () => {
  it('returns null for idle mode', () => {
    expect(buildInProgressSnapshot({ ...defaultCtx(), mode: 'idle' })).toBeNull()
  })

  it('returns null when scene does not use board (non-duel)', () => {
    expect(buildInProgressSnapshot({ ...defaultCtx(), mode: 'match', usesBoard: false })).toBeNull()
  })

  it('builds duel snapshots even when usesBoard is false (duel bypasses scene gate)', () => {
    const snap = buildInProgressSnapshot({
      ...defaultCtx(),
      mode: 'duel',
      usesBoard: false,
      duel: {
        opponentId: 'alexion',
        variantId: 'alexion-mentor',
        difficulty: 'balanced',
        playerColor: 'w',
        startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
    })
    expect(snap?.mode).toBe('duel')
    expect(snap?.duel?.opponentId).toBe('alexion')
  })

  it('builds match snapshot with ply cap and quality array', () => {
    const chess = new Chess()
    const start = chess.fen()
    chess.move('e4')
    const afterE4 = chess.fen()
    chess.move('e5')
    const afterE5 = chess.fen()
    const snap = buildInProgressSnapshot({
      ...defaultCtx(),
      history: [start, afterE4, afterE5],
      sanLog: ['e4', 'e5'],
      sanQuality: ['good', 'brilliant'],
    })
    expect(snap).not.toBeNull()
    expect(snap!.fen).toBe(afterE5)
    expect(snap!.sanLog).toEqual(['e4', 'e5'])
    expect(snap!.sanQuality).toEqual(['good', 'brilliant'])
    expect(snap!.duel).toBeUndefined()
  })

  it('embeds duel metadata when mode is duel', () => {
    const snap = buildInProgressSnapshot({
      ...defaultCtx(),
      mode: 'duel',
      usesBoard: true,
      duel: {
        opponentId: 'alexion',
        variantId: 'alexion-mentor',
        difficulty: 'relentless',
        playerColor: 'b',
        startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
    })
    expect(snap?.duel?.difficulty).toBe('relentless')
    expect(snap?.duel?.playerColor).toBe('b')
  })

  it('returns null when history is empty', () => {
    expect(buildInProgressSnapshot({ ...defaultCtx(), history: [], sanLog: [] })).toBeNull()
  })
})
