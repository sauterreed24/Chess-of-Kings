import { describe, expect, it } from 'vitest'
import { buildInProgressSnapshot } from './SnapshotManager'
import type { SnapshotBuildContext } from './SnapshotManager'
import { IN_PROGRESS_PLY_LIMIT } from './snapshotReplay'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function ctx(plies: number, extra: Partial<SnapshotBuildContext> = {}): SnapshotBuildContext {
  /* Distinct placeholder FENs per ply (the builder only slices them). */
  const history = Array.from({ length: plies + 1 }, (_, i) => START.replace(' 0 1', ` 0 ${i + 1}`))
  return {
    mode: 'match',
    chapterIndex: 1,
    sceneIndex: 8,
    usesBoard: true,
    history,
    sanLog: Array.from({ length: plies }, () => 'e4'),
    sanQuality: Array.from({ length: plies }, () => null),
    playerColor: 'w',
    calibrationMoves: 0,
    scriptedMoveIndex: 0,
    sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
    ...extra,
  }
}

describe('in-progress snapshot flags', () => {
  it('marks a resignation only when the saved position is the resigned one', () => {
    expect(buildInProgressSnapshot(ctx(40, { rivalResigned: true }))?.rivalResigned).toBe(true)
    const long = buildInProgressSnapshot(ctx(IN_PROGRESS_PLY_LIMIT + 10, { rivalResigned: true }))
    expect(long?.sanLog.length).toBe(IN_PROGRESS_PLY_LIMIT)
    expect(long?.rivalResigned).toBeUndefined()
  })

  it('keeps the relief streak for campaign matches only', () => {
    expect(buildInProgressSnapshot(ctx(10, { reliefStreak: 2 }))?.reliefStreak).toBe(2)
    expect(buildInProgressSnapshot(ctx(10, { mode: 'puzzle', reliefStreak: 2 }))?.reliefStreak).toBeUndefined()
  })
})
