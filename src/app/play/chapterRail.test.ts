import { describe, expect, it } from 'vitest'
import { buildChapterRail, buildLadderTrack } from './chapterRail'
import type { Chapter, MatchScene } from '../../types'

function matchScene(over: Partial<MatchScene> & Pick<MatchScene, 'id' | 'opponentName'>): MatchScene {
  return {
    type: 'match',
    title: over.title ?? 'Match',
    opponentNote: 'note',
    playerColor: 'w',
    aiDepth: 2,
    aiStyle: 'development',
    ...over,
  } as MatchScene
}

function chapter(scenes: Chapter['scenes']): Chapter {
  return {
    id: 'ch-test',
    index: 0,
    title: 'Chapter I',
    subtitle: 'Trial of the Archive',
    era: 'Era',
    themeClass: 'theme-test',
    philosophy: 'phi',
    scenes,
  }
}

describe('buildLadderTrack', () => {
  it('returns empty string when chapter has fewer than two match scenes', () => {
    expect(buildLadderTrack(chapter([]), 'x', [])).toBe('')
    expect(buildLadderTrack(chapter([matchScene({ id: 'm1', opponentName: 'A' })]), 'm1', [])).toBe('')
  })

  it('marks current, done, and pending dots; abbreviates boss/mini-boss/counterpart tiers', () => {
    const ch = chapter([
      matchScene({ id: 'm1', opponentName: 'Amara' }),
      matchScene({ id: 'm2', opponentName: 'Lukas', ladderTier: 'mini-boss' }),
      matchScene({ id: 'm3', opponentName: 'Edred', ladderTier: 'boss' }),
      matchScene({ id: 'm4', opponentName: 'Demetrios', ladderTier: 'counterpart' }),
    ])
    const html = buildLadderTrack(ch, 'm2', ['m1'])
    expect(html).toContain('ladder-track')
    expect(html).toContain('ltrack-dot--done')
    expect(html).toContain('ltrack-dot--current')
    expect(html).toContain('>1<')
    expect(html).toContain('>M<')
    expect(html).toContain('>B<')
    expect(html).toContain('>C<')
    expect(html).toContain('Amara')
    expect(html).toContain('Lukas')
  })

  it('escapes opponent names to prevent injection', () => {
    const ch = chapter([
      matchScene({ id: 'm1', opponentName: '<script>x</script>' }),
      matchScene({ id: 'm2', opponentName: 'safe' }),
    ])
    const html = buildLadderTrack(ch, 'm1', [])
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('buildChapterRail', () => {
  it('returns empty string when chapter has no match scenes', () => {
    expect(buildChapterRail(chapter([]), 'x', [])).toBe('')
  })

  it('emits one row per match with current/done classes and 1-indexed ids', () => {
    const ch = chapter([
      matchScene({ id: 'm1', opponentName: 'Amara' }),
      matchScene({ id: 'm2', opponentName: 'Lukas' }),
      matchScene({ id: 'm3', opponentName: 'Edred' }),
    ])
    const html = buildChapterRail(ch, 'm2', ['m1'])
    expect(html).toContain('Chapter I Ladder')
    expect(html).toContain('chapter-rail__row--done')
    expect(html).toContain('chapter-rail__row--current')
    expect(html).toContain('>1<')
    expect(html).toContain('>2<')
    expect(html).toContain('>3<')
    expect(html).toContain('Amara')
  })

  it('escapes chapter title and opponent names', () => {
    const ch = chapter([matchScene({ id: 'm1', opponentName: '<b>x</b>' })])
    const titled: Chapter = { ...ch, title: '<i>Title</i>' }
    const html = buildChapterRail(titled, 'm1', [])
    expect(html).not.toContain('<i>Title</i>')
    expect(html).toContain('&lt;i&gt;Title&lt;/i&gt;')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
})
