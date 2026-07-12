/**
 * Per-rival calibration rating (Elo-ish, 1200–2200).
 * Tracks how hard the archive judges this rival for you from outcomes.
 * Higher = the rival has been beating you more often recently.
 */
import { ARCHIVE_RATING_BAND_LABELS } from '../../data/strings'

export const DEFAULT_RIVAL_CALIBRATION = 1500
export const RIVAL_CALIBRATION_MIN = 1200
export const RIVAL_CALIBRATION_MAX = 2200

const K_FACTOR = 24
/** Fixed player anchor — we are not persisting a player Elo yet. */
const PLAYER_ANCHOR = 1500

export function expectedPlayerScore(playerRating: number, rivalRating: number): number {
  return 1 / (1 + 10 ** ((rivalRating - playerRating) / 400))
}

export function sanitizeRivalCalibrationRating(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_RIVAL_CALIBRATION
  return Math.round(Math.max(RIVAL_CALIBRATION_MIN, Math.min(RIVAL_CALIBRATION_MAX, raw)))
}

/**
 * Update rival calibration after a rated duel / ladder result.
 * Player wins pull the rival rating down; losses push it up.
 */
export function updateRivalCalibrationRating(
  current: number,
  outcome: 'win' | 'loss' | 'draw',
): number {
  const rating = sanitizeRivalCalibrationRating(current)
  const score = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0
  const expected = expectedPlayerScore(PLAYER_ANCHOR, rating)
  const next = rating + K_FACTOR * (expected - score)
  return sanitizeRivalCalibrationRating(next)
}

export function formatRivalCalibrationLabel(rating: number): string {
  const r = sanitizeRivalCalibrationRating(rating)
  if (r >= 1850) return ARCHIVE_RATING_BAND_LABELS.elite
  if (r >= 1700) return ARCHIVE_RATING_BAND_LABELS.courtMaster
  if (r >= 1580) return ARCHIVE_RATING_BAND_LABELS.seasoned
  if (r >= 1450) return ARCHIVE_RATING_BAND_LABELS.measured
  return ARCHIVE_RATING_BAND_LABELS.forgiving
}
