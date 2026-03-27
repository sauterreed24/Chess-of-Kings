import type { Color, PieceSymbol } from 'chess.js'
import type { PieceSkinId } from '../types'

const CLASSIC: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
}

const HIGH_CONTRAST: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' },
  b: { p: 'p', n: 'n', b: 'b', r: 'r', q: 'q', k: 'k' },
}

const ORNATE: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♛', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♕', k: '♚' },
}

const NEON: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '◉', n: '▲', b: '◆', r: '■', q: '✦', k: '✶' },
  b: { p: '◎', n: '△', b: '◇', r: '□', q: '✧', k: '✴' },
}

export const PIECE_SKIN_LABEL: Record<PieceSkinId, string> = {
  'classic-royal': 'Classic Royal',
  'high-contrast': 'High Contrast Tournament',
  'alexandrine-ornate': 'Alexandrine Ornate',
  'obsidian-neon': 'Obsidian Neon',
}

export const PIECE_SKIN_MAP: Record<PieceSkinId, Record<Color, Record<PieceSymbol, string>>> = {
  'classic-royal': CLASSIC,
  'high-contrast': HIGH_CONTRAST,
  'alexandrine-ornate': ORNATE,
  'obsidian-neon': NEON,
}

export function glyphForSkin(
  skin: PieceSkinId,
  color: Color,
  piece: PieceSymbol,
): string {
  return PIECE_SKIN_MAP[skin]?.[color]?.[piece] ?? PIECE_SKIN_MAP['classic-royal'][color][piece]
}
