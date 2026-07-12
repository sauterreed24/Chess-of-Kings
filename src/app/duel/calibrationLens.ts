/**
 * Calibration Lens — derives a 5-level adaptive-difficulty dial label
 * for a rival, given the player's recent history and rival memory.
 *
 * Surfaced in the duel dossier as a brass dial that visualizes how the
 * engine has adjusted around this player. The dial deliberately hides
 * raw numbers; players see one of:
 *
 *   Forgiving    -- after sustained losing streak (anti-tilt active)
 *   Measured     -- mild softening after a couple of recent losses
 *   Equilibrium  -- default, centered band
 *   Sharpened    -- after sustained wins (momentum hardening)
 *   Relentless   -- mastery-trial / boss ceiling
 *
 * Pure function: identical input -> identical output. Used by the
 * dossier renderer in mountApp; safe to call as often as needed.
 */
import type { MatchHistoryEntry, RivalMemoryEntry } from '../../types'
import { CALIBRATION_LENS_HINTS, CALIBRATION_LEVEL_LABELS } from '../../data/strings'

export type CalibrationLevel = keyof typeof CALIBRATION_LEVEL_LABELS

export interface CalibrationView {
  level: CalibrationLevel
  /** Display label from the shared strings table. */
  levelLabel: string
  /** 0 (forgiving) -> 1 (relentless), for the brass-dial fill. */
  dialPosition: number
  /** Short tooltip-friendly explanation. */
  hint: string
}

const LEVEL_ORDER: CalibrationLevel[] = ['Forgiving', 'Measured', 'Equilibrium', 'Sharpened', 'Relentless']

function viewFor(level: CalibrationLevel): CalibrationView {
  const idx = LEVEL_ORDER.indexOf(level)
  return {
    level,
    levelLabel: CALIBRATION_LEVEL_LABELS[level],
    dialPosition: idx / (LEVEL_ORDER.length - 1),
    hint: CALIBRATION_LENS_HINTS[level],
  }
}

export function deriveCalibrationLens(
  recentHistory: readonly MatchHistoryEntry[],
  rivalMem: RivalMemoryEntry | undefined,
  forced: 'novice' | 'balanced' | 'relentless' | null = null,
): CalibrationView {
  if (forced === 'novice') return viewFor('Forgiving')
  if (forced === 'relentless') return viewFor('Relentless')

  /* No history yet -- centered. */
  if (!recentHistory.length) return viewFor('Equilibrium')

  const last = recentHistory.slice(-12)
  const score = last.reduce((acc, h) => {
    if (h.outcome === 'win') return acc + 1
    if (h.outcome === 'draw') return acc + 0.5
    return acc - 1
  }, 0)
  const pressure = rivalMem ? rivalMem.losses - rivalMem.wins : 0
  const adjusted = score - pressure * 0.5

  let level: CalibrationLevel = 'Equilibrium'
  if (adjusted <= -3) level = 'Forgiving'
  else if (adjusted <= -1) level = 'Measured'
  else if (adjusted >= 4) level = 'Relentless'
  else if (adjusted >= 2) level = 'Sharpened'

  return viewFor(level)
}

/**
 * Anti-tilt curve helper used for the property test. Returns the
 * fractional softening factor applied to think-time / blunder-rate
 * after `lossStreak` consecutive losses. Bounded to [0, 0.25].
 *
 * The number is derived from gameFlow.tuneProfileForDuel /
 * tuneProfileForMatch's antiTiltRelief math; if those formulas change,
 * mirror the change here and adjust the test.
 */
export function antiTiltRelief(lossStreak: number): number {
  if (lossStreak < 2) return 0
  return Math.min(lossStreak >= 4 ? 0.22 : 0.18, lossStreak * 0.045)
}

/** Momentum hardening curve mirror, bounded to [0, ~0.18]. */
export function momentumHardening(winStreak: number): number {
  if (winStreak < 2) return 0
  /* Roughly 6 % per win past the second, cap at 18 %. */
  return Math.min(0.18, (winStreak - 1) * 0.06)
}
