import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { LOCKED_ROADMAP } from '../../data/roadmap'

export type ChapterProgressSummary = {
  inscribed: number
  total: number
  label: string
}

const AGE_SHORT: Record<string, string> = {
  prologue: 'Lens',
  ch1: 'Ancient',
  ch2: 'Romantic',
  ch3: 'Classical',
  ch4: 'Paradox',
  ch5: 'Machine',
  ch6: 'Silicon',
  ch7: 'Synthesis',
}

export type DoctrineAtlasMark = {
  id: string
  short: string
  state: 'sealed' | 'current' | 'locked'
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

export function doctrineAtlasMarks(highestUnlockedChapter: number): DoctrineAtlasMark[] {
  return PLAYABLE_CHAPTERS.map((chapter, index) => ({
    id: chapter.id,
    short: AGE_SHORT[chapter.id] ?? chapter.title,
    state:
      index < highestUnlockedChapter
        ? 'sealed'
        : index === highestUnlockedChapter
          ? 'current'
          : 'locked',
  }))
}

export function renderChapterProgressHtml(highestUnlockedChapter: number): string {
  const { label } = chapterProgressSummary(highestUnlockedChapter)
  const marks = doctrineAtlasMarks(highestUnlockedChapter)
    .map(
      (mark) =>
        `<li class="doctrine-atlas__mark doctrine-atlas__mark--${mark.state}">${mark.short}</li>`,
    )
    .join('')
  return `<div class="chapter-progress-wrap">
    <p class="chapter-progress" id="chapter-progress" aria-live="polite">${label}</p>
    <ol class="doctrine-atlas" aria-label="Doctrine succession">${marks}</ol>
  </div>`
}
