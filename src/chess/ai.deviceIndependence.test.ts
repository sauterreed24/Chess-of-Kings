import { afterEach, describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { clearEngineCaches, findBestMoveWithProfile, getLastSearchNodes } from './ai'
import { AI_PROFILES } from './aiProfiles'

/* A rival must be the same opponent on a fast desktop and a mid-range
   phone. Simulate both with a virtual clock (the engine reads the clock
   every 1024 nodes) and require identical choices and node counts. */

const realNow = performance.now.bind(performance)

function onDevice<T>(nodesPerMs: number, run: () => T): T {
  let t = 0
  const tick = 1024 / nodesPerMs
  performance.now = () => (t += tick)
  try {
    return run()
  } finally {
    performance.now = realNow
  }
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const FENS = [
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
]

function pick(profileId: string, fen: string, nodesPerMs: number) {
  clearEngineCaches()
  Math.random = mulberry32(42)
  return onDevice(nodesPerMs, () => {
    const move = findBestMoveWithProfile(new Chess(fen), AI_PROFILES[profileId]!)
    return { san: move?.san, nodes: getLastSearchNodes() }
  })
}

describe('persona strength is device-independent', () => {
  afterEach(() => {
    performance.now = realNow
  })

  for (const id of ['scholar_guard', 'veteran_scholar', 'advisor_boss', 'counterpart_apex']) {
    it(`${id}: same move and node count at 150 and 350 nodes/ms`, () => {
      for (const fen of FENS) {
        const phone = pick(id, fen, 150)
        const desktop = pick(id, fen, 350)
        expect(desktop).toEqual(phone)
        expect(phone.nodes).toBeGreaterThan(1000)
      }
    }, 60_000)
  }
})
