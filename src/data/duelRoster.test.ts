import { describe, expect, it } from 'vitest'
import { AI_PROFILES } from '../chess/aiProfiles'
import { getBookTopLines } from '../chess/openings'
import { DUEL_ROSTER } from './duelRoster'

function variantProfile(opponentId: string, variantId: string): string {
  const rival = DUEL_ROSTER.find((entry) => entry.opponentId === opponentId)
  const variant = rival?.variants.find((entry) => entry.id === variantId)
  expect(variant, `${opponentId}/${variantId} exists`).toBeDefined()
  return variant!.profileId
}

describe('DUEL_ROSTER profile wiring', () => {
  it('points every duel variant at a known AI profile', () => {
    for (const rival of DUEL_ROSTER) {
      for (const variant of rival.variants) {
        expect(AI_PROFILES[variant.profileId], `${variant.id} profile ${variant.profileId}`).toBeDefined()
      }
    }
  })

  it('keeps every visible duel AI trait in the dossier range', () => {
    for (const rival of DUEL_ROSTER) {
      for (const variant of rival.variants) {
        const profile = AI_PROFILES[variant.profileId]
        const values = [profile.riskAppetite, profile.openingDiscipline, profile.kingSafetyUrgency]
        expect(values.every((value) => value >= 0 && value <= 1), `${rival.opponentId}/${variant.id}`).toBe(true)
      }
    }
  })

  it('keeps visible rival variants aligned with their authored AI identities', () => {
    expect(variantProfile('edred', 'edred-guard')).toBe('scholar_guard')
    expect(variantProfile('lukas', 'lukas-phalanx')).toBe('apprentice_court')
    expect(variantProfile('marius', 'marius-patience')).toBe('veteran_scholar')
    expect(variantProfile('rowan', 'rowan-gambit')).toBe('rowan_gambit')
    expect(variantProfile('vega', 'vega-italian')).toBe('vega_italian')
    expect(variantProfile('kallistos', 'kallistos-law')).toBe('kallistos_classical')
    expect(variantProfile('nysa', 'nysa-frontier')).toBe('nysa_frontier')
    expect(variantProfile('cassian', 'cassian-paradox')).toBe('cassian_paradox')
    expect(variantProfile('gage', 'gage-discipline')).toBe('gage_discipline')
    expect(variantProfile('helia', 'helia-machine')).toBe('helia_machine')
  })

  it('feeds the Duel Archive opening watchlist from the intended rival books', () => {
    const rowanLines = getBookTopLines(variantProfile('rowan', 'rowan-gambit'), 9)
    const vegaLines = getBookTopLines(variantProfile('vega', 'vega-italian'), 9)
    const nysaLines = getBookTopLines(variantProfile('nysa', 'nysa-frontier'), 9)
    const cassianLines = getBookTopLines(variantProfile('cassian', 'cassian-paradox'), 9)
    const gageLines = getBookTopLines(variantProfile('gage', 'gage-discipline'), 9)
    const heliaLines = getBookTopLines(variantProfile('helia', 'helia-machine'), 9)

    expect(rowanLines.map((line) => line.san)).toContain('exf4')
    expect(vegaLines.map((line) => line.san)).toContain('Nf6')
    expect(nysaLines.map((line) => line.san)).toContain('g6')
    expect(cassianLines.map((line) => line.san)).toContain('Nf6')
    expect(gageLines.map((line) => line.san)).toContain('d6')
    expect(heliaLines.map((line) => line.san)).toContain('e6')
    expect(rowanLines.map((line) => line.san).join(' ')).not.toBe(
      vegaLines.map((line) => line.san).join(' '),
    )
  })
})
