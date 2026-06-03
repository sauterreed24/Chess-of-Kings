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
    return 'Mentor Insight: several heavy slips - use the Alexandrine three-count before you move: checks, captures, then loose back-rank defenders.'
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return 'Mentor Insight: late blunders hurt - in the endgame, ask whether your king marches first or your pieces infiltrate first before each pawn push.'
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: this game leaned on wing pawns - secure the center or a half-open file before the next flank stab.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen stirred too early - develop knights and bishops toward the center first; she should enter with tempo, not ask for it.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: checks without follow-through burned time - pair every check with a concrete threat, a won tempo, or a king march.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: back-to-back losses in this pairing - try a calmer opening next run; one extra development move often changes the whole trial.'
  }
  if (mistakeCount >= 4) {
    return 'Mentor Insight: accuracy drifted - after each opponent move, list what changed: unsafe pieces, weak squares, and king exposure.'
  }
  return 'Mentor Insight: study the recap\'s turning point - next run, spend one extra tempo on king safety before launching.'
}
