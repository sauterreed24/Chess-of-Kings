import { Chess } from 'chess.js'
import { findBestMove, getLastSearchNodes } from '../ai'
import type { AIStyle } from '../evaluate'

export type BenchPosition = {
  id: string
  fen: string
  label: string
}

/** Canonical positions for repeatable search benchmarks. */
export const BENCH_POSITIONS: BenchPosition[] = [
  { id: 'start', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', label: 'Starting position' },
  { id: 'italian', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', label: 'Italian structure' },
  { id: 'endgame-rook', fen: '8/4k3/8/8/8/8/4R3/4K3 w - - 0 1', label: 'King + rook endgame' },
]

export type DepthBenchResult = {
  id: string
  depth: number
  nodes: number
  ms: number
  moveSan: string | null
}

export type SearchBenchReport = {
  style: AIStyle
  depth: number
  timeLimitMs: number
  results: DepthBenchResult[]
  totalNodes: number
  totalMs: number
}

/**
 * Runs a shallow depth sweep on fixed positions. Deterministic when time limits
 * are generous enough for each depth to complete.
 */
export function runSearchBench(opts: {
  depth?: number
  timeLimitMs?: number
  style?: AIStyle
  positions?: BenchPosition[]
} = {}): SearchBenchReport {
  const depth = opts.depth ?? 3
  const timeLimitMs = opts.timeLimitMs ?? 1200
  const style = opts.style ?? 'classical'
  const positions = opts.positions ?? BENCH_POSITIONS

  const results: DepthBenchResult[] = []
  let totalNodes = 0
  let totalMs = 0

  for (const pos of positions) {
    const chess = new Chess(pos.fen)
    const t0 = performance.now()
    const move = findBestMove(chess, depth, style, timeLimitMs)
    const ms = Math.round(performance.now() - t0)
    const nodes = getLastSearchNodes()
    totalNodes += nodes
    totalMs += ms
    results.push({
      id: pos.id,
      depth,
      nodes,
      ms,
      moveSan: move?.san ?? null,
    })
  }

  return { style, depth, timeLimitMs, results, totalNodes, totalMs }
}
