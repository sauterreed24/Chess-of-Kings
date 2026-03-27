import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import {
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
  adaptProfileToPhase,
} from './aiProfiles'

describe('AI profile resolver', () => {
  it('resolves profile by match id and duel variant id', () => {
    const amara = resolveProfileByMatchId('c1-match-amara')
    const apex = resolveProfileByDuelVariant('alexion-apex')
    expect(amara.id).toBe('novice_court')
    expect(apex.id).toBe('alexion_apex')
  })

  it('detects game phase and adapts conversion/endgame values', () => {
    const c = new Chess('8/4k3/8/8/8/8/4K3/7Q w - - 0 1')
    const base = resolveProfileByMatchId('c1-match-marius')
    const phase = detectGamePhase(c)
    const adapted = adaptProfileToPhase(base, phase, {
      flankPawnPushes: 10,
      earlyQueenMoves: 5,
      repeatedChecksWithoutGain: 0,
    })
    expect(phase).toBe('endgame')
    expect(adapted.conversionStrictness).toBeGreaterThanOrEqual(base.conversionStrictness)
    expect(adapted.tacticalAlertness).toBeGreaterThan(base.tacticalAlertness)
  })

  it('encodes per-rival tactical motif priors', () => {
    const edred = resolveProfileByMatchId('c1-match-edred')
    const marius = resolveProfileByMatchId('c1-match-marius')
    expect(edred.motifBias.fork).toBeGreaterThan(marius.motifBias.fork)
    expect(marius.motifBias.pin).toBeGreaterThan(edred.motifBias.pin)
    expect(edred.motifBias.kingHunt).toBeGreaterThan(0.6)
  })
})
