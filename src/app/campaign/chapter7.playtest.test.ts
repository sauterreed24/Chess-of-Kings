import { describe, expect, it, vi } from 'vitest'
import type { BoardView } from '../../chess/boardView'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { GameFlow } from '../gameFlow'

vi.mock('../storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

function mockBoard(): Pick<BoardView, 'draw' | 'setInteraction' | 'setOrientation' | 'setCheckSquare' | 'setSkin'> {
  return {
    draw: vi.fn(),
    setInteraction: vi.fn(),
    setOrientation: vi.fn(),
    setCheckSquare: vi.fn(),
    setSkin: vi.fn(),
  }
}

function chapterSevenFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch7 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch7')
  flow.highestUnlockedChapter = ch7
  return { flow, ch7, onChapterComplete, onCampaignFinished }
}

describe('Chapter VII playtest', () => {
  it('walks the synthesis age: lore, three drills, and both examiners', () => {
    const { flow, ch7 } = chapterSevenFlow()
    const chapter = PLAYABLE_CHAPTERS[ch7]!
    expect(chapter.themeClass).toBe('theme-classical')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c7-intro',
      'c7-codex-synthesis',
      'c7-puzzle-switch',
      'c7-puzzle-wing',
      'c7-puzzle-smother',
      'c7-after-puzzles',
      'c7-before-mira',
      'c7-match-mira',
      'c7-after-mira',
      'c7-before-soren',
      'c7-match-soren',
      'c7-reflection',
      'c7-freeplay',
    ])

    flow.jumpToScene(ch7, 0)
    expect(flow.currentScene().id).toBe('c7-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-codex-synthesis')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c7-puzzle-switch')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e4', 'd5')
    expect(flow.chess.get('d5')?.type).toBe('b')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c7-puzzle-wing')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e1', 'c1')
    expect(flow.chess.get('c1')?.type).toBe('k')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c7-puzzle-smother')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e5', 'f7')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c7-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-before-mira')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-match-mira')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('e5')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-after-mira')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-before-soren')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c7-match-soren')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('g6')
  })

  it('seals the synthesis age and finishes the compiled campaign', () => {
    const { flow, ch7, onChapterComplete, onCampaignFinished } = chapterSevenFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch7]!.scenes.findIndex((scene) => scene.id === 'c7-freeplay')
    flow.jumpToScene(ch7, freeIdx)
    expect(flow.currentScene().id).toBe('c7-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).toHaveBeenCalled()
    expect(flow.chapter7Complete).toBe(true)
  })
})
