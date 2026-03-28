import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from './gameFlow'

function mockBoard(): Pick<BoardView, 'draw' | 'setInteraction' | 'setOrientation' | 'setCheckSquare' | 'setSkin'> {
  return {
    draw: vi.fn(),
    setInteraction: vi.fn(),
    setOrientation: vi.fn(),
    setCheckSquare: vi.fn(),
    setSkin: vi.fn(),
  }
}

describe('GameFlow AI / puzzles', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('after a non-solving puzzle move, opponent plays within the thinking delay', async () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    flow.jumpToScene(1, 2)

    expect(flow.currentScene().id).toBe('c1-tutorial-hanging')

    /* Suboptimal but legal — d4 is occupied so the bishop cannot “slide through” to e3 */
    flow.tryPlayerMove('c3', 'b4')

    await vi.advanceTimersByTimeAsync(500)

    const log = (flow as unknown as { sanLog: string[] }).sanLog
    expect(log.length).toBeGreaterThanOrEqual(2)
    expect(flow.chess.turn()).toBe('w')
  })

  it('undo in puzzle removes both player move and opponent reply', async () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    flow.jumpToScene(1, 2)
    flow.tryPlayerMove('c3', 'b4')
    await vi.advanceTimersByTimeAsync(500)
    expect(flow.chess.turn()).toBe('w')
    flow.undo()
    expect(flow.chess.fen()).toMatch(/2B5/)
    expect(flow.chess.turn()).toBe('w')
    expect((flow as unknown as { sanLog: string[] }).sanLog.length).toBe(0)
  })

  it('prevents duplicate AI scheduling when already thinking', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const started = flow.startDuel('alexion', 'alexion-mentor', 'b')
    expect(started).toBe(true)
    const priv = flow as unknown as {
      scheduleAiMove: () => void
      aiThinking: boolean
      aiTimer: unknown
    }
    const beforeTimer = priv.aiTimer
    priv.aiThinking = true
    priv.scheduleAiMove()
    expect(priv.aiTimer).toBe(beforeTimer)
  })

  it('undo after flank pawn restores scene tendency counters', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    expect(flow.startDuel('alexion', 'alexion-mentor', 'w')).toBe(true)
    flow.tryPlayerMove('a2', 'a4')
    const st = flow as unknown as { sceneTendencies: { flankPawnPushes: number } }
    expect(st.sceneTendencies.flankPawnPushes).toBe(1)
    flow.undo()
    expect(st.sceneTendencies.flankPawnPushes).toBe(0)
  })
})
