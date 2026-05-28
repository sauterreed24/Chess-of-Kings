import { describe, expect, it } from 'vitest'
import { chapterProgressSummary, countInscribedAges, renderChapterProgressHtml } from './chapterProgress'

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

  it('renders progress HTML with aria-live', () => {
    const html = renderChapterProgressHtml(0)
    expect(html).toContain('chapter-progress')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('1 of')
  })
})
