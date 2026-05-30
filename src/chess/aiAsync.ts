import type { Chess, Move } from 'chess.js'
import { findBestMove } from './ai'
import type { AIStyle } from './evaluate'

export type AiSearchSurface = 'main' | 'worker'

/**
 * Non-breaking async entry: defaults to main-thread search.
 * Worker path is reserved for a future opt-in (no Worker bundle in hot path yet).
 */
export async function findBestMoveAsync(
  chess: Chess,
  maxDepth: number,
  style: AIStyle,
  timeLimitMs = 2000,
  surface: AiSearchSurface = 'main',
): Promise<Move | null> {
  if (surface === 'worker' && typeof Worker !== 'undefined') {
    // First-cut adapter: fall back until a dedicated worker bundle ships.
    return findBestMove(chess, maxDepth, style, timeLimitMs)
  }
  return findBestMove(chess, maxDepth, style, timeLimitMs)
}

export function preferredAiSearchSurface(): AiSearchSurface {
  return 'main'
}
