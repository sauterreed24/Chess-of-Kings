import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { Position } from './position'
import { legalMovesFen } from './index'

/* chess.js is the project's legality oracle (src/ARCHITECTURE.md invariant 5).
   These tests prove the engine's internal move generator agrees with the
   oracle on every position reached during randomized playouts, so the
   engine can search fast internally while the app still validates every
   final move through chess.js. */

function chessJsMoveSet(chess: Chess): string[] {
  return chess
    .moves({ verbose: true })
    .map((m) => m.from + m.to + (m.promotion ?? ''))
    .sort()
}

function seededRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const START_FENS = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
  '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
  'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
  '8/4k3/8/8/8/8/4P3/4K3 w - - 0 1',
]

describe('Crown Engine v2 vs chess.js oracle', () => {
  it('generates identical legal move sets across randomized playouts', () => {
    const rng = seededRng(0xc0a51e)
    for (const startFen of START_FENS) {
      for (let game = 0; game < 4; game++) {
        const chess = new Chess(startFen)
        for (let plyIndex = 0; plyIndex < 60; plyIndex++) {
          const oracleMoves = chessJsMoveSet(chess)
          const engineMoves = legalMovesFen(chess.fen()).sort()
          expect(engineMoves, `divergence at FEN ${chess.fen()}`).toEqual(oracleMoves)
          if (oracleMoves.length === 0) break
          const verbose = chess.moves({ verbose: true })
          chess.move(verbose[Math.floor(rng() * verbose.length)]!)
        }
      }
    }
  }, 60_000)

  it('keeps incremental state consistent through deep make/unmake walks', () => {
    const rng = seededRng(0xfeedbeef)
    const pos = new Position()
    for (const startFen of START_FENS) {
      pos.setFromFen(startFen)
      const fenBefore = pos.toFen()
      const walk = (depth: number): void => {
        if (depth === 0) return
        const moves: number[] = []
        pos.generateMoves(moves)
        for (const move of moves) {
          if (rng() < 0.55) continue
          const legal = pos.make(move)
          if (legal) {
            /* Incremental hash and accumulators must match a full recompute. */
            const incLo = pos.hashLo
            const incHi = pos.hashHi
            const incMg = pos.mg
            const incEg = pos.eg
            const roundTrip = new Position()
            roundTrip.setFromFen(pos.toFen())
            expect(roundTrip.hashLo, `hashLo drift at ${pos.toFen()}`).toBe(incLo)
            expect(roundTrip.hashHi, `hashHi drift at ${pos.toFen()}`).toBe(incHi)
            expect(roundTrip.mg, `mg drift at ${pos.toFen()}`).toBe(incMg)
            expect(roundTrip.eg, `eg drift at ${pos.toFen()}`).toBe(incEg)
            walk(depth - 1)
          }
          pos.unmake()
        }
      }
      walk(2)
      expect(pos.toFen(), 'unmake must restore the start position').toBe(fenBefore)
    }
  }, 60_000)

  it('round-trips FEN parse/emit exactly', () => {
    const pos = new Position()
    for (const fen of START_FENS) {
      pos.setFromFen(fen)
      expect(pos.toFen()).toBe(fen)
    }
  })
})
