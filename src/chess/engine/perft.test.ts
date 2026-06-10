import { describe, expect, it } from 'vitest'
import { perftFen } from './perft'

/* Published reference perft values (chessprogramming.org/Perft_Results).
   An exact match proves move generation, make/unmake, castling, en passant,
   promotion, pins, and check handling are all correct. */

const CASES: Array<{ name: string; fen: string; depths: number[] }> = [
  {
    name: 'initial position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    depths: [20, 400, 8902, 197281],
  },
  {
    name: 'kiwipete (castling/EP/pin torture)',
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    depths: [48, 2039, 97862],
  },
  {
    name: 'position 3 (EP discovered check)',
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    depths: [14, 191, 2812, 43238],
  },
  {
    name: 'position 4 (promotions, underpromotion checks)',
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    depths: [6, 264, 9467],
  },
  {
    name: 'position 5 (castling rights edge cases)',
    fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    depths: [44, 1486, 62379],
  },
  {
    name: 'position 6 (balanced middlegame)',
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    depths: [46, 2079, 89890],
  },
]

describe('Crown Engine v2 perft', () => {
  for (const { name, fen, depths } of CASES) {
    it(`matches reference counts — ${name}`, () => {
      for (let depth = 1; depth <= depths.length; depth++) {
        expect(perftFen(fen, depth), `${name} depth ${depth}`).toBe(depths[depth - 1])
      }
    }, 60_000)
  }
})
