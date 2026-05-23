import { describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
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

function calibrationSceneIndex(): number {
  const idx = PLAYABLE_CHAPTERS[0]!.scenes.findIndex((s) => s.type === 'calibration')
  expect(idx).toBeGreaterThanOrEqual(0)
  return idx
}

function makeCalibrationSnapshot() {
  const chess = new Chess()
  const startFen = chess.fen()
  chess.move('e4')
  const fen = chess.fen()
  return {
    mode: 'calibration' as const,
    chapterIndex: 0,
    sceneIndex: calibrationSceneIndex(),
    fen,
    history: [startFen, fen],
    sanLog: ['e4'],
    sanQuality: ['good'],
    playerColor: 'w' as const,
    calibrationMoves: 1,
    scriptedMoveIndex: 0,
    sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
  }
}

describe('GameFlow depth systems', () => {
  it('duel roster is gated until victories unlock rivals', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const initial = flow.getDuelRoster().map((r) => r.opponentId)
    expect(initial).toContain('alexion')
    expect(initial).not.toContain('amara')

    const f = flow as unknown as {
      duelUnlockedOpponentIds: string[]
    }
    f.duelUnlockedOpponentIds.push('amara')
    const unlocked = flow.getDuelRoster().map((r) => r.opponentId)
    expect(unlocked).toContain('amara')
  })

  it('supports skin persistence APIs and pending rewards buffer', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.setPieceSkin('classic-royal')
    expect(flow.getSelectedPieceSkin()).toBe('classic-royal')
    expect(flow.consumePendingRewards()).toEqual([])
  })

  it('records resolved outcomes into match history once', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      mode: 'match'
      matchScene: { id: string; opponentName: string } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      recordResolvedOutcomeIfNeeded: () => void
    }
    flow.chess.load('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    f.mode = 'match'
    f.matchScene = { id: 'c1-match-test', opponentName: 'Test Rival' }
    f.sanLog = ['Qg7#']
    f.sanQuality = ['good']
    f.recordResolvedOutcomeIfNeeded()
    f.recordResolvedOutcomeIfNeeded()
    const hist = flow.getMatchHistory()
    expect(hist.length).toBe(1)
    expect(hist[0]?.outcome).toBe('win')
    const mem = flow.getRivalMemory()
    expect(mem['c1-match-test']?.games).toBe(1)
  })

  it('adjudicates crushing sealed stalemate as win for stronger side (story rule)', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.chess.load('8/8/8/3Q1Q2/3bk3/8/5PK1/8 b - - 0 1')
    const f = flow as unknown as {
      mode: 'match'
      playerColor: 'w'
      computeMatchOutcome: () => 'win' | 'loss' | 'draw' | null
    }
    f.mode = 'match'
    f.playerColor = 'w'
    const staleSpy = vi.spyOn(flow.chess, 'isStalemate').mockReturnValue(true)
    expect(f.computeMatchOutcome()).toBe('win')
    staleSpy.mockRestore()
  })

  it('does not upgrade marginal sealed stalemate to a win (single queen vs minor)', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.chess.load('8/8/8/3Q4/3bk3/8/5PK1/8 b - - 0 1')
    const f = flow as unknown as {
      mode: 'match'
      playerColor: 'w'
      computeMatchOutcome: () => 'win' | 'loss' | 'draw' | null
    }
    f.mode = 'match'
    f.playerColor = 'w'
    const staleSpy = vi.spyOn(flow.chess, 'isStalemate').mockReturnValue(true)
    expect(f.computeMatchOutcome()).toBe('draw')
    staleSpy.mockRestore()
  })

  it('recommends duel difficulty from recent rivalry outcomes', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      matchHistory: Array<{ opponentId: string; outcome: 'win' | 'loss' | 'draw' }>
      rivalMemory: Record<string, { wins: number; losses: number }>
    }
    f.matchHistory = [
      { opponentId: 'edred', outcome: 'loss' },
      { opponentId: 'edred', outcome: 'loss' },
      { opponentId: 'edred', outcome: 'draw' },
    ]
    f.rivalMemory = { edred: { wins: 0, losses: 4 } }
    expect(flow.recommendDuelDifficulty('edred')).toBe('novice')

    f.matchHistory = [
      { opponentId: 'marius', outcome: 'win' },
      { opponentId: 'marius', outcome: 'win' },
      { opponentId: 'marius', outcome: 'win' },
    ]
    f.rivalMemory = { marius: { wins: 5, losses: 1 } }
    expect(flow.recommendDuelDifficulty('marius')).toBe('relentless')
  })

  it('builds adaptive training plan from tendencies and rival memory', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      tendencies: { flankPawnPushes: number; earlyQueenMoves: number; repeatedChecksWithoutGain: number }
      rivalMemory: Record<string, { punishedEarlyQueen: number; punishedFlankPushes: number }>
    }
    f.tendencies = { flankPawnPushes: 9, earlyQueenMoves: 5, repeatedChecksWithoutGain: 0 }
    f.rivalMemory = { edred: { punishedEarlyQueen: 4, punishedFlankPushes: 5 } }
    const plan = flow.getAdaptiveTrainingPlan('edred')
    expect(plan.length).toBeGreaterThan(1)
    expect(plan.join(' ')).toMatch(/queen|wing|Rival counter-pattern/i)
  })

  it('detects recoverable in-progress session marker', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as { pendingInProgressSnapshot: unknown }
    expect(flow.hasRecoverableSession()).toBe(false)
    f.pendingInProgressSnapshot = makeCalibrationSnapshot()
    expect(flow.hasRecoverableSession()).toBe(true)
  })

  it('resumes recoverable board session into live board state', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const f = flow as unknown as {
      pendingInProgressSnapshot: unknown
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    const snapshot = makeCalibrationSnapshot()
    f.pendingInProgressSnapshot = snapshot
    const ok = flow.resumeRecoverableSession()
    expect(ok).toBe(true)
    expect(flow.chess.fen()).toBe(snapshot.fen)
    expect(flow.hasRecoverableSession()).toBe(false)
  })

  it('rejects recovered snapshots when the SAN ledger cannot replay to the board FEN', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const chess = new Chess()
    const startFen = chess.fen()
    chess.move('e4')
    const afterE4 = chess.fen()
    chess.move('Nh6')
    const afterNh6 = chess.fen()
    const f = flow as unknown as {
      pendingInProgressSnapshot: unknown | null
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    f.pendingInProgressSnapshot = {
      ...makeCalibrationSnapshot(),
      fen: afterNh6,
      history: [startFen, afterE4, afterNh6],
      sanLog: ['e4'],
      sanQuality: ['good'],
    }

    expect(flow.hasRecoverableSession()).toBe(false)
    expect(flow.resumeRecoverableSession()).toBe(false)
    expect(f.pendingInProgressSnapshot).toBeNull()
  })

  it('drops stale recoverable snapshot that targets locked chapter', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      pendingInProgressSnapshot: unknown
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    f.pendingInProgressSnapshot = { mode: 'match', chapterIndex: 2, sceneIndex: 0 }
    expect(flow.hasRecoverableSession()).toBe(false)
    const ok = flow.resumeRecoverableSession()
    expect(ok).toBe(false)
    expect(flow.hasRecoverableSession()).toBe(false)
  })

  it('newGame clears pending recoverable session state', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as { pendingInProgressSnapshot: unknown }
    f.pendingInProgressSnapshot = makeCalibrationSnapshot()
    expect(flow.hasRecoverableSession()).toBe(true)
    flow.newGame()
    expect(flow.hasRecoverableSession()).toBe(false)
  })

  it('newGame clears buffered reward overlays', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      pendingRewards: Array<{ sourceId: string; sourceLabel: string; rewards: unknown[] }>
    }
    f.pendingRewards = [{ sourceId: 'x', sourceLabel: 'y', rewards: [] }]
    flow.newGame()
    expect(flow.consumePendingRewards()).toEqual([])
  })

  it('surfaces selected-piece guidance through boardGuide', () => {
    let latest: { boardGuide: string } | null = null
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: (payload) => {
        latest = payload
      },
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const root = document.createElement('div')
    document.body.appendChild(root)
    flow.mountBoard(root)
    flow.jumpToScene(0, 3)

    flow.board?.showLegalFrom(flow.chess, 'e2')

    expect(latest?.boardGuide).toMatch(/e2 pawn selected: 2 legal targets; no captures/)
    root.remove()
  })

  it('flushDeferredIO flushes pending UI emit and does not throw', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 1
    flow.jumpToScene(1, 2)
    onChessUpdate.mockClear()
    expect(() => flow.flushDeferredIO()).not.toThrow()
    expect(onChessUpdate).toHaveBeenCalled()
  })
})
