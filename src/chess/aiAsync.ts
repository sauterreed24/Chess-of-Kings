import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { findBestMove } from './ai'
import type { AIStyle } from './evaluate'
import type { WorkerSearchRequest, WorkerSearchResponse } from './workers/aiSearch.worker'

export type AiSearchSurface = 'main' | 'worker'

const WORKER_PREF_KEY = 'cok-ai-worker'

let worker: Worker | null = null
let seq = 0
const pending = new Map<
  number,
  { resolve: (move: Move | null) => void; reject: (err: Error) => void; fen: string }
>()

function ensureWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (!worker) {
    worker = new Worker(new URL('./workers/aiSearch.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerSearchResponse>) => {
      const msg = event.data
      const entry = pending.get(msg.id)
      if (!entry) return
      pending.delete(msg.id)
      if (msg.error || !msg.san) {
        entry.resolve(null)
        return
      }
      try {
        const chess = new Chess(entry.fen)
        const move = chess.move(msg.san)
        entry.resolve(move)
      } catch {
        entry.resolve(null)
      }
    }
    worker.onerror = () => {
      for (const [, entry] of pending) entry.resolve(null)
      pending.clear()
    }
  }
  return worker
}

export function getAiSearchSurface(): AiSearchSurface {
  try {
    return localStorage.getItem(WORKER_PREF_KEY) === '1' ? 'worker' : 'main'
  } catch {
    return 'main'
  }
}

export function setAiSearchSurface(surface: AiSearchSurface): void {
  try {
    if (surface === 'worker') localStorage.setItem(WORKER_PREF_KEY, '1')
    else localStorage.removeItem(WORKER_PREF_KEY)
  } catch {
    /* private mode */
  }
}

export function preferredAiSearchSurface(): AiSearchSurface {
  return getAiSearchSurface()
}

function findBestMoveViaWorker(
  chess: Chess,
  maxDepth: number,
  style: AIStyle,
  timeLimitMs: number,
): Promise<Move | null> {
  const w = ensureWorker()
  if (!w) return Promise.resolve(findBestMove(chess, maxDepth, style, timeLimitMs))

  const fen = chess.fen()
  const id = ++seq
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, fen })
    const req: WorkerSearchRequest = { id, fen, maxDepth, style, timeLimitMs }
    w.postMessage(req)
  })
}

/**
 * Async search entry — main thread by default; optional Worker when
 * `localStorage['cok-ai-worker'] === '1'` or `surface === 'worker'`.
 */
export async function findBestMoveAsync(
  chess: Chess,
  maxDepth: number,
  style: AIStyle,
  timeLimitMs = 2000,
  surface: AiSearchSurface = getAiSearchSurface(),
): Promise<Move | null> {
  const useWorker = surface === 'worker' && ensureWorker() !== null
  if (useWorker) {
    return findBestMoveViaWorker(chess, maxDepth, style, timeLimitMs)
  }
  return findBestMove(chess, maxDepth, style, timeLimitMs)
}

export function terminateAiSearchWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
  }
  pending.clear()
}
