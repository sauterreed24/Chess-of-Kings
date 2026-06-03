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
    return 'Mentor Insight: the ledger shows repeated collapses - count checks, captures, loose defenders, then move.'
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return 'Mentor Insight: the endgame cracked late - choose whether the king, pieces, or pawns lead before each push.'
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: the wings moved before the center held - claim a square or half-open file before another edge thrust.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen went public too soon - let knights and bishops make her entrance a threat, not an invitation.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: checks became announcements, not plans - attach each one to mate, material, or a won tempo.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: this rival has your rhythm - begin quieter, finish development, and make them prove the attack.'
  }
  if (mistakeCount >= 4) {
    return 'Mentor Insight: accuracy thinned by degrees - after each reply, name the loose piece, weak square, and king question.'
  }
  return 'Mentor Insight: the turning point is in the ledger - next run, add one quiet tempo for king safety before the charge.'
}
