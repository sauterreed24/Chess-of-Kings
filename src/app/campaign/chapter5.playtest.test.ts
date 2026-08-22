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

function chapterFiveFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch5 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch5')
  flow.highestUnlockedChapter = ch5
  return { flow, ch5, onChapterComplete, onCampaignFinished }
}

describe('Chapter V playtest', () => {
  it('walks the discipline age: lore, three drills, and both examiners', () => {
    const { flow, ch5 } = chapterFiveFlow()
    const chapter = PLAYABLE_CHAPTERS[ch5]!
    expect(chapter.themeClass).toBe('theme-classical')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c5-intro',
      'c5-codex-discipline',
      'c5-puzzle-luft',
      'c5-puzzle-conversion',
      'c5-puzzle-squeeze',
      'c5-after-puzzles',
      'c5-before-gage',
      'c5-match-gage',
      'c5-after-gage',
      'c5-before-helia',
      'c5-match-helia',
      'c5-reflection',
      'c5-freeplay',
    ])

    flow.jumpToScene(ch5, 0)
    expect(flow.currentScene().id).toBe('c5-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-codex-discipline')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c5-puzzle-luft')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('h2', 'h3')
    expect(flow.chess.get('h3')?.type).toBe('p')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c5-puzzle-conversion')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('d1', 'd5')
    expect(flow.chess.get('d5')?.type).toBe('q')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c5-puzzle-squeeze')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('a1', 'a8')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c5-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-before-gage')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-match-gage')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('d6')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-after-gage')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-before-helia')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c5-match-helia')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('e6')
  })

  it('seals the discipline age and finishes the compiled campaign', () => {
    const { flow, ch5, onChapterComplete, onCampaignFinished } = chapterFiveFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch5]!.scenes.findIndex((scene) => scene.id === 'c5-freeplay')
    flow.jumpToScene(ch5, freeIdx)
    expect(flow.currentScene().id).toBe('c5-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).toHaveBeenCalled()
    expect(flow.chapter5Complete).toBe(true)
  })
})
