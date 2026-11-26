import { describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import type { AiProfile, MatchScene } from '../types'
import { adaptProfileToPhase, detectGamePhase, resolveProfileByMatchId } from '../chess/aiProfiles'

vi.mock('./storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from './gameFlow'

const matches = PLAYABLE_CHAPTERS.flatMap((c) => c.scenes.filter((s): s is MatchScene => s.type === 'match'))

function flowAt(sceneId: string) {
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete: vi.fn(),
    onCampaignFinished: vi.fn(),
  })
  flow.board = { draw: vi.fn(), setInteraction: vi.fn(), setOrientation: vi.fn(), setCheckSquare: vi.fn(), setSkin: vi.fn(), showLegalFrom: vi.fn() } as unknown as BoardView
  const ch = PLAYABLE_CHAPTERS.findIndex((c) => c.scenes.some((s) => s.id === sceneId))
  flow.highestUnlockedChapter = ch
  flow.jumpToScene(ch, PLAYABLE_CHAPTERS[ch]!.scenes.findIndex((s) => s.id === sceneId))
  return flow
}

function tunedFor(sceneId: string): AiProfile {
  const flow = flowAt(sceneId)
  const scene = flow.currentScene() as MatchScene
  const internals = flow as unknown as {
    tuneProfileForMatch(base: AiProfile, m: MatchScene): AiProfile
    tendencies: { flankPawnPushes: number; earlyQueenMoves: number; repeatedChecksWithoutGain: number }
  }
  const base = adaptProfileToPhase(resolveProfileByMatchId(scene.id), detectGamePhase(flow.chess), internals.tendencies)
  return internals.tuneProfileForMatch(base, scene)
}

describe('strength caps', () => {
  it('every cap names an uncapped match scene in the campaign', () => {
    for (const m of matches.filter((x) => x.strengthCapSceneId)) {
      const cap = matches.find((x) => x.id === m.strengthCapSceneId)
      expect(cap, m.id).toBeDefined()
      expect(cap!.strengthCapSceneId).toBeUndefined()
    }
  })

  it('Chapter I finale plays no stronger than Marius, and the Counterpart leaves best-move mode', () => {
    const marius = tunedFor('c1-match-marius')
    for (const id of ['c1-match-demetrios', 'c1-boss']) {
      const capped = tunedFor(id)
      expect(capped.searchDepth, id).toBeLessThanOrEqual(marius.searchDepth)
      expect(capped.thinkTimeMs, id).toBeLessThanOrEqual(marius.thinkTimeMs)
      expect(capped.blunderRate, id).toBeGreaterThanOrEqual(marius.blunderRate)
      expect(capped.tacticalAlertness, id).toBeLessThanOrEqual(marius.tacticalAlertness)
      expect(capped.conversionStrictness, id).toBeLessThan(0.95)
    }
    /* Personality is the rival's own. */
    expect(tunedFor('c1-boss').style).toBe(resolveProfileByMatchId('c1-boss').style)
  })

  it('uncapped rivals are unaffected', () => {
    const vega = tunedFor('c2-match-vega')
    expect(vega.searchDepth).toBeGreaterThanOrEqual(4)
  })

  it('a capped rival is rated no higher than its cap', () => {
    const rating = (id: string) => (flowAt(id) as unknown as { currentOpponentRating(): number }).currentOpponentRating()
    expect(rating('c1-boss')).toBeLessThanOrEqual(rating('c1-match-marius'))
    expect(rating('c1-match-demetrios')).toBeLessThanOrEqual(rating('c1-match-marius'))
  })
})
