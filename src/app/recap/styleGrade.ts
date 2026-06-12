/**
 * Pure post-match recap helpers (style grade + turning-point line).
 *
 * These are the formatting rules used by `mountApp` to render the reward
 * overlay's "Signature Recap" card. They depend only on the SAN log, the
 * per-move quality stream, and (when present) the per-ply engine eval
 * trace emitted by `GameFlow.onChessUpdate`, so we extract them as pure
 * functions for unit testing and re-use.
 *
 * Inputs:  a structural payload `{ sanLog, sanQuality, evalTrace?,
 *          playerColor? }` (a subset of
 *          {@link import('../gameFlow').ChessUiPayload}).
 * Outputs: a single-letter style grade and a short SAN-positioned line.
 *
 * Invariants:
 * - Pure: same input -> same output, no side effects, no DOM access.
 * - Grade is the AVERAGE quality of graded moves (length-independent):
 *   brilliant +3, good +2, ok +1, inaccuracy -1, mistake -2, blunder -3;
 *   average >= 2.4/1.6/0.9/0 -> S/A/B/C; default D. (Sum-based scoring
 *   inflated long games once grading became engine-truthful.)
 * - Turning point prefers the largest eval swing toward the player when
 *   a trace aligned with the SAN log is available (>= 60cp to qualify);
 *   otherwise the first 'brilliant', then the first 'good', then the
 *   final move played; falls back to '...' SAN when the log is empty.
 */
import type { MoveQuality } from '../gameFlow'

export type StyleGrade = 'S' | 'A' | 'B' | 'C' | 'D'

interface RecapPayload {
  sanLog: string[]
  sanQuality: MoveQuality[]
  /** White-positive engine eval after each ply (optional, session-only). */
  evalTrace?: number[]
  playerColor?: 'w' | 'b'
}

const QUALITY_SCORE: Record<NonNullable<MoveQuality>, number> = {
  brilliant: 3,
  good: 2,
  ok: 1,
  inaccuracy: -1,
  mistake: -2,
  blunder: -3,
}

/** Minimum eval swing (cp) for a ply to qualify as the turning point. */
const TURNING_POINT_SWING_CP = 60

export function styleGradeFromPayload(p: RecapPayload): StyleGrade {
  let score = 0
  let graded = 0
  for (const q of p.sanQuality) {
    if (!q) continue
    score += QUALITY_SCORE[q] ?? 0
    graded++
  }
  if (graded === 0) return 'D'
  const average = score / graded
  if (average >= 2.4) return 'S'
  if (average >= 1.6) return 'A'
  if (average >= 0.9) return 'B'
  if (average >= 0) return 'C'
  return 'D'
}

function formatSanAt(p: RecapPayload, idx: number): string {
  const san = p.sanLog[idx] ?? '...'
  const moveNo = Math.floor(idx / 2) + 1
  const dot = idx % 2 === 0 ? '.' : '...'
  return `${moveNo}${dot} ${san}`
}

/**
 * The ply where the game actually turned: the largest single-ply eval
 * swing toward the player (their punch or the rival's stumble).
 */
function largestSwingIndex(p: RecapPayload): number {
  const trace = p.evalTrace
  if (!trace || trace.length !== p.sanLog.length || trace.length === 0) return -1
  const sign = p.playerColor === 'b' ? -1 : 1
  let bestIdx = -1
  let bestSwing = TURNING_POINT_SWING_CP
  for (let i = 0; i < trace.length; i++) {
    const previous = i === 0 ? 0 : trace[i - 1]!
    const swing = sign * (trace[i]! - previous)
    if (swing >= bestSwing) {
      bestSwing = swing
      bestIdx = i
    }
  }
  return bestIdx
}

export function turningPointLine(p: RecapPayload): string {
  const swingIdx = largestSwingIndex(p)
  if (swingIdx >= 0) return formatSanAt(p, swingIdx)
  let idx = p.sanQuality.findIndex((q) => q === 'brilliant')
  if (idx < 0) idx = p.sanQuality.findIndex((q) => q === 'good')
  if (idx < 0) idx = Math.max(0, p.sanLog.length - 1)
  return formatSanAt(p, idx)
}
