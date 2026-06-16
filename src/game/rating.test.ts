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

describe('precision (engine-graded accuracy)', () => {
  it('returns null for games too short to grade', async () => {
    const { accuracyFromQualities } = await import('./rating')
    expect(accuracyFromQualities([])).toBeNull()
    expect(accuracyFromQualities(['good', 'good', null, 'ok'])).toBeNull()
  })

  it('skips rival plies (null) and unknown values, grades the rest', async () => {
    const { accuracyFromQualities } = await import('./rating')
    const allGood = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 'good' : null))
    expect(accuracyFromQualities(allGood)).toBe(100)
    const allBlunder = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 'blunder' : null))
    expect(accuracyFromQualities(allBlunder)).toBe(0)
    const withGarbage = [...Array.from({ length: 8 }, () => 'ok' as const), 'nonsense', undefined]
    const graded = accuracyFromQualities(withGarbage)
    expect(graded).toBe(78)
  })
})

describe('performance-informed ladder', () => {
  it('matches the legacy formula exactly when no accuracy is supplied', () => {
    const before = { rating: 1000, peak: 1000, rated: 12 }
    const legacyDelta = kFactor(12) * (1 - expectedScore(1000, 1100))
    const after = applyRatingResult(before, 1100, 'win')
    expect(after.rating).toBe(clampRating(1000 + legacyDelta))
  })

  it('a precise loss costs less; a sloppy win earns less — outcomes stay anchored', () => {
    const ladder = { rating: 1000, peak: 1000, rated: 30 }
    const preciseLoss = applyRatingResult(ladder, 1300, 'loss', 92)
    const sloppyLoss = applyRatingResult(ladder, 1300, 'loss', 40)
    expect(preciseLoss.rating).toBeGreaterThan(sloppyLoss.rating)
    expect(preciseLoss.rating).toBeLessThan(ladder.rating) /* a loss always costs */

    const preciseWin = applyRatingResult(ladder, 700, 'win', 95)
    const sloppyWin = applyRatingResult(ladder, 700, 'win', 45)
    expect(preciseWin.rating).toBeGreaterThanOrEqual(sloppyWin.rating)
    expect(sloppyWin.rating).toBeGreaterThan(ladder.rating) /* a win always gains */
  })

  it('rating delta is monotonic in accuracy', () => {
    const ladder = { rating: 1100, peak: 1100, rated: 30 }
    let previous = -Infinity
    for (let accuracy = 0; accuracy <= 100; accuracy += 5) {
      const next = applyRatingResult(ladder, 1100, 'draw', accuracy).rating
      expect(next).toBeGreaterThanOrEqual(previous)
      previous = next
    }
  })

  it('never produces a non-finite or out-of-range rating, for any hostile input', () => {
    const hostile = [NaN, Infinity, -Infinity, -5000, 0, 99999, 1200.7]
    const outcomes = ['win', 'loss', 'draw'] as const
    for (const rating of hostile) {
      for (const peak of hostile) {
        for (const rated of [-3, NaN, 0, 11, 400]) {
          for (const opp of hostile) {
            for (const outcome of outcomes) {
              for (const accuracy of [null, NaN, -50, 0, 64, 100, 1e9]) {
                const out = applyRatingResult({ rating, peak, rated }, opp, outcome, accuracy)
                expect(Number.isFinite(out.rating)).toBe(true)
                expect(out.rating).toBeGreaterThanOrEqual(MIN_RATING)
                expect(out.rating).toBeLessThanOrEqual(MAX_RATING)
                expect(out.peak).toBeGreaterThanOrEqual(out.rating)
                expect(out.rated).toBeGreaterThanOrEqual(1)
              }
            }
          }
        }
      }
    }
  })

  it('every shipped rival profile prices to a finite, ordered rating', () => {
    for (const profile of Object.values(AI_PROFILES)) {
      const rating = opponentRatingFromProfile(profile)
      expect(Number.isFinite(rating)).toBe(true)
      expect(rating).toBeGreaterThanOrEqual(MIN_RATING)
      expect(rating).toBeLessThanOrEqual(MAX_RATING)
    }
    expect(opponentRatingFromProfile(AI_PROFILES.novice_court!)).toBeLessThan(
      opponentRatingFromProfile(AI_PROFILES.counterpart_apex!),
    )
  })
})

describe('form trend and odds', () => {
  it('reports unproven until enough graded games exist', async () => {
    const { accuracyTrend } = await import('./rating')
    expect(accuracyTrend([]).label).toBe('unproven')
    expect(accuracyTrend([{ accuracy: 70 }, {}, { accuracy: NaN }]).label).toBe('unproven')
    /* Needs a full three-vs-three window: 4 and 5 samples are still unproven. */
    expect(accuracyTrend([60, 70, 80, 90].map((a) => ({ accuracy: a }))).label).toBe('unproven')
    expect(accuracyTrend([60, 70, 80, 90, 95].map((a) => ({ accuracy: a }))).label).toBe('unproven')
    expect(accuracyTrend([60, 70, 80, 90, 95, 99].map((a) => ({ accuracy: a }))).label).not.toBe(
      'unproven',
    )
  })

  it('detects rising and settling form from recent precision', async () => {
    const { accuracyTrend } = await import('./rating')
    const rising = accuracyTrend([60, 62, 61, 70, 74, 72].map((a) => ({ accuracy: a })))
    expect(rising.label).toBe('rising')
    expect(rising.delta).toBeGreaterThan(0)
    const settling = accuracyTrend([80, 78, 82, 66, 64, 70].map((a) => ({ accuracy: a })))
    expect(settling.label).toBe('settling')
    const steady = accuracyTrend([70, 71, 70, 71, 70, 71].map((a) => ({ accuracy: a })))
    expect(steady.label).toBe('steady')
  })

  it('duel odds stay within 2–98 in 100 and survive hostile ratings', async () => {
    const { duelOddsLabel } = await import('./rating')
    expect(duelOddsLabel(800, 2400)).toBe('2 in 100')
    expect(duelOddsLabel(2400, 800)).toBe('98 in 100')
    expect(duelOddsLabel(1000, 1000)).toBe('50 in 100')
    expect(duelOddsLabel(NaN, Infinity)).toMatch(/^\d+ in 100$/)
  })
})
