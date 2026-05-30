import { Chess } from 'chess.js'
import type { InProgressSnapshot } from '../../types'

export const IN_PROGRESS_PLY_LIMIT = 512

export type SnapshotRecoveryState = {
  history: string[]
  sanLog: string[]
  sanQuality: Array<'brilliant' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' | null>
}

export type SavedMoveQuality = 'brilliant' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' | null

/**
 * Pure, deterministic validation + replay of a captured in-progress snapshot.
 *
 * Replays the SAN log from the scene's documented start position and verifies
 * that the final FEN matches what was captured. Returns the reconstructed
 * history + quality array on success, or null on any corruption / mismatch.
 *
 * This function has no side effects and is safe to call from tests, workers,
 * or during recovery flows.
 */
export function validateAndReplaySnapshot(
  snap: InProgressSnapshot,
  startFen: string | null,
): SnapshotRecoveryState | null {
  if (typeof snap.fen !== 'string' || !Array.isArray(snap.sanLog)) return null
  if (snap.sanLog.length > IN_PROGRESS_PLY_LIMIT) return null
  if (!startFen) return null

  try {
    const replay = new Chess(startFen)
    const history: string[] = [replay.fen()]
    const sanLog: string[] = []

    for (const raw of snap.sanLog) {
      if (typeof raw !== 'string') return null
      const san = raw.trim()
      if (!san) return null

      const move = replay.move(san)
      if (!move) return null

      sanLog.push(san)
      history.push(replay.fen())
    }

    if (replay.fen() !== snap.fen) return null

    const sanQuality = sanLog.map((_, i) => {
      const raw = (snap.sanQuality as SavedMoveQuality[] | undefined)?.[i]
      return isValidQuality(raw) ? raw : null
    })

    return { history, sanLog, sanQuality }
  } catch {
    return null
  }
}

function isValidQuality(q: unknown): q is SavedMoveQuality {
  return (
    q === null ||
    q === 'brilliant' ||
    q === 'good' ||
    q === 'ok' ||
    q === 'inaccuracy' ||
    q === 'mistake' ||
    q === 'blunder'
  )
}
