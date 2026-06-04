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
    return 'Mate inscribed. Replay the forcing path; every flight square closed by design.'
  }

  if (san === 'O-O' || san === 'O-O-O') {
    return 'King housed. The room gets quieter; now give the rooks a file to govern.'
  }

  if (input.quality === 'brilliant') {
    return 'Archive judgment: brilliant. You seized initiative; keep asking forcing questions.'
  }

  if (input.quality === 'blunder') {
    return 'Archive warning: the line broke. Before the reply, name every check, capture, and loose defender.'
  }

  if (input.quality === 'mistake') {
    return 'Archive warning: the line slipped. Spend one tempo on king safety, material, or coordination before chasing plans.'
  }

  if (halfMoveCount > 28) return null

  if (san.includes('x') && !san.includes('#')) {
    if (materialAfterCp < -50) {
      return 'Legal tribute, bad account. The position worsened; check recaptures and counter-threats before taking.'
    }
    return 'Material won. Finish the proof: what can the rival take next?'
  }

  if (halfMoveCount <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
    return 'The queen spoke early. Public authority becomes a target; develop knights and bishops first.'
  }

  if (san.endsWith('+') && !san.includes('x') && halfMoveCount <= 18 && materialAfterCp <= 20) {
    return 'A check without profit only teaches the king where to run. Give checks with a concrete follow-up.'
  }

  if (halfMoveCount <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
    return 'Wing pawn drift recorded. Let the edge wait until center and development are under seal.'
  }

  if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) {
    return 'Center claimed. Make it durable with a knight or bishop behind it.'
  }

  if (
    (move.piece === 'n' || move.piece === 'b') &&
    (playerColor === 'w' ? WHITE_BACK_RANK_MINORS : BLACK_BACK_RANK_MINORS).has(move.from)
  ) {
    return 'A minor piece joins the record. Finish development before asking it to serve twice.'
  }

  if (input.mode === 'calibration' && halfMoveCount <= 8) {
    return 'Calibration signal recorded. Tie the next move to center, development, or king safety.'
  }

  if (input.mode === 'freeplay' && halfMoveCount <= 10) {
    return 'Position updated. Ask what it attacks, guards, and leaves behind.'
  }

  if (input.quality === 'good') {
    return 'Archive judgment: sound. Convert the gain into development, safety, or a cleaner file.'
  }

  if (input.quality === 'inaccuracy') {
    return 'Small concession recorded. Recheck center, development, and king safety.'
  }

  return null
}
