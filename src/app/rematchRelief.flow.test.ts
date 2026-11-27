import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Chess, Move } from 'chess.js'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import type { AiProfile, MatchHistoryEntry, MatchScene } from '../types'
import { AI_PROFILES } from '../chess/aiProfiles'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

/* Capture the profile the rival actually searches with (runAiTurn path). */
const searched: AiProfile[] = []
vi.mock('../chess/aiAsync', async (importOriginal) => {
  const real = await importOriginal<typeof import('../chess/aiAsync')>()
  return {
    ...real,
    findBestMoveWithProfileAsync: async (chess: Chess, profile: AiProfile): Promise<Move | null> => {
      searched.push(profile)
      return chess.moves({ verbose: true })[0] ?? null
    },
  }
})
vi.mock('../chess/openings', async (importOriginal) => {
  const real = await importOriginal<typeof import('../chess/openings')>()
  return { ...real, chooseOpeningBookMove: () => null }
})

import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'
import { buildInProgressSnapshot } from './persistence/SnapshotManager'
import type { SnapshotBuildContext } from './persistence/SnapshotManager'
import type { TrialId } from './trials'

type Outcome = 'win' | 'loss' | 'draw'

function entry(sceneId: string, outcome: Outcome, i: number): MatchHistoryEntry {
  return {
    id: `h${i}`,
    timestamp: i,
    mode: 'match',
    sourceId: sceneId,
    opponentId: sceneId,
    opponentLabel: 'Rival',
    outcome,
    moves: 30,
    styleGrade: 'C',
    turningPointSan: 'e4',
  }
}

function flowAt(sceneId: string, outcomes: Outcome[], trials: TrialId[] = []) {
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
  const history = outcomes.map((o, i) => entry(sceneId, o, i))
  ;(flow as unknown as { matchHistory: MatchHistoryEntry[] }).matchHistory = history
  flow.trials = new Set(trials)
  const ch = PLAYABLE_CHAPTERS.findIndex((c) => c.scenes.some((s) => s.id === sceneId))
  const sc = PLAYABLE_CHAPTERS[ch]!.scenes.findIndex((s) => s.id === sceneId)
  flow.highestUnlockedChapter = ch
  flow.jumpToScene(ch, sc)
  const persona = () => {
    expect(updates.length).toBeGreaterThan(0)
    return updates.at(-1)!.aiPersona ?? ''
  }
  return { flow, history, persona }
}

type Tune = (base: AiProfile, match: MatchScene) => AiProfile

describe('rematch relief in the campaign', () => {
  beforeEach(() => {
    searched.length = 0
  })

  it('first meeting shows no relief', () => {
    const { persona } = flowAt('c1-match-edred', [])
    expect(persona()).toMatch(/Scholar Guard/)
    expect(persona()).not.toMatch(/rematch relief/)
  })

  it('two straight losses surface relief II in the court dossier', () => {
    const { persona } = flowAt('c1-match-edred', ['loss', 'loss'])
    expect(persona()).toMatch(/\(rematch relief II: calculates shallower\)$/)
  })

  it('a rival already on the depth floor is labelled honestly', () => {
    const { persona } = flowAt('c1-match-amara', ['loss'])
    expect(persona()).toMatch(/\(rematch relief I: plays looser\)$/)
  })

  it('trial early-relief: the first meeting is already at step I, labelled as the trial', () => {
    const before = searched.length
    expect(flowAt('c1-match-edred', [], ['early-relief']).persona()).toMatch(
      /\(early relief \(trial\) I: calculates shallower\)$/,
    )
    expect(flowAt('c1-match-edred', ['loss', 'loss'], ['early-relief']).persona()).toMatch(/early relief \(trial\) III:/)
    expect(flowAt('c1-match-edred', ['loss', 'win'], ['early-relief']).persona()).toMatch(/early relief \(trial\) I:/)
    expect(searched.length).toBe(before)
  })

  it('a win ends the streak; a draw does not', () => {
    expect(flowAt('c1-match-edred', ['loss', 'loss', 'win']).persona()).not.toMatch(/rematch relief/)
    expect(flowAt('c1-match-edred', ['loss', 'loss', 'draw']).persona()).toMatch(/rematch relief II/)
  })

  it('a loss recorded mid-game (undo after mate) does not ease the current game', async () => {
    vi.useFakeTimers()
    try {
      const { flow, history, persona } = flowAt('c1-match-edred', ['loss'])
      const mv = flow.chess.moves({ verbose: true })[0]!
      flow.tryPlayerMove(mv.from, mv.to, mv.promotion)
      await vi.advanceTimersByTimeAsync(1000)
      const plies = flow.chess.history().length
      expect(plies).toBeGreaterThan(0)
      history.push(entry('c1-match-edred', 'loss', 9))
      flow.undo()
      expect(flow.chess.history().length).toBeLessThan(plies)
      expect(persona()).toMatch(/rematch relief I:/)
      flow.resetChessScene()
      expect(persona()).toMatch(/rematch relief II:/)
    } finally {
      vi.useRealTimers()
    }
  })

  it('a reload keeps the attempt\'s relief step even if a loss was recorded and undone', async () => {
    vi.useFakeTimers()
    try {
      const { flow, history, persona } = flowAt('c1-match-edred', ['loss'])
      const mv = flow.chess.moves({ verbose: true })[0]!
      flow.tryPlayerMove(mv.from, mv.to, mv.promotion)
      await vi.advanceTimersByTimeAsync(1000)
      expect(persona()).toMatch(/rematch relief I:/)
      /* Loss recorded mid-attempt (mate, then undo), then the app reloads. */
      history.push(entry('c1-match-edred', 'loss', 9))
      const snap = buildInProgressSnapshot(
        (flow as unknown as { snapshotBuildContext(): SnapshotBuildContext }).snapshotBuildContext(),
      )
      expect(snap?.reliefStreak).toBe(1)
      const again = flowAt('c1-match-edred', ['loss', 'loss'])
      const internals = again.flow as unknown as {
        snapshots: { setPendingSnapshot(s: unknown): void }
        refreshScene(): void
      }
      internals.snapshots.setPendingSnapshot(JSON.parse(JSON.stringify(snap)))
      internals.refreshScene()
      expect(again.flow.chess.fen()).toBe(snap!.fen)
      expect(again.persona()).toMatch(/rematch relief I:/)
      again.flow.resetChessScene()
      expect(again.persona()).toMatch(/rematch relief II:/)
    } finally {
      vi.useRealTimers()
    }
  })

  it('the rival searches with the eased depth, below the scene floor', async () => {
    vi.useFakeTimers()
    try {
      /* Vega: authored aiDepth 4; relief III cuts two depth units. */
      const { flow } = flowAt('c2-match-vega', ['loss', 'loss', 'loss'])
      const scene = flow.currentScene() as MatchScene
      for (let i = 0; i < 12 && searched.length === 0; i++) {
        const mv = flow.chess.moves({ verbose: true })[0]!
        flow.tryPlayerMove(mv.from, mv.to, mv.promotion)
        await vi.advanceTimersByTimeAsync(1000)
      }
      expect(searched.length).toBeGreaterThan(0)
      expect(searched[0]!.searchDepth).toBeLessThan(scene.aiDepth)
    } finally {
      vi.useRealTimers()
    }
  })

  it('eases the profile and leaves apex mode, but only after losses', () => {
    const tuned = (outcomes: Outcome[]) => {
      const { flow } = flowAt('c1-boss', outcomes)
      /* Uncapped copy: this checks relief on an apex rival, not the Chapter I cap. */
      const scene = { ...(flow.currentScene() as MatchScene), strengthCapSceneId: undefined }
      const tune = (flow as unknown as { tuneProfileForMatch: Tune }).tuneProfileForMatch.bind(flow)
      return { profile: tune(AI_PROFILES.counterpart_apex!, scene), scene }
    }
    const fresh = tuned([])
    const eased = tuned(['loss', 'loss', 'loss'])
    expect(fresh.profile.searchDepth).toBeGreaterThanOrEqual(fresh.scene.aiDepth)
    expect(fresh.profile.conversionStrictness).toBeGreaterThanOrEqual(0.95)
    expect(eased.profile.searchDepth).toBeLessThan(fresh.profile.searchDepth)
    expect(eased.profile.conversionStrictness).toBeLessThan(0.95)
  })
})
