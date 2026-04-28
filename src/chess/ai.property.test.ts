/**
 * Engine property test: across many random positions and every shipped
 * AiProfile, the chosen move must always be legal and the call must
 * never throw. Stronger guarantee than ai.legality.test.ts (which uses
 * a small slice of profiles and few positions).
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
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

describe('engine property: legality across all profiles', () => {
  it('every profile returns a legal move (or null at terminal positions) across random positions', { timeout: 90000 }, () => {
    /* Tight caps -- this test runs 12 positions x 9 profiles = 108 calls
     * and must finish well inside the 90s timeout on CI / jsdom. */
    const profiles = Object.values(AI_PROFILES).map((p) => ({
      ...p,
      searchDepth: 1,
      thinkTimeMs: 60,
    }))

    for (let i = 0; i < 12; i++) {
      const c = randomPosition(28)
      if (c.isGameOver()) continue
      const fenSnapshot = c.fen()
      for (const p of profiles) {
        const copy = new Chess(fenSnapshot)
        let mv: Move | null = null
        expect(() => {
          mv = findBestMoveWithProfile(copy, p)
        }).not.toThrow()
        if (!mv) continue
        const legalMoves = copy.moves({ verbose: true })
        const legal = legalMoves.some(
          (m) =>
            m.from === (mv as Move).from &&
            m.to === (mv as Move).to &&
            m.promotion === (mv as Move).promotion,
        )
        expect(legal, `${p.id} chose illegal move ${(mv as Move).san} from ${fenSnapshot}`).toBe(true)
      }
    }
  })

  it('never returns an unsafe SAN that contains < or & (would imply formatter / type confusion)', () => {
    const c = new Chess()
    const profile = { ...AI_PROFILES.novice_court, thinkTimeMs: 80, searchDepth: 1 }
    for (let i = 0; i < 20; i++) {
      if (c.isGameOver()) break
      const mv = findBestMoveWithProfile(c, profile)
      if (!mv) break
      expect(mv.san).not.toMatch(/[<&]/)
      c.move(mv)
    }
  })
})
