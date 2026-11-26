/* Player bots. Each bot sees only the board (a chess.js instance) and
   returns a legal move; randomness comes from the seeded Math.random.

   novice  — greedy 1-ply: best capture that does not obviously hang,
             takes mate-in-1, otherwise a random non-hanging move. Roughly
             someone who just learned the rules.
   club    — shallow calculator: 3-ply spectrum search, samples among moves
             within ~a pawn of its best with a soft preference. Plays
             sensibly, misses deeper tactics; knows basic mating technique
             (deeper best-move search once clearly won with ≤ 8 pieces).
   skilled — node-limited engine (40k nodes, ~5-6 plies), always its best
             move. A strong club player who rarely drops material. */

import type { Chess, Move } from 'chess.js'
import { searchFen } from '../src/chess/engine'

export type BotId = 'novice' | 'club' | 'skilled'
export const BOTS: BotId[] = ['novice', 'club', 'skilled']

const PIECE_CP: Record<string, number> = { p: 100, n: 300, b: 310, r: 500, q: 900, k: 0 }

function noviceMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null
  let best: Move | null = null
  let bestScore = -Infinity
  for (const move of moves) {
    let score = PIECE_CP[move.captured ?? ''] ?? 0
    chess.move(move)
    if (chess.isCheckmate()) score += 100_000
    let worstLoss = 0
    for (const reply of chess.moves({ verbose: true })) {
      if (!reply.captured) continue
      const gain = (PIECE_CP[reply.captured] ?? 0) - 40
      if (gain > worstLoss) worstLoss = gain
    }
    chess.undo()
    score -= worstLoss * 0.9
    score += Math.random() * 30
    if (score > bestScore) {
      bestScore = score
      best = move
    }
  }
  return best
}

function pick(chess: Chess, uci: string): Move | null {
  return chess.moves({ verbose: true }).find((m) => `${m.from}${m.to}${m.promotion ?? ''}` === uci) ?? null
}

function pieceCount(chess: Chess): number {
  return chess.board().flat().filter((p) => p && p.type !== 'k').length
}

function clubMove(chess: Chess, historyFens: string[]): Move | null {
  const result = searchFen(chess.fen(), { maxDepth: 3, maxNodes: 20_000, spectrum: true, freshTable: true, historyFens })
  const roots = result.rootMoves
  if (roots.length === 0) return chess.moves({ verbose: true })[0] ?? null
  const top = roots[0]!.score
  /* Technique: a club player knows the basic mates. Clearly won with few
     pieces left, they play purposefully instead of sampling. */
  if (top >= 500 && pieceCount(chess) <= 8) {
    const deep = searchFen(chess.fen(), { maxDepth: 9, maxNodes: 60_000, freshTable: true, historyFens })
    if (deep.move) return pick(chess, deep.move.uci)
  }
  const band = roots.filter((r) => r.score >= top - 90)
  const weights = band.map((r) => Math.exp((r.score - top) / 35))
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < band.length; i++) {
    roll -= weights[i]!
    if (roll <= 0) return pick(chess, band[i]!.uci)
  }
  return pick(chess, band[0]!.uci)
}

function skilledMove(chess: Chess, historyFens: string[]): Move | null {
  const result = searchFen(chess.fen(), { maxNodes: 40_000, freshTable: true, historyFens })
  if (!result.move) return chess.moves({ verbose: true })[0] ?? null
  return pick(chess, result.move.uci)
}

/** `historyFens`: positions before the current one (oldest first) so the
    searching bots see repetitions the way a player remembers them. */
export function botMove(bot: BotId, chess: Chess, historyFens: string[] = []): Move | null {
  if (bot === 'novice') return noviceMove(chess)
  if (bot === 'club') return clubMove(chess, historyFens)
  return skilledMove(chess, historyFens)
}

/** A player reads the puzzle goal: if one move achieves it outright, play it. */
export function goalMove(chess: Chess, achieves: (after: Chess) => boolean): Move | null {
  for (const move of chess.moves({ verbose: true })) {
    chess.move(move)
    const ok = achieves(chess)
    chess.undo()
    if (ok) return move
  }
  return null
}
