import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMove } from './ai'

describe('alpha-beta search pipeline', () => {
  it('finds a forced mate at the root under the normal tactical ordering path', () => {
    const chess = new Chess('7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1')

    const move = findBestMove(chess, 2, 'engine', 250)

    expect(move?.san).toBe('Rf8#')
  })

  it('prioritizes winning an undefended queen in a quiet material position', () => {
    const chess = new Chess('7k/8/8/8/4q3/8/8/K3R3 w - - 0 1')

    const move = findBestMove(chess, 2, 'engine', 250)

    expect(move?.san).toBe('Rxe4')
  })

  it('does not chase a poisoned pawn when the recapture is visible', () => {
    const chess = new Chess('3r2k1/8/8/8/3p4/8/8/3Q2K1 w - - 0 1')

    const move = findBestMove(chess, 2, 'engine', 250)

    expect(move?.san).not.toBe('Qxd4')
  })
})
