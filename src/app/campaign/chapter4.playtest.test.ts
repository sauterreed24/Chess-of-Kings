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

function chapterFourFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch4 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch4')
  flow.highestUnlockedChapter = ch4
  return { flow, ch4, onChapterComplete, onCampaignFinished }
}

describe('Chapter IV playtest', () => {
  it('walks the paradox age: lore, three drills, and both examiners', () => {
    const { flow, ch4 } = chapterFourFlow()
    const chapter = PLAYABLE_CHAPTERS[ch4]!
    expect(chapter.themeClass).toBe('theme-hypermodern')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c4-intro',
      'c4-codex-paradox',
      'c4-puzzle-fianchetto',
      'c4-puzzle-overreach',
      'c4-puzzle-battery',
      'c4-after-puzzles',
      'c4-before-nysa',
      'c4-match-nysa',
      'c4-after-nysa',
      'c4-before-cassian',
      'c4-match-cassian',
      'c4-reflection',
      'c4-freeplay',
    ])

    flow.jumpToScene(ch4, 0)
    expect(flow.currentScene().id).toBe('c4-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-codex-paradox')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c4-puzzle-fianchetto')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('f1', 'g2')
    expect(flow.chess.get('g2')?.type).toBe('b')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c4-puzzle-overreach')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('g2', 'd5')
    expect(flow.chess.get('d5')?.type).toBe('b')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c4-puzzle-battery')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('h3', 'c8')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c4-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-before-nysa')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-match-nysa')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('g6')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-after-nysa')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-before-cassian')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c4-match-cassian')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('Nf6')
  })

  it('seals the paradox age and finishes the compiled campaign', () => {
    const { flow, ch4, onChapterComplete, onCampaignFinished } = chapterFourFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch4]!.scenes.findIndex((scene) => scene.id === 'c4-freeplay')
    flow.jumpToScene(ch4, freeIdx)
    expect(flow.currentScene().id).toBe('c4-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).toHaveBeenCalled()
    expect(flow.chapter4Complete).toBe(true)
  })
})
