/**
 * Turns the engine's recommended move into a short, teaching hint — a
 * nudge toward the idea, not engine notation. Pure and deterministic so
 * it can be unit-tested; the board separately highlights the piece to
 * move, so the words explain *why* rather than spelling out the square.
 */
export interface HintMove {
  san: string
  piece: string
  captured?: string
}

export function describeHint(move: HintMove, movedPieceUnderAttack: boolean): string {
  if (move.san.includes('#')) return 'There is a checkmate here — find the forcing finish.'
  if (move.san === 'O-O' || move.san === 'O-O-O') return 'Castle now — bring your king to safety.'
  if (movedPieceUnderAttack && move.piece !== 'p') {
    return 'This piece is under pressure — move it to safety or trade on your terms.'
  }
  if (move.captured) return 'Look for a capture — this one wins or wins back material.'
  if (move.san.includes('+')) return 'A forcing check keeps the initiative on your side.'
  if (move.piece === 'n' || move.piece === 'b') return 'Develop a minor piece toward the centre.'
  if (move.piece === 'r' || move.piece === 'q') return 'Bring a major piece to an open line.'
  if (move.piece === 'p') return 'A pawn move that stakes a claim in the centre.'
  return 'This is the move the archive would choose.'
}
