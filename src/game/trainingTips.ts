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
    return `Mentor Insight: the archive marked ${blunderCount} blunders. Slow the hand: checks, captures, loose defenders, then move.`
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return `Mentor Insight: the endgame frayed after ${moveCount} ply. Choose the carrier: king, piece, or passed pawn before you calculate.`
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: the wing pawns ran ahead of the center. Claim one central square or open file before another edge push.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen came out before the court was formed. Develop two minor pieces, then let her threat matter.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: the checks became noise. Give the next one only if it wins mate, material, or tempo.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: this rival knows your rhythm now. Open quieter, finish development, then let their impatience appear.'
  }
  if (mistakeCount >= 4) {
    return `Mentor Insight: ${mistakeCount} mistakes came by degrees. After each reply, name the loose piece, weak square, and king question.`
  }
  return 'Mentor Insight: the ledger found the hinge. In the rematch, buy one quiet tempo for king safety before ambition.'
}
