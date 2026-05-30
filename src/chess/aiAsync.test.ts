import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMoveAsync, preferredAiSearchSurface } from './aiAsync'

describe('aiAsync (non-breaking adapter)', () => {
  it('defaults to main-thread search and returns a legal move', async () => {
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 800)
    expect(move).not.toBeNull()
    expect(chess.moves()).toContain(move!.san)
  })

  it('worker surface falls back to main without throwing', async () => {
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 800, 'worker')
    expect(move).not.toBeNull()
  })

  it('reports main as the preferred surface', () => {
    expect(preferredAiSearchSurface()).toBe('main')
  })
})
