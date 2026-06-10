/* Off-thread search host. Accepts plain-data requests, runs Crown Engine
   v2 (full-strength or persona-flavored), and echoes the request FEN so
   the main thread can reject stale or corrupted responses. */

import { Chess } from 'chess.js'
import { findBestMove, findBestMoveWithProfile, getLastSearchNodes } from '../ai'
import type { ProfileMoveOptions } from '../ai'
import type { AIStyle } from '../evaluate'
import type { AiProfile } from '../../types'

export type WorkerSearchRequest =
  | {
      id: number
      kind: 'best'
      fen: string
      maxDepth: number
      style: AIStyle
      timeLimitMs: number
    }
  | {
      id: number
      kind: 'profile'
      fen: string
      profile: AiProfile
      opts: ProfileMoveOptions | null
    }

export type WorkerSearchResponse = {
  id: number
  fen: string
  nodes: number
  san: string | null
  from?: string
  to?: string
  promotion?: string
  error?: string
}

self.onmessage = (event: MessageEvent<WorkerSearchRequest>) => {
  const req = event.data
  try {
    const chess = new Chess(req.fen)
    const move =
      req.kind === 'profile'
        ? findBestMoveWithProfile(chess, req.profile, req.opts ?? undefined)
        : findBestMove(chess, req.maxDepth, req.style, req.timeLimitMs)
    const payload: WorkerSearchResponse = {
      id: req.id,
      fen: req.fen,
      nodes: getLastSearchNodes(),
      san: move?.san ?? null,
      from: move?.from,
      to: move?.to,
      promotion: move?.promotion,
    }
    self.postMessage(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'worker search failed'
    self.postMessage({
      id: req.id,
      fen: req.fen,
      nodes: 0,
      san: null,
      error: message,
    } satisfies WorkerSearchResponse)
  }
}
