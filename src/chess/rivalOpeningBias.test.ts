import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { chooseOpeningBookMove } from './openings'
import { rivalOpeningWeightBoost } from './rivalOpeningBias'

describe('rival opening bias', () => {
  it('boosts Edred Sicilian lines over quiet e5 when biased', () => {
    const c = new Chess()
    c.move('e4')
    const samples: Record<string, number> = { c5: 0, e5: 0 }
    for (let i = 0; i < 80; i++) {
      const clone = new Chess(c.fen())
      const san = chooseOpeningBookMove(clone, 'scholar_guard', 1, 'edred')
      if (san && san in samples) samples[san]!++
    }
    expect(samples.c5).toBeGreaterThan(samples.e5)
  })

  it('boosts Lukas classical e5 over d5', () => {
    const c = new Chess()
    c.move('e4')
    const samples: Record<string, number> = { e5: 0, d5: 0 }
    for (let i = 0; i < 80; i++) {
      const clone = new Chess(c.fen())
      const san = chooseOpeningBookMove(clone, 'apprentice_court', 1, 'lukas')
      if (san && san in samples) samples[san]!++
    }
    expect(samples.e5).toBeGreaterThan(samples.d5)
  })

  it('adds zero weight when rival id is unknown', () => {
    expect(rivalOpeningWeightBoost(undefined, 1, 'e5')).toBe(0)
    expect(rivalOpeningWeightBoost('unknown', 1, 'e5')).toBe(0)
    expect(rivalOpeningWeightBoost('edred', 1, 'c5')).toBeGreaterThan(0)
  })
})
