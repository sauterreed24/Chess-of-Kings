import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMove } from './ai'

describe('alpha-beta search pipeline', () => {
  it('finds a forced mate at the root under the normal tactical ordering path', () => {
    const chess = new Chess('7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1')

    const move = findBestMove(chess, 2, 'engine', 250)

    expect(move?.san).toBe('Rf8#')
  })
})

