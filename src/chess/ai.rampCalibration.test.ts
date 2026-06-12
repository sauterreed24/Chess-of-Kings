/**
 * Difficulty-ramp calibration (gated: CROWN_MATCH=1).
 *
 * The campaign's promise is a climbable ladder: the first rival must be
 * beatable by a beginner, and each tier must outscore the one below it.
 * "Beginner" here is a greedy 1-ply bot — takes the best capture that
 * does not obviously hang, punishes hanging pieces, otherwise plays a
 * random non-hanging move. Roughly the player who just learned the rules.
 *
 *   CROWN_MATCH=1 npx vitest run src/chess/ai.rampCalibration.test.ts
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { findBestMoveWithProfile } from './ai'
import { AI_PROFILES } from './aiProfiles'

const PIECE_CP: Record<string, number> = { p: 100, n: 300, b: 310, r: 500, q: 900, k: 0 }

/** Greedy beginner: best safe capture, else random move that doesn't hang. */
function beginnerMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null
  let best: Move | null = null
  let bestScore = -Infinity
  for (const move of moves) {
    let score = PIECE_CP[move.captured ?? ''] ?? 0
    chess.move(move)
    const replies = chess.moves({ verbose: true })
    /* Does the opponent win material on the obvious reply? */
    let worstLoss = 0
    for (const reply of replies) {
      if (!reply.captured) continue
      const gain = (PIECE_CP[reply.captured] ?? 0) - 40 /* assume some recapture chance */
      if (gain > worstLoss) worstLoss = gain
    }
    if (chess.isCheckmate()) score += 100_000
    chess.undo()
    score -= worstLoss * 0.9
    score += Math.random() * 30 /* tie-break variety */
    if (score > bestScore) {
      bestScore = score
      best = move
    }
  }
  return best
}

function playMatch(profileId: string, games: number): number {
  const profile = { ...AI_PROFILES[profileId]!, thinkTimeMs: 120 }
  let personaPoints = 0
  for (let game = 0; game < games; game++) {
    const personaIsWhite = game % 2 === 0
    const chess = new Chess()
    let plies = 0
    while (!chess.isGameOver() && plies < 220) {
      const personaToMove = (chess.turn() === 'w') === personaIsWhite
      const move = personaToMove ? findBestMoveWithProfile(chess, profile) : beginnerMove(chess)
      if (!move) break
      chess.move(move)
      plies++
    }
    if (chess.isCheckmate()) {
      const loserIsWhite = chess.turn() === 'w'
      if (loserIsWhite !== personaIsWhite) personaPoints += 1
    } else {
      personaPoints += 0.5
    }
  }
  return personaPoints
}

describe.runIf(process.env.CROWN_MATCH === '1')('campaign difficulty ramp', () => {
  it('first rival is beatable by a beginner and the ladder climbs', () => {
    const games = 8
    const novice = playMatch('novice_court', games)
    const apprentice = playMatch('apprentice_court', games)
    const veteran = playMatch('veteran_scholar', games)
    console.info(
      `[ramp] vs greedy beginner over ${games}: novice ${novice}, apprentice ${apprentice}, veteran ${veteran}`,
    )
    /* The beginner must get real games from the first rival… */
    expect(novice).toBeLessThanOrEqual(games - 1.5)
    /* …each tier must climb… */
    expect(apprentice).toBeGreaterThanOrEqual(novice - 1)
    expect(veteran).toBeGreaterThanOrEqual(apprentice - 1)
    /* …and the top of this slice should clearly beat a beginner. */
    expect(veteran).toBeGreaterThanOrEqual(games * 0.75)
  }, 900_000)
})
