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

function chapterSixFlow() {
  const onChapterComplete = vi.fn()
  const onCampaignFinished = vi.fn()
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete,
    onCampaignFinished,
  })
  flow.board = mockBoard() as unknown as BoardView
  const ch6 = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch6')
  flow.highestUnlockedChapter = ch6
  return { flow, ch6, onChapterComplete, onCampaignFinished }
}

describe('Chapter VI playtest', () => {
  it('walks the ledger age: lore, three drills, and both examiners', () => {
    const { flow, ch6 } = chapterSixFlow()
    const chapter = PLAYABLE_CHAPTERS[ch6]!
    expect(chapter.themeClass).toBe('theme-classical')
    expect(chapter.scenes.map((scene) => scene.id)).toEqual([
      'c6-intro',
      'c6-codex-ledger',
      'c6-puzzle-outpost',
      'c6-puzzle-precision',
      'c6-puzzle-backrank',
      'c6-after-puzzles',
      'c6-before-prax',
      'c6-match-prax',
      'c6-after-prax',
      'c6-before-iota',
      'c6-match-iota',
      'c6-reflection',
      'c6-freeplay',
    ])

    flow.jumpToScene(ch6, 0)
    expect(flow.currentScene().id).toBe('c6-intro')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-codex-ledger')
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c6-puzzle-outpost')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('c3', 'd5')
    expect(flow.chess.get('d5')?.type).toBe('n')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c6-puzzle-precision')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e3', 'd5')
    expect(flow.chess.get('d5')?.type).toBe('n')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c6-puzzle-backrank')
    expect(flow.canAdvance()).toBe(false)
    flow.tryPlayerMove('e1', 'e8')
    expect(flow.chess.isCheckmate()).toBe(true)
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()

    expect(flow.currentScene().id).toBe('c6-after-puzzles')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-before-prax')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-match-prax')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('c5')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-after-prax')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-before-iota')
    flow.advanceScene()
    expect(flow.currentScene().id).toBe('c6-match-iota')
    expect(flow.currentScene().type === 'match' && flow.currentScene().scriptedBlackSans?.[0]).toBe('c6')
  })

  it('seals the ledger age and opens the Human Synthesis', () => {
    const { flow, ch6, onChapterComplete, onCampaignFinished } = chapterSixFlow()
    const freeIdx = PLAYABLE_CHAPTERS[ch6]!.scenes.findIndex((scene) => scene.id === 'c6-freeplay')
    flow.jumpToScene(ch6, freeIdx)
    expect(flow.currentScene().id).toBe('c6-freeplay')
    expect(flow.canAdvance()).toBe(true)
    flow.advanceScene()
    expect(onChapterComplete).toHaveBeenCalled()
    expect(onCampaignFinished).not.toHaveBeenCalled()
    expect(flow.chapter6Complete).toBe(true)
    expect(flow.currentScene().id).toBe('c7-intro')
  })
})
