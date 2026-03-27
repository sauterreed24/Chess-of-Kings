import type { Chess, Color, PieceSymbol, Square } from 'chess.js'

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
}

/* ─── Piece-square tables ────────────────────────────────────────────────
   Index 0 = a1, index 7 = h1, index 56 = a8, index 63 = h8.
   For black, index = 63 − idxW (mirrors vertically).
   ──────────────────────────────────────────────────────────────────────── */

const PST_PAWN_W = [
  /* rank 1 */  0,  0,  0,  0,  0,  0,  0,  0,
  /* rank 2 */  5, 10, 10,-20,-20, 10, 10,  5,
  /* rank 3 */  5, -5,-10,  0,  0,-10, -5,  5,
  /* rank 4 */  0,  0,  0, 20, 20,  0,  0,  0,
  /* rank 5 */  5,  5, 10, 25, 25, 10,  5,  5,
  /* rank 6 */ 10, 10, 20, 30, 30, 20, 10, 10,
  /* rank 7 */ 50, 50, 50, 50, 50, 50, 50, 50,
  /* rank 8 */  0,  0,  0,  0,  0,  0,  0,  0,
]

const PST_KNIGHT_W = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
]

const PST_BISHOP_W = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
]

/* Rook: 7th-rank bonus (indices 48–55), connect early */
const PST_ROOK_W = [
    0,  0,  5, 10, 10,  5,  0,  0,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    5, 10, 10, 10, 10, 10, 10,  5,
    0,  0,  0,  5,  5,  0,  0,  0,
]

const PST_QUEEN_W = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -10,  5,  5,  5,  5,  5,  0,-10,
    0,  0,  5,  5,  5,  5,  0, -5,
   -5,  0,  5,  5,  5,  5,  0, -5,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
]

/* King middlegame: castled = good, centre = danger */
const PST_KING_MG_W = [
   20, 30, 10,  0,  0, 10, 30, 20,
   20, 20,  0,  0,  0,  0, 20, 20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
]

/* King endgame: centralise */
const PST_KING_EG_W = [
  -50,-30,-30,-30,-30,-30,-30,-50,
  -30,-20, -5, -5, -5, -5,-20,-30,
  -30, -5, 10, 15, 15, 10, -5,-30,
  -30, -5, 15, 20, 20, 15, -5,-30,
  -30, -5, 15, 20, 20, 15, -5,-30,
  -30, -5, 10, 15, 15, 10, -5,-30,
  -30,-20, -5, -5, -5, -5,-20,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
]

function sqIndex(square: Square): number {
  return (Number(square[1]) - 1) * 8 + (square.charCodeAt(0) - 97)
}

function heavyPieceCount(board: ReturnType<Chess['board']>): number {
  let n = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r]![c]
      if (p && (p.type === 'q' || p.type === 'r')) n++
    }
  }
  return n
}

function pstFor(piece: PieceSymbol, square: Square, color: Color, endgame: boolean): number {
  const idxW = sqIndex(square)
  const idx = color === 'w' ? idxW : 63 - idxW
  switch (piece) {
    case 'p': return PST_PAWN_W[idx]!
    case 'n': return PST_KNIGHT_W[idx]!
    case 'b': return PST_BISHOP_W[idx]!
    case 'r': return PST_ROOK_W[idx]!
    case 'q': return PST_QUEEN_W[idx]!
    case 'k': return (endgame ? PST_KING_EG_W : PST_KING_MG_W)[idx]!
    default:  return 0
  }
}

/* ─── Pawn structure ──────────────────────────────────────────────────── */

function doubledPawnPenalty(board: ReturnType<Chess['board']>, c: Color): number {
  const perFile = new Array<number>(8).fill(0)
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r]![f]
      if (p?.type === 'p' && p.color === c) perFile[f]++
    }
  }
  let pen = 0
  for (const n of perFile) if (n >= 2) pen += 14 * (n - 1)
  return pen
}

function isolatedPawnPenalty(board: ReturnType<Chess['board']>, c: Color): number {
  const perFile = new Array<number>(8).fill(0)
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r]![f]
      if (p?.type === 'p' && p.color === c) perFile[f]++
    }
  }
  let pen = 0
  for (let f = 0; f < 8; f++) {
    if (!perFile[f]) continue
    const adj = (f > 0 && perFile[f - 1]! > 0) || (f < 7 && perFile[f + 1]! > 0)
    if (!adj) pen += 18
  }
  return pen
}

const PASSED_BONUS = [0, 0, 10, 18, 30, 52, 82, 0]

function passedPawnBonus(board: ReturnType<Chess['board']>, c: Color): number {
  const opp: Color = c === 'w' ? 'b' : 'w'
  let bonus = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r]![f]
      if (!p || p.type !== 'p' || p.color !== c) continue
      let passed = true
      outer: for (let r2 = 0; r2 < 8; r2++) {
        if (c === 'w' ? r2 <= r : r2 >= r) continue
        for (let df = -1; df <= 1; df++) {
          const f2 = f + df
          if (f2 < 0 || f2 > 7) continue
          if (board[r2]![f2]?.type === 'p' && board[r2]![f2]?.color === opp) {
            passed = false
            break outer
          }
        }
      }
      if (passed) {
        const rankFromHome = c === 'w' ? r : 7 - r
        bonus += PASSED_BONUS[rankFromHome] ?? 0
      }
    }
  }
  return bonus
}

/* ─── Piece coordination ─────────────────────────────────────────────── */

function rookFileBonus(board: ReturnType<Chess['board']>, c: Color): number {
  const opp: Color = c === 'w' ? 'b' : 'w'
  let bonus = 0
  for (let f = 0; f < 8; f++) {
    let ownPawn = false, oppPawn = false, hasRook = false
    for (let r = 0; r < 8; r++) {
      const p = board[r]![f]
      if (!p) continue
      if (p.type === 'p' && p.color === c) ownPawn = true
      if (p.type === 'p' && p.color === opp) oppPawn = true
      if ((p.type === 'r' || p.type === 'q') && p.color === c) hasRook = true
    }
    if (hasRook) {
      if (!ownPawn && !oppPawn) bonus += 18
      else if (!ownPawn) bonus += 10
    }
  }
  return bonus
}

function bishopPairBonus(board: ReturnType<Chess['board']>, c: Color): number {
  let bishops = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (board[r]![f]?.type === 'b' && board[r]![f]?.color === c) bishops++
    }
  }
  return bishops >= 2 ? 22 : 0
}

/* ─── King safety ────────────────────────────────────────────────────── */

function kingSafetyPenalty(board: ReturnType<Chess['board']>, c: Color): number {
  const homeRank = c === 'w' ? 0 : 7
  const shieldRank = c === 'w' ? 1 : 6
  /* Find king on home rank */
  let kf = -1
  for (let f = 0; f < 8; f++) {
    const p = board[homeRank]![f]
    if (p?.type === 'k' && p.color === c) { kf = f; break }
  }
  if (kf < 0) return 0 // king advanced (endgame context, handled by EG PST)
  let pen = 0
  if (kf >= 5) {
    /* Kingside castle — check f/g/h shield */
    for (let f = 5; f <= 7; f++) {
      const p = board[shieldRank]![f]
      if (!p || p.type !== 'p' || p.color !== c) pen += 22
    }
  } else if (kf <= 2) {
    /* Queenside castle — check a/b/c shield */
    for (let f = 0; f <= 2; f++) {
      const p = board[shieldRank]![f]
      if (!p || p.type !== 'p' || p.color !== c) pen += 16
    }
  } else {
    /* King in centre — significant danger */
    pen += 28
  }
  return pen
}

/* ─── Main evaluation ────────────────────────────────────────────────── */

export function materialAndPst(chess: Chess, forColor: Color): number {
  const board = chess.board()
  const eg = heavyPieceCount(board) <= 2
  const opp: Color = forColor === 'w' ? 'b' : 'w'
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r]![f]
      if (!p) continue
      const v = PIECE_VALUES[p.type] + pstFor(p.type, p.square, p.color, eg)
      score += p.color === forColor ? v : -v
    }
  }
  score -= doubledPawnPenalty(board, forColor)
  score += doubledPawnPenalty(board, opp)
  score -= isolatedPawnPenalty(board, forColor)
  score += isolatedPawnPenalty(board, opp)
  score += passedPawnBonus(board, forColor)
  score -= passedPawnBonus(board, opp)
  score += rookFileBonus(board, forColor)
  score -= rookFileBonus(board, opp)
  score += bishopPairBonus(board, forColor)
  score -= bishopPairBonus(board, opp)
  if (!eg) {
    score -= kingSafetyPenalty(board, forColor)
    score += kingSafetyPenalty(board, opp)
  }
  return score
}

export type AIStyle =
  | 'development' | 'romantic' | 'classical' | 'hypermodern'
  | 'soviet' | 'engine' | 'universal' | 'alexandrine' | 'apotheosis' | 'random'

export function styleBias(move: import('chess.js').Move, style: AIStyle): number {
  let b = 0
  if (move.captured) {
    b += style === 'romantic' || style === 'engine' || style === 'apotheosis' ? 35 : 15
  }
  if (move.piece === 'n' || move.piece === 'b') {
    const toRank = Number(move.to[1])
    if (move.color === 'w' && toRank >= 5) b += style === 'development' || style === 'classical' ? 25 : 10
    if (move.color === 'b' && toRank <= 4) b += style === 'development' || style === 'classical' ? 25 : 10
  }
  if (move.piece === 'p' && Math.abs(Number(move.to[1]) - Number(move.from[1])) === 2) {
    b += style === 'romantic' ? 20 : 5
  }
  if (style === 'hypermodern' && (move.piece === 'b' || move.piece === 'n')) {
    if (move.to[0] === 'a' || move.to[0] === 'h') b += 15
  }
  if (style === 'soviet' || style === 'alexandrine') {
    if (move.captured) b += 10
    if (move.san.includes('+')) b += 12
  }
  if (style === 'universal') b += move.captured ? 12 : 4
  return b
}
