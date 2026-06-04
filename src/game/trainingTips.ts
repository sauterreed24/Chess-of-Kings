import type { PlayerTendencyProfile } from '../types'

/**
 * Deterministic, data-driven copy for the mentor rail — easy to extend with new
 * heuristics or A/B variants without touching `GameFlow` internals.
 */
export type LossTipInput = {
  lossStreakVsOpponent: number
  sceneTendencies: PlayerTendencyProfile
  blunderCount: number
  mistakeCount: number
  moveCount: number
}

export function lossRecoveryMentorLine(input: LossTipInput): string {
  const { lossStreakVsOpponent, sceneTendencies, blunderCount, mistakeCount, moveCount } = input

  if (blunderCount >= 4) {
    return 'Mentor Insight: repeated collapses, same invoice. Audit checks, captures, and loose defenders before the hand moves.'
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return 'Mentor Insight: late endgames need a leader. Name whether king, piece, or pawn carries the next move.'
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: the wings outran the center. Seal one central square or file before another edge thrust.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen entered before the court was ready. Let knights and bishops build her threat first.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: checks became noise. Give the next one only if it wins mate, material, or tempo.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: this rival has learned your cadence. Open quieter, finish development, then ask them to overreach.'
  }
  if (mistakeCount >= 4) {
    return 'Mentor Insight: accuracy leaked by degrees. After each reply, name the loose piece, weak square, and king question.'
  }
  return 'Mentor Insight: the ledger already names the hinge. In the next run, buy one quiet tempo for king safety.'
}
