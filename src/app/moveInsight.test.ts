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
    expect(insight({ san: 'Nf3', from: 'g1', to: 'f3', piece: 'n' })).toMatch(/minor piece/i)
  })

  it('warns on early queen moves', () => {
    expect(insight({ san: 'Qh5', from: 'd1', to: 'h5', piece: 'q' }, 3)).toMatch(/queen spoke early/)
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

  it('surfaces quality verdicts for quiet brilliant moves and blunders', () => {
    expect(moveInsightFor({
      move: { san: 'Re1', from: 'a1', to: 'e1', piece: 'r' },
      halfMoveCount: 18,
      materialAfterCp: 240,
      playerColor: 'w',
      mode: 'match',
      quality: 'brilliant',
    })).toMatch(/Archive judgment: brilliant/)

    expect(moveInsightFor({
      move: { san: 'Kh2', from: 'g1', to: 'h2', piece: 'k' },
      halfMoveCount: 18,
      materialAfterCp: -260,
      playerColor: 'w',
      mode: 'match',
      quality: 'blunder',
    })).toMatch(/line broke/)
  })

  it('keeps ordinary sound moves alive with a next-question prompt', () => {
    expect(moveInsightFor({
      move: { san: 'Re1', from: 'a1', to: 'e1', piece: 'r' },
      halfMoveCount: 16,
      materialAfterCp: 20,
      playerColor: 'w',
      mode: 'duel',
      quality: 'ok',
    })).toMatch(/Improve the worst piece/)
  })

  it('lets strong quality verdicts override capture material heuristics', () => {
    expect(moveInsightFor({
      move: { san: 'Bxd5', from: 'c4', to: 'd5', piece: 'b', captured: 'p' },
      halfMoveCount: 9,
      materialAfterCp: -120,
      playerColor: 'w',
      mode: 'match',
      quality: 'brilliant',
    })).toMatch(/Archive judgment: brilliant/)

    expect(moveInsightFor({
      move: { san: 'Qxg7', from: 'd4', to: 'g7', piece: 'q', captured: 'p' },
      halfMoveCount: 11,
      materialAfterCp: 140,
      playerColor: 'w',
      mode: 'match',
      quality: 'blunder',
    })).toMatch(/line broke/)
  })

  it('keeps decisive late-game verdicts while quieting ordinary late moves', () => {
    expect(moveInsightFor({
      move: { san: 'Qh7#', from: 'h5', to: 'h7', piece: 'q' },
      halfMoveCount: 42,
      materialAfterCp: 0,
      playerColor: 'w',
      mode: 'match',
    })).toMatch(/Mate inscribed/)

    expect(moveInsightFor({
      move: { san: 'Re1', from: 'a1', to: 'e1', piece: 'r' },
      halfMoveCount: 42,
      materialAfterCp: 240,
      playerColor: 'w',
      mode: 'match',
      quality: 'brilliant',
    })).toMatch(/Archive judgment: brilliant/)

    expect(moveInsightFor({
      move: { san: 'e4', from: 'e2', to: 'e4', piece: 'p' },
      halfMoveCount: 42,
      materialAfterCp: 0,
      playerColor: 'w',
      mode: 'match',
    })).toBeNull()
  })
})
