import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMoveWithProfile } from './ai'
import { AI_PROFILES } from './aiProfiles'

function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function randomPosition(maxPly: number, rand: () => number): Chess {
  const c = new Chess()
  const plies = Math.floor(rand() * Math.max(1, maxPly))
  for (let i = 0; i < plies; i++) {
    const moves = c.moves({ verbose: true })
    if (!moves.length) break
    const mv = moves[Math.floor(rand() * moves.length)]!
    c.move(mv)
    if (c.isGameOver()) break
  }
  return c
}

describe('AI legal move robustness', () => {
  it('returns legal moves across random positions and profiles', { timeout: 60000 }, () => {
    const profiles = Object.values(AI_PROFILES).slice(0, 3).map((p) => ({
      ...p,
      searchDepth: Math.min(2, p.searchDepth),
      thinkTimeMs: Math.min(70, p.thinkTimeMs),
    }))
    const rand = makeRng(0xa11e9a1)
    for (let i = 0; i < 4; i++) {
      const c = randomPosition(26, rand)
      if (c.isGameOver()) continue
      for (const p of profiles) {
        const copy = new Chess(c.fen())
        const mv = findBestMoveWithProfile(copy, p)
        if (!mv) continue
        const legal = copy.moves({ verbose: true }).some(
          (m) => m.from === mv.from && m.to === mv.to && m.promotion === mv.promotion,
        )
        expect(legal).toBe(true)
      }
    }
  })
})
