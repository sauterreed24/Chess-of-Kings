import { describe, expect, it } from 'vitest'
import { styleGradeFromPayload, turningPointLine } from './styleGrade'
import type { MoveQuality } from '../gameFlow'

describe('styleGradeFromPayload', () => {
  it('returns D for an empty log', () => {
    expect(styleGradeFromPayload({ sanLog: [], sanQuality: [] })).toBe('D')
  })

  it('aggregates quality scores into letter bands', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
    const allBrilliant: MoveQuality[] = ['brilliant', 'brilliant', 'brilliant', 'brilliant', 'brilliant', 'brilliant']
    expect(styleGradeFromPayload({ sanLog, sanQuality: allBrilliant })).toBe('S')

    const mixedAGood: MoveQuality[] = ['good', 'good', 'good', 'good', 'ok', 'ok']
    expect(styleGradeFromPayload({ sanLog, sanQuality: mixedAGood })).toBe('A')

    const mixedB: MoveQuality[] = ['good', 'ok', 'ok', 'ok', null, null]
    expect(styleGradeFromPayload({ sanLog, sanQuality: mixedB })).toBe('B')

    const lossy: MoveQuality[] = ['good', 'mistake', 'blunder', 'inaccuracy', null, null]
    expect(styleGradeFromPayload({ sanLog, sanQuality: lossy })).toBe('D')
  })

  it('ignores null quality entries (no penalty, no bonus)', () => {
    const sanLog = ['e4', 'e5']
    expect(styleGradeFromPayload({ sanLog, sanQuality: [null, null] })).toBe('D')
    expect(styleGradeFromPayload({ sanLog, sanQuality: ['ok', null] })).toBe('C')
  })
})

describe('turningPointLine', () => {
  it('uses the first brilliant move when present', () => {
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
