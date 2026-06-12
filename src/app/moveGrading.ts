/**
 * Engine-truthful move grading.
 *
 * Both evaluations bracket exactly one move and come from a (shallow)
 * engine search, so the score after the move already accounts for the
 * opponent's best reply. Consequences:
 *  - a capture that loses the queen to the recapture grades as the
 *    blunder it is (static counting used to call it "brilliant");
 *  - a sound sacrifice — material offered while the engine still
 *    approves — finally earns 'brilliant' instead of 'blunder'.
 *
 * All scores are centipawns from the mover's perspective.
 */
import type { MoveQuality } from './gameFlow'

export interface MoveGradeInput {
  /** Engine eval of the position before the move, mover's perspective. */
  povBefore: number
  /** Engine eval after the move (opponent to play), mover's perspective. */
  povAfter: number
  /**
   * Material the move leaves en prise for the opponent (net static gain
   * of their best capture), 0 when nothing hangs. Used for the
   * sacrifice → 'brilliant' upgrade.
   */
  offeredGain: number
}

/** Still clearly winning after the move: soften harsh labels. */
const WINNING_MERCY_CP = 350
/** Material offer large enough to read as a real sacrifice. */
const SACRIFICE_GAIN_CP = 150
/** No 'brilliant' once the game is already decided. */
const BRILLIANT_CEILING_CP = 500

export function gradeMoveByEval(input: MoveGradeInput): NonNullable<MoveQuality> {
  const loss = Math.max(0, input.povBefore - input.povAfter)
  let quality: NonNullable<MoveQuality>
  if (loss <= 10) quality = 'good'
  else if (loss <= 40) quality = 'ok'
  else if (loss <= 90) quality = 'inaccuracy'
  else if (loss <= 200) quality = 'mistake'
  else quality = 'blunder'

  /* Mercy rule: when the position stays completely winning, a sloppy
     move is an inaccuracy, not a demoralizing "blunder". */
  if ((quality === 'mistake' || quality === 'blunder') && input.povAfter >= WINNING_MERCY_CP) {
    quality = 'inaccuracy'
  }

  /* Sound sacrifice: near-best by the engine while offering real
     material — the move static grading used to punish hardest. */
  if (
    quality === 'good' &&
    input.offeredGain >= SACRIFICE_GAIN_CP &&
    input.povBefore < BRILLIANT_CEILING_CP
  ) {
    quality = 'brilliant'
  }
  return quality
}
