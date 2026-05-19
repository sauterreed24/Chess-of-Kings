import { describe, expect, it } from 'vitest'
import { moveInsightFor, type MoveInsightMove } from './moveInsight'

function insight(move: MoveInsightMove, halfMoveCount = 1, materialAfterCp = 0) {
  return moveInsightFor({
    move,
    halfMoveCount,
    materialAfterCp,
    playerColor: 'w',
    mode: 'match',
  })
}

describe('move insight', () => {
  it('coaches center pawn claims', () => {
    expect(insight({ san: 'e4', from: 'e2', to: 'e4', piece: 'p' })).toMatch(/Center claimed/)
  })

  it('coaches minor-piece development', () => {
    expect(insight({ san: 'Nf3', from: 'g1', to: 'f3', piece: 'n' })).toMatch(/Minor piece developed/)
  })

  it('warns on early queen moves', () => {
    expect(insight({ san: 'Qh5', from: 'd1', to: 'h5', piece: 'q' }, 3)).toMatch(/Early queens/)
  })

  it('warns on opening wing pawn drift', () => {
    expect(insight({ san: 'a4', from: 'a2', to: 'a4', piece: 'p' }, 3)).toMatch(/Wing pawn/)
  })

  it('coaches castling as king safety', () => {
    expect(insight({ san: 'O-O', from: 'e1', to: 'g1', piece: 'k' }, 9)).toMatch(/King housed/)
  })

  it('distinguishes sound and unsafe captures', () => {
    expect(insight({ san: 'Bxd5', from: 'c4', to: 'd5', piece: 'b', captured: 'p' }, 9, 120)).toMatch(/Material won/)
    expect(insight({ san: 'Bxd5', from: 'c4', to: 'd5', piece: 'b', captured: 'p' }, 9, -120)).toMatch(/position worsened/)
  })

  it('warns on speculative checks', () => {
    expect(insight({ san: 'Qh5+', from: 'd1', to: 'h5', piece: 'q' }, 7, 0)).toMatch(/concrete follow-up/)
  })
})
