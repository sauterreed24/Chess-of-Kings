import { describe, expect, it } from 'vitest'
import { styleGradeFromPayload, turningPointLine } from './styleGrade'
import type { MoveQuality } from '../gameFlow'

describe('styleGradeFromPayload', () => {
  it('returns D for an empty log', () => {
    expect(styleGradeFromPayload({ sanLog: [], sanQuality: [] })).toBe('D')
  })

  it('grades by average quality, independent of game length', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
    const allBrilliant: MoveQuality[] = Array.from({ length: 6 }, () => 'brilliant' as const)
    expect(styleGradeFromPayload({ sanLog, sanQuality: allBrilliant })).toBe('S')

    const mostlyBest: MoveQuality[] = ['good', 'good', 'good', 'good', 'ok', 'ok']
    expect(styleGradeFromPayload({ sanLog, sanQuality: mostlyBest })).toBe('A')

    const solid: MoveQuality[] = ['good', 'ok', 'ok', 'ok', null, null]
    expect(styleGradeFromPayload({ sanLog, sanQuality: solid })).toBe('B')

    const shaky: MoveQuality[] = ['good', 'ok', 'inaccuracy', 'inaccuracy', null, null]
    expect(styleGradeFromPayload({ sanLog, sanQuality: shaky })).toBe('C')

    const lossy: MoveQuality[] = ['good', 'mistake', 'blunder', 'inaccuracy', null, null]
    expect(styleGradeFromPayload({ sanLog, sanQuality: lossy })).toBe('D')
  })

  it('a long solid game grades the same as a short one (no length inflation)', () => {
    const short: MoveQuality[] = ['ok', 'ok', 'ok']
    const long: MoveQuality[] = Array.from({ length: 30 }, () => 'ok' as const)
    const shortGrade = styleGradeFromPayload({ sanLog: ['a', 'b', 'c'], sanQuality: short })
    const longGrade = styleGradeFromPayload({
      sanLog: Array.from({ length: 30 }, () => 'x'),
      sanQuality: long,
    })
    expect(shortGrade).toBe(longGrade)
  })

  it('ignores null quality entries (no penalty, no bonus)', () => {
    const sanLog = ['e4', 'e5']
    expect(styleGradeFromPayload({ sanLog, sanQuality: [null, null] })).toBe('D')
    expect(styleGradeFromPayload({ sanLog, sanQuality: ['ok', null] })).toBe('B')
  })
})

describe('turningPointLine', () => {
  it('picks the largest eval swing toward the player when a trace is present', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bxf7+', 'Kxf7']
    const sanQuality: MoveQuality[] = ['good', null, 'good', null, 'good', null]
    /* White-positive trace: the rival's 3...Kxf7?? hands White +320. */
    const evalTrace = [20, 10, 25, 15, 30, 350]
    expect(turningPointLine({ sanLog, sanQuality, evalTrace, playerColor: 'w' })).toBe('3... Kxf7')
  })

  it('respects black perspective when reading the trace', () => {
    const sanLog = ['e4', 'e5', 'Qh5', 'Nc6']
    const sanQuality: MoveQuality[] = [null, 'good', null, 'good']
    /* White-positive trace falling means black is winning the exchange. */
    const evalTrace = [20, 10, -150, -160]
    expect(turningPointLine({ sanLog, sanQuality, evalTrace, playerColor: 'b' })).toBe('2. Qh5')
  })

  it('ignores a trace whose length drifted from the SAN log', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    const sanQuality: MoveQuality[] = ['ok', null, 'good', null]
    expect(
      turningPointLine({ sanLog, sanQuality, evalTrace: [500], playerColor: 'w' }),
    ).toBe('2. Nf3')
  })

  it('ignores a flat trace (no swing worth naming) and falls back to quality', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    const sanQuality: MoveQuality[] = ['ok', null, 'good', null]
    const evalTrace = [10, 12, 18, 14]
    expect(turningPointLine({ sanLog, sanQuality, evalTrace, playerColor: 'w' })).toBe('2. Nf3')
  })

  it('uses the first brilliant move when no trace is available', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
    const sanQuality: MoveQuality[] = ['ok', 'ok', 'good', 'ok', 'brilliant', 'mistake']
    expect(turningPointLine({ sanLog, sanQuality })).toBe('3. Bb5')
  })

  it('falls back to first good move when no brilliancy', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    const sanQuality: MoveQuality[] = ['ok', null, 'good', null]
    expect(turningPointLine({ sanLog, sanQuality })).toBe('2. Nf3')
  })

  it('falls back to last move when no good move', () => {
    const sanLog = ['e4', 'e5', 'Nf3']
    const sanQuality: MoveQuality[] = ['ok', null, null]
    expect(turningPointLine({ sanLog, sanQuality })).toBe('2. Nf3')
  })

  it('produces ... move-number suffix on black-side index', () => {
    const sanLog = ['e4', 'e5']
    const sanQuality: MoveQuality[] = [null, 'good']
    expect(turningPointLine({ sanLog, sanQuality })).toBe('1... e5')
  })

  it('returns ... SAN when log is empty', () => {
    expect(turningPointLine({ sanLog: [], sanQuality: [] })).toBe('1. ...')
  })
})
