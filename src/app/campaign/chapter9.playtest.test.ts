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

function chapterNineFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch9 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch9')
  flow.highestUnlockedChapter = ch9
  return { flow, ch9, onChapterComplete, onCampaignFinished }
}

describe('Chapter IX playtest', () => {
  it('walks the Apotheosis age: lore, three drills, and both examiners', () => {
    const { flow, ch9 } = chapterNineFlow()
    const chapter = PLAYABLE_CHAPTERS[ch9]!
    expect(chapter.themeClass).toBe('theme-classical')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c9-intro',
      'c9-codex-engine',
      'c9-puzzle-census',
      'c9-puzzle-compile',
      'c9-puzzle-last-rank',
      'c9-after-puzzles',
      'c9-before-wren',
      'c9-match-wren',
      'c9-after-wren',
      'c9-before-bram',
      'c9-match-bram',
      'c9-reflection',
      'c9-freeplay',
    ])

    flow.jumpToScene(ch9, 0)
    expect(flow.currentScene().id).toBe('c9-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-codex-engine')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c9-puzzle-census')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e2', 'e6')
    expect(flow.chess.get('e6')?.type).toBe('r')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c9-puzzle-compile')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e4', 'd6')
    expect(flow.chess.get('d6')?.type).toBe('n')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c9-puzzle-last-rank')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('a1', 'a8')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c9-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-before-wren')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-match-wren')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('e5')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-after-wren')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-before-bram')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c9-match-bram')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('Nf6')
  })

  it('seals the Apotheosis age and finishes the compiled campaign', () => {
    const { flow, ch9, onChapterComplete, onCampaignFinished } = chapterNineFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch9]!.scenes.findIndex((scene) => scene.id === 'c9-freeplay')
    flow.jumpToScene(ch9, freeIdx)
    expect(flow.currentScene().id).toBe('c9-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).toHaveBeenCalled()
    expect(flow.chapter9Complete).toBe(true)
  })
})
