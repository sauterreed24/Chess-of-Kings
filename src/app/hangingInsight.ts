import type { Chess, Color, PieceSymbol } from 'chess.js'
import { PIECE_VALUES } from '../chess/evaluate'

export interface HangingThreat {
  /** Square of the player piece the opponent can win the most material from. */
  square: string
  pieceType: PieceSymbol
  /** Estimated material (centipawns) the opponent nets from the capture. */
  oppGain: number
}

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

/** Minimum opponent gain (cp) worth surfacing — about an exchange or a clean
 *  minor piece. Keeps the signal high and avoids nagging over loose pawns. */
const MIN_GAIN = 160

/**
 * Called with the position AFTER the player's move (opponent on move). Finds the
 * player piece the opponent can win the most material from with an immediate
 * legal capture, using a one-exchange static estimate:
 *   - undefended piece → opponent wins its full value
 *   - defended piece   → opponent captures with its least valuable attacker and
 *                        the player recaptures, so the opponent nets
 *                        (piece value − cheapest attacker value)
 *
 * Building it from the opponent's *legal* captures means pinned or otherwise
 * illegal "attackers" never raise a false alarm. Returns null while the
 * opponent is in check (forcing dynamics differ) or when nothing meaningful
 * hangs.
 */
export function findHangingPiece(chess: Chess, playerColor: Color): HangingThreat | null {
  if (chess.isGameOver() || chess.inCheck()) return null
  const opp: Color = playerColor === 'w' ? 'b' : 'w'
  if (chess.turn() !== opp) return null

  type Agg = { capturedVal: number; minAttacker: number; type: PieceSymbol }
  const byTarget = new Map<string, Agg>()
  for (const m of chess.moves({ verbose: true })) {
    if (!m.captured) continue
    const attackerVal = PIECE_VALUES[m.piece]
    const prev = byTarget.get(m.to)
    if (!prev || attackerVal < prev.minAttacker) {
      byTarget.set(m.to, { capturedVal: PIECE_VALUES[m.captured], minAttacker: attackerVal, type: m.captured })
    }
  }

  let worst: HangingThreat | null = null
  for (const [square, info] of byTarget) {
    const defended = chess.attackers(square as Parameters<Chess['attackers']>[0], playerColor).length > 0
    const oppGain = defended ? info.capturedVal - info.minAttacker : info.capturedVal
    if (oppGain > (worst?.oppGain ?? 0)) {
      worst = { square, pieceType: info.type, oppGain }
    }
  }

  if (!worst || worst.oppGain < MIN_GAIN) return null
  return worst
}

export function hangingCoachTip(threat: HangingThreat): string {
  const name = PIECE_NAMES[threat.pieceType]
  return `Careful — your ${name} on ${threat.square} can be won. Defend it, move it, or make a bigger threat before you commit elsewhere.`
}
