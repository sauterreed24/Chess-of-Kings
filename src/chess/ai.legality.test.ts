import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMoveWithProfile } from './ai'
import { AI_PROFILES } from './aiProfiles'

function randomPosition(maxPly: number): Chess {
  const c = new Chess()
  const plies = Math.floor(Math.random() * Math.max(1, maxPly))
  for (let i = 0; i < plies; i++) {
    const moves = c.moves({ verbose: true })
    if (!moves.length) break
    const mv = moves[Math.floor(Math.random() * moves.length)]!
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
      thinkTimeMs: Math.min(90, p.thinkTimeMs),
    }))
    for (let i = 0; i < 4; i++) {
      const c = randomPosition(26)
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
