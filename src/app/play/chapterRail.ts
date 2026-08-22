/**
 * Pure HTML builders for the chapter / ladder progression UI.
 *
 * Two functions, both pure: they take the chapter, the current scene id,
 * and the set of completed scene ids, and return ready-to-inject HTML.
 *
 * - {@link buildLadderTrack}: a horizontal dot strip with one dot per
 *   match scene in the chapter, marking done / current / pending tiers.
 * - {@link buildChapterRail}: a vertical rail (manuscript margin) listing
 *   every match in order with its index and opponent name.
 *
 * The pre-existing function in mountApp closed over `flow.completedSceneIds`
 * implicitly. Lifting it here makes the data dependency explicit, lets
 * unit tests pin the markup, and prevents accidental coupling to the
 * GameFlow instance.
 */
import { escapeHtml } from '../htmlEscape'
import type { Chapter, MatchScene } from '../../types'

const TIER_ABBREVIATIONS: Record<string, string> = {
  'mini-boss': 'M',
  boss: 'B',
  counterpart: 'C',
}

function tierAbbreviation(scene: MatchScene, fallbackIndex: number): string {
  const tier = scene.ladderTier ?? ''
  return TIER_ABBREVIATIONS[tier] ?? String(fallbackIndex + 1)
}

export function buildLadderTrack(
  chapter: Chapter,
  currentSceneId: string,
  completedSceneIds: readonly string[],
): string {
  const matches = chapter.scenes.filter((s): s is MatchScene => s.type === 'match')
  if (matches.length < 2) return ''
  const completed = new Set(completedSceneIds)
  const dots = matches
    .map((m, i) => {
      const done = completed.has(m.id)
      const current = m.id === currentSceneId
      const cls = current
        ? 'ltrack-dot ltrack-dot--current'
        : done
          ? 'ltrack-dot ltrack-dot--done'
          : 'ltrack-dot'
      const abbr = tierAbbreviation(m, i)
      return `<span class="${cls}" title="${escapeHtml(m.opponentName)}" style="font-size:0.7rem">${abbr}</span>`
    })
    .join('<span class="ltrack-line" aria-hidden="true"></span>')
  return `<div class="ladder-track">${dots}</div>`
}

export function buildChapterRail(
  chapter: Chapter,
  currentSceneId: string,
  completedSceneIds: readonly string[],
): string {
  const matches = chapter.scenes.filter((s): s is MatchScene => s.type === 'match')
  if (!matches.length) return ''
  const completed = new Set(completedSceneIds)
  const rows = matches
    .map((m, idx) => {
      const done = completed.has(m.id)
      const current = m.id === currentSceneId
      const cls = current
        ? 'chapter-rail__row chapter-rail__row--current'
        : done
          ? 'chapter-rail__row chapter-rail__row--done'
          : 'chapter-rail__row'
      return `<div class="${cls}">
        <span class="chapter-rail__idx">${idx + 1}</span>
        <span class="chapter-rail__name">${escapeHtml(m.opponentName)}</span>
      </div>`
    })
    .join('')
  return `<p class="chapter-rail__title">${escapeHtml(chapter.title)} Ladder</p>${rows}`
}
