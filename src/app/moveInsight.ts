import type { Color, Move, PieceSymbol, Square } from 'chess.js'

export type MoveInsightMode = 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel'
export type MoveInsightQuality = 'brilliant' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' | null

export type MoveInsightMove = Pick<Move, 'san' | 'from' | 'to' | 'piece'> & {
  captured?: PieceSymbol
}

export interface MoveInsightInput {
  move: MoveInsightMove
  halfMoveCount: number
  materialAfterCp: number
  playerColor: Color
  mode: MoveInsightMode
  quality?: MoveInsightQuality
}

const CENTER_SQUARES = new Set<Square>(['d4', 'e4', 'd5', 'e5'])
const WHITE_BACK_RANK_MINORS = new Set<Square>(['b1', 'c1', 'f1', 'g1'])
const BLACK_BACK_RANK_MINORS = new Set<Square>(['b8', 'c8', 'f8', 'g8'])

export function moveInsightFor(input: MoveInsightInput): string | null {
  const { move, halfMoveCount, materialAfterCp, playerColor } = input
  const san = move.san

  if (san.includes('#')) {
    return 'Mate sealed. Replay the forcing path; every flight square was closed.'
  }

  if (san === 'O-O' || san === 'O-O-O') {
    return 'King housed. The room gets quieter; put a rook on a file.'
  }

  if (input.quality === 'brilliant') {
    return 'Brilliant. Initiative is yours; keep asking forcing questions.'
  }

  if (input.quality === 'blunder') {
    return 'The line broke. Before moving, name checks, captures, loose defenders.'
  }

  if (input.quality === 'mistake') {
    return 'The line slipped. Spend one tempo on safety, material, or coordination.'
  }

  if (halfMoveCount > 28) return null

  if (san.includes('x') && !san.includes('#')) {
    if (materialAfterCp < -50) {
      return 'Legal capture, bad account. Position worsened; check recaptures before taking.'
    }
    return 'Material won. Finish the proof: what can the rival take next?'
  }

  if (halfMoveCount <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
    return 'Queen too early. Authority becomes a target; develop knights and bishops first.'
  }

  if (san.endsWith('+') && !san.includes('x') && halfMoveCount <= 18 && materialAfterCp <= 20) {
    return 'Checks without profit show the king an exit. Give checks with a concrete follow-up.'
  }

  if (halfMoveCount <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
    return 'Edge pawn early. Let the wing wait until center and development are ready.'
  }

  if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) {
    return 'Center claimed. Back it with a knight or bishop.'
  }

  if (
    (move.piece === 'n' || move.piece === 'b') &&
    (playerColor === 'w' ? WHITE_BACK_RANK_MINORS : BLACK_BACK_RANK_MINORS).has(move.from)
  ) {
    return 'Minor piece developed. Finish the rest before moving it twice.'
  }

  if (input.mode === 'calibration' && halfMoveCount <= 8) {
    return 'Calibration logged. Tie the next move to center, development, or king safety.'
  }

  if (input.mode === 'freeplay' && halfMoveCount <= 10) {
    return 'Position updated. Name what it attacks, guards, and leaves loose.'
  }

  if (input.quality === 'good') {
    return 'Sound. Convert the gain into development, safety, or a cleaner file.'
  }

  if (input.quality === 'inaccuracy') {
    return 'Small concession. Recheck center, development, and king safety.'
  }

  if (input.quality === 'ok') {
    return "Held. Improve the worst piece or name the rival's next threat."
  }

  return null
}
