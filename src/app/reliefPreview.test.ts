import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import type { Chapter, MatchHistoryEntry } from '../types'

vi.mock('./storage', () => ({ loadSave: () => null, writeSave: vi.fn(), clearSave: vi.fn(), hasSave: () => false }))
vi.mock('../chess/openings', async (importOriginal) => {
  const real = await importOriginal<typeof import('../chess/openings')>()
  return { ...real, chooseOpeningBookMove: () => null }
})

import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'

/* After 1.f3 e5, White's g4?? allows Qh4#. */
const FOOL = 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2'
const CHAPTERS: Chapter[] = PLAYABLE_CHAPTERS.map((c) => ({
  ...c,
  scenes: c.scenes.map((s) =>
    s.type === 'match' && s.id === 'c1-match-edred' ? { ...s, fen: FOOL, scriptedBlackSans: undefined } : s,
  ),
}))

function lose(priorLosses: number) {
  const updates: ChessUiPayload[] = []
  const flow = new GameFlow(CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: (p) => {
      updates.push(p)
    },
    onChapterComplete: vi.fn(),
    onCampaignFinished: vi.fn(),
  })
  flow.board = { draw: vi.fn(), setInteraction: vi.fn(), setOrientation: vi.fn(), setCheckSquare: vi.fn(), setSkin: vi.fn(), showLegalFrom: vi.fn() } as unknown as BoardView
  ;(flow as unknown as { matchHistory: MatchHistoryEntry[] }).matchHistory = Array.from({ length: priorLosses }, (_, i) => ({
    id: `h${i}`, timestamp: i, mode: 'match' as const, sourceId: 'c1-match-edred', opponentId: 'c1-match-edred',
    opponentLabel: 'Edred', outcome: 'loss' as const, moves: 20, styleGrade: 'C' as const, turningPointSan: 'g4',
  }))
  flow.highestUnlockedChapter = 1
  flow.jumpToScene(1, CHAPTERS[1]!.scenes.findIndex((s) => s.id === 'c1-match-edred'))
  return { flow, last: () => updates.at(-1)! }
}

describe('after a campaign loss the player learns the rematch will ease', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('first loss previews relief I with what changes', async () => {
    const { flow, last } = lose(0)
    flow.tryPlayerMove('g2', 'g4')
    await vi.advanceTimersByTimeAsync(3000)
    expect(last().matchOutcome).toBe('loss')
    expect(last().mentorInsight).toMatch(/Next attempt — rematch relief I: calculates shallower\.$/)
  })

  it('names the next step after repeated losses, and says nothing at the top step', async () => {
    const second = lose(1)
    second.flow.tryPlayerMove('g2', 'g4')
    await vi.advanceTimersByTimeAsync(3000)
    expect(second.last().mentorInsight).toMatch(/Next attempt — rematch relief II:/)
    const top = lose(3)
    top.flow.tryPlayerMove('g2', 'g4')
    await vi.advanceTimersByTimeAsync(3000)
    expect(top.last().matchOutcome).toBe('loss')
    expect(top.last().mentorInsight ?? '').not.toMatch(/Next attempt/)
  })
})
