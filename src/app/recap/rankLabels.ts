/**
 * Rank-points -> rank label mapping shown in the reward overlay.
 *
 * Two pure functions:
 * - {@link rankLabel} returns the player's current rank for a given RP total.
 * - {@link nextRankThreshold} returns the (floor, next, nextLabel) trio used
 *   to draw the progress bar to the next rank.
 *
 * Bands (RP):
 *   [0, 140)    Initiate              -> next Apprentice Analyst @ 140
 *   [140, 280)  Apprentice Analyst    -> next Senior Scholar @ 280
 *   [280, 450)  Senior Scholar        -> next Court Strategos @ 450
 *   [450, 650)  Court Strategos       -> next Archive Grandmaster @ 650
 *   [650, +inf) Archive Grandmaster   -> next Legendary Archivist @ 900
 *
 * Invariants: pure, deterministic, no DOM/IO, total over the real numbers.
 */

export type RankLabel =
  | 'Initiate'
  | 'Apprentice Analyst'
  | 'Senior Scholar'
  | 'Court Strategos'
  | 'Archive Grandmaster'

export interface NextRankThreshold {
  /** RP value at which the player entered their current rank band. */
  currentFloor: number
  /** RP value required to reach the next rank band. */
  next: number
  /** Display label for the next rank. */
  nextLabel: string
}

export function rankLabel(points: number): RankLabel {
  if (points >= 650) return 'Archive Grandmaster'
  if (points >= 450) return 'Court Strategos'
  if (points >= 280) return 'Senior Scholar'
  if (points >= 140) return 'Apprentice Analyst'
  return 'Initiate'
}

export function nextRankThreshold(points: number): NextRankThreshold {
  if (points < 140) return { currentFloor: 0, next: 140, nextLabel: 'Apprentice Analyst' }
  if (points < 280) return { currentFloor: 140, next: 280, nextLabel: 'Senior Scholar' }
  if (points < 450) return { currentFloor: 280, next: 450, nextLabel: 'Court Strategos' }
  if (points < 650) return { currentFloor: 450, next: 650, nextLabel: 'Archive Grandmaster' }
  return { currentFloor: 650, next: 900, nextLabel: 'Legendary Archivist' }
}
