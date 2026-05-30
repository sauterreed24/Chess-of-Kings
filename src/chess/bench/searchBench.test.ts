import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { BENCH_POSITIONS, runSearchBench } from './searchBench'
import { findBestMove, getLastSearchNodes } from '../ai'

describe('searchBench harness', () => {
  it('exposes canonical benchmark positions', () => {
    expect(BENCH_POSITIONS.length).toBeGreaterThanOrEqual(3)
    for (const pos of BENCH_POSITIONS) {
      expect(() => new Chess(pos.fen)).not.toThrow()
    }
  })

  it('records nodes and legal moves for a shallow depth sweep', () => {
    const report = runSearchBench({ depth: 2, timeLimitMs: 1500 })
    expect(report.results.length).toBe(BENCH_POSITIONS.length)
    expect(report.totalNodes).toBeGreaterThan(0)
    for (const row of report.results) {
      expect(row.nodes).toBeGreaterThan(0)
      expect(row.ms).toBeGreaterThanOrEqual(0)
      if (row.moveSan) {
        const c = new Chess(BENCH_POSITIONS.find((p) => p.id === row.id)!.fen)
        expect(c.moves()).toContain(row.moveSan)
      }
    }
  })

  it('getLastSearchNodes reflects the most recent search', () => {
    const chess = new Chess()
    findBestMove(chess, 2, 'classical', 800)
    expect(getLastSearchNodes()).toBeGreaterThan(10)
  })
})
