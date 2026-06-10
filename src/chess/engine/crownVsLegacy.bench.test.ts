import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMove, getLastSearchNodes } from '../legacyAi'
import { searchFen } from './index'

/* Evidence harness: Crown Engine v2 vs the legacy chess.js-walking search.
   The full match is slow and stochastic, so it only runs when explicitly
   requested:  CROWN_MATCH=1 npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts
   The NPS comparison always runs (fast, informative, stable). */

const BENCH_FENS = [
  ['start', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'],
  ['italian', 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'],
  ['kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'],
  ['rook endgame', '8/4k3/8/8/8/8/4R3/4K3 w - - 0 1'],
] as const

describe('Crown v2 vs legacy throughput', () => {
  it('searches at least 10x the legacy nodes in the same time budget', () => {
    const budgetMs = 300
    let crownTotal = 0
    let legacyTotal = 0
    const rows: string[] = []
    for (const [name, fen] of BENCH_FENS) {
      const crown = searchFen(fen, { maxDepth: 63, maxTimeMs: budgetMs, freshTable: true })
      const chess = new Chess(fen)
      findBestMove(chess, 24, 'classical', budgetMs)
      const legacyNodes = getLastSearchNodes()
      crownTotal += crown.nodes
      legacyTotal += legacyNodes
      rows.push(
        `${name}: crown ${crown.nodes} nodes (depth ${crown.depth}) vs legacy ${legacyNodes} nodes`,
      )
    }
    console.info(`[crown-vs-legacy ${budgetMs}ms/position]\n  ${rows.join('\n  ')}`)
    expect(crownTotal).toBeGreaterThan(legacyTotal * 10)
  }, 30_000)
})

describe.runIf(process.env.CROWN_MATCH === '1')('Crown v2 vs legacy match', () => {
  it('wins a head-to-head match decisively at equal time controls', () => {
    const msPerMove = 200
    const games = 8
    let crownWins = 0
    let legacyWins = 0
    let draws = 0

    for (let game = 0; game < games; game++) {
      const crownPlaysWhite = game % 2 === 0
      const chess = new Chess()
      let plies = 0
      while (!chess.isGameOver() && plies < 300) {
        const crownToMove = (chess.turn() === 'w') === crownPlaysWhite
        if (crownToMove) {
          const result = searchFen(chess.fen(), { maxDepth: 63, maxTimeMs: msPerMove })
          if (!result.move) break
          chess.move({ from: result.move.from, to: result.move.to, promotion: result.move.promotion })
        } else {
          const move = findBestMove(chess, 24, 'classical', msPerMove)
          if (!move) break
          chess.move(move)
        }
        plies++
      }
      if (chess.isCheckmate()) {
        const loserIsWhite = chess.turn() === 'w'
        if (loserIsWhite === crownPlaysWhite) legacyWins++
        else crownWins++
      } else {
        draws++
      }
      console.info(
        `[match] game ${game + 1}: crown=${crownWins} legacy=${legacyWins} draws=${draws} (plies ${plies})`,
      )
    }
    console.info(`[match final] crown ${crownWins} / legacy ${legacyWins} / draws ${draws}`)
    expect(crownWins).toBeGreaterThan(legacyWins)
  }, 600_000)
})
