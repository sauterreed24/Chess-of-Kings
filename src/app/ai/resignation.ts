/**
 * Rival resignation. Matches have no move cap, so a player who is winning
 * but cannot yet deliver mate used to be stuck until they pressed Reset.
 * A hopeless rival now resigns, as a real player would, but only in an
 * endgame (≤ 8 pieces besides kings), only when it has been at least a
 * queen's worth of material down on each of its last three turns, and only
 * when a fixed-size confirming search agrees it is ≥ 9 pawns lost (so a
 * rival with a mating attack or a perpetual fights on). In the middlegame a
 * rival fights on — a dropped queen is not the end against a beginner.
 *
 * Everything here is device-independent: material comes from the recorded
 * positions and the confirming search is a node budget with no wall clock.
 */
export const RESIGN_EVAL_CP = 900
export const RESIGN_MATERIAL_CP = 900
export const RESIGN_STREAK = 3
export const RESIGN_MAX_PIECES = 8
/** Node budget of the confirming search (only run when every cheap leg holds). */
export const RESIGN_CONFIRM_NODES = 4000

const PIECE_CP: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900 }

export type ResignationInput = {
  /** Rival material minus player material (cp, kings excluded) in positions with the rival to move, oldest first. */
  rivalToMoveMaterial: readonly number[]
  /** Pieces on the board besides the two kings, now. */
  piecesExcludingKings: number
  /** Confirming search score, rival POV (cp). Pass -Infinity to test only the cheap legs. */
  confirmEvalCp: number
}

export function rivalShouldResign(input: ResignationInput): boolean {
  if (input.piecesExcludingKings > RESIGN_MAX_PIECES) return false
  const recent = input.rivalToMoveMaterial.slice(-RESIGN_STREAK)
  if (recent.length < RESIGN_STREAK) return false
  if (!recent.every((cp) => cp <= -RESIGN_MATERIAL_CP)) return false
  return input.confirmEvalCp <= -RESIGN_EVAL_CP
}

/** Material balance for `side` (its material minus the other side's), kings excluded. */
export function materialBalanceFromFen(fen: string, side: 'w' | 'b'): number {
  let balance = 0
  for (const ch of fen.split(' ')[0] ?? '') {
    const value = PIECE_CP[ch.toLowerCase()]
    if (value === undefined) continue
    const white = ch === ch.toUpperCase()
    balance += (white === (side === 'w') ? 1 : -1) * value
  }
  return balance
}

export function piecesFromFen(fen: string): number {
  let n = 0
  for (const ch of fen.split(' ')[0] ?? '') if (PIECE_CP[ch.toLowerCase()] !== undefined) n++
  return n
}
