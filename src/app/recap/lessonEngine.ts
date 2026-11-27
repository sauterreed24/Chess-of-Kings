import { Chess } from 'chess.js'
import { PERSONA_NODES_PER_MS } from '../../chess/ai'
import { searchFen } from '../../chess/engine'
import type { LessonEngine } from './costliestMoment'

/** Fixed node budget per lesson search: the same verdict on every device. */
export const RECAP_VERIFY_NODES = 6000
/** Candidates re-checked per finished game. */
export const RECAP_VERIFY_CANDIDATES = 4

/**
 * The recap's engine: fixed node budgets and a fresh table, so the lesson
 * depends only on the game. Wall-clock is a generous safety net (4× the
 * reference phone's time) that only binds on very slow devices.
 */
export function createLessonEngine(nodes = RECAP_VERIFY_NODES): LessonEngine {
  const search = (fen: string, spectrum: boolean) =>
    searchFen(fen, {
      maxDepth: 64,
      targetNodes: nodes,
      maxTimeMs: Math.ceil((nodes / PERSONA_NODES_PER_MS) * 4),
      spectrum,
      freshTable: true,
    })
  return {
    scoreRoots(fen) {
      try {
        const probe = new Chess(fen)
        return search(fen, true).rootMoves.map((r) => {
          const played = probe.move({ from: r.from, to: r.to, promotion: r.promotion })
          probe.undo()
          return { san: played.san, score: r.score }
        })
      } catch {
        return null
      }
    },
    scorePosition(fen) {
      try {
        if (new Chess(fen).isGameOver()) return null
        return search(fen, false).score
      } catch {
        return null
      }
    },
  }
}
