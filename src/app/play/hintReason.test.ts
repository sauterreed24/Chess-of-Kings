import { describe, expect, it } from 'vitest'
import { describeHint } from './hintReason'

describe('describeHint', () => {
  it('prioritizes mate, then castling, then a piece under pressure', () => {
    expect(describeHint({ san: 'Qh7#', piece: 'q' }, false)).toContain('checkmate')
    expect(describeHint({ san: 'O-O', piece: 'k' }, false)).toContain('Castle')
    expect(describeHint({ san: 'Be2', piece: 'b' }, true)).toContain('under pressure')
  })

  it('explains captures and checks', () => {
    expect(describeHint({ san: 'Bxf7', piece: 'b', captured: 'p' }, false)).toContain('capture')
    expect(describeHint({ san: 'Bb5+', piece: 'b' }, false)).toContain('check')
  })

  it('coaches development and central pawn play for quiet moves', () => {
    expect(describeHint({ san: 'Nf3', piece: 'n' }, false)).toContain('minor piece')
    expect(describeHint({ san: 'Rd1', piece: 'r' }, false)).toContain('major piece')
    expect(describeHint({ san: 'd4', piece: 'p' }, false)).toContain('centre')
  })

  it('does not flag a pawn as "under pressure" (pawns are cheap)', () => {
    expect(describeHint({ san: 'e4', piece: 'p' }, true)).toContain('centre')
  })

  it('falls back to a neutral nudge', () => {
    expect(describeHint({ san: 'Kg1', piece: 'k' }, false)).toContain('archive would choose')
  })
})
