import { Chess } from 'chess.js'
import { findBestMove, getLastSearchNodes } from '../ai'
import type { AIStyle } from '../evaluate'

export type WorkerSearchRequest = {
  id: number
  fen: string
  maxDepth: number
  style: AIStyle
  timeLimitMs: number
}

export type WorkerSearchResponse = {
  id: number
  nodes: number
  san: string | null
  from?: string
  to?: string
  promotion?: string
  error?: string
}

self.onmessage = (event: MessageEvent<WorkerSearchRequest>) => {
  const { id, fen, maxDepth, style, timeLimitMs } = event.data
  try {
    const chess = new Chess(fen)
    const move = findBestMove(chess, maxDepth, style, timeLimitMs)
    const nodes = getLastSearchNodes()
    const payload: WorkerSearchResponse = {
      id,
      nodes,
      san: move?.san ?? null,
      from: move?.from,
      to: move?.to,
      promotion: move?.promotion,
    }
    self.postMessage(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'worker search failed'
    self.postMessage({ id, nodes: 0, san: null, error: message } satisfies WorkerSearchResponse)
  }
}
