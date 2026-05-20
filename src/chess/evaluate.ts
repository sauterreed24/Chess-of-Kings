import type { Chess, Color, PieceSymbol, Square } from 'chess.js'
import {
  FILE_MASKS,
  SQUARE_MASKS,
  analyzePosition,
  fileOfIndex,
  isPawnPassed,
  isSemiOpenFile,
  opponentOf,
  pawnDefendsSquare,
  popCount,
  rankOfIndex,
  squareIndex,
} from './bitboard'
import type { PositionAnalysis, PositionPiece } from './bitboard'

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

function pstFor(piece: PieceSymbol, square: Square, color: Color, endgame: boolean): number {
  const idxW = squareIndex(square)
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

function doubledPawnPenalty(position: PositionAnalysis, c: Color): number {
  const perFile = position.pawnsByFile[c]
  let pen = 0
  for (const n of perFile) if (n >= 2) pen += 14 * (n - 1)
  return pen
}

function isolatedPawnPenalty(position: PositionAnalysis, c: Color): number {
  const perFile = position.pawnsByFile[c]
  let pen = 0
  for (let f = 0; f < 8; f++) {
    if (!perFile[f]) continue
    const adj = (f > 0 && perFile[f - 1]! > 0) || (f < 7 && perFile[f + 1]! > 0)
    if (!adj) pen += 18
  }
  return pen
}

const PASSED_BONUS = [0, 0, 10, 18, 30, 52, 82, 0]
const CORE_CENTER_MASK = boxMask(3, 4, 3, 4)
const EXTENDED_CENTER_MASK = boxMask(2, 5, 2, 5) & ~CORE_CENTER_MASK
const RANK_MASKS: readonly bigint[] = Array.from({ length: 8 }, (_, rank) => {
  let mask = 0n
  for (let file = 0; file < 8; file++) mask |= SQUARE_MASKS[rank * 8 + file]!
  return mask
})

function boxMask(fileMin: number, fileMax: number, rankMin: number, rankMax: number): bigint {
  let mask = 0n
  for (let rank = rankMin; rank <= rankMax; rank++) {
    for (let file = fileMin; file <= fileMax; file++) {
      mask |= SQUARE_MASKS[rank * 8 + file]!
    }
  }
  return mask
}

function passedPawnBonus(position: PositionAnalysis, c: Color): number {
  let bonus = 0
  for (const piece of position.pieceList) {
    if (piece.type !== 'p' || piece.color !== c) continue
    if (!isPawnPassed(position, c, piece.index)) continue

    const rank = rankOfIndex(piece.index)
    const rankFromHome = c === 'w' ? rank : 7 - rank
    const protectedBonus = pawnDefendsSquare(position, c, piece.index) ? 9 : 0
    const file = fileOfIndex(piece.index)
    const connected =
      (file > 0 && position.pawnsByFile[c][file - 1]! > 0) ||
      (file < 7 && position.pawnsByFile[c][file + 1]! > 0)
    bonus += (PASSED_BONUS[rankFromHome] ?? 0) + protectedBonus + (connected ? 5 : 0)
  }
  return bonus
}

/* ─── Piece coordination ─────────────────────────────────────────────── */

function rookFileBonus(position: PositionAnalysis, c: Color): number {
  const opp = opponentOf(c)
  const majorPieces = position.pieces[c].r | position.pieces[c].q
  let bonus = 0
  for (let f = 0; f < 8; f++) {
    const mask = FILE_MASKS[f]!
    if ((majorPieces & mask) === 0n) continue
    const ownPawn = (position.pieces[c].p & mask) !== 0n
    const oppPawn = (position.pieces[opp].p & mask) !== 0n
    if (!ownPawn && !oppPawn) bonus += 18
    else if (!ownPawn) bonus += 10
  }
  return bonus
}

function bishopPairBonus(position: PositionAnalysis, c: Color): number {
  return position.bishopCount[c] >= 2 ? 22 : 0
}

function knightOutpostBonus(position: PositionAnalysis, piece: PositionPiece): number {
  const rank = rankOfIndex(piece.index)
  const file = fileOfIndex(piece.index)
  const rankFromHome = piece.color === 'w' ? rank : 7 - rank
  if (rankFromHome < 3 || rankFromHome > 5) return 0
  if (file < 2 || file > 5) return 0
  if (!pawnDefendsSquare(position, piece.color, piece.index)) return 0

  const enemy = opponentOf(piece.color)
  const enemyPawnCanChallenge = pawnDefendsSquare(position, enemy, piece.index)
  return enemyPawnCanChallenge ? 6 : 18
}

function rookSeventhBonus(position: PositionAnalysis, piece: PositionPiece): number {
  const rank = rankOfIndex(piece.index)
  const targetRank = piece.color === 'w' ? 6 : 1
  if (rank !== targetRank) return 0

  const enemy = opponentOf(piece.color)
  const enemyKing = position.kingIndex[enemy]
  const enemyKingBackRank = enemyKing !== null && rankOfIndex(enemyKing) === (enemy === 'w' ? 0 : 7)
  const enemyPawnsOnRank =
    (position.pieces[enemy].p & rankMask(targetRank)) !== 0n ||
    (position.pieces[enemy].p & rankMask(piece.color === 'w' ? 7 : 0)) !== 0n
  return enemyKingBackRank || enemyPawnsOnRank ? 14 : 7
}

function rankMask(rank: number): bigint {
  return RANK_MASKS[rank]!
}

function pieceCoordinationBonus(position: PositionAnalysis, c: Color): number {
  let bonus = 0
  for (const piece of position.pieceList) {
    if (piece.color !== c) continue
    if (piece.type === 'n') bonus += knightOutpostBonus(position, piece)
    if (piece.type === 'r') bonus += rookSeventhBonus(position, piece)
  }
  return bonus
}

/* ─── Activity, pressure, and king safety ────────────────────────────── */

function mobilityBonus(position: PositionAnalysis, c: Color, endgame: boolean): number {
  const perMove = endgame ? 0.55 : 0.4
  return Math.round(position.mobility[c] * perMove)
}

function kingPressureBonus(position: PositionAnalysis, c: Color, endgame: boolean): number {
  if (endgame) return 0
  return position.kingPressure[c] * 7
}

function loosePiecePressureBonus(position: PositionAnalysis, c: Color): number {
  return Math.min(90, position.loosePiecePressure[c])
}

function centerControlBonus(position: PositionAnalysis, c: Color): number {
  return popCount(position.attacks[c] & CORE_CENTER_MASK) * 5 +
    popCount(position.attacks[c] & EXTENDED_CENTER_MASK) * 2
}

function kingSafetyPenalty(position: PositionAnalysis, c: Color): number {
  const homeRank = c === 'w' ? 0 : 7
  const shieldRank = c === 'w' ? 1 : 6
  const king = position.kingIndex[c]
  if (king === null || rankOfIndex(king) !== homeRank) return 0 // advanced king is handled by EG PST

  const kf = fileOfIndex(king)
  const enemy = opponentOf(c)
  let pen = 0
  if (kf >= 5) {
    /* Kingside castle — check f/g/h shield */
    for (let f = 5; f <= 7; f++) {
      const shield = SQUARE_MASKS[shieldRank * 8 + f]!
      if ((position.pieces[c].p & shield) === 0n) pen += 22
    }
  } else if (kf <= 2) {
    /* Queenside castle — check a/b/c shield */
    for (let f = 0; f <= 2; f++) {
      const shield = SQUARE_MASKS[shieldRank * 8 + f]!
      if ((position.pieces[c].p & shield) === 0n) pen += 16
    }
  } else {
    /* King in centre — significant danger */
    pen += 28
  }

  const enemyMajors = position.pieces[enemy].r | position.pieces[enemy].q
  for (let f = Math.max(0, kf - 1); f <= Math.min(7, kf + 1); f++) {
    if (!isSemiOpenFile(position, c, f)) continue
    pen += 5
    if ((enemyMajors & FILE_MASKS[f]!) !== 0n) pen += 11
  }
  return pen
}

/* ─── Main evaluation ────────────────────────────────────────────────── */

export function materialAndPst(
  chess: Chess,
  forColor: Color,
  position: PositionAnalysis = analyzePosition(chess),
): number {
  const eg = position.heavyPieceCount <= 2
  const opp = opponentOf(forColor)
  let score = 0
  for (const piece of position.pieceList) {
    const v = PIECE_VALUES[piece.type] + pstFor(piece.type, piece.square, piece.color, eg)
    score += piece.color === forColor ? v : -v
  }
  score -= doubledPawnPenalty(position, forColor)
  score += doubledPawnPenalty(position, opp)
  score -= isolatedPawnPenalty(position, forColor)
  score += isolatedPawnPenalty(position, opp)
  score += passedPawnBonus(position, forColor)
  score -= passedPawnBonus(position, opp)
  score += rookFileBonus(position, forColor)
  score -= rookFileBonus(position, opp)
  score += bishopPairBonus(position, forColor)
  score -= bishopPairBonus(position, opp)
  score += pieceCoordinationBonus(position, forColor)
  score -= pieceCoordinationBonus(position, opp)
  score += mobilityBonus(position, forColor, eg)
  score -= mobilityBonus(position, opp, eg)
  score += kingPressureBonus(position, forColor, eg)
  score -= kingPressureBonus(position, opp, eg)
  score += loosePiecePressureBonus(position, forColor)
  score -= loosePiecePressureBonus(position, opp)
  score += centerControlBonus(position, forColor)
  score -= centerControlBonus(position, opp)
  if (!eg) {
    score -= kingSafetyPenalty(position, forColor)
    score += kingSafetyPenalty(position, opp)
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
