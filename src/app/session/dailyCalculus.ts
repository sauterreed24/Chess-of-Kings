/**
 * Daily Calculus — selects one puzzle scene per local day, deterministically.
 *
 * Pulled from the existing puzzle scenes already in `data/chapters.ts`,
 * so no new puzzle content has to be written and the player always sees
 * something curated. The mapping from day -> puzzle is a stable hash of
 * the {@link dayKey} string mod the puzzle list length, which means:
 *
 * - Two devices in the same timezone show the same puzzle on the same day.
 * - The picker is pure (date in -> puzzle out); no global RNG.
 * - The pool is collected once on import; callers pass the chapter list
 *   so this module stays decoupled from the chapter data import.
 */
import type { Chapter, PuzzleScene } from '../../types'
import { dayKey } from './streak'

export interface DailyPick {
  /** YYYY-MM-DD, the day this pick is for. */
  dayKey: string
  /** Puzzle title for display. */
  title: string
  /** Chapter title that owns this puzzle (e.g. "Chapter I"). */
  chapterTitle: string
  /** chapter / scene indices into the supplied chapter list (for jumpToScene). */
  chapterIndex: number
  sceneIndex: number
  /** The puzzle scene id (stable). */
  puzzleId: string
}

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return h >>> 0
}

interface PuzzleHandle {
  scene: PuzzleScene
  chapterIndex: number
  sceneIndex: number
  chapterTitle: string
}

export function collectPuzzlePool(chapters: readonly Chapter[]): PuzzleHandle[] {
  const out: PuzzleHandle[] = []
  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci]!
    for (let si = 0; si < ch.scenes.length; si++) {
      const sc = ch.scenes[si]!
      if (sc.type === 'puzzle') {
        out.push({
          scene: sc,
          chapterIndex: ci,
          sceneIndex: si,
          chapterTitle: ch.title,
        })
      }
    }
  }
  return out
}

export function pickDailyCalculus(
  chapters: readonly Chapter[],
  now: Date = new Date(),
): DailyPick | null {
  const pool = collectPuzzlePool(chapters)
  if (!pool.length) return null
  const key = dayKey(now)
  const idx = djb2(key) % pool.length
  const handle = pool[idx]!
  return {
    dayKey: key,
    title: handle.scene.title,
    chapterTitle: handle.chapterTitle,
    chapterIndex: handle.chapterIndex,
    sceneIndex: handle.sceneIndex,
    puzzleId: handle.scene.id,
  }
}
