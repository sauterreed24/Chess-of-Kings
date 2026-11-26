/**
 * Rival resignation. Matches have no move cap, so a player who is winning
 * but cannot yet deliver mate used to be stuck until they pressed Reset.
 * A hopeless rival now resigns, as a real player would, but only in an
 * endgame (≤ 8 pieces besides kings): it must be at least a queen's worth
 * of material down AND the game's own evaluation must have had it lost
 * (≥ 9 pawns behind) on each of its last three turns. In the middlegame a
 * rival fights on — a dropped queen is not the end against a beginner — and
 * a rival with counterplay (a mating attack, a perpetual) never meets the
 * eval leg.
 */
export const RESIGN_EVAL_CP = 900
export const RESIGN_MATERIAL_CP = 900
export const RESIGN_STREAK = 3
export const RESIGN_MAX_PIECES = 8

export type ResignationInput = {
  /** Rival-POV evals (centipawns) of positions with the rival to move, oldest first. */
  rivalToMoveEvals: readonly number[]
  /** Rival material minus player material, excluding kings (centipawns). */
  materialBalanceCp: number
  /** Pieces on the board besides the two kings. */
  piecesExcludingKings: number
}

export function rivalShouldResign(input: ResignationInput): boolean {
  if (input.piecesExcludingKings > RESIGN_MAX_PIECES) return false
  if (input.materialBalanceCp > -RESIGN_MATERIAL_CP) return false
  const recent = input.rivalToMoveEvals.slice(-RESIGN_STREAK)
  if (recent.length < RESIGN_STREAK) return false
  return recent.every((cp) => cp <= -RESIGN_EVAL_CP)
}
