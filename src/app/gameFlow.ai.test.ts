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
import { writeSave } from './storage'

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

  it('does not file a court dossier on teaching puzzles', () => {
    let latest: { aiPersona: string | null } | null = null
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
    flow.jumpToScene(1, 2)
    expect(flow.currentScene().id).toBe('c1-tutorial-hanging')
    expect(latest?.aiPersona).toBeNull()
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

  it('jumpToScene persists the destination scene state, not stale duel in-progress snapshot', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const writeSaveMock = vi.mocked(writeSave)
    writeSaveMock.mockClear()

    expect(flow.startDuel('alexion', 'alexion-mentor', 'w')).toBe(true)
    flow.tryPlayerMove('e2', 'e4')
    writeSaveMock.mockClear()

    flow.jumpToScene(0, 0)
    const latest = writeSaveMock.mock.calls.at(-1)?.[0]
    expect(latest).toBeTruthy()
    expect(latest?.chapterIndex).toBe(0)
    expect(latest?.sceneIndex).toBe(0)
    expect(latest?.inProgress).toBeNull()
  })

  it('emits boardGuide that explains waiting when the player color is not on move', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    onChessUpdate.mockClear()
    expect(flow.startDuel('alexion', 'alexion-mentor', 'b')).toBe(true)
    /* `startDuel` emits once before AI thinking, then again with `aiThinking` — assert the first snapshot. */
    const waitGuide = onChessUpdate.mock.calls.map((c) => c[0]).find((p) => /White to move/.test(p.boardGuide))
    expect(waitGuide).toBeDefined()
    onChessUpdate.mockClear()
    expect(flow.startDuel('alexion', 'alexion-mentor', 'w')).toBe(true)
    const payloadW = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(payloadW?.boardGuide).toMatch(/accountable/)
    expect(payloadW?.boardGuide).toMatch(/no loose pieces/)
    expect(payloadW?.boardGuide).not.toMatch(/Targets glow/)
  })

  it('puts rival-specific live aims on the instrument as the command', () => {
    const guideFor = (opponentId: string, variantId: string) => {
      const onChessUpdate = vi.fn()
      const flow = new GameFlow(PLAYABLE_CHAPTERS, {
        onSceneChange: vi.fn(),
        onChessUpdate,
        onChapterComplete: vi.fn(),
        onCampaignFinished: vi.fn(),
      })
      flow.board = mockBoard() as unknown as BoardView
      flow.highestUnlockedChapter = 2
      ;(flow as unknown as { unlockedDuelVariantIds: string[] }).unlockedDuelVariantIds.push(variantId)
      expect(flow.startDuel(opponentId, variantId, 'w')).toBe(true)
      return onChessUpdate.mock.calls.at(-1)?.[0]?.boardGuide ?? ''
    }

    const rowanGuide = guideFor('rowan', 'rowan-gambit')
    expect(rowanGuide).toMatch(/Rowan/)
    expect(rowanGuide).toMatch(/castle/i)
    expect(rowanGuide).not.toMatch(/Targets glow/)

    const vegaGuide = guideFor('vega', 'vega-italian')
    expect(vegaGuide).toMatch(/Vega/)
    expect(vegaGuide).toMatch(/pressure/)
    expect(vegaGuide).toMatch(/development/)
    expect(vegaGuide).not.toMatch(/Targets glow/)

    const alexionGuide = guideFor('alexion', 'alexion-mentor')
    expect(alexionGuide).toMatch(/accountable/)
    expect(alexionGuide).toMatch(/no loose pieces/)
    expect(alexionGuide).not.toMatch(/Targets glow/)
  })

  it('emits freeplay-specific boardGuide on the rehearsal board', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const freeIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-freeplay')
    expect(freeIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(ch1, freeIdx)
    const payload = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(payload?.boardGuide).toMatch(/Select side/)
  })

  it('keeps the last player move insight visible after the trainer replies', async () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    const calibrationIdx = PLAYABLE_CHAPTERS[0]!.scenes.findIndex((s) => s.id === 'pr-calibration')
    expect(calibrationIdx).toBeGreaterThanOrEqual(0)
    flow.jumpToScene(0, calibrationIdx)
    onChessUpdate.mockClear()

    flow.tryPlayerMove('e2', 'e4')

    const playerInsight = onChessUpdate.mock.calls.at(-1)?.[0]?.coachTip
    expect(playerInsight).toMatch(/Center claimed/)

    await vi.advanceTimersByTimeAsync(500)

    const afterReply = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(flow.chess.turn()).toBe('w')
    expect(afterReply?.coachTip).toBe(playerInsight)
    expect(afterReply?.tacticalPulse).toMatch(/Archive reply:/)
  })

  it('threads active rival doctrine into visible move coaching and replies', async () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 2
    ;(flow as unknown as { unlockedDuelVariantIds: string[] }).unlockedDuelVariantIds.push('rowan-gambit')
    expect(flow.startDuel('rowan', 'rowan-gambit', 'w')).toBe(true)
    onChessUpdate.mockClear()

    flow.tryPlayerMove('g1', 'f3')

    const tip = onChessUpdate.mock.calls.at(-1)?.[0]?.coachTip
    expect(tip).toMatch(/Rowan fire/)
    expect(tip).toMatch(/Developed/)

    await vi.advanceTimersByTimeAsync(500)
    const afterReply = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(flow.chess.turn()).toBe('w')
    expect(afterReply?.tacticalPulse).toMatch(/Rowan Vale reply:/)
    expect(afterReply?.coachTip).toBe(tip)
  })

  it('warns the player when a move leaves a piece to be won (real-world coaching)', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const freeIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-freeplay')
    flow.jumpToScene(ch1, freeIdx)

    /* Freeplay = human controls both sides, so the line is deterministic. */
    flow.tryPlayerMove('e2', 'e4') // White
    flow.tryPlayerMove('b7', 'b5') // Black pushes a pawn that will guard c4
    onChessUpdate.mockClear()
    flow.tryPlayerMove('f1', 'c4') // White bishop walks onto c4, attacked by the b5 pawn, undefended

    const tip = onChessUpdate.mock.calls.at(-1)?.[0]?.coachTip
    expect(tip).toMatch(/can be won/)
    expect(tip).toMatch(/bishop on c4/)
  })

  it('clears a "piece can be won" warning once the rival replies (no stale advice)', async () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 2
    expect(flow.startDuel('alexion', 'alexion-mentor', 'w')).toBe(true)
    /* White on move with a bishop able to walk onto a square a black pawn
       attacks; reset the session log so tryPlayerMove is consistent. */
    flow.chess.load('rnbqkbnr/p1pppppp/8/1p6/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
    const f = flow as unknown as { sanLog: string[]; history: string[]; evalTrace: number[] }
    f.sanLog = []
    f.history = [flow.chess.fen()]
    f.evalTrace = []
    onChessUpdate.mockClear()

    flow.tryPlayerMove('f1', 'c4') // hangs the bishop to the b5 pawn
    const warned = onChessUpdate.mock.calls.at(-1)?.[0]?.coachTip
    expect(warned).toMatch(/can be won/)

    await vi.advanceTimersByTimeAsync(2000) // rival replies
    const afterReply = onChessUpdate.mock.calls.at(-1)?.[0]
    expect(flow.chess.turn()).toBe('w')
    expect(afterReply?.tacticalPulse).toMatch(/reply:/)
    /* The warning must not linger — the rival may have just taken the piece. */
    expect(afterReply?.coachTip ?? '').not.toMatch(/can be won/)
  })

  it('stays quiet when the developing move is safe', () => {
    const onChessUpdate = vi.fn()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate,
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    const ch1 = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch1')
    const freeIdx = PLAYABLE_CHAPTERS[ch1]!.scenes.findIndex((s) => s.id === 'c1-freeplay')
    flow.jumpToScene(ch1, freeIdx)

    flow.tryPlayerMove('e2', 'e4')
    flow.tryPlayerMove('e7', 'e5')
    onChessUpdate.mockClear()
    flow.tryPlayerMove('g1', 'f3') // sound development, nothing hangs

    const tip = onChessUpdate.mock.calls.at(-1)?.[0]?.coachTip ?? ''
    expect(tip).not.toMatch(/can be won/)
  })

  it('duel aiFlavor prefixes with curated talk when the rival has a profile', () => {
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.board = mockBoard() as unknown as BoardView
    flow.highestUnlockedChapter = 1
    ;(flow as unknown as { unlockedDuelVariantIds: string[] }).unlockedDuelVariantIds.push('amara-initiate')
    expect(flow.startDuel('amara', 'amara-initiate', 'w')).toBe(true)
    const flavor = (flow as unknown as { currentAiFlavor(): string | null }).currentAiFlavor()
    expect(flavor).toMatch(/Amara treats symmetry as jurisprudence/)
    expect(flavor).toMatch(/\(Measured Foe, 1500\)/)
    expect(flavor).toMatch(/ — /)
    expect(
      flavor?.includes('I have studied the board') ||
        flavor?.includes('Symmetry is the patient') ||
        flavor?.includes('Mirror me only'),
    ).toBe(true)
  })

  it('duel aiFlavor makes Rowan, Vega, and Alexion doctrines distinct in live play', () => {
    const flavorFor = (opponentId: string, variantId: string) => {
      const flow = new GameFlow(PLAYABLE_CHAPTERS, {
        onSceneChange: vi.fn(),
        onChessUpdate: vi.fn(),
        onChapterComplete: vi.fn(),
        onCampaignFinished: vi.fn(),
      })
      flow.board = mockBoard() as unknown as BoardView
      flow.highestUnlockedChapter = 2
      ;(flow as unknown as { unlockedDuelVariantIds: string[] }).unlockedDuelVariantIds.push(variantId)
      expect(flow.startDuel(opponentId, variantId, 'w')).toBe(true)
      return (flow as unknown as { currentAiFlavor(): string | null }).currentAiFlavor() ?? ''
    }

    expect(flavorFor('alexion', 'alexion-mentor')).toMatch(/Alexion audits plans like civic law/)
    expect(flavorFor('rowan', 'rowan-gambit')).toMatch(/Rowan turns imbalance into fire/)
    expect(flavorFor('vega', 'vega-italian')).toMatch(/Vega audits romance with law/)
  })
})
