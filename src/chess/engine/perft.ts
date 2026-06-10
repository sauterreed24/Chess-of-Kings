/* Perft (performance test): counts leaf nodes of the legal move tree.
   The canonical correctness check for move generators — totals must match
   the published reference values exactly. */

import { Position, moveToUci } from './position'

export function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1
  const moves: number[] = []
  pos.generateMoves(moves)
  let count = 0
  for (const move of moves) {
    if (pos.make(move)) {
      count += depth === 1 ? 1 : perft(pos, depth - 1)
    }
    pos.unmake()
  }
  return count
}

/** Per-root-move breakdown, for diffing against a reference engine. */
export function perftDivide(pos: Position, depth: number): Array<{ uci: string; nodes: number }> {
  const out: Array<{ uci: string; nodes: number }> = []
  const moves: number[] = []
  pos.generateMoves(moves)
  for (const move of moves) {
    if (pos.make(move)) {
      out.push({ uci: moveToUci(move), nodes: depth <= 1 ? 1 : perft(pos, depth - 1) })
    }
    pos.unmake()
  }
  return out.sort((a, b) => (a.uci < b.uci ? -1 : 1))
}

export function perftFen(fen: string, depth: number): number {
  const pos = new Position()
  pos.setFromFen(fen)
  return perft(pos, depth)
}
