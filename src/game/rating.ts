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

/* ─── Precision (engine-graded play quality) ─────────────────────────── */

/** Per-move credit toward the archive's precision grade. */
const QUALITY_CREDIT: Record<string, number> = {
  brilliant: 1,
  good: 1,
  ok: 0.78,
  inaccuracy: 0.45,
  mistake: 0.2,
  blunder: 0,
}

/** Below this many graded moves a game says nothing about skill. */
export const MIN_GRADED_MOVES_FOR_PRECISION = 8

/**
 * Precision 0–100 from the per-move quality stream (player moves only —
 * rival plies carry null and are skipped). Returns null when the game is
 * too short to grade, which also keeps two-move farm games from touching
 * the performance side of the ladder.
 */
export function accuracyFromQualities(
  qualities: ReadonlyArray<string | null | undefined>,
): number | null {
  let sum = 0
  let graded = 0
  for (const quality of qualities) {
    const credit = quality ? QUALITY_CREDIT[quality] : undefined
    if (credit === undefined) continue
    sum += credit
    graded++
  }
  if (graded < MIN_GRADED_MOVES_FOR_PRECISION) return null
  return Math.round((100 * sum) / graded)
}

/** Map precision to a quasi-score: ~55 plays like a loss, ~95 like a win. */
export function accuracyImpliedScore(accuracy: number): number {
  if (!Number.isFinite(accuracy)) return 0.5
  return Math.max(0, Math.min(1, (accuracy - 55) / 40))
}

/** Duel pressure-band offsets — single source of truth for UI and ladder. */
export const DUEL_DIFFICULTY_RATING_OFFSET: Record<'novice' | 'balanced' | 'relentless', number> = {
  novice: -130,
  balanced: 0,
  relentless: 170,
}

/**
 * Apply one rated result. Returns a fresh {@link LadderRating}; the input is
 * never mutated. `peak` only ever rises; `rated` always increments.
 *
 * Performance-informed: when `accuracy` is supplied (engine-graded
 * precision, 0–100), it carries 25% of the effective score — playing
 * precisely in a loss costs less, a blunder-strewn win earns less. The
 * outcome stays anchored: a win always gains at least a point, a loss
 * always costs at least one, so the ladder can never feel absurd.
 * Hostile inputs (NaN ratings, garbage accuracy) degrade safely.
 */
export function applyRatingResult(
  current: LadderRating,
  opponentRating: number,
  outcome: RatingOutcome,
  accuracy: number | null = null,
): LadderRating {
  const playerRating = clampRating(current.rating)
  const rated = Number.isFinite(current.rated) ? Math.max(0, Math.floor(current.rated)) : 0
  const opponent = Number.isFinite(opponentRating) ? opponentRating : playerRating
  const expected = expectedScore(playerRating, opponent)
  const score = outcomeScore(outcome)
  const effective =
    accuracy !== null && Number.isFinite(accuracy)
      ? 0.75 * score + 0.25 * accuracyImpliedScore(accuracy)
      : score
  let delta = kFactor(rated) * (effective - expected)
  if (!Number.isFinite(delta)) delta = 0
  if (outcome === 'win') delta = Math.max(1, delta)
  else if (outcome === 'loss') delta = Math.min(-1, delta)
  const rating = clampRating(playerRating + delta)
  return {
    rating,
    peak: Math.max(Number.isFinite(current.peak) ? current.peak : rating, rating),
    rated: rated + 1,
  }
}

/* ─── Form (improvement over recent games) ───────────────────────────── */

export interface FormTrend {
  /** Precision delta, recent three graded games vs the prior three. */
  delta: number | null
  label: 'rising' | 'steady' | 'settling' | 'unproven'
}

/** Recent-precision trend — the player's improvement made visible. */
export function accuracyTrend(history: ReadonlyArray<{ accuracy?: number }>): FormTrend {
  const values: number[] = []
  for (const entry of history) {
    if (typeof entry?.accuracy === 'number' && Number.isFinite(entry.accuracy)) {
      values.push(entry.accuracy)
    }
  }
  /* Need a full three-vs-three window; fewer is too noisy to label. */
  if (values.length < 6) return { delta: null, label: 'unproven' }
  const recent = values.slice(-3)
  const prior = values.slice(-6, -3)
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const delta = Math.round(avg(recent) - avg(prior))
  if (!Number.isFinite(delta)) return { delta: null, label: 'unproven' }
  return { delta, label: delta >= 3 ? 'rising' : delta <= -3 ? 'settling' : 'steady' }
}

/** "N in 100" — the ledger's price for the player against a rival. */
export function duelOddsLabel(playerRating: number, opponentRating: number): string {
  const p = expectedScore(clampRating(playerRating), clampRating(opponentRating))
  const odds = Math.max(2, Math.min(98, Math.round(p * 100)))
  return `${odds} in 100`
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
