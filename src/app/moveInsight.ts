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
  if (halfMoveCount > 28) return null

  if (san.includes('#')) {
    return 'Mate entered in the archive. Review the forcing path that made flight impossible.'
  }

  if (san === 'O-O' || san === 'O-O-O') {
    return 'King housed. The court is safer now; bring the rooks into the same argument.'
  }

  if (san.includes('x') && !san.includes('#')) {
    if (materialAfterCp < -50) {
      return 'The capture was legal, not yet wise. The position worsened; check recaptures and counter-threats before taking tribute.'
    }
    return 'Material won. Complete the proof by checking what the rival can take in return.'
  }

  if (input.quality === 'brilliant') {
    return 'Archive judgment: brilliant. You changed the initiative; keep asking forcing questions.'
  }

  if (input.quality === 'blunder') {
    return 'Archive warning: the line cracked sharply. Before the reply, name every check, capture, and loose defender.'
  }

  if (input.quality === 'mistake') {
    return 'Archive warning: the line slipped. Spend the next tempo repairing king safety, material, or coordination before chasing plans.'
  }

  if (halfMoveCount <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
    return 'The queen has spoken early. Exposed authority becomes a target; develop knights and bishops first.'
  }

  if (san.endsWith('+') && !san.includes('x') && halfMoveCount <= 18 && materialAfterCp <= 20) {
    return 'A check without profit only teaches the king where to flee. Give checks with a concrete follow-up.'
  }

  if (halfMoveCount <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
    return 'Wing pawn drift recorded. The edge can wait until the center and development are under seal.'
  }

  if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) {
    return 'Center claimed. Now make the claim durable with a knight or bishop behind it.'
  }

  if (
    (move.piece === 'n' || move.piece === 'b') &&
    (playerColor === 'w' ? WHITE_BACK_RANK_MINORS : BLACK_BACK_RANK_MINORS).has(move.from)
  ) {
    return 'A minor piece joins the record. Finish development before asking the same piece to serve twice.'
  }

  if (input.mode === 'calibration' && halfMoveCount <= 8) {
    return 'Calibration signal recorded. Tie the next move to center, development, or king safety.'
  }

  if (input.mode === 'freeplay' && halfMoveCount <= 10) {
    return 'Position updated. Ask what the move attacks, what it guards, and what it leaves behind.'
  }

  if (input.quality === 'good') {
    return 'Archive judgment: sound. Convert the gain into development, king safety, or a cleaner file.'
  }

  if (input.quality === 'inaccuracy') {
    return 'Small concession recorded. Recheck whether the move improved center, development, or king safety.'
  }

  return null
}
