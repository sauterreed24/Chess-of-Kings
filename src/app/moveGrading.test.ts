import { describe, expect, it } from 'vitest'
import { gradeMoveByEval } from './moveGrading'

describe('gradeMoveByEval', () => {
  it('grades near-best moves good and small slips ok', () => {
    expect(gradeMoveByEval({ povBefore: 20, povAfter: 15, offeredGain: 0 })).toBe('good')
    expect(gradeMoveByEval({ povBefore: 20, povAfter: -10, offeredGain: 0 })).toBe('ok')
  })

  it('grades by eval loss bands', () => {
    expect(gradeMoveByEval({ povBefore: 0, povAfter: -70, offeredGain: 0 })).toBe('inaccuracy')
    expect(gradeMoveByEval({ povBefore: 0, povAfter: -150, offeredGain: 0 })).toBe('mistake')
    expect(gradeMoveByEval({ povBefore: 0, povAfter: -400, offeredGain: 0 })).toBe('blunder')
  })

  it('a capture that loses the queen to the recapture is a blunder, not brilliant', () => {
    /* Static counting saw +500 (rook captured); the engine sees the queen
       falls next move: before +30, after -600. */
    expect(gradeMoveByEval({ povBefore: 30, povAfter: -600, offeredGain: 0 })).toBe('blunder')
  })

  it('a sound sacrifice grades brilliant, not blunder', () => {
    /* Bishop left en prise (offeredGain 330) while the engine still
       approves the position. */
    expect(gradeMoveByEval({ povBefore: 40, povAfter: 35, offeredGain: 330 })).toBe('brilliant')
  })

  it('no brilliancy label when already completely winning', () => {
    expect(gradeMoveByEval({ povBefore: 800, povAfter: 795, offeredGain: 330 })).toBe('good')
  })

  it('mercy rule: sloppy conversion while winning is an inaccuracy, not a blunder', () => {
    expect(gradeMoveByEval({ povBefore: 900, povAfter: 400, offeredGain: 0 })).toBe('inaccuracy')
    /* …but dropping from winning to lost is still a blunder. */
    expect(gradeMoveByEval({ povBefore: 900, povAfter: -200, offeredGain: 0 })).toBe('blunder')
  })

  it('positive swings never grade below good', () => {
    expect(gradeMoveByEval({ povBefore: -50, povAfter: 100, offeredGain: 0 })).toBe('good')
  })
})
