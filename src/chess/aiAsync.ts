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
import {
  clearEngineCaches,
  findBestMove,
  findBestMoveWithProfile,
  noteSearchNodes,
  recentHistoryFens,
} from './ai'
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
    try {
      worker = new Worker(new URL('./workers/aiSearch.worker.ts', import.meta.url), {
        type: 'module',
      })
    } catch {
      return null /* CSP or platform refusal: degrade to main-thread search */
    }
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
      noteSearchNodes(msg.nodes)
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

type SearchRequest = Exclude<WorkerSearchRequest, { kind: 'reset' }>

function postToWorker(req: SearchRequest, timeoutMs: number): Promise<Move | null> {
  const w = ensureWorker()
  if (!w) return Promise.resolve(null)
  return new Promise((resolve) => {
    /* Watchdog: a worker killed by the platform (OOM, backgrounding) may
       never reply and onerror is not guaranteed — without this the awaited
       turn never settles and the board locks on "thinking" forever. */
    const watchdog = setTimeout(() => {
      if (pending.delete(req.id)) {
        resolve(null)
        terminateAiSearchWorker() /* presumed wedged; rebuilt next request */
      }
    }, timeoutMs)
    pending.set(req.id, {
      resolve: (move) => {
        clearTimeout(watchdog)
        resolve(move)
      },
      fen: req.fen,
    })
    w.postMessage(req)
  })
}

/**
 * Reset persistent engine caches on BOTH surfaces when a new game starts,
 * so path-dependent draw scores (repetition/fifty-move) from one game can
 * never steer search in the next.
 */
export function resetAiGameContext(): void {
  clearEngineCaches()
  if (worker) worker.postMessage({ id: ++seq, kind: 'reset' } satisfies WorkerSearchRequest)
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
  const recentFens = recentHistoryFens(chess)
  if (surface === 'worker' && ensureWorker() !== null) {
    const fen = chess.fen()
    const moved = await postToWorker(
      {
        id: ++seq,
        kind: 'best',
        fen,
        maxDepth,
        style,
        timeLimitMs,
        recentFens,
      },
      timeLimitMs + 4000,
    )
    const live = resolveOnLiveBoard(chess, fen, moved)
    if (live) return live
    if (chess.fen() !== fen) return null /* position changed: drop, do not fall back */
  }
  return findBestMove(chess, maxDepth, style, timeLimitMs, recentFens)
}

/** Persona-flavored async search (duels and matches). */
export async function findBestMoveWithProfileAsync(
  chess: Chess,
  profile: AiProfile,
  opts: ProfileMoveOptions | null = null,
  surface: AiSearchSurface = getAiSearchSurface(),
): Promise<Move | null> {
  /* The worker rebuilds the position from a bare FEN, so the live game's
     recent positions and the persona's own last move (anti-reversal bias)
     ride along in the options. */
  const history = chess.history({ verbose: true })
  const priorOwn = history.at(-2) ?? null
  const enriched: ProfileMoveOptions = {
    ...(opts ?? {}),
    recentFens: opts?.recentFens ?? history.slice(-17).map((m) => m.before),
    ownLast:
      opts?.ownLast !== undefined
        ? opts.ownLast
        : priorOwn
          ? { from: priorOwn.from, to: priorOwn.to, piece: priorOwn.piece }
          : null,
  }
  if (surface === 'worker' && ensureWorker() !== null) {
    const fen = chess.fen()
    const moved = await postToWorker(
      {
        id: ++seq,
        kind: 'profile',
        fen,
        profile,
        opts: enriched,
      },
      Math.min(4000, Math.max(300, profile.thinkTimeMs)) * 2 + 5000,
    )
    const live = resolveOnLiveBoard(chess, fen, moved)
    if (live) return live
    if (chess.fen() !== fen) return null /* position changed: drop, do not fall back */
  }
  return findBestMoveWithProfile(chess, profile, enriched)
}

export function terminateAiSearchWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
  }
  for (const [, entry] of pending) entry.resolve(null)
  pending.clear()
}
