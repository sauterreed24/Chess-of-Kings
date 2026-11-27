import { describe, expect, it } from 'vitest'
import { readTrials, TRIALS_STORAGE_KEY } from './trials'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

describe('readTrials', () => {
  it('is empty by default: the game plays as authored', () => {
    expect([...readTrials('', memoryStorage())]).toEqual([])
  })

  it('turns a trial on from ?try= and remembers it under its own key', () => {
    const storage = memoryStorage()
    expect([...readTrials('?try=early-relief', storage)]).toEqual(['early-relief'])
    expect(storage.data.get(TRIALS_STORAGE_KEY)).toBe('["early-relief"]')
    expect([...storage.data.keys()]).toEqual([TRIALS_STORAGE_KEY])
    expect([...readTrials('', storage)]).toEqual(['early-relief'])
  })

  it('?try=off (or unknown ids) clears every trial', () => {
    const storage = memoryStorage({ [TRIALS_STORAGE_KEY]: '["early-relief"]' })
    expect([...readTrials('?try=off', storage)]).toEqual([])
    expect(storage.data.has(TRIALS_STORAGE_KEY)).toBe(false)
    expect([...readTrials('?try=nonsense', memoryStorage())]).toEqual([])
  })

  it('survives broken storage', () => {
    expect([...readTrials('', memoryStorage({ [TRIALS_STORAGE_KEY]: '{bad' }))]).toEqual([])
    expect([...readTrials('?try=early-relief', null)]).toEqual(['early-relief'])
  })
})
