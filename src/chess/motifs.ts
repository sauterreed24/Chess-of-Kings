import type { Chess, Move, Color, PieceSymbol, Square } from 'chess.js'

export interface TacticalMotifs {
  fork: boolean
  pin: boolean
  skewer: boolean
  kingHunt: boolean
  givesCheck: boolean
}

const PIECE_SCORE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
}

function parseSquare(square: string): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 97
  const rank = Number(square[1]) - 1
  return { file, rank }
}

function sq(file: number, rank: number): Square {
  return `${String.fromCharCode(97 + file)}${rank + 1}` as Square
}

function inBounds(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
}

function attackedSquaresFrom(chess: Chess, from: string, piece: PieceSymbol, color: Color): Square[] {
  const out: Square[] = []
  const p = parseSquare(from)
  if (piece === 'n') {
    for (const [df, dr] of [
      [1, 2], [2, 1], [2, -1], [1, -2],
      [-1, -2], [-2, -1], [-2, 1], [-1, 2],
    ]) {
      const f = p.file + df
      const r = p.rank + dr
      if (!inBounds(f, r)) continue
      out.push(sq(f, r))
    }
    return out
  }
  if (piece === 'k') {
    for (const [df, dr] of [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1],  [0, 1],  [1, 1],
    ]) {
      const f = p.file + df
      const r = p.rank + dr
      if (!inBounds(f, r)) continue
      out.push(sq(f, r))
    }
    return out
  }
  if (piece === 'p') {
    const dir = color === 'w' ? 1 : -1
    for (const df of [-1, 1]) {
      const f = p.file + df
      const r = p.rank + dir
      if (!inBounds(f, r)) continue
      out.push(sq(f, r))
    }
    return out
  }

  const directions: Array<[number, number]> = []
  if (piece === 'b' || piece === 'q') {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
  }
  if (piece === 'r' || piece === 'q') {
    directions.push([1, 0], [-1, 0], [0, 1], [0, -1])
  }

  for (const [df, dr] of directions) {
    let f = p.file + df
    let r = p.rank + dr
    while (inBounds(f, r)) {
      const target = sq(f, r)
      out.push(target)
      if (chess.get(target)) break
      f += df
      r += dr
    }
  }
  return out
}

function lineMotifsForSlider(chess: Chess, move: Move, enemy: Color): { pin: boolean; skewer: boolean } {
  if (!(move.piece === 'b' || move.piece === 'r' || move.piece === 'q')) {
    return { pin: false, skewer: false }
  }
  const from = parseSquare(move.to)
  const directions: Array<[number, number]> = []
  if (move.piece === 'b' || move.piece === 'q') {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
  }
  if (move.piece === 'r' || move.piece === 'q') {
    directions.push([1, 0], [-1, 0], [0, 1], [0, -1])
  }
  let pin = false
  let skewer = false
  for (const [df, dr] of directions) {
    let f = from.file + df
    let r = from.rank + dr
    let first: { type: PieceSymbol; color: Color } | null = null
    while (inBounds(f, r)) {
      const piece = chess.get(sq(f, r))
      if (!piece) {
        f += df
        r += dr
        continue
      }
      if (piece.color !== enemy) break
      if (!first) {
        first = piece
        f += df
        r += dr
        continue
      }
      if (first.type !== 'k' && piece.type === 'k') pin = true
      if (first.type === 'k' && piece.type !== 'k') skewer = true
      break
    }
  }
  return { pin, skewer }
}

export function detectTacticalMotifs(chessAfter: Chess, move: Move, mover: Color): TacticalMotifs {
  const enemy: Color = mover === 'w' ? 'b' : 'w'
  const attacks = attackedSquaresFrom(chessAfter, move.to, move.piece, mover)
  const enemyTargets = attacks
    .map((square) => chessAfter.get(square))
    .filter((p): p is { type: PieceSymbol; color: Color } => Boolean(p && p.color === enemy))
  const threateningTargets = enemyTargets.filter((p) => p.type === 'k' || (PIECE_SCORE[p.type] ?? 0) >= 3)
  const givesCheck = enemyTargets.some((p) => p.type === 'k')
  const fork = move.piece !== 'k' && threateningTargets.length >= 2
  const { pin, skewer } = lineMotifsForSlider(chessAfter, move, enemy)
  const kingHunt = givesCheck && (move.piece === 'q' || move.piece === 'r' || move.piece === 'b' || move.piece === 'n')
  return {
    fork,
    pin,
    skewer,
    kingHunt,
    givesCheck,
  }
}
