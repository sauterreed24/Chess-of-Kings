import { describe, expect, it } from 'vitest'
import { dayKey, readStreak, recordToday, type StreakStorage } from './streak'

function memoryStore(initial: string | null = null): StreakStorage & { value: string | null } {
  const s = {
    value: initial,
    read() {
      return s.value
    },
    write(v: string) {
      s.value = v
    },
  }
  return s
}

describe('dayKey', () => {
  it('formats a date as YYYY-MM-DD in local time', () => {
    const d = new Date(2026, 3, 28, 14, 12, 0) /* Apr 28, 2026 14:12 local */
    expect(dayKey(d)).toBe('2026-04-28')
  })

  it('zero-pads month and day', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('readStreak', () => {
  it('returns zero state when storage is empty', () => {
    expect(readStreak(memoryStore(null))).toEqual({ count: 0, lastDayKey: '' })
  })

  it('returns zero state when storage is corrupt', () => {
    expect(readStreak(memoryStore('not-json'))).toEqual({ count: 0, lastDayKey: '' })
  })

  it('round-trips a previously written state', () => {
    const store = memoryStore(JSON.stringify({ count: 3, lastDayKey: '2026-04-28' }))
    expect(readStreak(store)).toEqual({ count: 3, lastDayKey: '2026-04-28' })
  })

  it('clamps negative or non-numeric counts to zero', () => {
    expect(readStreak(memoryStore(JSON.stringify({ count: -2, lastDayKey: 'x' })))).toEqual({
      count: 0,
      lastDayKey: 'x',
    })
    expect(readStreak(memoryStore(JSON.stringify({ count: 'oops', lastDayKey: 'x' })))).toEqual({
      count: 0,
      lastDayKey: 'x',
    })
  })
})

describe('recordToday', () => {
  it('first record establishes a streak of 1', () => {
    const store = memoryStore(null)
    const r = recordToday(new Date(2026, 3, 28), store)
    expect(r.state).toEqual({ count: 1, lastDayKey: '2026-04-28' })
    expect(r.isFreshDay).toBe(true)
    expect(r.wasReset).toBe(false)
  })

  it('same-day repeat does not change anything', () => {
    const store = memoryStore(JSON.stringify({ count: 4, lastDayKey: '2026-04-28' }))
    const r = recordToday(new Date(2026, 3, 28, 23, 0), store)
    expect(r.state.count).toBe(4)
    expect(r.isFreshDay).toBe(false)
  })

  it('consecutive-day increments by 1', () => {
    const store = memoryStore(JSON.stringify({ count: 4, lastDayKey: '2026-04-28' }))
    const r = recordToday(new Date(2026, 3, 29), store)
    expect(r.state).toEqual({ count: 5, lastDayKey: '2026-04-29' })
    expect(r.isFreshDay).toBe(true)
    expect(r.wasReset).toBe(false)
  })

  it('a 2+ day gap resets the streak to 1 and flags wasReset when the prior streak was > 1', () => {
    const store = memoryStore(JSON.stringify({ count: 9, lastDayKey: '2026-04-25' }))
    const r = recordToday(new Date(2026, 3, 28), store)
    expect(r.state).toEqual({ count: 1, lastDayKey: '2026-04-28' })
    expect(r.isFreshDay).toBe(true)
    expect(r.wasReset).toBe(true)
  })

  it('a clock that goes backward leaves prior state untouched', () => {
    const store = memoryStore(JSON.stringify({ count: 3, lastDayKey: '2026-04-28' }))
    const r = recordToday(new Date(2026, 3, 25), store)
    expect(r.state.count).toBe(1)
    expect(r.isFreshDay).toBe(true)
    expect(r.wasReset).toBe(true)
  })
})
