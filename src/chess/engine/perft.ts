/* Perft (performance test): counts leaf nodes of the legal move tree.
   The canonical correctness check for move generators — totals must match
   the published reference values exactly. */

import { MAX_MOVES, Position, moveToUci } from './position'

export function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1
  const moves = new Int32Array(MAX_MOVES)
  const count = pos.generateMoves(moves, 0)
  let total = 0
  for (let i = 0; i < count; i++) {
    if (pos.make(moves[i]!)) {
      total += depth === 1 ? 1 : perft(pos, depth - 1)
    }
    pos.unmake()
  }
  return total
}

/** Per-root-move breakdown, for diffing against a reference engine. */
export function perftDivide(pos: Position, depth: number): Array<{ uci: string; nodes: number }> {
  const out: Array<{ uci: string; nodes: number }> = []
  for (const move of pos.legalMoves()) {
    pos.make(move)
    out.push({ uci: moveToUci(move), nodes: depth <= 1 ? 1 : perft(pos, depth - 1) })
    pos.unmake()
  }
  return out.sort((a, b) => (a.uci < b.uci ? -1 : 1))
}

export function perftFen(fen: string, depth: number): number {
  const pos = new Position()
  pos.setFromFen(fen)
  return perft(pos, depth)
}
