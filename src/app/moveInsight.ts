import type { Color, Move, PieceSymbol, Square } from 'chess.js'

export type MoveInsightMode = 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel'

export type MoveInsightMove = Pick<Move, 'san' | 'from' | 'to' | 'piece'> & {
  captured?: PieceSymbol
}

export interface MoveInsightInput {
  move: MoveInsightMove
  halfMoveCount: number
  materialAfterCp: number
  playerColor: Color
  mode: MoveInsightMode
}

const CENTER_SQUARES = new Set<Square>(['d4', 'e4', 'd5', 'e5'])
const WHITE_BACK_RANK_MINORS = new Set<Square>(['b1', 'c1', 'f1', 'g1'])
const BLACK_BACK_RANK_MINORS = new Set<Square>(['b8', 'c8', 'f8', 'g8'])

export function moveInsightFor(input: MoveInsightInput): string | null {
  const { move, halfMoveCount, materialAfterCp, playerColor } = input
  const san = move.san
  if (halfMoveCount > 28) return null

  if (san === 'O-O' || san === 'O-O-O') {
    return 'King housed - your rooks can now coordinate along the back rank.'
  }

  if (san.includes('x') && !san.includes('#')) {
    if (materialAfterCp < -50) {
      return 'You captured, but the position worsened. Check recaptures and counter-threats before grabbing material.'
    }
    return 'Material won. Verify nothing is left hanging in return.'
  }

  if (halfMoveCount <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
    return 'Early queens are easy targets - knights and bishops first.'
  }

  if (san.endsWith('+') && !san.includes('x') && halfMoveCount <= 18 && materialAfterCp <= 20) {
    return 'A check that does not win material alerts the king to escape sooner. Each check needs a concrete follow-up.'
  }

  if (halfMoveCount <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
    return 'Wing pawn moves in the opening often lose time. Development and center first.'
  }

  if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) {
    return 'Center claimed. Now develop a knight or bishop to defend that square.'
  }

  if (
    (move.piece === 'n' || move.piece === 'b') &&
    (playerColor === 'w' ? WHITE_BACK_RANK_MINORS : BLACK_BACK_RANK_MINORS).has(move.from)
  ) {
    return 'Minor piece developed. Bring the rest out before moving the same piece again.'
  }

  if (input.mode === 'calibration' && halfMoveCount <= 8) {
    return 'Calibration signal recorded. Keep each move tied to center, development, or king safety.'
  }

  if (input.mode === 'freeplay' && halfMoveCount <= 10) {
    return 'Position updated. Ask what this move attacks and what it leaves behind.'
  }

  return null
}
