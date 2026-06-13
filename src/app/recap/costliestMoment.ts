/**
 * Post-game coaching: the single move that cost the player the most.
 *
 * `evalTrace[k]` is the White-positive engine evaluation after ply `k`
 * (1:1 with `sanLog`). The player's costliest move is the one of *their
 * own* plies where their evaluation fell the most — already accounting
 * for the opponent's best reply, because the trace comes from engine
 * probes. Pure and deterministic; the better-move suggestion is computed
 * separately by the caller (it needs an engine search).
 */

export interface CostliestMoment {
  /** Index in `sanLog` of the player's costliest move. */
  ply: number
  /** SAN of the move actually played. */
  san: string
  /** Centipawns lost on that move, player's perspective (positive). */
  dropCp: number
}

/**
 * Find the player's worst move, or `null` when no move cost at least
 * `minDropCp` (a clean game — nothing worth scolding). Defensive against
 * mismatched / empty inputs.
 */
export function findCostliestMoment(
  sanLog: readonly string[],
  evalTrace: readonly number[],
  playerColor: 'w' | 'b',
  minDropCp = 120,
): CostliestMoment | null {
  if (sanLog.length === 0 || evalTrace.length !== sanLog.length) return null
  const sign = playerColor === 'w' ? 1 : -1
  const playerMovesOnEven = playerColor === 'w' /* ply 0 is White's first move */
  let best: CostliestMoment | null = null
  for (let i = 0; i < sanLog.length; i++) {
    if ((i % 2 === 0) !== playerMovesOnEven) continue
    const before = (i === 0 ? 0 : evalTrace[i - 1]!) * sign
    const after = evalTrace[i]! * sign
    if (!Number.isFinite(before) || !Number.isFinite(after)) continue
    const drop = before - after
    if (drop >= minDropCp && (best === null || drop > best.dropCp)) {
      best = { ply: i, san: sanLog[i]!, dropCp: Math.round(drop) }
    }
  }
  return best
}

/** Move-number label for a ply index, e.g. 8 -> "5... " for Black's 4th move. */
export function plyMoveLabel(ply: number): string {
  const moveNo = Math.floor(ply / 2) + 1
  return ply % 2 === 0 ? `${moveNo}.` : `${moveNo}...`
}
