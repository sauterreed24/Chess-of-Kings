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
  opponentKey?: string | null
}

const CENTER_SQUARES = new Set<Square>(['d4', 'e4', 'd5', 'e5'])
const WHITE_BACK_RANK_MINORS = new Set<Square>(['b1', 'c1', 'f1', 'g1'])
const BLACK_BACK_RANK_MINORS = new Set<Square>(['b8', 'c8', 'f8', 'g8'])

function doctrineLabel(key: string | null | undefined): string | null {
  const k = key?.toLowerCase() ?? ''
  if (k.includes('amara')) return 'Amara symmetry'
  if (k.includes('lukas')) return 'Lukas theory'
  if (k.includes('edred')) return 'Edred threats'
  if (k.includes('marius')) return 'Marius structure'
  if (k.includes('demetrios')) return 'Demetrios office'
  if (k.includes('rowan')) return 'Rowan fire'
  if (k.includes('vega')) return 'Vega pressure'
  if (k.includes('alexion')) return 'Alexion law'
  if (k.includes('counterpart') || k.includes('apotheosis') || k.includes('boss')) return 'Court synthesis'
  return null
}

export function moveInsightFor(input: MoveInsightInput): string | null {
  const { move, halfMoveCount, materialAfterCp, playerColor } = input
  const san = move.san
  const doctrine = doctrineLabel(input.opponentKey)

  if (san.includes('#')) {
    return 'Mate sealed. Replay the path; every flight square closed.'
  }

  if (san === 'O-O' || san === 'O-O-O') {
    if (doctrine) return `King housed vs ${doctrine}. Make the attack pay.`
    return 'King housed. Put a rook on a file.'
  }

  if (input.quality === 'brilliant') {
    return 'Brilliant. Keep asking forcing questions.'
  }

  if (input.quality === 'blunder') {
    return 'The line broke. Name checks, captures, loose defenders.'
  }

  if (input.quality === 'mistake') {
    return 'The line slipped. Spend one tempo on safety or coordination.'
  }

  if (halfMoveCount > 28) return null

  if (san.includes('x') && !san.includes('#')) {
    if (materialAfterCp < -50) {
      return 'Legal capture, bad account. Position worsened; check recaptures.'
    }
    return 'Material won. Ask what the rival can take next.'
  }

  if (halfMoveCount <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
    return 'Queen too early. Authority becomes a target; develop minors first.'
  }

  if (san.endsWith('+') && !san.includes('x') && halfMoveCount <= 18 && materialAfterCp <= 20) {
    return 'Checks without profit show exits. Give checks with a concrete follow-up.'
  }

  if (halfMoveCount <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
    return 'Edge pawn early. Let the wing wait until center and development are ready.'
  }

  if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) {
    if (doctrine) return `Center claimed vs ${doctrine}. Back it with a knight or bishop.`
    return 'Center claimed. Back it with a knight or bishop.'
  }

  if (
    (move.piece === 'n' || move.piece === 'b') &&
    (playerColor === 'w' ? WHITE_BACK_RANK_MINORS : BLACK_BACK_RANK_MINORS).has(move.from)
  ) {
    if (doctrine) return `Developed vs ${doctrine}. Finish the rest before moving twice.`
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
    if (doctrine) return `Held vs ${doctrine}. Improve worst piece or name next threat.`
    return 'Held. Improve worst piece or name the next threat.'
  }

  return null
}
