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

  it('shows sealed Duel Archive dossiers without making them playable early', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView

    const archive = flow.getDuelArchiveRoster()
    expect(archive.map((entry) => entry.rival.opponentId)).toEqual([
      'amara',
      'lukas',
      'edred',
      'marius',
      'alexion',
      'rowan',
      'vega',
      'kallistos',
      'nysa',
      'cassian',
      'gage',
      'helia',
      'prax',
      'iota',
      'mira',
      'soren',
      'voss',
      'elara',
      'wren',
      'bram',
    ])
    expect(archive.find((entry) => entry.rival.opponentId === 'alexion')?.isOpen).toBe(true)
    expect(archive.find((entry) => entry.rival.opponentId === 'lukas')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'kallistos')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'nysa')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'cassian')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'gage')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'helia')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'prax')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'iota')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'mira')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'soren')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'voss')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'elara')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'wren')?.isOpen).toBe(false)
    expect(archive.find((entry) => entry.rival.opponentId === 'bram')?.isOpen).toBe(false)
    const rowan = archive.find((entry) => entry.rival.opponentId === 'rowan')
    expect(rowan?.isOpen).toBe(false)
    expect(rowan?.unlockHint).toContain('Defeat Rowan Vale in Chapter II')
    expect(flow.startDuel('rowan', 'rowan-gambit', 'w')).toBe(false)
  })

  it('opens non-Alexion duel variants once that rival is campaign-unlocked', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView

    const f = flow as unknown as {
      duelUnlockedOpponentIds: string[]
      highestUnlockedChapter: number
    }
    f.duelUnlockedOpponentIds.push('amara')
    f.highestUnlockedChapter = 1

    expect(flow.isDuelVariantUnlocked('amara-initiate')).toBe(true)
    expect(flow.startDuel('amara', 'amara-initiate', 'w')).toBe(true)
    expect(flow.isDuelVariantUnlocked('alexion-apex')).toBe(false)
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

  it('names the player\'s costliest move with the engine\'s preferred reply', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      mode: 'match'
      playerColor: 'w' | 'b'
      matchScene: { id: string; opponentName: string } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      evalTrace: number[]
      history: string[]
      recordResolvedOutcomeIfNeeded: () => void
    }
    /* White (the player) threw away ~3 pawns on move 2 (Qh5), recovered,
       and still mated. The recap must surface the blunder, not the win. */
    flow.chess.load('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    f.mode = 'match'
    f.playerColor = 'w'
    f.matchScene = { id: 'c1-match-test', opponentName: 'Test Rival' }
    f.sanLog = ['e4', 'e5', 'Qh5', 'Nc6', 'Qg7#']
    f.sanQuality = ['good', null, 'blunder', null, 'good']
    f.evalTrace = [25, 20, -300, -290, 30000]
    f.history = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2',
      '8/8/8/8/8/8/8/8 w - - 0 1',
    ]
    f.recordResolvedOutcomeIfNeeded()

    const line = flow.getCostliestMomentLine()
    expect(line).not.toBeNull()
    expect(line).toContain('Qh5')
    expect(line).toContain('2.')
    expect(line).toMatch(/cost about \d+\.\d+ pawns/)
    expect(line).toContain('preferred') /* engine offers a real alternative */
  })

  it('reports no costliest move for a clean game', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      mode: 'match'
      playerColor: 'w' | 'b'
      matchScene: { id: string; opponentName: string } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      evalTrace: number[]
      history: string[]
      recordResolvedOutcomeIfNeeded: () => void
    }
    flow.chess.load('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    f.mode = 'match'
    f.playerColor = 'w'
    f.matchScene = { id: 'c1-match-clean', opponentName: 'Test Rival' }
    f.sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    f.sanQuality = ['good', null, 'good', null]
    f.evalTrace = [25, 20, 35, 30] /* never drops past the threshold */
    f.history = ['x', 'x', 'x', 'x']
    f.recordResolvedOutcomeIfNeeded()
    expect(flow.getCostliestMomentLine()).toBeNull()
  })

  it('requestHint emits a teaching coach line on the player\'s turn', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as { mode: string; playerColor: 'w' | 'b' }
    f.mode = 'duel'
    f.playerColor = 'w'
    flow.chess.load('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4')
    onChessUpdate.mockClear()
    flow.requestHint()
    const payload = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(payload?.coachTip).toMatch(/^Hint — /)
  })

  it('requestHint is a no-op when it is not the player\'s turn', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as { mode: string; playerColor: 'w' | 'b' }
    f.mode = 'duel'
    f.playerColor = 'w'
    /* Black to move — not the player. */
    flow.chess.load('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
    onChessUpdate.mockClear()
    flow.requestHint()
    expect(onChessUpdate).not.toHaveBeenCalled()
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

  it('raises the Stratarch Rating after a won match and records a positive delta', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      mode: 'match'
      matchScene: { id: string; opponentName: string; aiDepth: number } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      recordResolvedOutcomeIfNeeded: () => void
    }
    expect(flow.getLadderRating()).toEqual({ rating: 800, peak: 800, rated: 0 })
    flow.chess.load('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    f.mode = 'match'
    f.matchScene = { id: 'c1-match-test', opponentName: 'Test Rival', aiDepth: 3 }
    f.sanLog = ['Qg7#']
    f.sanQuality = ['good']
    f.recordResolvedOutcomeIfNeeded()

    const ladder = flow.getLadderRating()
    expect(ladder.rated).toBe(1)
    expect(ladder.rating).toBeGreaterThan(800)
    expect(ladder.peak).toBe(ladder.rating)
    expect(flow.getLastRatingDelta()).toBeGreaterThan(0)

    // Idempotent: the same resolved key must not double-count the rating.
    f.recordResolvedOutcomeIfNeeded()
    expect(flow.getLadderRating().rated).toBe(1)
  })

  it('lowers the Stratarch Rating after a lost match', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      mode: 'match'
      playerColor: 'w'
      matchScene: { id: string; opponentName: string; aiDepth: number } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      recordResolvedOutcomeIfNeeded: () => void
    }
    // Fool's mate: White (the player) is checkmated, so the rival wins.
    flow.chess.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3')
    f.mode = 'match'
    f.playerColor = 'w'
    f.matchScene = { id: 'c1-match-test', opponentName: 'Test Rival', aiDepth: 3 }
    f.sanLog = ['f3', 'e5', 'g4', 'Qh4#']
    f.sanQuality = ['ok', 'good', 'blunder', 'good']
    f.recordResolvedOutcomeIfNeeded()

    const ladder = flow.getLadderRating()
    expect(ladder.rated).toBe(1)
    expect(ladder.rating).toBeLessThan(800)
    expect(flow.getLastRatingDelta()).toBeLessThan(0)
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
    const f = flow as unknown as { snapshots: { setPendingSnapshot: (s: unknown) => void } }
    expect(flow.hasRecoverableSession()).toBe(false)
    f.snapshots.setPendingSnapshot(makeCalibrationSnapshot())
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
      snapshots: { setPendingSnapshot: (s: unknown) => void }
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    const snapshot = makeCalibrationSnapshot()
    f.snapshots.setPendingSnapshot(snapshot)
    const ok = flow.resumeRecoverableSession()
    expect(ok).toBe(true)
    expect(flow.chess.fen()).toBe(snapshot.fen)
    // Pass 8: live board progress re-promotes into pending on persist so Resume
    // works after vestibule without a reload.
    expect(flow.hasRecoverableSession()).toBe(true)
    expect(flow.hasUnsavedPassageProgress()).toBe(true)
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
      snapshots: { setPendingSnapshot: (s: unknown) => void; getPendingSnapshot: () => unknown | null }
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    f.snapshots.setPendingSnapshot({
      ...makeCalibrationSnapshot(),
      fen: afterNh6,
      history: [startFen, afterE4, afterNh6],
      sanLog: ['e4'],
      sanQuality: ['good'],
    })

    expect(flow.hasRecoverableSession()).toBe(false)
    expect(flow.resumeRecoverableSession()).toBe(false)
    expect(f.snapshots.getPendingSnapshot()).toBeNull()
  })

  it('drops stale recoverable snapshot that targets locked chapter', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      snapshots: { setPendingSnapshot: (s: unknown) => void }
      highestUnlockedChapter: number
    }
    f.highestUnlockedChapter = 0
    f.snapshots.setPendingSnapshot({ mode: 'match', chapterIndex: 2, sceneIndex: 0 })
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
    const f = flow as unknown as { snapshots: { setPendingSnapshot: (s: unknown) => void } }
    f.snapshots.setPendingSnapshot(makeCalibrationSnapshot())
    expect(flow.hasRecoverableSession()).toBe(true)
    flow.newGame()
    expect(flow.hasRecoverableSession()).toBe(false)
  })

  it('newGame resets the Stratarch Rating ladder', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    const f = flow as unknown as {
      ladder: { rating: number; peak: number; rated: number }
      lastRatingDelta: number
    }
    f.ladder = { rating: 912, peak: 940, rated: 14 }
    f.lastRatingDelta = 18
    flow.newGame()
    expect(flow.getLadderRating()).toEqual({ rating: 800, peak: 800, rated: 0 })
    expect(flow.getLastRatingDelta()).toBe(0)
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
    const calibrationIdx = PLAYABLE_CHAPTERS[0]!.scenes.findIndex((s) => s.id === 'pr-calibration')
    expect(calibrationIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(0, calibrationIdx)

    expect(latest?.boardGuide).toContain('four White moves')
    expect(latest?.boardGuide).toContain('Archive reply')

    flow.board?.showLegalFrom(flow.chess, 'e2')

    expect(latest?.boardGuide).toContain('four White moves')
    expect(latest?.boardGuide).toContain('Archive reply')
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    root.remove()
  })

  it('keeps the hanging-knight command when the bishop is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const puzzleIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-tutorial-hanging')
    flow.jumpToScene(ch1, puzzleIdx)
    flow.board?.showLegalFrom(flow.chess, 'c3')
    expect(latest?.boardGuide).toMatch(/loose knight on d4/i)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    root.remove()
  })

  it('still names kingside when the castle king is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const castleIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-tutorial-castle')
    flow.jumpToScene(ch1, castleIdx)
    flow.board?.showLegalFrom(flow.chess, 'e1')
    expect(latest?.boardGuide).toMatch(/castle kingside to g1/i)
    root.remove()
  })

  it('surfaces puzzle objectives near the board before a piece is selected', () => {
    let latest: { boardGuide: string } | null = null
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: (payload) => {
        latest = payload
      },
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const puzzleIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.type === 'puzzle')
    expect(puzzleIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch1, puzzleIdx)

    expect(latest?.boardGuide).toMatch(/loose knight|undefended knight|bishop/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
  })

  it('turns the board guide into check-defense coaching', () => {
    let latest: { boardGuide: string } | null = null
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: (payload) => {
        latest = payload
      },
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const freeIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-freeplay')
    expect(freeIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch1, freeIdx)

    flow.chess.load('4k3/8/8/8/8/8/4q3/4K3 w - - 0 1')
    flow.flushDeferredIO()

    expect(latest?.boardGuide).toMatch(/Check: \d+ legal repl(?:y|ies)/)
    expect(latest?.boardGuide).toContain('Save king: move, block, capture.')
  })

  it('keeps Nysa\'s frontier aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 4
    const ch4 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch4')
    const matchIdx = PLAYABLE_CHAPTERS[ch4]!.scenes.findIndex((s) => s.id === 'c4-match-nysa')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch4, matchIdx)
    expect(latest?.boardGuide).toMatch(/defend twice/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/defend twice/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Cassian\'s paradox aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 4
    const ch4 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch4')
    const matchIdx = PLAYABLE_CHAPTERS[ch4]!.scenes.findIndex((s) => s.id === 'c4-match-cassian')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch4, matchIdx)
    expect(latest?.boardGuide).toMatch(/Hold the center|long diagonal/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/Hold the center|long diagonal/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Gage\'s pause aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 5
    const ch5 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch5')
    const matchIdx = PLAYABLE_CHAPTERS[ch5]!.scenes.findIndex((s) => s.id === 'c5-match-gage')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch5, matchIdx)
    expect(latest?.boardGuide).toMatch(/Gage wants named|refuse the square/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/Gage wants named|refuse the square/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Helia\'s conversion aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 5
    const ch5 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch5')
    const matchIdx = PLAYABLE_CHAPTERS[ch5]!.scenes.findIndex((s) => s.id === 'c5-match-helia')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch5, matchIdx)
    expect(latest?.boardGuide).toMatch(/Cash what you win|donate counterplay/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/Cash what you win|donate counterplay/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Iota\'s finish aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 6
    const ch6 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch6')
    const matchIdx = PLAYABLE_CHAPTERS[ch6]!.scenes.findIndex((s) => s.id === 'c6-match-iota')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch6, matchIdx)
    expect(latest?.boardGuide).toMatch(/Finish the plus|back rank/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/Finish the plus|back rank/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Soren\'s answering-school aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 7
    const ch7 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch7')
    const matchIdx = PLAYABLE_CHAPTERS[ch7]!.scenes.findIndex((s) => s.id === 'c7-match-soren')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch7, matchIdx)
    expect(latest?.boardGuide).toMatch(/Meet the reply school|first costume/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/Meet the reply school|first costume/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Elara\'s fork-registrar aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 8
    const ch8 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch8')
    const matchIdx = PLAYABLE_CHAPTERS[ch8]!.scenes.findIndex((s) => s.id === 'c8-match-elara')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch8, matchIdx)
    expect(latest?.boardGuide).toMatch(/File both futures|second office/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/File both futures|second office/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Bram\'s compiled-school aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 9
    const ch9 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch9')
    const matchIdx = PLAYABLE_CHAPTERS[ch9]!.scenes.findIndex((s) => s.id === 'c9-match-bram')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch9, matchIdx)
    expect(latest?.boardGuide).toMatch(/Meet the compiled school|first costume/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'd2')
    expect(latest?.boardGuide).toMatch(/Meet the compiled school|first costume/i)
    expect(latest?.boardGuide).not.toMatch(/d2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Demetrios-return aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 3
    const ch3 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch3')
    const matchIdx = PLAYABLE_CHAPTERS[ch3]!.scenes.findIndex((s) => s.id === 'c3-match-demetrios-return')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch3, matchIdx)
    expect(latest?.boardGuide).toMatch(/quiet threats|pawn tempi/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/quiet threats|pawn tempi/i)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps the Chapter II king-hunt command when the queen is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 2
    const ch2 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch2')
    const huntIdx = PLAYABLE_CHAPTERS[ch2]!.scenes.findIndex((s) => s.id === 'c2-puzzle-king-hunt')
    expect(huntIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch2, huntIdx)
    expect(latest?.boardGuide).toMatch(/eighth rank/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'g7')
    expect(latest?.boardGuide).toMatch(/eighth rank/i)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps Rowan\'s gambit aim when a knight is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 2
    const ch2 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch2')
    const matchIdx = PLAYABLE_CHAPTERS[ch2]!.scenes.findIndex((s) => s.id === 'c2-match-rowan')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch2, matchIdx)
    expect(latest?.boardGuide).toMatch(/poisoned pawn/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'g1')
    expect(latest?.boardGuide).toMatch(/poisoned pawn/i)
    expect(latest?.boardGuide).not.toMatch(/g1 knight selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    expect(flow.chess.get('f4')?.type).toBe('p')
    expect(flow.chess.get('e2')).toBeUndefined()
    root.remove()
  })

  it('keeps Vega\'s Italian-pressure aim when the king is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 2
    const ch2 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch2')
    const matchIdx = PLAYABLE_CHAPTERS[ch2]!.scenes.findIndex((s) => s.id === 'c2-match-vega')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch2, matchIdx)
    expect(latest?.boardGuide).toMatch(/Castle early|pressure with development/i)
    expect(latest?.boardGuide.length).toBeLessThan(80)
    flow.board?.showLegalFrom(flow.chess, 'e1')
    expect(latest?.boardGuide).toMatch(/Castle early|pressure with development/i)
    expect(latest?.boardGuide).not.toMatch(/e1 king selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    expect(flow.chess.get('e2')).toBeUndefined()
    expect(flow.chess.get('e4')?.type).toBe('p')
    expect(flow.chess.get('c4')?.type).toBe('b')
    root.remove()
  })

  it('keeps Amara\'s opening aim when a pawn is selected', () => {
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
    const f = flow as unknown as { highestUnlockedChapter: number }
    f.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const matchIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-match-amara')
    expect(matchIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch1, matchIdx)

    expect(latest?.boardGuide).toMatch(/Open the center/)
    expect(latest?.boardGuide).toMatch(/Amara/)
    expect(latest?.boardGuide).not.toMatch(/Targets glow/)
    expect(latest?.boardGuide.length).toBeLessThan(80)

    flow.board?.showLegalFrom(flow.chess, 'e2')

    expect(latest?.boardGuide).toMatch(/Open the center/)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/legal targets/i)
    root.remove()
  })

  it('keeps the Alexion duel aim when a pawn is selected', () => {
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
    expect(flow.startDuel('alexion', 'alexion-mentor', 'w')).toBe(true)
    expect(latest?.boardGuide).toMatch(/accountable/)
    flow.board?.showLegalFrom(flow.chess, 'e2')
    expect(latest?.boardGuide).toMatch(/accountable/)
    expect(latest?.boardGuide).not.toMatch(/e2 pawn selected/)
    expect(latest?.boardGuide).not.toMatch(/Targets glow/)
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
