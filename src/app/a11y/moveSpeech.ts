/**
 * Spoken description of a move for the live-region announcer.
 *
 * Sighted players see the rival's reply land on the board; screen-reader
 * players otherwise heard only "White to move." and had to explore the
 * board square by square to learn what changed. Pure: the caller decides
 * when to speak (the opponent's moves only).
 */
import type { Move } from 'chess.js'

const PIECE: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

export type SpokenMove = Pick<Move, 'color' | 'piece' | 'from' | 'to' | 'san' | 'flags'> &
  Partial<Pick<Move, 'captured' | 'promotion'>>

/** e.g. "Black knight g8 to f6.", "White bishop c4 takes pawn on f7, check." */
export function describeMove(m: SpokenMove): string {
  const side = m.color === 'w' ? 'White' : 'Black'
  const piece = PIECE[m.piece] ?? m.piece
  let line: string
  if (m.flags.includes('k')) line = `${side} castles kingside`
  else if (m.flags.includes('q')) line = `${side} castles queenside`
  else if (m.flags.includes('e')) line = `${side} pawn ${m.from} takes pawn en passant on ${m.to}`
  else if (m.captured) line = `${side} ${piece} ${m.from} takes ${PIECE[m.captured] ?? m.captured} on ${m.to}`
  else line = `${side} ${piece} ${m.from} to ${m.to}`
  if (m.promotion) line += `, promotes to ${PIECE[m.promotion] ?? m.promotion}`
  if (m.san.endsWith('#')) line += ', checkmate'
  else if (m.san.endsWith('+')) line += ', check'
  return `${line}.`
}
