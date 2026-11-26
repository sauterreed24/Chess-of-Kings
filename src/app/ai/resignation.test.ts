import { describe, expect, it } from 'vitest'
import { rivalShouldResign } from './resignation'

describe('rival resignation rule', () => {
  it('resigns only after three straight lost evaluations', () => {
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200], materialBalanceCp: -1400, piecesExcludingKings: 4 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -950, -1200], materialBalanceCp: -1400, piecesExcludingKings: 4 })).toBe(true)
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200, -1200, -400], materialBalanceCp: -1400, piecesExcludingKings: 4 })).toBe(false)
  })

  it('needs a real material deficit (no resigning into a mating attack)', () => {
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200, -1200], materialBalanceCp: -500, piecesExcludingKings: 4 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200, -1200], materialBalanceCp: -900, piecesExcludingKings: 4 })).toBe(true)
  })

  it('fights on in the middlegame, even a queen down', () => {
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200, -1200], materialBalanceCp: -1000, piecesExcludingKings: 9 })).toBe(false)
    expect(rivalShouldResign({ rivalToMoveEvals: [-1200, -1200, -1200], materialBalanceCp: -1000, piecesExcludingKings: 8 })).toBe(true)
  })

  it('never resigns a position the eval says is holding', () => {
    expect(rivalShouldResign({ rivalToMoveEvals: [-850, -899, -880], materialBalanceCp: -2000, piecesExcludingKings: 4 })).toBe(false)
  })
})
