import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { validateAndReplaySnapshot, IN_PROGRESS_PLY_LIMIT } from './snapshotReplay'
import type { InProgressSnapshot } from '../../types'

function makeSnap(overrides: Partial<InProgressSnapshot> = {}): InProgressSnapshot {
  return {
    mode: 'match',
    chapterIndex: 0,
    sceneIndex: 0,
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    history: [],
    sanLog: ['e4'],
    sanQuality: ['good'],
    playerColor: 'w',
    calibrationMoves: 0,
    scriptedMoveIndex: 0,
    sceneTendencies: { earlyQueenMoves: 0, flankPawnPushes: 0, repeatedChecksWithoutGain: 0 },
    ...overrides,
  }
}

describe('validateAndReplaySnapshot', () => {
  it('replays a simple legal game and matches final FEN', () => {
    const chess = new Chess()
    chess.move('e4')
    const snap = makeSnap({ fen: chess.fen(), sanLog: ['e4'], sanQuality: ['good'] })
    const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    const result = validateAndReplaySnapshot(snap, start)
    expect(result).not.toBeNull()
    expect(result!.sanLog).toEqual(['e4'])
    expect(result!.history.at(-1)).toBe(chess.fen())
  })

  it('rejects when final FEN does not match captured FEN', () => {
    const snap = makeSnap({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' /* wrong */ })
    const result = validateAndReplaySnapshot(snap, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(result).toBeNull()
  })

  it('rejects corrupted SAN', () => {
    const snap = makeSnap({ sanLog: ['e4', 'Qh5??'] })
    const result = validateAndReplaySnapshot(snap, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(result).toBeNull()
  })

  it('enforces ply limit', () => {
    const longSan = Array.from({ length: IN_PROGRESS_PLY_LIMIT + 1 }, (_, i) => (i % 2 === 0 ? 'e4' : 'e5'))
    const snap = makeSnap({ sanLog: longSan })
    const result = validateAndReplaySnapshot(snap, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(result).toBeNull()
  })

  it('roundtrips a short duel snapshot with quality tags', () => {
    const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    const snap: InProgressSnapshot = {
      ...makeSnap(),
      mode: 'duel',
      sanLog: ['e4', 'e5', 'Nf3'],
      sanQuality: ['good', null, 'brilliant'],
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
      duel: { opponentId: 'alexion', variantId: 'alexion-mentor', difficulty: 'balanced', playerColor: 'w', startFen: start },
    }
    const result = validateAndReplaySnapshot(snap, start)
    expect(result).not.toBeNull()
    expect(result!.sanQuality).toEqual(['good', null, 'brilliant'])
  })

  it('returns null for non-string SAN entries', () => {
    const snap = makeSnap({ sanLog: ['e4', 123 as unknown as string] })
    const result = validateAndReplaySnapshot(snap, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(result).toBeNull()
  })
})
