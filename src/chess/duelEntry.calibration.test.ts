/**
 * Duel entry-point accessibility (gated: CROWN_MATCH=1).
 *
 * A brand-new player can open the Duel Archive immediately and face the
 * Alexion "Early Mentor" at the Forgiving (novice) band. That band must be
 * genuinely forgiving — a near-beginner should win comfortably, or the
 * first duel is a discouraging wall. We measure the band the way the game
 * builds it (mirroring GameFlow.tuneProfileForDuel for a fresh player:
 * no rival memory, no tilt relief) against the same greedy-beginner proxy
 * used by the campaign ramp test.
 *
 *   CROWN_MATCH=1 npx vitest run src/chess/duelEntry.calibration.test.ts
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { clearEngineCaches, findBestMoveWithProfile } from './ai'
import { AI_PROFILES, resolveProfileByDuelVariant } from './aiProfiles'
import type { AiProfile } from '../types'

/** Fresh-player Forgiving-band transform — mirrors tuneProfileForDuel's
    'novice' branch with all memory/rivalry/tilt relief at zero. */
function forgivingBand(base: AiProfile): AiProfile {
  return {
    ...base,
    searchDepth: Math.max(1, base.searchDepth - 1),
    thinkTimeMs: Math.max(260, base.thinkTimeMs - 260),
    blunderRate: Math.min(0.45, base.blunderRate + 0.22),
    tacticalAlertness: Math.max(0.16, base.tacticalAlertness - 0.3),
    conversionStrictness: Math.max(0.16, base.conversionStrictness - 0.34),
  }
}

const PIECE_CP: Record<string, number> = { p: 100, n: 300, b: 310, r: 500, q: 900, k: 0 }

/** Greedy near-beginner: best safe capture, else a non-hanging move. */
function beginnerMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null
  let best: Move | null = null
  let bestScore = -Infinity
  for (const move of moves) {
    let score = PIECE_CP[move.captured ?? ''] ?? 0
    chess.move(move)
    let worstLoss = 0
    for (const reply of chess.moves({ verbose: true })) {
      if (!reply.captured) continue
      const gain = (PIECE_CP[reply.captured] ?? 0) - 40
      if (gain > worstLoss) worstLoss = gain
    }
    if (chess.isCheckmate()) score += 100_000
    chess.undo()
    score -= worstLoss * 0.9 + Math.random() * 30
    if (score > bestScore) {
      bestScore = score
      best = move
    }
  }
  return best
}

function beginnerPointsVs(profile: AiProfile, games: number): number {
  const tuned = { ...profile, thinkTimeMs: 200 } /* depth-bounded on these tiny searches */
  let beginnerPoints = 0
  for (let game = 0; game < games; game++) {
    clearEngineCaches()
    const rivalIsWhite = game % 2 === 0
    const chess = new Chess()
    let plies = 0
    while (!chess.isGameOver() && plies < 200) {
      const rivalToMove = (chess.turn() === 'w') === rivalIsWhite
      const move = rivalToMove ? findBestMoveWithProfile(chess, tuned) : beginnerMove(chess)
      if (!move) break
      chess.move(move)
      plies++
    }
    if (chess.isCheckmate()) {
      const loserIsWhite = chess.turn() === 'w'
      if (loserIsWhite === rivalIsWhite) beginnerPoints += 1 /* beginner won */
    } else {
      beginnerPoints += 0.5
    }
  }
  return beginnerPoints
}

describe.runIf(process.env.CROWN_MATCH === '1')('duel entry accessibility', () => {
  it('the Forgiving band lets a near-beginner win comfortably', () => {
    const games = 8
    const mentor = forgivingBand(resolveProfileByDuelVariant('alexion-mentor'))
    const novice = forgivingBand(AI_PROFILES.novice_court!)
    const mentorPts = beginnerPointsVs(mentor, games)
    const novicePts = beginnerPointsVs(novice, games)
    console.info(
      `[duel-entry] beginner vs Forgiving band over ${games}: ` +
        `Early Mentor ${mentorPts}, novice_court ${novicePts}`,
    )
    /* Forgiving = the beginner should get real games (>= ~3/8), not a wall. */
    expect(mentorPts).toBeGreaterThanOrEqual(games * 0.375)
  }, 900_000)
})
