import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { chooseOpeningBookMove, getBookTopLines } from './openings'

describe('opening books', () => {
  it('returns legal weighted SAN for known profile', () => {
    const c = new Chess()
    c.move('e4')
    const san = chooseOpeningBookMove(c, 'apprentice_court', 1)
    expect(typeof san === 'string' || san === null).toBe(true)
    if (san) {
      const clone = new Chess(c.fen())
      expect(() => clone.move(san)).not.toThrow()
    }
  })

  it('books odd plies index black replies — ply 1 after 1.e4, not ply 2', () => {
    const c = new Chess()
    c.move('e4')
    expect(c.turn()).toBe('b')
    expect(chooseOpeningBookMove(c, 'alexion_mentor', 1)).not.toBeNull()
    expect(chooseOpeningBookMove(c, 'alexion_mentor', 2)).toBeNull()
  })

  it('returns null when profile or ply has no line', () => {
    const c = new Chess()
    expect(chooseOpeningBookMove(c, 'unknown_profile', 1)).toBeNull()
    expect(chooseOpeningBookMove(c, 'novice_court', 99)).toBeNull()
  })

  it('returns deterministic top-line opening previews', () => {
    const lines = getBookTopLines('alexion_apex', 9)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines[0]?.ply).toBe(1)
    expect(typeof lines[0]?.san).toBe('string')
  })
})
