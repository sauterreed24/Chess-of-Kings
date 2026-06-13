import { describe, expect, it } from 'vitest'
import { findCostliestMoment, plyMoveLabel } from './costliestMoment'

describe('findCostliestMoment', () => {
  it('finds the White player\'s worst move (largest own-eval drop)', () => {
    /* White plays plies 0,2,4. White-positive trace: ply 2 drops 30 -> -260
       (a 290cp blunder); ply 4 only slips 10cp. */
    const sanLog = ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6']
    const evalTrace = [25, 20, -260, -250, -240, -245]
    const m = findCostliestMoment(sanLog, evalTrace, 'w')
    expect(m).not.toBeNull()
    expect(m!.ply).toBe(2)
    expect(m!.san).toBe('Qh5')
    expect(m!.dropCp).toBe(280) /* before = evalTrace[1]=20, after = -260 */
  })

  it('scores from Black\'s perspective on odd plies', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Qf6']
    /* White-positive trace; Black blunders on ply 3 (their eval falls). */
    const evalTrace = [25, 20, 30, 320]
    const m = findCostliestMoment(sanLog, evalTrace, 'b')
    expect(m).not.toBeNull()
    expect(m!.ply).toBe(3) /* Black's move */
    /* before = -evalTrace[2] = -30, after = -320 -> drop 290 */
    expect(m!.dropCp).toBe(290)
  })

  it('ignores the opponent\'s blunders (only grades the player\'s plies)', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    /* The big swing is on ply 1 and 2 (opponent White moves for a Black player). */
    const evalTrace = [25, -400, -390, -395]
    const m = findCostliestMoment(sanLog, evalTrace, 'w')
    /* White player; their plies 0 and 2 are near-flat -> no costly move. */
    expect(m).toBeNull()
  })

  it('returns null for a clean game (no drop past the threshold)', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
    const evalTrace = [25, 20, 30, 25, 35, 30]
    expect(findCostliestMoment(sanLog, evalTrace, 'w')).toBeNull()
  })

  it('respects a custom threshold', () => {
    const sanLog = ['e4', 'e5', 'Bc4', 'Nc6']
    const evalTrace = [25, 20, -60, -55] /* ply 2 drops 80cp */
    expect(findCostliestMoment(sanLog, evalTrace, 'w', 120)).toBeNull()
    expect(findCostliestMoment(sanLog, evalTrace, 'w', 70)?.ply).toBe(2)
  })

  it('is defensive against mismatched or empty input', () => {
    expect(findCostliestMoment([], [], 'w')).toBeNull()
    expect(findCostliestMoment(['e4'], [], 'w')).toBeNull()
    expect(findCostliestMoment(['e4', 'e5'], [10], 'w')).toBeNull()
    expect(findCostliestMoment(['e4'], [Number.NaN], 'w')).toBeNull()
  })

  it('formats ply move labels for both colors', () => {
    expect(plyMoveLabel(0)).toBe('1.')
    expect(plyMoveLabel(1)).toBe('1...')
    expect(plyMoveLabel(8)).toBe('5.')
    expect(plyMoveLabel(9)).toBe('5...')
  })
})
