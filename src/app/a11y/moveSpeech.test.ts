import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { describeMove } from './moveSpeech'

function lastMove(fen: string, san: string) {
  const chess = new Chess(fen)
  return chess.move(san)
}

describe('describeMove', () => {
  it('names side, piece, and squares for a quiet move', () => {
    expect(describeMove(new Chess().move('Nf3'))).toBe('White knight g1 to f3.')
    const c = new Chess()
    c.move('e4')
    expect(describeMove(c.move('d5'))).toBe('Black pawn d7 to d5.')
  })

  it('names the captured piece and check', () => {
    const c = new Chess()
    for (const san of ['e4', 'e5', 'Bc4', 'Nc6']) c.move(san)
    expect(describeMove(c.move('Bxf7+'))).toBe('White bishop c4 takes pawn on f7, check.')
  })

  it('speaks castling, en passant, promotion, and mate plainly', () => {
    expect(describeMove(lastMove('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1', 'O-O-O'))).toBe('Black castles queenside.')
    expect(describeMove(lastMove('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', 'exd6'))).toBe(
      'White pawn e5 takes pawn en passant on d6.',
    )
    expect(describeMove(lastMove('8/P7/8/8/8/8/8/2K4k w - - 0 1', 'a8=Q+'))).toBe(
      'White pawn a7 to a8, promotes to queen, check.',
    )
    expect(describeMove(lastMove('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', 'Re8#'))).toBe(
      'White rook e1 to e8, checkmate.',
    )
  })
})
