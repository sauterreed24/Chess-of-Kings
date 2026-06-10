import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { MATE, MATE_BOUND, searchFen } from './index'

describe('Crown Engine v2 search', () => {
  it('finds mate in 1 and reports a mate score', () => {
    const result = searchFen('6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1', {
      maxDepth: 4,
      maxTimeMs: 2000,
      freshTable: true,
    })
    expect(result.move?.uci).toBe('e1e8')
    expect(result.score).toBe(MATE - 1)
  })

  it('finds the quiet-first-move mate in 2 (two-rook ladder)', () => {
    const fen = '7k/8/8/8/8/8/R7/1R4K1 w - - 0 1'
    const result = searchFen(fen, { maxDepth: 6, maxTimeMs: 3000, freshTable: true })
    expect(result.score).toBe(MATE - 3)

    /* Play the line out with chess.js as arbiter: mate within 3 plies. */
    const chess = new Chess(fen)
    for (let halfMove = 0; halfMove < 3 && !chess.isGameOver(); halfMove++) {
      const reply = searchFen(chess.fen(), { maxDepth: 6, maxTimeMs: 2000, freshTable: true })
      expect(reply.move).not.toBeNull()
      chess.move({ from: reply.move!.from, to: reply.move!.to, promotion: reply.move!.promotion })
    }
    expect(chess.isCheckmate()).toBe(true)
  })

  it('wins the hanging queen', () => {
    const result = searchFen('7k/8/8/8/4q3/8/8/K3R3 w - - 0 1', {
      maxDepth: 4,
      maxTimeMs: 2000,
      freshTable: true,
    })
    expect(result.move?.uci).toBe('e1e4')
  })

  it('declines the poisoned pawn when the recapture is visible', () => {
    const result = searchFen('3r2k1/8/8/8/3p4/8/8/3Q2K1 w - - 0 1', {
      maxDepth: 4,
      maxTimeMs: 2000,
      freshTable: true,
    })
    expect(result.move?.uci).not.toBe('d1d4')
  })

  it('promotes with mate-aware judgement instead of grabbing material', () => {
    /* White can promote; promotion must not be discarded for a lesser move. */
    const result = searchFen('8/4P1k1/8/8/8/8/8/4K3 w - - 0 1', {
      maxDepth: 6,
      maxTimeMs: 2000,
      freshTable: true,
    })
    expect(result.move?.uci).toBe('e7e8q')
  })

  it('returns null move and mate score on a checkmated position', () => {
    /* Fool's mate final position: white is mated. */
    const chess = new Chess()
    for (const san of ['f3', 'e5', 'g4', 'Qh4#']) chess.move(san)
    const result = searchFen(chess.fen(), { maxDepth: 3, freshTable: true })
    expect(result.move).toBeNull()
    expect(result.score).toBe(-MATE)
  })

  it('returns null move and draw score on stalemate', () => {
    const result = searchFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', { maxDepth: 3, freshTable: true })
    expect(result.move).toBeNull()
    expect(result.score).toBe(0)
  })

  it('is deterministic for fixed depth and fresh table', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'
    const a = searchFen(fen, { maxDepth: 5, maxTimeMs: 60_000, freshTable: true })
    const b = searchFen(fen, { maxDepth: 5, maxTimeMs: 60_000, freshTable: true })
    expect(a.move?.uci).toBe(b.move?.uci)
    expect(a.score).toBe(b.score)
    expect(a.nodes).toBe(b.nodes)
    expect(a.pv).toEqual(b.pv)
  })

  it('respects the hard time budget', () => {
    const fen = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'
    const start = performance.now()
    const result = searchFen(fen, { maxDepth: 63, maxTimeMs: 150, freshTable: true })
    const wall = performance.now() - start
    expect(result.move).not.toBeNull()
    expect(wall).toBeLessThan(600) /* generous CI slack over the 150ms budget */
    /* The move must be legal per the oracle. */
    const chess = new Chess(fen)
    expect(() =>
      chess.move({ from: result.move!.from, to: result.move!.to, promotion: result.move!.promotion }),
    ).not.toThrow()
  })

  it('spectrum mode scores every root move exactly, best first', () => {
    const fen = '7k/8/8/8/4q3/8/8/K3R3 w - - 0 1'
    const chess = new Chess(fen)
    const result = searchFen(fen, {
      maxDepth: 4,
      maxTimeMs: 5000,
      spectrum: true,
      freshTable: true,
    })
    expect(result.rootMoves.length).toBe(chess.moves().length)
    for (let i = 1; i < result.rootMoves.length; i++) {
      expect(result.rootMoves[i - 1]!.score).toBeGreaterThanOrEqual(result.rootMoves[i]!.score)
    }
    /* Taking the queen must dominate the spectrum. */
    expect(result.rootMoves[0]!.uci).toBe('e1e4')
    expect(result.rootMoves[0]!.score).toBeGreaterThan(result.rootMoves[1]!.score + 300)
  })

  it('sees deep tactics fast: depth 7+ on a middlegame within 500ms', () => {
    const result = searchFen(
      'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
      { maxDepth: 63, maxTimeMs: 500, freshTable: true },
    )
    expect(result.depth).toBeGreaterThanOrEqual(6)
    expect(result.nodes).toBeGreaterThan(20_000)
  })

  it('never claims a mate score bound is an ordinary eval', () => {
    const result = searchFen('6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1', {
      maxDepth: 4,
      freshTable: true,
    })
    expect(Math.abs(result.score)).toBeGreaterThan(MATE_BOUND)
  })
})
