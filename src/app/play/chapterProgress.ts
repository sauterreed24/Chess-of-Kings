import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { LOCKED_ROADMAP } from '../../data/roadmap'

export type ChapterProgressSummary = {
  inscribed: number
  total: number
  label: string
}

/** Count playable chapters the player has fully unlocked (index <= highestUnlockedChapter). */
export function countInscribedAges(highestUnlockedChapter: number): number {
  return PLAYABLE_CHAPTERS.filter((_, i) => i <= highestUnlockedChapter).length
}

export function chapterProgressSummary(highestUnlockedChapter: number): ChapterProgressSummary {
  const total = PLAYABLE_CHAPTERS.length + LOCKED_ROADMAP.length
  const inscribed = countInscribedAges(highestUnlockedChapter)
  return {
    inscribed,
    total,
    label: `${inscribed} of ${total} ages inscribed`,
  }
}

export function renderChapterProgressHtml(highestUnlockedChapter: number): string {
  const { label } = chapterProgressSummary(highestUnlockedChapter)
  return `<p class="chapter-progress" id="chapter-progress" aria-live="polite">${label}</p>`
}
