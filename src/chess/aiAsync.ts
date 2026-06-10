/* ─── Async search host ───────────────────────────────────────────────────
   Runs engine searches off the main thread by default (Web Worker), so
   the UI never freezes while a rival thinks. Falls back to synchronous
   main-thread search when Workers are unavailable or the response would
   be stale (the position changed while the worker was thinking).

   Surface preference (localStorage "cok-ai-worker"):
     unset → auto: worker when available
     "1"   → force worker        "0" → force main thread
   ────────────────────────────────────────────────────────────────────────── */

import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { findBestMove, findBestMoveWithProfile } from './ai'
import type { ProfileMoveOptions } from './ai'
import type { AIStyle } from './evaluate'
import type { AiProfile } from '../types'
import type { WorkerSearchRequest, WorkerSearchResponse } from './workers/aiSearch.worker'

export type AiSearchSurface = 'main' | 'worker'

const WORKER_PREF_KEY = 'cok-ai-worker'

let worker: Worker | null = null
let seq = 0
const pending = new Map<
  number,
  { resolve: (move: Move | null) => void; fen: string }
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
      /* The echoed FEN must match the request — a cheap corruption guard. */
      if (msg.error || !msg.san || msg.fen !== entry.fen) {
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
    const pref = localStorage.getItem(WORKER_PREF_KEY)
    if (pref === '1') return 'worker'
    if (pref === '0') return 'main'
  } catch {
    /* private mode */
  }
  return typeof Worker === 'undefined' ? 'main' : 'worker'
}

export function setAiSearchSurface(surface: AiSearchSurface): void {
  try {
    localStorage.setItem(WORKER_PREF_KEY, surface === 'worker' ? '1' : '0')
  } catch {
    /* private mode */
  }
}

export function preferredAiSearchSurface(): AiSearchSurface {
  return getAiSearchSurface()
}

function postToWorker(req: WorkerSearchRequest): Promise<Move | null> {
  const w = ensureWorker()
  if (!w) return Promise.resolve(null)
  return new Promise((resolve) => {
    pending.set(req.id, { resolve, fen: req.fen })
    w.postMessage(req)
  })
}

/** Match a worker move against the live position's legal list. */
function resolveOnLiveBoard(chess: Chess, requestFen: string, move: Move | null): Move | null {
  if (!move) return null
  /* Stale guard: the board must not have changed since the request. */
  if (chess.fen() !== requestFen) return null
  return (
    chess
      .moves({ verbose: true })
      .find((m) => m.from === move.from && m.to === move.to && m.promotion === move.promotion) ?? null
  )
}

/** Full-strength async search (puzzles, hints). */
export async function findBestMoveAsync(
  chess: Chess,
  maxDepth: number,
  style: AIStyle,
  timeLimitMs = 2000,
  surface: AiSearchSurface = getAiSearchSurface(),
): Promise<Move | null> {
  if (surface === 'worker' && ensureWorker() !== null) {
    const fen = chess.fen()
    const moved = await postToWorker({
      id: ++seq,
      kind: 'best',
      fen,
      maxDepth,
      style,
      timeLimitMs,
    })
    const live = resolveOnLiveBoard(chess, fen, moved)
    if (live) return live
    if (chess.fen() !== fen) return null /* position changed: drop, do not fall back */
  }
  return findBestMove(chess, maxDepth, style, timeLimitMs)
}

/** Persona-flavored async search (duels and matches). */
export async function findBestMoveWithProfileAsync(
  chess: Chess,
  profile: AiProfile,
  opts: ProfileMoveOptions | null = null,
  surface: AiSearchSurface = getAiSearchSurface(),
): Promise<Move | null> {
  if (surface === 'worker' && ensureWorker() !== null) {
    const fen = chess.fen()
    const moved = await postToWorker({
      id: ++seq,
      kind: 'profile',
      fen,
      profile,
      opts,
    })
    const live = resolveOnLiveBoard(chess, fen, moved)
    if (live) return live
    if (chess.fen() !== fen) return null /* position changed: drop, do not fall back */
  }
  return findBestMoveWithProfile(chess, profile, opts ?? undefined)
}

export function terminateAiSearchWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
  }
  for (const [, entry] of pending) entry.resolve(null)
  pending.clear()
}
