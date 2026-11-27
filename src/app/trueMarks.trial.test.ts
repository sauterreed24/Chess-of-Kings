import { describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

/* Distinguishable grades: the first call per move is the saved grading,
   the second (trial on) is what the player sees. */
const grade = vi.hoisted(() => ({ queue: [] as string[] }))
vi.mock('./moveGrading', async (importOriginal) => {
  const real = await importOriginal<typeof import('./moveGrading')>()
  return {
    ...real,
    gradeMoveByEval: (input: Parameters<typeof real.gradeMoveByEval>[0]) =>
      (grade.queue.shift() as ReturnType<typeof real.gradeMoveByEval> | undefined) ?? real.gradeMoveByEval(input),
  }
})

import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'
import { buildInProgressSnapshot } from './persistence/SnapshotManager'
import type { SnapshotBuildContext } from './persistence/SnapshotManager'
import type { TrialId } from './trials'

/* A duel-free campaign board where the player's moves are graded. */
function flowOn(trials: TrialId[]) {
  const updates: ChessUiPayload[] = []
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: (p) => void updates.push(p),
    onChapterComplete: vi.fn(),
    onCampaignFinished: vi.fn(),
  })
  flow.board = {
    draw: vi.fn(),
    setInteraction: vi.fn(),
    setOrientation: vi.fn(),
    setCheckSquare: vi.fn(),
    setSkin: vi.fn(),
    showLegalFrom: vi.fn(),
  } as unknown as BoardView
  flow.trials = new Set(trials)
  flow.highestUnlockedChapter = 1
  flow.jumpToScene(1, 2) /* c1-tutorial-hanging: a graded puzzle, no rival reply needed */
  return { flow, updates }
}

const internals = (flow: GameFlow) =>
  flow as unknown as { sanQuality: (string | null)[]; snapshotBuildContext(): SnapshotBuildContext }

describe('trial true-marks', () => {
  it('never marks a ply the game leaves unmarked, even with a stale trial mark for it', () => {
    const on = flowOn(['true-marks'])
    grade.queue = ['good', 'blunder']
    on.flow.tryPlayerMove('d1', 'd2')
    const f = on.flow as unknown as { sanQuality: (string | null)[]; shownQualities(): (string | null)[] }
    f.sanQuality[0] = null /* e.g. the same move later played on an ungraded board */
    expect(f.shownQualities()).toEqual([null])
  })

  it('reads threefold repetition as play-on, not a dead draw', () => {
    const on = flowOn(['true-marks'])
    const f = on.flow as unknown as {
      chess: { load(fen: string): void; move(m: string): void; isThreefoldRepetition(): boolean }
      parityMatchedGrade(before: number, depth: number, gain: number): string | null
    }
    /* K+Q v K: shuffling the queen repeats the position; the win is still there. */
    f.chess.load('7k/8/8/8/8/8/8/3QK3 w - - 0 1')
    /* The player's 3rd Qd2 repeats the position for the third time. */
    for (const m of ['Qd2', 'Kg8', 'Qd1', 'Kh8', 'Qd2', 'Kg8', 'Qd1', 'Kh8', 'Qd2']) f.chess.move(m)
    expect(f.chess.isThreefoldRepetition()).toBe(true)
    expect(f.parityMatchedGrade(1200, 3, 0)).not.toBe('blunder')
  })

  it('changes only the marks the player sees: saved grading, snapshot and rating input stay as before', () => {
    const off = flowOn([])
    const on = flowOn(['true-marks'])
    /* A quiet king move instead of taking the loose knight: graded either way. */
    grade.queue = ['good']
    off.flow.tryPlayerMove('d1', 'd2')
    grade.queue = ['good', 'blunder']
    on.flow.tryPlayerMove('d1', 'd2')
    expect(grade.queue).toEqual([])
    expect(internals(off.flow).sanQuality).toEqual(['good'])
    expect(internals(on.flow).sanQuality).toEqual(['good'])
    const snapOff = buildInProgressSnapshot(internals(off.flow).snapshotBuildContext())
    const snapOn = buildInProgressSnapshot(internals(on.flow).snapshotBuildContext())
    expect(snapOn?.sanQuality).toEqual(snapOff?.sanQuality)
    /* Off: the ledger shows exactly the saved grading. */
    expect(off.updates.at(-1)!.sanQuality).toEqual(internals(off.flow).sanQuality)
    /* On: the ledger shows the trial's mark. */
    expect(on.updates.at(-1)!.sanQuality).toEqual(['blunder'])
  })

  it('a fresh board drops the trial marks of the last one', () => {
    const on = flowOn(['true-marks'])
    grade.queue = ['good', 'blunder']
    on.flow.tryPlayerMove('d1', 'd2')
    expect(on.updates.at(-1)!.sanQuality).toEqual(['blunder'])
    on.flow.resetChessScene()
    expect(on.updates.at(-1)!.sanQuality).toEqual([])
  })
})
