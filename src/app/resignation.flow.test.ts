import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import type { Chapter } from '../types'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'
import { buildInProgressSnapshot } from './persistence/SnapshotManager'
import type { SnapshotBuildContext } from './persistence/SnapshotManager'

/* White (player) K+Q+R vs bare black king, far from mate: a won game a
   beginner may not be able to finish. */
const WON = '7k/8/8/8/8/8/8/R2QK3 w - - 0 40'

/* Campaign copy whose first rival starts from the won position, so every
   ply (and the save/restore replay) comes from a real game. */
const CHAPTERS: Chapter[] = PLAYABLE_CHAPTERS.map((chapter) => ({
  ...chapter,
  scenes: chapter.scenes.map((scene) =>
    scene.type === 'match' && scene.id === 'c1-match-amara'
      ? { ...scene, fen: WON, scriptedBlackSans: undefined }
      : scene,
  ),
}))

function setup() {
  const updates: ChessUiPayload[] = []
  const flow = new GameFlow(CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: (p) => {
      updates.push(p)
    },
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
  flow.highestUnlockedChapter = 1
  const sc = CHAPTERS[1]!.scenes.findIndex((s) => s.id === 'c1-match-amara')
  flow.jumpToScene(1, sc)
  expect(flow.chess.fen()).toBe(WON)
  return { flow, last: () => updates.at(-1)! }
}

/* Quiet king shuffles that keep the black king free (never stalemate/mate). */
const QUIET: Array<[string, string]> = [
  ['e1', 'e2'],
  ['e2', 'e3'],
  ['e3', 'e4'],
  ['e4', 'e5'],
]

async function playToResignation(flow: GameFlow, last: () => ChessUiPayload) {
  for (const [from, to] of QUIET) {
    if (last().matchOutcome) break
    flow.tryPlayerMove(from as never, to as never)
    await vi.advanceTimersByTimeAsync(2000)
  }
}

describe('a hopeless rival resigns', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('ends the match as a win after three lost turns, and the scene can advance', async () => {
    const { flow, last } = setup()
    for (const [from, to] of QUIET) {
      if (last().matchOutcome) break
      flow.tryPlayerMove(from as never, to as never)
      await vi.advanceTimersByTimeAsync(2000)
    }
    expect(last().matchOutcome).toBe('win')
    expect(last().status).toMatch(/^Resigned/)
    expect(flow.chess.turn()).toBe('b')
    expect(flow.canAdvance()).toBe(true)
    expect(flow.chess.history().length).toBe(5) /* 3 player moves, 2 replies */
    const history = (flow as unknown as { matchHistory: Array<{ outcome: string }> }).matchHistory
    expect(history.at(-1)?.outcome).toBe('win')
  })

  it('a resignation is final: undo is blocked, Reset starts a fresh game', async () => {
    const { flow, last } = setup()
    await playToResignation(flow, last)
    expect(last().matchOutcome).toBe('win')
    expect(last().canUndo).toBe(false)
    const plies = flow.chess.history().length
    flow.undo()
    expect(flow.chess.history().length).toBe(plies)
    expect(last().matchOutcome).toBe('win')
    flow.resetChessScene()
    expect(last().matchOutcome).toBeNull()
    expect(flow.canAdvance()).toBe(false)
  })

  it('survives a save and reload (sanitized snapshot restores the win)', async () => {
    const { flow, last } = setup()
    await playToResignation(flow, last)
    const snap = buildInProgressSnapshot(
      (flow as unknown as { snapshotBuildContext(): SnapshotBuildContext }).snapshotBuildContext(),
    )
    expect(snap?.rivalResigned).toBe(true)
    const real = await vi.importActual<typeof import('./storage')>('./storage')
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({ version: 3, chapterIndex: 1, sceneIndex: snap!.sceneIndex, highestUnlockedChapter: 1, inProgress: snap }))
    const loaded = real.loadSave()
    expect(loaded?.inProgress?.rivalResigned).toBe(true)

    const again = setup()
    const internals = again.flow as unknown as {
      snapshots: { setPendingSnapshot(s: unknown): void }
      refreshScene(): void
    }
    internals.snapshots.setPendingSnapshot(loaded!.inProgress)
    internals.refreshScene()
    await vi.advanceTimersByTimeAsync(3000)
    expect(again.flow.chess.fen()).toBe(snap!.fen)
    expect(again.last().matchOutcome).toBe('win')
    expect(again.flow.canAdvance()).toBe(true)
    /* The result was recorded before the reload; restoring must not record
       (or reward) it a second time. */
    const history = (again.flow as unknown as { matchHistory: unknown[] }).matchHistory
    expect(history).toHaveLength(0)
    expect(again.last().tacticalPulse ?? '').not.toMatch(/resigns/)
    localStorage.clear()
  })
})
