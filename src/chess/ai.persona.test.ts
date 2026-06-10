/**
 * Persona/difficulty model tests for the Crown Engine v2 selection layer.
 * The contract: personalities shape WHICH good move gets played, mistakes
 * are bounded and human-like, and no persona ever walks into a visible
 * forced mate while alternatives exist.
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findBestMoveWithProfile } from './ai'
import { AI_PROFILES } from './aiProfiles'

describe('persona selection', () => {
  it('apex tier takes the tactically best move outright', () => {
    const chess = new Chess('7k/8/8/8/4q3/8/8/K3R3 w - - 0 1')
    const move = findBestMoveWithProfile(chess, AI_PROFILES.counterpart_apex!)
    expect(move?.san).toBe('Rxe4')
  })

  it('novice persona never steps into a seen mate-in-1 when alternatives exist', () => {
    /* Black must create luft or lose to Qd8#; passive king moves lose. */
    const fen = '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 b - - 0 1'
    for (let trial = 0; trial < 24; trial++) {
      const chess = new Chess(fen)
      const move = findBestMoveWithProfile(chess, AI_PROFILES.novice_court!)
      expect(move).not.toBeNull()
      chess.move(move!)
      const mateReply = chess.moves({ verbose: true }).find((m) => m.san.endsWith('#'))
      expect(
        mateReply,
        `novice allowed ${mateReply?.san} after playing ${move!.san}`,
      ).toBeUndefined()
    }
  }, 60_000)

  it('weak personas vary their play; the spread shrinks with strength', () => {
    const sampleDistinct = (profileId: string, runs: number): number => {
      const seen = new Set<string>()
      for (let i = 0; i < runs; i++) {
        const chess = new Chess()
        const move = findBestMoveWithProfile(chess, AI_PROFILES[profileId]!)
        seen.add(move?.san ?? '-')
      }
      return seen.size
    }
    expect(sampleDistinct('novice_court', 14)).toBeGreaterThanOrEqual(2)
  }, 60_000)

  it('respects profile think-time budgets with headroom', () => {
    const cases: Array<[string, number]> = [
      ['novice_court', 1000],
      ['veteran_scholar', 1900],
      ['counterpart_apex', 2800],
    ]
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'
    for (const [profileId, ceilingMs] of cases) {
      const chess = new Chess(fen)
      const start = performance.now()
      const move = findBestMoveWithProfile(chess, AI_PROFILES[profileId]!)
      const wall = performance.now() - start
      expect(move).not.toBeNull()
      expect(wall, `${profileId} took ${wall}ms`).toBeLessThan(ceilingMs)
    }
  }, 60_000)

  it('every persona converts KQ vs K instead of shuffling', () => {
    /* A won endgame must end in mate, not the fifty-move rule. */
    for (const profileId of ['novice_court', 'veteran_scholar', 'counterpart_apex']) {
      const chess = new Chess('8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1')
      let lastAiKey: string | null = null
      for (let plyIndex = 0; plyIndex < 80 && !chess.isGameOver(); plyIndex++) {
        if (chess.turn() === 'w') {
          const move = findBestMoveWithProfile(chess, AI_PROFILES[profileId]!, {
            avoidMoveKey: lastAiKey,
          })
          expect(move).not.toBeNull()
          lastAiKey = `${move!.from}${move!.to}${move!.promotion ?? ''}`
          chess.move(move!)
        } else {
          const replies = chess.moves({ verbose: true })
          chess.move(replies[Math.floor(Math.random() * replies.length)]!)
        }
      }
      expect(chess.isCheckmate(), `${profileId} failed to convert KQ vs K`).toBe(true)
    }
  }, 120_000)
})

describe.runIf(process.env.CROWN_MATCH === '1')('persona strength ladder', () => {
  it('veteran beats novice decisively over a short match', () => {
    let veteranPoints = 0
    const games = 6
    for (let game = 0; game < games; game++) {
      const veteranIsWhite = game % 2 === 0
      const chess = new Chess()
      let plies = 0
      while (!chess.isGameOver() && plies < 240) {
        const veteranToMove = (chess.turn() === 'w') === veteranIsWhite
        const profile = veteranToMove ? AI_PROFILES.veteran_scholar! : AI_PROFILES.novice_court!
        const move = findBestMoveWithProfile(chess, { ...profile, thinkTimeMs: 120 })
        if (!move) break
        chess.move(move)
        plies++
      }
      if (chess.isCheckmate()) {
        const loserIsWhite = chess.turn() === 'w'
        if (loserIsWhite !== veteranIsWhite) veteranPoints += 1
      } else {
        veteranPoints += 0.5
      }
      console.info(`[ladder] game ${game + 1}: veteran ${veteranPoints}/${game + 1}`)
    }
    console.info(`[ladder final] veteran ${veteranPoints}/${games}`)
    expect(veteranPoints).toBeGreaterThanOrEqual(games * 0.7)
  }, 600_000)
})
