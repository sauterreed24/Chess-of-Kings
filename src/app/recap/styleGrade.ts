/**
 * Pure post-match recap helpers (style grade + turning-point line).
 *
 * These are the formatting rules used by `mountApp` to render the reward
 * overlay's "Signature Recap" card. They depend only on the SAN log and
 * the per-move quality stream emitted by `GameFlow.onChessUpdate`, so we
 * extract them as pure functions for unit testing and re-use.
 *
 * Inputs:  a structural payload `{ sanLog, sanQuality }` (a subset of
 *          {@link import('../gameFlow').ChessUiPayload}).
 * Outputs: a single-letter style grade and a short SAN-positioned line.
 *
 * Invariants:
 * - Pure: same input -> same output, no side effects, no DOM access.
 * - Stable scoring: brilliant +3, good +2, ok +1, inaccuracy -1,
 *   mistake -2, blunder -3; thresholds 16/10/5/1 -> S/A/B/C; default D.
 * - Turning point prefers the first 'brilliant' move, then the first
 *   'good' move, then the final move played; falls back to '...' SAN
 *   when the log is empty.
 */
import type { MoveQuality } from '../gameFlow'

export type StyleGrade = 'S' | 'A' | 'B' | 'C' | 'D'

interface RecapPayload {
  sanLog: string[]
  sanQuality: MoveQuality[]
}

const QUALITY_SCORE: Record<NonNullable<MoveQuality>, number> = {
  brilliant: 3,
  good: 2,
  ok: 1,
  inaccuracy: -1,
  mistake: -2,
  blunder: -3,
}

export function styleGradeFromPayload(p: RecapPayload): StyleGrade {
  let score = 0
  for (const q of p.sanQuality) {
    if (!q) continue
    score += QUALITY_SCORE[q] ?? 0
  }
  if (score >= 16) return 'S'
  if (score >= 10) return 'A'
  if (score >= 5) return 'B'
  if (score >= 1) return 'C'
  return 'D'
}

export function turningPointLine(p: RecapPayload): string {
  let idx = p.sanQuality.findIndex((q) => q === 'brilliant')
  if (idx < 0) idx = p.sanQuality.findIndex((q) => q === 'good')
  if (idx < 0) idx = Math.max(0, p.sanLog.length - 1)
  const san = p.sanLog[idx] ?? '...'
  const moveNo = Math.floor(idx / 2) + 1
  const dot = idx % 2 === 0 ? '.' : '...'
  return `${moveNo}${dot} ${san}`
}
