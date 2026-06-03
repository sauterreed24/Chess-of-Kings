import { describe, expect, it, vi } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { renderScene } from './renderScene'
import { createMountPlayState, type MountDomRefs } from '../mountContext'
import { GameFlow } from '../gameFlow'

function minimalDom(): MountDomRefs {
  document.body.innerHTML = `
    <div id="app">
      <section id="screen-play" data-theme="">
        <p id="play-chapter-label"></p>
        <h2 id="play-chapter-title"></h2>
        <p id="play-chapter-sub"></p>
        <p id="play-philosophy"></p>
        <span id="scene-progress"></span>
        <p id="scene-tag"></p>
        <div id="play-atelier" class="play-atelier--solo"></div>
        <div id="narrative-body" class="narrative-body"></div>
        <aside id="chapter-rail" class="hidden"></aside>
        <div id="manuscript-panel"></div>
        <div id="board-panel" class="instrument-column--hidden"></div>
        <div id="board-stage"></div>
        <span id="board-status"></span>
        <span id="turn-pulse"></span>
        <span id="move-counter"></span>
        <div id="move-ledger"></div>
        <div id="calibration-rail" class="hidden"></div>
        <div id="eval-bar-wrap" class="hidden"></div>
        <div id="captured-top" class="hidden"></div>
        <div id="captured-bot" class="hidden"></div>
        <div id="eval-bar-fill"></div>
        <span id="eval-bar-score"></span>
        <p id="lesson-note"></p>
        <p id="coach-tip" class="hidden"></p>
        <button id="btn-reset"></button>
        <button id="btn-next"></button>
        <span id="btn-next-hint"></span>
      </section>
    </div>
  `
  const app = document.getElementById('app') as HTMLDivElement
  const q = <T extends HTMLElement>(sel: string) => app.querySelector<T>(sel)!
  return {
    app,
    playScreen: q('#screen-play'),
    boardPanel: q('#board-panel'),
    manuscriptPanel: q('#manuscript-panel'),
    boardStage: q('#board-stage'),
    narrativeBody: q('#narrative-body'),
    sceneTag: q('#scene-tag'),
    chapterRail: q('#chapter-rail'),
    sceneProgress: q('#scene-progress'),
    lessonNote: q('#lesson-note'),
    coachTipEl: q('#coach-tip'),
    btnReset: q('#btn-reset'),
    btnNext: q('#btn-next'),
    btnNextHint: q('#btn-next-hint'),
    boardStatus: q('#board-status'),
    turnPulseEl: q('#turn-pulse'),
    moveCounterEl: q('#move-counter'),
    aiPersonaEl: document.createElement('p'),
    aiFlavorEl: document.createElement('p'),
    tacticalPulseEl: document.createElement('p'),
    boardGuide: document.createElement('p'),
    mobileBoardGuide: document.createElement('p'),
    recoveryControls: document.createElement('div'),
    btnRecoveryRestore: document.createElement('button'),
    btnUndo: document.createElement('button'),
    moveLedger: q('#move-ledger'),
    calibrationRail: q('#calibration-rail'),
    calibrationTrack: document.createElement('div'),
    evalBarWrap: q('#eval-bar-wrap'),
    evalBarFill: q('#eval-bar-fill'),
    evalBarScore: q('#eval-bar-score'),
    capturedTop: q('#captured-top'),
    capturedBot: q('#captured-bot'),
    duelList: document.createElement('div'),
    duelPanel: document.createElement('div'),
    labEraLabel: document.createElement('span'),
  }
}

describe('renderScene', () => {
  it('emits story-beat markup for the Prologue dialogue opening', () => {
    const dom = minimalDom()
    const play = createMountPlayState()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const chapter = PLAYABLE_CHAPTERS[0]!
    const scene = chapter.scenes[0]!
    renderScene(chapter, scene, 0, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })
    expect(dom.narrativeBody.querySelector('.story-beat')).not.toBeNull()
    expect(dom.narrativeBody.querySelector('.spoken-char')).not.toBeNull()
    expect(dom.narrativeBody.querySelector('.spoken-text')?.getAttribute('aria-hidden')).toBe('true')
    expect(dom.narrativeBody.querySelector('.sr-only')?.textContent).toContain('Rain threads the window')
    expect(dom.narrativeBody.textContent).toContain('A player without a method')
  })

  it('renders AI doctrine traits for campaign match briefings', () => {
    const dom = minimalDom()
    const play = createMountPlayState()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const chapter = PLAYABLE_CHAPTERS.find((ch) => ch.id === 'ch2')!
    const sceneIndex = chapter.scenes.findIndex((scene) => scene.id === 'c2-match-rowan')
    const scene = chapter.scenes[sceneIndex]!
    renderScene(chapter, scene, sceneIndex, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })

    const traitText = dom.narrativeBody.querySelector('.ai-traits')?.textContent ?? ''
    expect(traitText).toContain('AI Doctrine')
    expect(traitText).toContain('Rowan Gambit Tabiya')
    expect(traitText).toContain('Risk')
    expect(dom.lessonNote.textContent).toContain('Survive the first wave')
  })
})
