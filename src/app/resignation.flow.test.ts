import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'

/* White (player) K+Q+R vs bare black king, far from mate: a won game a
   beginner may not be able to finish. */
const WON = '7k/8/8/8/8/8/8/R2QK3 w - - 0 40'

function setup() {
  const updates: ChessUiPayload[] = []
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
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
  const sc = PLAYABLE_CHAPTERS[1]!.scenes.findIndex((s) => s.id === 'c1-match-amara')
  flow.jumpToScene(1, sc)
  flow.chess.load(WON)
  const internals = flow as unknown as { history: string[]; sanLog: string[]; evalTrace: number[]; sanQuality: unknown[] }
  internals.history = [WON]
  internals.sanLog = []
  internals.evalTrace = []
  internals.sanQuality = []
  return { flow, last: () => updates.at(-1)! }
}

/* Quiet king shuffles that keep the black king free (never stalemate/mate). */
const QUIET: Array<[string, string]> = [
  ['e1', 'e2'],
  ['e2', 'e3'],
  ['e3', 'e4'],
  ['e4', 'e5'],
]

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

  it('undo voids the resignation', async () => {
    const { flow, last } = setup()
    for (const [from, to] of QUIET) {
      if (last().matchOutcome) break
      flow.tryPlayerMove(from as never, to as never)
      await vi.advanceTimersByTimeAsync(2000)
    }
    expect(last().matchOutcome).toBe('win')
    flow.undo()
    expect(last().matchOutcome).toBeNull()
    expect(flow.canAdvance()).toBe(false)
  })
})
