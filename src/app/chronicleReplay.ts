import { Chess } from 'chess.js'
import type { MatchHistoryEntry, PieceSkinId } from '../types'
import { glyphForSkin } from '../chess/skins'
import { devWarn } from './devLog'
import { escapeHtml } from './htmlEscape'

export function buildReplayFens(entry: MatchHistoryEntry): string[] {
  const startFen = entry.replayStartFen ?? new Chess().fen()
  let root: Chess
  try {
    root = new Chess(startFen)
  } catch {
    root = new Chess()
  }
  const out = [root.fen()]
  for (const san of entry.replaySans ?? []) {
    try {
      root.move(san)
      out.push(root.fen())
    } catch {
      break
    }
  }
  return out
}

export function formatEchoTimeline(entry: MatchHistoryEntry, plyIndex: number): string {
  const moves = entry.replaySans ?? []
  if (!moves.length) return '<p class="ledger-empty">No echo timeline recorded yet.</p>'
  const rows = moves.map((san, i) => {
    const marker = san === entry.turningPointSan ? ' echo-turning' : ''
    const active = i === plyIndex ? ' echo-active' : ''
    return `<span class="echo-move${marker}${active}">${i + 1}. ${escapeHtml(san)}</span>`
  }).join('')
  return `<div class="echo-line">${rows}</div>`
}

export function renderEchoBoardFen(fen: string, skin: PieceSkinId): string {
  let c: Chess
  try {
    c = new Chess(fen)
  } catch {
    devWarn('renderEchoBoardFen: invalid FEN, using start position', fen)
    c = new Chess()
  }
  const board = c.board()
  let html = '<div class="echo-board">'
  for (let r = 7; r >= 0; r--) {
    for (let f = 0; f < 8; f++) {
      const dark = (r + f) % 2 === 1
      const square = board[7 - r]?.[f]
      const glyph = square ? glyphForSkin(skin, square.color, square.type) : ''
      html += `<span class="echo-sq ${dark ? 'echo-sq--dark' : 'echo-sq--light'}">${glyph}</span>`
    }
  }
  html += '</div>'
  return html
}
