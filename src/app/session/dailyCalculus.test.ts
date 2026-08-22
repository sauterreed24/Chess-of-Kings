import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { collectPuzzlePool, pickDailyCalculus } from './dailyCalculus'
import type { Chapter, PuzzleScene } from '../../types'

function puzzle(id: string, title: string): PuzzleScene {
  return {
    type: 'puzzle',
    id,
    title,
    fen: '8/8/8/8/8/8/8/4K2k w - - 0 1',
    playerColor: 'w',
    goal: { kind: 'mate' },
    lesson: 'lesson',
  }
}

function chapter(id: string, title: string, puzzleIds: Array<[string, string]>): Chapter {
  return {
    id,
    index: 0,
    title,
    subtitle: 'sub',
    era: 'era',
    themeClass: 'theme',
    philosophy: 'phi',
    scenes: [
      { type: 'dialogue', id: `${id}-d`, lines: [] },
      ...puzzleIds.map(([pid, ptitle]) => puzzle(pid, ptitle)),
    ],
  }
}

const FIXTURE: Chapter[] = [
  chapter('ch1', 'Chapter I', [
    ['p1', 'Trial of Composure'],
    ['p2', 'Trial of Tempo'],
    ['p3', 'Trial of Patience'],
  ]),
  chapter('ch2', 'Chapter II', [['p4', 'Trial of Sight']]),
]

describe('collectPuzzlePool', () => {
  it('flattens every PuzzleScene with its chapter / scene indices', () => {
    const pool = collectPuzzlePool(FIXTURE)
    expect(pool.map((p) => p.scene.id)).toEqual(['p1', 'p2', 'p3', 'p4'])
    expect(pool[0]!.chapterIndex).toBe(0)
    expect(pool[0]!.sceneIndex).toBe(1)
    expect(pool[3]!.chapterIndex).toBe(1)
    expect(pool[3]!.sceneIndex).toBe(1)
  })

  it('returns an empty pool when no chapter has a puzzle', () => {
    expect(collectPuzzlePool([chapter('z', 'Z', [])])).toEqual([])
  })

  it('includes Chapter V–IX drills in the live campaign pool', () => {
    const ids = collectPuzzlePool(PLAYABLE_CHAPTERS).map((p) => p.scene.id)
    expect(ids).toEqual(expect.arrayContaining([
      'c4-puzzle-fianchetto',
      'c4-puzzle-overreach',
      'c4-puzzle-battery',
      'c5-puzzle-luft',
      'c5-puzzle-conversion',
      'c5-puzzle-squeeze',
      'c6-puzzle-outpost',
      'c6-puzzle-precision',
      'c6-puzzle-backrank',
      'c7-puzzle-switch',
      'c7-puzzle-wing',
      'c7-puzzle-smother',
      'c8-puzzle-exchange',
      'c8-puzzle-fork',
      'c8-puzzle-file',
      'c9-puzzle-census',
      'c9-puzzle-compile',
      'c9-puzzle-last-rank',
    ]))
    expect(ids.length).toBeGreaterThanOrEqual(20)
  })
})

describe('pickDailyCalculus', () => {
  it('returns null when there are no puzzles', () => {
    expect(pickDailyCalculus([chapter('z', 'Z', [])], new Date(2026, 3, 28))).toBeNull()
  })

  it('is deterministic for a given local date', () => {
    const a = pickDailyCalculus(FIXTURE, new Date(2026, 3, 28))
    const b = pickDailyCalculus(FIXTURE, new Date(2026, 3, 28, 23, 59, 59))
    expect(a).not.toBeNull()
    expect(a).toEqual(b)
  })

  it('rotates day-to-day (visits more than one puzzle across a small span)', () => {
    const ids = new Set<string>()
    for (let d = 0; d < 60; d++) {
      const pick = pickDailyCalculus(FIXTURE, new Date(2026, 3, 28 + d))!
      ids.add(pick.puzzleId)
    }
    expect(ids.size).toBeGreaterThan(1)
  })

  it('always returns a puzzle that exists in the supplied chapter list', () => {
    const allowed = new Set(['p1', 'p2', 'p3', 'p4'])
    for (let d = 0; d < 30; d++) {
      const pick = pickDailyCalculus(FIXTURE, new Date(2026, 5, 1 + d))!
      expect(allowed.has(pick.puzzleId)).toBe(true)
    }
  })

  it('returns indices that point at the picked puzzle in the supplied list', () => {
    const pick = pickDailyCalculus(FIXTURE, new Date(2026, 3, 28))!
    const chosen = FIXTURE[pick.chapterIndex]!.scenes[pick.sceneIndex]!
    expect(chosen.type).toBe('puzzle')
    expect((chosen as PuzzleScene).id).toBe(pick.puzzleId)
  })
})
