import { PERSONA_NODES_PER_MS } from '../src/chess/ai'
import { engineNodesSearched } from '../src/chess/engine'

/* Seeded randomness and a node-proportional virtual clock.

   The engine's search is time-budgeted, so wall-clock time makes rival
   strength depend on machine load. The virtual clock reads the engine's
   own node counter: virtual ms = nodes searched / nodesPerMs (plus a tiny
   per-read step so time always moves), which turns every time budget into
   a node budget on a reference device. Same seed + same code => same games.

   (Until session 3 it advanced 1024/nodesPerMs per *read*. Searches read
   the clock at every iteration boundary too, so a 12 ms budget stopped
   after depth 1 — the UI eval probe never reached the depth a phone gets.) */

export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function seedRandom(key: string): () => number {
  const rng = mulberry32(hashString(key))
  Math.random = rng
  return rng
}

/** Reference device: engine nodes searched per millisecond. Rival budgets
    are node budgets at the game's PERSONA_NODES_PER_MS, so this mostly
    affects the UI eval probe and the slow-device time cap. Override with
    EVAL_NODES_PER_MS (this container measures ~320-410 real nodes/ms). */
export const DEFAULT_NODES_PER_MS = Number(process.env.EVAL_NODES_PER_MS ?? PERSONA_NODES_PER_MS)

const realNow = performance.now.bind(performance)

export function installVirtualClock(nodesPerMs = DEFAULT_NODES_PER_MS): void {
  const base = engineNodesSearched()
  let reads = 0
  performance.now = () => {
    reads++
    return (engineNodesSearched() - base) / nodesPerMs + reads * 0.001
  }
}

export function wallClockMs(): number {
  return realNow()
}
