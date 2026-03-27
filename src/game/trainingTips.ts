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
    return 'Mentor Insight: several heavy slips — slow down: one candidate move, then scan for checks, captures, and threats before you commit.'
  }
  if (blunderCount >= 2 && moveCount > 22) {
    return 'Mentor Insight: late blunders hurt — in the endgame, ask “does my king march or my pieces infiltrate first?” before each push.'
  }
  if (sceneTendencies.flankPawnPushes >= 5) {
    return 'Mentor Insight: this game leaned on wing pawns — secure the center or a half-open file toward the enemy king before the next flank stab.'
  }
  if (sceneTendencies.earlyQueenMoves >= 2) {
    return 'Mentor Insight: the queen stirred too early — develop knights and bishops toward the center; she can enter with tempo later.'
  }
  if (sceneTendencies.repeatedChecksWithoutGain >= 3) {
    return 'Mentor Insight: checks without follow-through burned time — pair every check with a concrete threat or king march.'
  }
  if (lossStreakVsOpponent >= 2) {
    return 'Mentor Insight: back-to-back losses in this pairing — try a calmer opening next run; one extra development move often flips the story.'
  }
  if (mistakeCount >= 4) {
    return 'Mentor Insight: accuracy drifted — after each opponent move, list what changed: unsafe pieces, weak squares, and king exposure.'
  }
  return 'Mentor Insight: study the recap’s turning point — the next run, spend one extra tempo on king safety before launching.'
}
