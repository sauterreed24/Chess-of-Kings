import type { Scene } from '../../types'

/** Scene types that are reading only — no board, no decision. */
const PROSE_TYPES: ReadonlySet<Scene['type']> = new Set(['dialogue', 'codex', 'interlude'])

/**
 * Onboarding accelerator: the index of the next playable scene a reader can
 * jump to by skipping ONLY a run of consecutive prose (dialogue / codex /
 * story). Returns `null` when there is nothing worth skipping.
 *
 * Guarantees, by construction:
 *  - The current scene must itself be prose (you never skip from a board).
 *  - At least one *intermediate* prose scene must lie between here and the
 *    target, so the button never duplicates a plain Advance.
 *  - The target is the FIRST non-prose scene — a puzzle, calibration, or
 *    match — so skipping can never bypass gameplay, only reading.
 *  - Generic over scene order: any current or future chapter shape resolves
 *    correctly with no per-chapter wiring.
 */
export function prosePeekSkipIndex(scenes: readonly Scene[], currentIndex: number): number | null {
  if (!Array.isArray(scenes) || currentIndex < 0 || currentIndex >= scenes.length) return null
  if (!PROSE_TYPES.has(scenes[currentIndex]!.type)) return null
  for (let i = currentIndex + 1; i < scenes.length; i++) {
    if (PROSE_TYPES.has(scenes[i]!.type)) continue
    /* First board scene found — only worth a button if at least one prose
       scene sits between the current scene and it. */
    return i > currentIndex + 1 ? i : null
  }
  return null
}
