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
