import { describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import {
  chooseOpeningBookMove,
  getBookTopLines,
  openingSanBias,
  rankOpeningCandidates,
} from './openings'

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

  it('exposes distinct Rowan and Vega opening previews', () => {
    const nysa = getBookTopLines('nysa_frontier', 9)
    expect(nysa.map((line) => line.san)).toContain('g6')
    expect(nysa.map((line) => line.san)).toContain('Bg7')
    const cassian = getBookTopLines('cassian_paradox', 9)
    expect(cassian.map((line) => line.san)).toContain('Nf6')
    expect(getBookTopLines('kallistos_classical', 7).map((line) => line.san)).toContain('Be7')
    expect(getBookTopLines('gage_discipline', 9).map((line) => line.san)).toContain('d6')
    expect(getBookTopLines('helia_machine', 9).map((line) => line.san)).toContain('e6')
    expect(getBookTopLines('prax_precision', 9).map((line) => line.san)).toContain('c5')
    expect(getBookTopLines('iota_threshold', 9).map((line) => line.san)).toContain('c6')
    expect(getBookTopLines('mira_practical', 9).map((line) => line.san)).toContain('e5')
    expect(getBookTopLines('soren_answer', 9).map((line) => line.san)).toContain('g6')
    expect(getBookTopLines('voss_exchange', 9).map((line) => line.san)).toContain('d5')
    expect(getBookTopLines('elara_fork', 9).map((line) => line.san)).toContain('c5')

    const rowan = getBookTopLines('rowan_gambit', 9)
    const vega = getBookTopLines('vega_italian', 9)
    expect(rowan.map((line) => line.san)).toContain('exf4')
    expect(vega.map((line) => line.san)).toContain('Nf6')
    expect(rowan.map((line) => line.san).join(' ')).not.toBe(vega.map((line) => line.san).join(' '))
  })

  it('keeps Rowan and Vega book choices legal when their target moves fit the board', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const rowanPosition = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 2')
      expect(chooseOpeningBookMove(rowanPosition, 'rowan_gambit', 1)).toBe('exf4')

      const vegaPosition = new Chess('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 4')
      expect(chooseOpeningBookMove(vegaPosition, 'vega_italian', 1)).toBe('Nf6')
    } finally {
      vi.restoreAllMocks()
    }
  })

  it('openingSanBias rewards book moves and ignores off-book replies', () => {
    const c = new Chess()
    c.move('e4')
    const bookBias = openingSanBias(c, 'apprentice_court', 1, 'e5')
    const offBook = openingSanBias(c, 'apprentice_court', 1, 'c5')
    expect(bookBias).toBeGreaterThan(0)
    expect(offBook).toBe(0)
    expect(bookBias).toBeGreaterThan(offBook)
  })

  it('openingSanBias scales with book weight', () => {
    const c = new Chess()
    c.move('e4')
    const top = openingSanBias(c, 'apprentice_court', 1, 'e5')
    const alt = openingSanBias(c, 'apprentice_court', 1, 'd5')
    expect(top).toBeGreaterThan(alt)
  })

  it('rankOpeningCandidates exposes measurable rival repertoire differences', () => {
    const rowanPosition = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 2')
    const vegaPosition = new Chess('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 4')
    const rowanTop = rankOpeningCandidates(rowanPosition, 'rowan_gambit', 1)[0]?.san
    const vegaTop = rankOpeningCandidates(vegaPosition, 'vega_italian', 1)[0]?.san
    expect(rowanTop).toBe('exf4')
    expect(vegaTop).toBe('Nf6')
    expect(rowanTop).not.toBe(vegaTop)
  })

  it('rowan book bias favors exf4 over e5 on the gambit tabiya', () => {
    const c = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4PP2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 2')
    const exf4 = openingSanBias(c, 'rowan_gambit', 1, 'exf4')
    const e5 = openingSanBias(c, 'rowan_gambit', 1, 'e5')
    expect(exf4).toBeGreaterThan(e5)
  })
})
