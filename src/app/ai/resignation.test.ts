import { describe, expect, it } from 'vitest'
import { materialBalanceFromFen, piecesFromFen, rivalShouldResign } from './resignation'

const lost = [-1400, -1400, -1400]

describe('rival resignation rule', () => {
  it('resigns only after three straight turns a queen or more down, confirmed lost', () => {
    expect(rivalShouldResign({ rivalToMoveMaterial: [-1400, -1400], piecesExcludingKings: 3, confirmEvalCp: -1500 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveMaterial: lost, piecesExcludingKings: 3, confirmEvalCp: -1500 })).toBe(true)
    expect(rivalShouldResign({ rivalToMoveMaterial: [-1400, -1400, -1400, -400], piecesExcludingKings: 3, confirmEvalCp: -1500 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveMaterial: [-1400, -800, -1400], piecesExcludingKings: 3, confirmEvalCp: -1500 })).toBe(false)
  })

  it('fights on when the confirming search sees counterplay', () => {
    expect(rivalShouldResign({ rivalToMoveMaterial: lost, piecesExcludingKings: 3, confirmEvalCp: -300 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveMaterial: lost, piecesExcludingKings: 3, confirmEvalCp: 29_000 })).toBe(false)
  })

  it('fights on in the middlegame, even a queen down', () => {
    expect(rivalShouldResign({ rivalToMoveMaterial: lost, piecesExcludingKings: 9, confirmEvalCp: -1500 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveMaterial: lost, piecesExcludingKings: 8, confirmEvalCp: -1500 })).toBe(true)
  })

  it('reads material and pieces from FEN', () => {
    const fen = '7k/8/8/8/8/8/8/R2QK3 w - - 0 40'
    expect(materialBalanceFromFen(fen, 'b')).toBe(-1400)
    expect(materialBalanceFromFen(fen, 'w')).toBe(1400)
    expect(piecesFromFen(fen)).toBe(2)
    expect(materialBalanceFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'w')).toBe(0)
  })
})
