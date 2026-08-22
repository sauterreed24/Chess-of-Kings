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

function chapterEightFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch8 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch8')
  flow.highestUnlockedChapter = ch8
  return { flow, ch8, onChapterComplete, onCampaignFinished }
}

describe('Chapter VIII playtest', () => {
  it('walks the Alexandrine age: lore, three drills, and both examiners', () => {
    const { flow, ch8 } = chapterEightFlow()
    const chapter = PLAYABLE_CHAPTERS[ch8]!
    expect(chapter.themeClass).toBe('theme-classical')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c8-intro',
      'c8-codex-board',
      'c8-puzzle-exchange',
      'c8-puzzle-fork',
      'c8-puzzle-file',
      'c8-after-puzzles',
      'c8-before-voss',
      'c8-match-voss',
      'c8-after-voss',
      'c8-before-elara',
      'c8-match-elara',
      'c8-reflection',
      'c8-freeplay',
    ])

    flow.jumpToScene(ch8, 0)
    expect(flow.currentScene().id).toBe('c8-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-codex-board')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c8-puzzle-exchange')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('d2', 'a5')
    expect(flow.chess.get('a5')?.type).toBe('q')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c8-puzzle-fork')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('d5', 'c7')
    expect(flow.chess.get('c7')?.type).toBe('n')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c8-puzzle-file')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('c3', 'g7')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c8-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-before-voss')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-match-voss')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('d5')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-after-voss')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-before-elara')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c8-match-elara')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('c5')
  })

  it('files the stratarchic seal when the Alexandrine reflection is left', () => {
    const { flow, ch8 } = chapterEightFlow()
    const reflectionIdx = PLAYABLE_CHAPTERS[ch8]!.scenes.findIndex((scene) => scene.id === 'c8-reflection')
    flow.jumpToScene(ch8, reflectionIdx)
    expect(flow.stratarchiaUnlocked).toBe(false)
    flow.advanceScene()
    expect(flow.stratarchiaUnlocked).toBe(true)
    expect(flow.currentScene().id).toBe('c8-freeplay')
  })

  it('seals the Alexandrine age and opens the Apotheosis Engine', () => {
    const { flow, ch8, onChapterComplete, onCampaignFinished } = chapterEightFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch8]!.scenes.findIndex((scene) => scene.id === 'c8-freeplay')
    flow.jumpToScene(ch8, freeIdx)
    expect(flow.currentScene().id).toBe('c8-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).not.toHaveBeenCalled()
    expect(flow.chapter8Complete).toBe(true)
    expect(flow.currentScene().id).toBe('c9-intro')
  })
})
