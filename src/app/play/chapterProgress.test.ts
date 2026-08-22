import { describe, expect, it } from 'vitest'
import {
  chapterProgressSummary,
  countInscribedAges,
  doctrineAtlasMarks,
  renderChapterProgressHtml,
} from './chapterProgress'

describe('chapterProgress', () => {
  it('counts inscribed playable chapters up to highestUnlockedChapter', () => {
    expect(countInscribedAges(0)).toBe(1)
    expect(countInscribedAges(2)).toBe(3)
  })

  it('includes locked roadmap in total ages', () => {
    const s = chapterProgressSummary(1)
    expect(s.inscribed).toBe(2)
    expect(s.total).toBeGreaterThanOrEqual(9)
    expect(s.label).toMatch(/2 of \d+ ages inscribed/)
  })

  it('renders progress HTML with aria-live and a doctrine atlas', () => {
    const html = renderChapterProgressHtml(0)
    expect(html).toContain('chapter-progress')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('1 of')
    expect(html).toContain('doctrine-atlas')
    expect(html).toContain('Lens')
    expect(html).toContain('Paradox')
    expect(html).toContain('Machine')
    expect(html).toContain('Silicon')
    expect(html).toContain('Synthesis')
    expect(html).toContain('Board')
  })

  it('marks sealed, current, and locked ages along the succession', () => {
    const marks = doctrineAtlasMarks(3)
    expect(marks.find((mark) => mark.id === 'ch2')?.state).toBe('sealed')
    expect(marks.find((mark) => mark.id === 'ch3')?.state).toBe('current')
    expect(marks.find((mark) => mark.id === 'ch4')?.state).toBe('locked')
  })
})
