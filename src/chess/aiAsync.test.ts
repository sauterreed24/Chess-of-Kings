import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import {
  findBestMoveAsync,
  getAiSearchSurface,
  preferredAiSearchSurface,
  setAiSearchSurface,
  terminateAiSearchWorker,
} from './aiAsync'

describe('aiAsync', () => {
  it('defaults to main-thread search and returns a legal move', async () => {
    setAiSearchSurface('main')
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 800, 'main')
    expect(move).not.toBeNull()
    expect(chess.moves()).toContain(move!.san)
  })

  it('worker surface returns a legal move when Worker is available', async () => {
    if (typeof Worker === 'undefined') return
    setAiSearchSurface('worker')
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 1200, 'worker')
    expect(move).not.toBeNull()
    expect(chess.moves()).toContain(move!.san)
    terminateAiSearchWorker()
  })

  it('reports preferred surface from localStorage flag', () => {
    setAiSearchSurface('worker')
    expect(getAiSearchSurface()).toBe('worker')
    setAiSearchSurface('main')
    expect(preferredAiSearchSurface()).toBe('main')
  })
})
