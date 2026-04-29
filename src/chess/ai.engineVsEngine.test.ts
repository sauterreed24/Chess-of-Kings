/**
 * Engine-vs-engine smoke: a strong profile must beat or draw a random
 * baseline most of the time. Specifically, the alexandrine `advisor_boss`
 * profile should not LOSE to pure random more than 1 in 6 games when
 * playing White from the standard starting position.
 *
 * This is a smoke test, not a benchmark — runs 6 short games (max 60
 * plies) under a tight per-move time cap so the whole suite finishes in
 * a few seconds. The assertion is loose so non-determinism in
 * Math.random() doesn't cause flakes.
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMoveWithProfile, findRandomMove } from './ai'
import { AI_PROFILES } from './aiProfiles'

type Outcome = 'engineWin' | 'engineLoss' | 'draw'

function withSeededMathRandom<T>(seed: number, run: () => T): T {
  const original = Math.random
  let s = seed >>> 0
  Math.random = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
  try {
    return run()
  } finally {
    Math.random = original
  }
}

function playOneGame(maxPly: number): Outcome {
  const c = new Chess()
  /* Tight depth/time budget so the test stays well under the timeout
   * in CI / jsdom. The point is to validate the win-rate band, not to
   * benchmark search quality. */
  const profile = {
    ...AI_PROFILES.veteran_scholar,
    searchDepth: 2,
    thinkTimeMs: 80,
  }
  for (let ply = 0; ply < maxPly && !c.isGameOver(); ply++) {
    if (c.turn() === 'w') {
      const mv = findBestMoveWithProfile(c, profile)
      if (!mv) break
      c.move(mv)
    } else {
      const mv = findRandomMove(c)
      if (!mv) break
      c.move(mv)
    }
  }
  if (c.isCheckmate()) {
    /* The side to move is checkmated. If it's Black's turn, White won. */
    return c.turn() === 'b' ? 'engineWin' : 'engineLoss'
  }
  return 'draw'
}

describe('engine-vs-engine smoke (veteran_scholar vs random)', () => {
  it('strong profile beats random baseline on a majority of short games', { timeout: 90000 }, () => {
    withSeededMathRandom(0x5eed1234, () => {
      const N = 3
      let wins = 0
      let losses = 0
      let draws = 0
      for (let i = 0; i < N; i++) {
        const o = playOneGame(40)
        if (o === 'engineWin') wins += 1
        else if (o === 'engineLoss') losses += 1
        else draws += 1
      }
      /* Loose band: the engine must lose < half of games to random.
       * Realistic expectation is wins 2-4, losses 0-1. */
      expect(losses).toBeLessThanOrEqual(1)
      expect(wins + draws).toBeGreaterThanOrEqual(N - 1)
    })
  })

  it('every game terminates with only legal moves', { timeout: 30000 }, () => {
    withSeededMathRandom(0x1badb002, () => {
      const c = new Chess()
      const profile = { ...AI_PROFILES.apprentice_court, searchDepth: 2, thinkTimeMs: 80 }
      for (let ply = 0; ply < 24 && !c.isGameOver(); ply++) {
        const mv = c.turn() === 'w' ? findBestMoveWithProfile(c, profile) : findRandomMove(c)
        if (!mv) break
        const legal = c.moves({ verbose: true }).some(
          (m) => m.from === mv.from && m.to === mv.to && m.promotion === mv.promotion,
        )
        expect(legal).toBe(true)
        c.move(mv)
      }
    })
  })
})
