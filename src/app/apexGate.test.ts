import { describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import type { AiProfile, MatchScene } from '../types'
import { adaptProfileToPhase, resolveProfileByMatchId } from '../chess/aiProfiles'
import type { GamePhase } from '../types'
import { APEX_CONVERSION_STRICTNESS } from '../chess/ai'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from './gameFlow'

type Internals = {
  tuneProfileForMatch(base: AiProfile, m: MatchScene): AiProfile
  tendencies: { flankPawnPushes: number; earlyQueenMoves: number; repeatedChecksWithoutGain: number }
  sanLog: string[]
}

/* A real rook endgame, so the cap rival is tuned in the same phase. */
const ENDGAME = '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 40'

function tuned(ci: number, si: number, phase: GamePhase, plies = 0): AiProfile {
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete: vi.fn(),
    onCampaignFinished: vi.fn(),
  })
  flow.board = { draw: vi.fn(), setInteraction: vi.fn(), setOrientation: vi.fn(), setCheckSquare: vi.fn(), setSkin: vi.fn(), showLegalFrom: vi.fn() } as unknown as BoardView
  flow.highestUnlockedChapter = ci
  flow.jumpToScene(ci, si)
  const f = flow as unknown as Internals
  if (phase === 'endgame') flow.chess.load(ENDGAME)
  f.sanLog = Array.from({ length: plies }, () => 'e4') /* endgame ramp kicks in at 24 plies */
  const scene = flow.currentScene() as MatchScene
  return f.tuneProfileForMatch(adaptProfileToPhase(resolveProfileByMatchId(scene.id), phase, f.tendencies), scene)
}

describe('apex best-move mode is for bosses and authored apex rivals, not ramped veterans', () => {
  it('a non-boss rival plays best-move only if authored at apex strictness', () => {
    let apex = 0
    let checked = 0
    PLAYABLE_CHAPTERS.forEach((chapter, ci) =>
      chapter.scenes.forEach((scene, si) => {
        if (scene.type !== 'match') return
        const authoredApex =
          resolveProfileByMatchId(scene.id).conversionStrictness >= APEX_CONVERSION_STRICTNESS ||
          scene.ladderTier === 'boss' ||
          scene.ladderTier === 'counterpart'
        for (const phase of ['opening', 'middlegame', 'endgame'] as const) {
          const t = tuned(ci, si, phase, phase === 'endgame' ? 60 : 0)
          const playsApex = t.conversionStrictness >= APEX_CONVERSION_STRICTNESS
          checked++
          if (!authoredApex) expect(playsApex, `${scene.id} ${phase}`).toBe(false)
          if (playsApex) apex++
        }
      }),
    )
    expect(checked).toBe(66)
    /* Bosses and authored apex rivals can still reach it (the Chapter I finale is capped to Marius). */
    expect(apex).toBeGreaterThan(0)
  })

  it('spot checks: ramped veterans stay personas, late apex bosses keep best-move, Chapter I finale follows Marius', () => {
    const at = (id: string, phase: GamePhase) => {
      const ci = PLAYABLE_CHAPTERS.findIndex((c) => c.scenes.some((s) => s.id === id))
      const si = PLAYABLE_CHAPTERS[ci]!.scenes.findIndex((s) => s.id === id)
      return tuned(ci, si, phase, phase === 'endgame' ? 60 : 0).conversionStrictness
    }
    for (const id of ['c5-match-gage', 'c6-match-prax', 'c4-match-nysa', 'c8-match-voss']) {
      for (const phase of ['opening', 'middlegame', 'endgame'] as const) {
        expect(at(id, phase), `${id} ${phase}`).toBeLessThan(APEX_CONVERSION_STRICTNESS)
      }
    }
    for (const id of ['c9-match-wren', 'c9-match-bram', 'c5-match-helia']) {
      expect(at(id, 'middlegame'), id).toBeGreaterThanOrEqual(APEX_CONVERSION_STRICTNESS)
    }
    /* Capped to Marius (a veteran): never apex, even in the endgame. */
    for (const id of ['c1-match-demetrios', 'c1-boss']) {
      expect(at(id, 'endgame'), id).toBeLessThanOrEqual(at('c1-match-marius', 'endgame'))
      expect(at(id, 'endgame'), id).toBeLessThan(APEX_CONVERSION_STRICTNESS)
    }
  })

  it('ramps still sharpen a non-apex rival', () => {
    const ci = PLAYABLE_CHAPTERS.findIndex((c) => c.id === 'ch5')
    const si = PLAYABLE_CHAPTERS[ci]!.scenes.findIndex((s) => s.id === 'c5-match-gage')
    const t = tuned(ci, si, 'middlegame')
    expect(t.conversionStrictness).toBeGreaterThan(resolveProfileByMatchId('c5-match-gage').conversionStrictness)
    expect(t.conversionStrictness).toBeLessThan(APEX_CONVERSION_STRICTNESS)
  })
})
