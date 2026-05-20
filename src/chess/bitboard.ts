import type { Chess, Color, PieceSymbol, Square } from 'chess.js'

export type PieceBitboards = Record<PieceSymbol, bigint>
export type ColorMap<T> = Record<Color, T>

export interface PositionPiece {
  type: PieceSymbol
  color: Color
  square: Square
  index: number
}

export interface PositionAnalysis {
  pieces: ColorMap<PieceBitboards>
  occupancy: ColorMap<bigint> & { all: bigint }
  pawnsByFile: ColorMap<number[]>
  pieceList: PositionPiece[]
  heavyPieceCount: number
  nonKingPieceCount: number
  bishopCount: ColorMap<number>
  kingIndex: ColorMap<number | null>
}

export const SQUARE_MASKS: readonly bigint[] = Array.from(
  { length: 64 },
  (_, index) => 1n << BigInt(index),
)

export const FILE_MASKS: readonly bigint[] = Array.from({ length: 8 }, (_, file) => {
  let mask = 0n
  for (let rank = 0; rank < 8; rank++) mask |= SQUARE_MASKS[rank * 8 + file]!
  return mask
})

export const ADJACENT_FILE_MASKS: readonly bigint[] = Array.from({ length: 8 }, (_, file) => {
  let mask = 0n
  if (file > 0) mask |= FILE_MASKS[file - 1]!
  if (file < 7) mask |= FILE_MASKS[file + 1]!
  return mask
})

const WHITE_PASSED_MASKS: readonly bigint[] = buildPassedPawnMasks('w')
const BLACK_PASSED_MASKS: readonly bigint[] = buildPassedPawnMasks('b')
const WHITE_PAWN_ATTACKERS_TO: readonly bigint[] = buildPawnAttackersTo('w')
const BLACK_PAWN_ATTACKERS_TO: readonly bigint[] = buildPawnAttackersTo('b')

function emptyPieceBitboards(): PieceBitboards {
  return { p: 0n, n: 0n, b: 0n, r: 0n, q: 0n, k: 0n }
}

function buildPassedPawnMasks(color: Color): bigint[] {
  return Array.from({ length: 64 }, (_, index) => {
    const file = fileOfIndex(index)
    const rank = rankOfIndex(index)
    let mask = 0n
    const rankStep = color === 'w' ? 1 : -1
    for (let r = rank + rankStep; r >= 0 && r < 8; r += rankStep) {
      for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
        mask |= SQUARE_MASKS[r * 8 + f]!
      }
    }
    return mask
  })
}

function buildPawnAttackersTo(color: Color): bigint[] {
  return Array.from({ length: 64 }, (_, index) => {
    const file = fileOfIndex(index)
    const rank = rankOfIndex(index)
    const defenderRank = color === 'w' ? rank - 1 : rank + 1
    if (defenderRank < 0 || defenderRank > 7) return 0n
    let mask = 0n
    if (file > 0) mask |= SQUARE_MASKS[defenderRank * 8 + file - 1]!
    if (file < 7) mask |= SQUARE_MASKS[defenderRank * 8 + file + 1]!
    return mask
  })
}

export function squareIndex(square: Square): number {
  return (Number(square[1]) - 1) * 8 + (square.charCodeAt(0) - 97)
}

export function squareFromIndex(index: number): Square {
  const file = String.fromCharCode(97 + fileOfIndex(index))
  return `${file}${rankOfIndex(index) + 1}` as Square
}

export function fileOfIndex(index: number): number {
  return index & 7
}

export function rankOfIndex(index: number): number {
  return index >> 3
}

export function opponentOf(color: Color): Color {
  return color === 'w' ? 'b' : 'w'
}

export function analyzePosition(chess: Chess): PositionAnalysis {
  const pieces: ColorMap<PieceBitboards> = {
    w: emptyPieceBitboards(),
    b: emptyPieceBitboards(),
  }
  const occupancy: ColorMap<bigint> & { all: bigint } = { w: 0n, b: 0n, all: 0n }
  const pawnsByFile: ColorMap<number[]> = {
    w: Array.from({ length: 8 }, () => 0),
    b: Array.from({ length: 8 }, () => 0),
  }
  const bishopCount: ColorMap<number> = { w: 0, b: 0 }
  const kingIndex: ColorMap<number | null> = { w: null, b: null }
  const pieceList: PositionPiece[] = []
  let heavyPieceCount = 0
  let nonKingPieceCount = 0

  const board = chess.board()
  for (let boardRank = 0; boardRank < 8; boardRank++) {
    const row = board[boardRank]!
    const rank = 7 - boardRank
    for (let file = 0; file < 8; file++) {
      const piece = row[file]
      if (!piece) continue

      const index = rank * 8 + file
      const mask = SQUARE_MASKS[index]!
      const color = piece.color
      const type = piece.type

      pieces[color][type] |= mask
      occupancy[color] |= mask
      occupancy.all |= mask
      pieceList.push({ type, color, square: piece.square, index })

      if (type === 'p') pawnsByFile[color][file] = (pawnsByFile[color][file] ?? 0) + 1
      if (type === 'b') bishopCount[color]++
      if (type === 'k') kingIndex[color] = index
      else nonKingPieceCount++
      if (type === 'r' || type === 'q') heavyPieceCount++
    }
  }

  return {
    pieces,
    occupancy,
    pawnsByFile,
    pieceList,
    heavyPieceCount,
    nonKingPieceCount,
    bishopCount,
    kingIndex,
  }
}

export function isPawnPassed(position: PositionAnalysis, color: Color, index: number): boolean {
  const enemy = opponentOf(color)
  const masks = color === 'w' ? WHITE_PASSED_MASKS : BLACK_PASSED_MASKS
  return (position.pieces[enemy].p & masks[index]!) === 0n
}

export function hasPassedPawn(position: PositionAnalysis, color: Color): boolean {
  for (const piece of position.pieceList) {
    if (piece.color === color && piece.type === 'p' && isPawnPassed(position, color, piece.index)) {
      return true
    }
  }
  return false
}

export function pawnDefendsSquare(position: PositionAnalysis, color: Color, index: number): boolean {
  const attackers = color === 'w' ? WHITE_PAWN_ATTACKERS_TO[index]! : BLACK_PAWN_ATTACKERS_TO[index]!
  return (position.pieces[color].p & attackers) !== 0n
}

export function isOpenFile(position: PositionAnalysis, file: number): boolean {
  const mask = FILE_MASKS[file]!
  return ((position.pieces.w.p | position.pieces.b.p) & mask) === 0n
}

export function isSemiOpenFile(position: PositionAnalysis, color: Color, file: number): boolean {
  return (position.pieces[color].p & FILE_MASKS[file]!) === 0n
}
