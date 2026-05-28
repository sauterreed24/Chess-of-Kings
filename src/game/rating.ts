/**
 * Stratarch Rating — a deterministic, Elo-style ladder number that evolves
 * after every rated match / duel. Pure functions only (no randomness, no DOM,
 * no storage) so the progression is reproducible and unit-testable.
 *
 * Design:
 *   - The player starts at {@link BASE_RATING}.
 *   - Each rival has a rating derived from its AI profile strength
 *     ({@link opponentRatingFromProfile}) plus a per-mode difficulty offset,
 *     so a rival's published strength stays stable (it is NOT perturbed by the
 *     dynamic anti-tilt / momentum ramps applied at move-selection time).
 *   - After a result, the player's rating moves toward the expected score by a
 *     provisional-aware K-factor ({@link kFactor}).
 */
import type { AiProfile, LadderRating } from '../types'

export const BASE_RATING = 800
export const MIN_RATING = 100
export const MAX_RATING = 3000

export type RatingOutcome = 'win' | 'loss' | 'draw'

export function defaultLadderRating(): LadderRating {
  return { rating: BASE_RATING, peak: BASE_RATING, rated: 0 }
}

/** Logistic expected score for the player given the rating gap (FIDE 400-base). */
export function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400))
}

export function outcomeScore(outcome: RatingOutcome): number {
  return outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0
}

/** Provisional players move faster, then settle as they accumulate rated games. */
export function kFactor(ratedGames: number): number {
  if (ratedGames < 10) return 40
  if (ratedGames < 25) return 24
  return 16
}

export function clampRating(value: number): number {
  if (!Number.isFinite(value)) return BASE_RATING
  return Math.max(MIN_RATING, Math.min(MAX_RATING, Math.round(value)))
}

/**
 * Apply one rated result. Returns a fresh {@link LadderRating}; the input is
 * never mutated. `peak` only ever rises; `rated` always increments.
 */
export function applyRatingResult(
  current: LadderRating,
  opponentRating: number,
  outcome: RatingOutcome,
): LadderRating {
  const expected = expectedScore(current.rating, opponentRating)
  const delta = kFactor(current.rated) * (outcomeScore(outcome) - expected)
  const rating = clampRating(current.rating + delta)
  return {
    rating,
    peak: Math.max(current.peak, rating),
    rated: current.rated + 1,
  }
}

/**
 * Derive a stable rating for a rival from its base AI profile. Monotonic in the
 * strength signals (depth, tactical alertness, conversion strictness, opening
 * discipline) and decreasing in blunder rate. `offset` carries per-mode
 * difficulty adjustments (duel difficulty band, match depth ceiling).
 */
export function opponentRatingFromProfile(profile: AiProfile, offset = 0): number {
  const raw =
    380 +
    profile.searchDepth * 90 +
    profile.tacticalAlertness * 360 +
    profile.conversionStrictness * 230 +
    profile.openingDiscipline * 130 -
    profile.blunderRate * 520 +
    offset
  return clampRating(raw)
}

/** Signed, display-ready delta label (e.g. "+18", "0", "-9"). */
export function ratingDeltaLabel(delta: number): string {
  if (delta > 0) return `+${delta}`
  return `${delta}`
}
