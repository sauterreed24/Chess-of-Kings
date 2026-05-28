import { describe, expect, it } from 'vitest'
import {
  applyRatingResult,
  BASE_RATING,
  clampRating,
  defaultLadderRating,
  expectedScore,
  kFactor,
  MAX_RATING,
  MIN_RATING,
  opponentRatingFromProfile,
  outcomeScore,
  ratingDeltaLabel,
} from './rating'
import { AI_PROFILES } from '../chess/aiProfiles'

describe('rating math', () => {
  it('starts every player at the base rating', () => {
    const d = defaultLadderRating()
    expect(d).toEqual({ rating: BASE_RATING, peak: BASE_RATING, rated: 0 })
  })

  it('expected score is 0.5 for equal ratings and monotonic in the gap', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5, 5)
    expect(expectedScore(1200, 1000)).toBeGreaterThan(0.5)
    expect(expectedScore(800, 1000)).toBeLessThan(0.5)
  })

  it('maps outcomes to standard scores', () => {
    expect(outcomeScore('win')).toBe(1)
    expect(outcomeScore('draw')).toBe(0.5)
    expect(outcomeScore('loss')).toBe(0)
  })

  it('uses a higher provisional K-factor that settles with experience', () => {
    expect(kFactor(0)).toBe(40)
    expect(kFactor(9)).toBe(40)
    expect(kFactor(10)).toBe(24)
    expect(kFactor(24)).toBe(24)
    expect(kFactor(25)).toBe(16)
    expect(kFactor(500)).toBe(16)
  })

  it('clamps ratings into the playable band and guards non-finite input', () => {
    expect(clampRating(50)).toBe(MIN_RATING)
    expect(clampRating(99999)).toBe(MAX_RATING)
    expect(clampRating(1234.6)).toBe(1235)
    expect(clampRating(Number.NaN)).toBe(BASE_RATING)
  })

  it('raises rating on a win and lowers it on a loss', () => {
    const start = defaultLadderRating()
    const afterWin = applyRatingResult(start, 800, 'win')
    const afterLoss = applyRatingResult(start, 800, 'loss')
    expect(afterWin.rating).toBeGreaterThan(start.rating)
    expect(afterLoss.rating).toBeLessThan(start.rating)
    expect(afterWin.rated).toBe(1)
    expect(afterLoss.rated).toBe(1)
  })

  it('rewards beating a stronger rival more than an equal one', () => {
    const start = defaultLadderRating()
    const vsEqual = applyRatingResult(start, 800, 'win')
    const vsStronger = applyRatingResult(start, 1200, 'win')
    expect(vsStronger.rating - start.rating).toBeGreaterThan(vsEqual.rating - start.rating)
  })

  it('never lowers peak and tracks the all-time high', () => {
    let r = defaultLadderRating()
    r = applyRatingResult(r, 1200, 'win')
    const peakAfterWin = r.peak
    r = applyRatingResult(r, 200, 'loss')
    expect(r.rating).toBeLessThan(peakAfterWin)
    expect(r.peak).toBe(peakAfterWin)
  })

  it('does not mutate the input rating', () => {
    const start = defaultLadderRating()
    const snapshot = { ...start }
    applyRatingResult(start, 1000, 'win')
    expect(start).toEqual(snapshot)
  })

  it('keeps results inside the clamp band even after extreme streaks', () => {
    let r = defaultLadderRating()
    for (let i = 0; i < 200; i++) r = applyRatingResult(r, MAX_RATING, 'win')
    expect(r.rating).toBeLessThanOrEqual(MAX_RATING)
    let low = defaultLadderRating()
    for (let i = 0; i < 200; i++) low = applyRatingResult(low, MIN_RATING, 'loss')
    expect(low.rating).toBeGreaterThanOrEqual(MIN_RATING)
  })

  it('derives a monotonic rival ladder from profile strength', () => {
    const novice = opponentRatingFromProfile(AI_PROFILES.novice_court!)
    const apprentice = opponentRatingFromProfile(AI_PROFILES.apprentice_court!)
    const veteran = opponentRatingFromProfile(AI_PROFILES.veteran_scholar!)
    const apex = opponentRatingFromProfile(AI_PROFILES.counterpart_apex!)
    expect(novice).toBeLessThan(apprentice)
    expect(apprentice).toBeLessThan(veteran)
    expect(veteran).toBeLessThan(apex)
    expect(novice).toBeGreaterThanOrEqual(MIN_RATING)
    expect(apex).toBeLessThanOrEqual(MAX_RATING)
  })

  it('applies the difficulty offset to opponent ratings', () => {
    const base = opponentRatingFromProfile(AI_PROFILES.alexion_mentor!)
    const harder = opponentRatingFromProfile(AI_PROFILES.alexion_mentor!, 170)
    const easier = opponentRatingFromProfile(AI_PROFILES.alexion_mentor!, -130)
    expect(harder).toBeGreaterThan(base)
    expect(easier).toBeLessThan(base)
  })

  it('formats signed delta labels', () => {
    expect(ratingDeltaLabel(18)).toBe('+18')
    expect(ratingDeltaLabel(0)).toBe('0')
    expect(ratingDeltaLabel(-9)).toBe('-9')
  })
})
