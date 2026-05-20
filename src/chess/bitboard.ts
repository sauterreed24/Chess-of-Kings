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
  attacks: ColorMap<bigint>
  mobility: ColorMap<number>
  kingPressure: ColorMap<number>
  loosePiecePressure: ColorMap<number>
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
const WHITE_PAWN_ATTACKS_FROM: readonly bigint[] = buildPawnAttacksFrom('w')
const BLACK_PAWN_ATTACKS_FROM: readonly bigint[] = buildPawnAttacksFrom('b')
const KNIGHT_ATTACKS: readonly bigint[] = buildJumpAttackMasks([
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2],
])
const KING_ATTACKS: readonly bigint[] = buildJumpAttackMasks([
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
])
const BISHOP_DIRECTIONS: readonly Direction[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const ROOK_DIRECTIONS: readonly Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const LOOSE_PRESSURE_VALUE: Record<PieceSymbol, number> = {
  p: 8,
  n: 18,
  b: 18,
  r: 28,
  q: 48,
  k: 0,
}

type Direction = readonly [number, number]

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

function buildPawnAttacksFrom(color: Color): bigint[] {
  return Array.from({ length: 64 }, (_, index) => {
    const file = fileOfIndex(index)
    const rank = rankOfIndex(index)
    const attackRank = color === 'w' ? rank + 1 : rank - 1
    if (attackRank < 0 || attackRank > 7) return 0n
    let mask = 0n
    if (file > 0) mask |= SQUARE_MASKS[attackRank * 8 + file - 1]!
    if (file < 7) mask |= SQUARE_MASKS[attackRank * 8 + file + 1]!
    return mask
  })
}

function buildJumpAttackMasks(offsets: readonly Direction[]): bigint[] {
  return Array.from({ length: 64 }, (_, index) => {
    const file = fileOfIndex(index)
    const rank = rankOfIndex(index)
    let mask = 0n
    for (const [df, dr] of offsets) {
      const f = file + df
      const r = rank + dr
      if (f >= 0 && f < 8 && r >= 0 && r < 8) mask |= SQUARE_MASKS[r * 8 + f]!
    }
    return mask
  })
}

function slidingAttacksFrom(index: number, occupied: bigint, directions: readonly Direction[]): bigint {
  const file = fileOfIndex(index)
  const rank = rankOfIndex(index)
  let mask = 0n
  for (const [df, dr] of directions) {
    let f = file + df
    let r = rank + dr
    while (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const squareMask = SQUARE_MASKS[r * 8 + f]!
      mask |= squareMask
      if ((occupied & squareMask) !== 0n) break
      f += df
      r += dr
    }
  }
  return mask
}

function attacksFromPiece(piece: PositionPiece, occupied: bigint): bigint {
  switch (piece.type) {
    case 'p':
      return (piece.color === 'w' ? WHITE_PAWN_ATTACKS_FROM : BLACK_PAWN_ATTACKS_FROM)[piece.index]!
    case 'n':
      return KNIGHT_ATTACKS[piece.index]!
    case 'b':
      return slidingAttacksFrom(piece.index, occupied, BISHOP_DIRECTIONS)
    case 'r':
      return slidingAttacksFrom(piece.index, occupied, ROOK_DIRECTIONS)
    case 'q':
      return (
        slidingAttacksFrom(piece.index, occupied, BISHOP_DIRECTIONS) |
        slidingAttacksFrom(piece.index, occupied, ROOK_DIRECTIONS)
      )
    case 'k':
      return KING_ATTACKS[piece.index]!
    default:
      return 0n
  }
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

export function popCount(mask: bigint): number {
  let n = 0
  while (mask !== 0n) {
    mask &= mask - 1n
    n++
  }
  return n
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
  const attacks: ColorMap<bigint> = { w: 0n, b: 0n }
  const mobility: ColorMap<number> = { w: 0, b: 0 }
  const kingPressure: ColorMap<number> = { w: 0, b: 0 }
  const loosePiecePressure: ColorMap<number> = { w: 0, b: 0 }
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

  for (const piece of pieceList) {
    const attackMask = attacksFromPiece(piece, occupancy.all)
    attacks[piece.color] |= attackMask
    mobility[piece.color] += popCount(attackMask & ~occupancy[piece.color])
  }

  for (const color of ['w', 'b'] as const) {
    const enemy = opponentOf(color)
    const enemyKing = kingIndex[enemy]
    if (enemyKing !== null) {
      kingPressure[color] = popCount(attacks[color] & (KING_ATTACKS[enemyKing]! | SQUARE_MASKS[enemyKing]!))
    }
  }

  for (const piece of pieceList) {
    if (piece.type === 'k') continue
    const enemy = opponentOf(piece.color)
    const mask = SQUARE_MASKS[piece.index]!
    if ((attacks[enemy] & mask) !== 0n && (attacks[piece.color] & mask) === 0n) {
      loosePiecePressure[enemy] += LOOSE_PRESSURE_VALUE[piece.type]
    }
  }

  return {
    pieces,
    occupancy,
    pawnsByFile,
    pieceList,
    attacks,
    mobility,
    kingPressure,
    loosePiecePressure,
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

export function isSquareAttacked(position: PositionAnalysis, byColor: Color, index: number): boolean {
  return (position.attacks[byColor] & SQUARE_MASKS[index]!) !== 0n
}
