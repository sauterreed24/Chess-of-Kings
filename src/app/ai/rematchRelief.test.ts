import { describe, expect, it } from 'vitest'
import { AI_PROFILES } from '../../chess/aiProfiles'
import {
  RELIEF_MAX_BLUNDER,
  applyRematchRelief,
  rematchRelief,
  rematchReliefNote,
  reliefLossStreak,
} from './rematchRelief'

describe('rematch relief', () => {
  it('leaves the first meeting exactly as authored', () => {
    for (const profile of Object.values(AI_PROFILES)) {
      expect(applyRematchRelief(profile, rematchRelief(0))).toBe(profile)
    }
    expect(rematchReliefNote(rematchRelief(0), true)).toBeNull()
  })

  it('never makes a rival stronger and eases monotonically with the loss streak', () => {
    for (const profile of Object.values(AI_PROFILES)) {
      let prev = profile
      for (let streak = 1; streak <= 8; streak++) {
        const eased = applyRematchRelief(profile, rematchRelief(streak))
        expect(eased.searchDepth).toBeLessThanOrEqual(prev.searchDepth)
        expect(eased.thinkTimeMs).toBeLessThanOrEqual(prev.thinkTimeMs)
        expect(eased.blunderRate).toBeGreaterThanOrEqual(prev.blunderRate)
        expect(eased.conversionStrictness).toBeLessThanOrEqual(prev.conversionStrictness)
        expect(eased.tacticalAlertness).toBeLessThanOrEqual(prev.tacticalAlertness)
        prev = eased
      }
    }
  })

  it('stays a bounded persona: depth >= 2, sane budgets, never random-move territory', () => {
    for (const profile of Object.values(AI_PROFILES)) {
      for (let streak = 0; streak <= 20; streak++) {
        const eased = applyRematchRelief(profile, rematchRelief(streak))
        expect(eased.searchDepth).toBeGreaterThanOrEqual(2)
        expect(eased.thinkTimeMs).toBeGreaterThanOrEqual(260)
        expect(eased.blunderRate).toBeLessThanOrEqual(Math.max(profile.blunderRate, RELIEF_MAX_BLUNDER))
      }
    }
  })

  it('drops apex rivals out of best-move mode after one loss', () => {
    const eased = applyRematchRelief(AI_PROFILES.counterpart_apex!, rematchRelief(1))
    expect(eased.conversionStrictness).toBeLessThan(0.95)
  })

  it('every step changes something real for every rival, even on the depth floor', () => {
    for (const profile of Object.values(AI_PROFILES)) {
      const eased = applyRematchRelief(profile, rematchRelief(1))
      expect(eased.blunderRate).toBeGreaterThan(profile.blunderRate)
    }
  })

  it('names the step and what changed', () => {
    expect(rematchReliefNote(rematchRelief(1), true)).toBe('rematch relief I: calculates shallower')
    expect(rematchReliefNote(rematchRelief(2), false)).toBe('rematch relief II: plays looser')
    expect(rematchReliefNote(rematchRelief(9), true)).toMatch(/rematch relief III\b/)
  })

  it('counts consecutive losses; draws neither add nor clear; a win clears', () => {
    expect(reliefLossStreak([])).toBe(0)
    expect(reliefLossStreak(['loss', 'loss'])).toBe(2)
    expect(reliefLossStreak(['loss', 'draw', 'loss'])).toBe(2)
    expect(reliefLossStreak(['loss', 'loss', 'draw'])).toBe(2)
    expect(reliefLossStreak(['loss', 'win', 'loss'])).toBe(1)
    expect(reliefLossStreak(['loss', 'loss', 'win'])).toBe(0)
  })
})
