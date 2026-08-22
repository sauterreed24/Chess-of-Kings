import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import {
  AI_PROFILES,
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
  adaptProfileToPhase,
} from './aiProfiles'

describe('AI profile resolver', () => {
  it('resolves profile by match id and duel variant id', () => {
    const amara = resolveProfileByMatchId('c1-match-amara')
    const apex = resolveProfileByDuelVariant('alexion-apex')
    const rowan = resolveProfileByMatchId('c2-match-rowan')
    const vega = resolveProfileByDuelVariant('vega-italian')
    expect(amara.id).toBe('novice_court')
    expect(apex.id).toBe('alexion_apex')
    expect(rowan.id).toBe('rowan_gambit')
    expect(vega.id).toBe('vega_italian')
    expect(resolveProfileByMatchId('c5-match-gage').id).toBe('gage_discipline')
    expect(resolveProfileByDuelVariant('helia-machine').id).toBe('helia_machine')
    expect(resolveProfileByMatchId('c5-match-gage').style).toBe('soviet')
    expect(resolveProfileByMatchId('c6-match-prax').id).toBe('prax_precision')
    expect(resolveProfileByDuelVariant('iota-threshold').id).toBe('iota_threshold')
    expect(resolveProfileByMatchId('c6-match-prax').style).toBe('engine')
    expect(resolveProfileByMatchId('c6-match-iota').style).toBe('engine')
    expect(resolveProfileByMatchId('c7-match-mira').id).toBe('mira_practical')
    expect(resolveProfileByDuelVariant('soren-answer').id).toBe('soren_answer')
    expect(resolveProfileByMatchId('c7-match-mira').style).toBe('universal')
    expect(resolveProfileByMatchId('c7-match-soren').style).toBe('universal')
    expect(resolveProfileByMatchId('c8-match-voss').id).toBe('voss_exchange')
    expect(resolveProfileByDuelVariant('elara-fork').id).toBe('elara_fork')
    expect(resolveProfileByMatchId('c8-match-voss').style).toBe('alexandrine')
    expect(resolveProfileByMatchId('c8-match-elara').style).toBe('alexandrine')
    expect(resolveProfileByMatchId('c9-match-wren').id).toBe('wren_census')
    expect(resolveProfileByDuelVariant('bram-fused').id).toBe('bram_fused')
    expect(resolveProfileByMatchId('c9-match-wren').style).toBe('apotheosis')
    expect(resolveProfileByMatchId('c9-match-bram').style).toBe('apotheosis')
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
    const rowan = resolveProfileByMatchId('c2-match-rowan')
    const vega = resolveProfileByMatchId('c2-match-vega')
    expect(edred.motifBias.fork).toBeGreaterThan(marius.motifBias.fork)
    expect(marius.motifBias.pin).toBeGreaterThan(edred.motifBias.pin)
    expect(edred.motifBias.kingHunt).toBeGreaterThan(0.6)
    expect(rowan.riskAppetite).toBeGreaterThan(vega.riskAppetite)
    expect(rowan.weights.sacrificial).toBeGreaterThan(vega.weights.sacrificial)
    expect(vega.kingSafetyUrgency).toBeGreaterThan(rowan.kingSafetyUrgency)
    expect(vega.openingDiscipline).toBeGreaterThan(rowan.openingDiscipline)
    expect(rowan.motifBias.kingHunt).toBeGreaterThan(0.9)
  })

  it('makes Alexandrine and apotheosis profiles more disciplined than Romantic fire', () => {
    const rowan = resolveProfileByMatchId('c2-match-rowan')
    const strategos = resolveProfileByDuelVariant('alexion-strategos')
    const apex = resolveProfileByDuelVariant('alexion-apex')
    expect(strategos.openingDiscipline).toBeGreaterThan(rowan.openingDiscipline)
    expect(apex.conversionStrictness).toBeGreaterThan(strategos.conversionStrictness)
    expect(apex.weights.prophylactic).toBeGreaterThan(rowan.weights.prophylactic)
  })

  it('sharpens Rowan as fire and Vega as disciplined pressure', () => {
    const rowan = resolveProfileByMatchId('c2-match-rowan')
    const vega = resolveProfileByMatchId('c2-match-vega')
    expect(rowan.riskAppetite).toBeGreaterThanOrEqual(0.95)
    expect(rowan.openingDiscipline).toBeLessThanOrEqual(0.32)
    expect(rowan.kingSafetyUrgency).toBeLessThan(0.45)
    expect(rowan.conversionStrictness).toBeLessThanOrEqual(0.36)
    expect(rowan.weights.sacrificial).toBeGreaterThan(0.95)
    expect(rowan.weights.prophylactic).toBeLessThan(0.15)
    expect(rowan.motifBias.kingHunt).toBeGreaterThan(vega.motifBias.kingHunt)
    expect(vega.blunderRate).toBeLessThan(rowan.blunderRate)
    expect(vega.riskAppetite).toBeLessThanOrEqual(0.42)
    expect(vega.openingDiscipline).toBeGreaterThanOrEqual(0.92)
    expect(vega.kingSafetyUrgency).toBeGreaterThanOrEqual(0.95)
    expect(vega.conversionStrictness).toBeGreaterThan(rowan.conversionStrictness)
    expect(vega.weights.prophylactic).toBeGreaterThanOrEqual(0.86)
    expect(vega.motifBias.pin).toBeGreaterThan(rowan.motifBias.pin)
    expect(vega.motifBias.pin).toBeGreaterThanOrEqual(0.92)
  })

  it('keeps early rivals brisk while bosses still feel deliberate', () => {
    const novice = AI_PROFILES.novice_court
    const apprentice = AI_PROFILES.apprentice_court
    const rowan = resolveProfileByMatchId('c2-match-rowan')
    const vega = resolveProfileByMatchId('c2-match-vega')
    const apex = resolveProfileByDuelVariant('alexion-apex')
    expect(novice.thinkTimeMs).toBeLessThan(apprentice.thinkTimeMs)
    expect(rowan.thinkTimeMs).toBeLessThan(vega.thinkTimeMs)
    expect(apex.thinkTimeMs).toBeGreaterThan(vega.thinkTimeMs)
  })

  it('makes Alexion and apotheosis profiles feel inevitable rather than reckless', () => {
    const mentor = resolveProfileByDuelVariant('alexion-mentor')
    const strategos = resolveProfileByDuelVariant('alexion-strategos')
    const apex = resolveProfileByDuelVariant('alexion-apex')
    const counterpart = resolveProfileByMatchId('c9-boss-counterpart')
    expect(strategos.conversionStrictness).toBeGreaterThan(mentor.conversionStrictness)
    expect(mentor.riskAppetite).toBeLessThan(0.25)
    expect(strategos.riskAppetite).toBeLessThanOrEqual(0.26)
    expect(strategos.weights.prophylactic).toBeGreaterThanOrEqual(0.97)
    expect(strategos.weights.positional).toBeGreaterThanOrEqual(0.95)
    expect(strategos.weights.sacrificial).toBeLessThanOrEqual(0.26)
    expect(apex.conversionStrictness).toBe(0.99)
    expect(apex.openingDiscipline).toBeGreaterThanOrEqual(0.99)
    expect(apex.kingSafetyUrgency).toBeGreaterThanOrEqual(0.99)
    expect(apex.riskAppetite).toBeLessThanOrEqual(0.24)
    expect(apex.blunderRate).toBeLessThan(0.02)
    expect(apex.weights.positional).toBeGreaterThanOrEqual(0.99)
    expect(apex.weights.prophylactic).toBeGreaterThanOrEqual(0.99)
    expect(apex.motifBias.pin).toBe(1)
    expect(counterpart.conversionStrictness).toBe(0.99)
    expect(counterpart.riskAppetite).toBeLessThanOrEqual(0.26)
    expect(counterpart.openingDiscipline).toBeGreaterThanOrEqual(0.99)
  })
})
