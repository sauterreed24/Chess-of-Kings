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
    return `Mentor Insight: ${blunderCount} blunders decided the file. Before moving, name checks, captures, and the loose defender.`
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return `Mentor Insight: the endgame frayed after ${moveCount} ply. Choose one proof: king march, active piece, or passed pawn.`
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: the wings outran the center. Claim d/e control or open a file before another edge pawn.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen arrived before the court. Develop two minors, then make her threat earn time.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: checks became noise. Give one only for mate, material, or a saved tempo.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: this rival has your rhythm. Begin quieter, finish development, then make them overreach.'
  }
  if (mistakeCount >= 4) {
    return `Mentor Insight: ${mistakeCount} mistakes came by degrees. After each reply, name the loose piece, weak square, king risk.`
  }
  return 'Mentor Insight: the ledger found the hinge. In the rematch, buy one quiet tempo for king safety.'
}
