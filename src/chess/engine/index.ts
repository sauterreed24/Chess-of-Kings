/* ─── Crown Engine v2 — public facade ─────────────────────────────────────
   The only module the rest of the app should import from `engine/`.

   Boundary contract: positions enter as FEN strings (produced by chess.js)
   and moves leave as { from, to, promotion } coordinates that callers MUST
   replay through chess.js before mutating game state. chess.js stays the
   legality oracle; the engine is a scoring/search accelerator.
   ────────────────────────────────────────────────────────────────────────── */

import { Position, moveFrom, moveTo, movePromotion, squareName } from './position'
import { MATE, MATE_BOUND, clearTranspositionTable, search } from './search'
import type { SearchLimits } from './search'
import { evaluate } from './evaluate'

export { MATE, MATE_BOUND, clearTranspositionTable }
export { perftFen } from './perft'

export interface EngineMove {
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
  uci: string
}

export interface EngineRootMove extends EngineMove {
  /** Centipawns from the mover's perspective; ±(MATE − n) encodes mate in n plies. */
  score: number
}

export interface EngineSearchResult {
  move: EngineMove | null
  score: number
  depth: number
  nodes: number
  timeMs: number
  pv: string[]
  /** Exact-scored root moves, best first. Only populated in spectrum mode. */
  rootMoves: EngineRootMove[]
}

export interface EngineSearchOptions {
  maxDepth?: number
  maxTimeMs?: number
  maxNodes?: number
  /** Score every root move exactly (used by the persona/difficulty layer). */
  spectrum?: boolean
  /** Clear the transposition table first (reproducible test runs). */
  freshTable?: boolean
  /**
   * Recent game positions (FEN, oldest first, excluding the current one)
   * so the search can detect repetitions across the root — without this a
   * winning engine may walk into a game-level threefold it cannot see.
   */
  historyFens?: string[]
}

const PROMO_NAMES = ['', '', 'n', 'b', 'r', 'q'] as const

function toEngineMove(move: number): EngineMove {
  const promo = movePromotion(move)
  const out: EngineMove = {
    from: squareName(moveFrom(move)),
    to: squareName(moveTo(move)),
    uci:
      squareName(moveFrom(move)) +
      squareName(moveTo(move)) +
      (promo !== 0 ? PROMO_NAMES[promo]! : ''),
  }
  if (promo !== 0) out.promotion = PROMO_NAMES[promo] as 'q' | 'r' | 'b' | 'n'
  return out
}

/**
 * Search a position given as FEN. Deterministic for fixed inputs when
 * `freshTable` is set (otherwise the persistent table may steer ordering).
 */
export function searchFen(fen: string, options: EngineSearchOptions = {}): EngineSearchResult {
  const pos = new Position()
  pos.setFromFen(fen)
  if (options.historyFens && options.historyFens.length > 0) {
    const scratch = new Position()
    const hashes: Array<{ lo: number; hi: number }> = []
    for (const historyFen of options.historyFens) {
      try {
        scratch.setFromFen(historyFen)
        hashes.push({ lo: scratch.hashLo, hi: scratch.hashHi })
      } catch {
        /* skip malformed history entries */
      }
    }
    pos.seedHistory(hashes)
  }
  if (options.freshTable) clearTranspositionTable()
  const limits: SearchLimits = {
    maxDepth: options.maxDepth,
    maxTimeMs: options.maxTimeMs,
    maxNodes: options.maxNodes,
    spectrum: options.spectrum,
  }
  const outcome = search(pos, limits)
  return {
    move: outcome.move !== 0 ? toEngineMove(outcome.move) : null,
    score: outcome.score,
    depth: outcome.depth,
    nodes: outcome.nodes,
    timeMs: outcome.timeMs,
    pv: outcome.pv,
    rootMoves: options.spectrum
      ? outcome.rootMoves.map((r) => ({ ...toEngineMove(r.move), score: r.score }))
      : [],
  }
}

/** Static evaluation (side-to-move perspective, centipawns). */
export function evaluateFen(fen: string): number {
  const pos = new Position()
  pos.setFromFen(fen)
  return evaluate(pos)
}

/** Legal moves as UCI strings — used by cross-validation tests. */
export function legalMovesFen(fen: string): string[] {
  const pos = new Position()
  pos.setFromFen(fen)
  return pos.legalMoves().map((m) => toEngineMove(m).uci)
}
