import { describe, expect, it, vi } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { renderScene } from './renderScene'
import { createMountPlayState, type MountDomRefs } from '../mountContext'
import { GameFlow } from '../gameFlow'

function minimalDom(): MountDomRefs {
  document.body.innerHTML = `
    <div id="app">
      <section id="screen-play" data-theme="">
        <header class="play-crawl">
          <p id="play-chapter-label"></p>
          <h2 id="play-chapter-title"></h2>
          <p id="play-chapter-sub"></p>
          <p id="play-philosophy"></p>
          <span id="scene-progress"></span>
        </header>
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
        <div class="move-ledger-wrap"><div id="move-ledger"></div></div>
        <div class="instrument-toggles"></div>
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
    btnHint: document.createElement('button'),
    btnNext: q('#btn-next'),
    btnNextHint: q('#btn-next-hint'),
    btnSkipAhead: document.createElement('button'),
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
    expect(dom.narrativeBody.querySelector('.line')?.getAttribute('data-voice')).toBe('archive')
    expect(dom.narrativeBody.querySelector('.line')?.getAttribute('data-spoken-duration-ms')).toMatch(/^\d+$/)
    const lineDelays = [...dom.narrativeBody.querySelectorAll<HTMLElement>('.line')].map((line) =>
      line.style.getPropertyValue('--line-delay'),
    )
    const lineDelayValues = lineDelays.map((delay) => Number(delay.replace('ms', '')))
    expect(lineDelayValues[0]).toBe(90)
    expect(lineDelayValues[1]).toBeGreaterThan(1080)
    expect(lineDelayValues[2]).toBeGreaterThan(lineDelayValues[1]!)
    expect(dom.narrativeBody.querySelector('.speaker-seal')?.textContent).toBe('AR')
    expect(dom.narrativeBody.querySelector('.spoken-char')).not.toBeNull()
    expect(dom.narrativeBody.querySelector('.spoken-text')?.getAttribute('aria-hidden')).toBe('true')
    expect(dom.narrativeBody.querySelector<HTMLElement>('.spoken-char')?.style.getPropertyValue('--char-delay')).toContain('ms')
    expect(dom.narrativeBody.querySelector('.sr-only')?.textContent).toContain('Rain threads the window')
    expect(dom.narrativeBody.textContent).toContain('A player without a method')
    /* Onboarding accelerator: the opening prologue prose offers a one-tap
       jump to the first board (the calibration). */
    expect(dom.btnSkipAhead.classList.contains('hidden')).toBe(false)
    expect(dom.btnSkipAhead.dataset.target).toBe('4')
  })

  it('hides the skip-ahead affordance on board scenes and outside the prologue', () => {
    const dom = minimalDom()
    const play = createMountPlayState()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const render = (chapter: (typeof PLAYABLE_CHAPTERS)[number], idx: number) =>
      renderScene(chapter, chapter.scenes[idx]!, idx, dom, play, flow, {
        setBoardVisible: () => {},
        updateAdvance: () => {},
        syncNarrativeFade: () => {},
        revealBoardScene: () => {},
      })
    /* Prologue calibration (a board scene) — no skip. */
    const prologue = PLAYABLE_CHAPTERS[0]!
    const calibIdx = prologue.scenes.findIndex((s) => s.type === 'calibration')
    render(prologue, calibIdx)
    expect(dom.btnSkipAhead.classList.contains('hidden')).toBe(true)
    /* A later chapter's prose — story stays intact, no skip offered. */
    flow.highestUnlockedChapter = 1
    flow.jumpToChapter(1)
    expect(flow.chapterIndex).toBe(1)
    render(PLAYABLE_CHAPTERS[1]!, 0)
    expect(dom.btnSkipAhead.classList.contains('hidden')).toBe(true)
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
    expect(traitText).toContain('Court Dossier')
    expect(traitText).toContain('Rowan Gambit Tabiya')
    expect(traitText).toContain('Audacity')
    expect(dom.lessonNote.textContent).toContain('Weather the first wave')
  })

  it('marks Alexion dialogue with a distinct render voice and seal', () => {
    const dom = minimalDom()
    const play = createMountPlayState()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const chapter = PLAYABLE_CHAPTERS.find((ch) =>
      ch.scenes.some((scene) => scene.type === 'dialogue' && scene.lines.some((line) => line.speaker === 'alexion')),
    )!
    const sceneIndex = chapter.scenes.findIndex(
      (scene) => scene.type === 'dialogue' && scene.lines.some((line) => line.speaker === 'alexion'),
    )
    const scene = chapter.scenes[sceneIndex]!
    renderScene(chapter, scene, sceneIndex, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })

    const alexionLine = dom.narrativeBody.querySelector<HTMLElement>('.line[data-voice="alexion"]')
    expect(alexionLine).not.toBeNull()
    expect(alexionLine?.querySelector('.speaker-seal')?.textContent).toBe('A')
    expect(alexionLine?.querySelector('.who')?.textContent).toContain('Alexion')
  })

  it('renders calibration as an archive lens instead of a generic trainer', () => {
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
    const sceneIndex = chapter.scenes.findIndex((scene) => scene.type === 'calibration')
    const scene = chapter.scenes[sceneIndex]!
    renderScene(chapter, scene, sceneIndex, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })

    expect(dom.sceneTag.textContent).toContain('archive lens')
    expect(dom.narrativeBody.textContent).toContain('The Archive replies')
    expect(dom.narrativeBody.textContent).toContain('The Archive answers')
    expect(dom.narrativeBody.textContent).not.toContain('adaptive trainer')
  })

  it('shows the eval HUD on freeplay and hides it on calibration', () => {
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
    const calibIdx = chapter.scenes.findIndex((scene) => scene.type === 'calibration')
    renderScene(chapter, chapter.scenes[calibIdx]!, calibIdx, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })
    expect(play.showEvalBar).toBe(false)
    expect(dom.evalBarWrap.classList.contains('hidden')).toBe(true)

    const freeIdx = PLAYABLE_CHAPTERS[1]!.scenes.findIndex((scene) => scene.type === 'freeplay')
    const freeChapter = freeIdx >= 0 ? PLAYABLE_CHAPTERS[1]! : PLAYABLE_CHAPTERS.find((ch) => ch.scenes.some((s) => s.type === 'freeplay'))!
    const freeSceneIdx = freeChapter.scenes.findIndex((scene) => scene.type === 'freeplay')
    flow.highestUnlockedChapter = freeChapter.index
    flow.jumpToChapter(freeChapter.index)
    renderScene(freeChapter, freeChapter.scenes[freeSceneIdx]!, freeSceneIdx, dom, play, flow, {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    })
    expect(play.showEvalBar).toBe(true)
    expect(dom.evalBarWrap.classList.contains('hidden')).toBe(false)
    expect(dom.capturedTop.classList.contains('hidden')).toBe(false)
  })

  it('collapses match chrome on teaching puzzles and restores it on living boards', () => {
    const dom = minimalDom()
    const play = createMountPlayState()
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const cbs = {
      setBoardVisible: () => {},
      updateAdvance: () => {},
      syncNarrativeFade: () => {},
      revealBoardScene: () => {},
    }
    const crawl = () => dom.app.querySelector('.play-crawl')
    const ledgerWrap = () => dom.moveLedger.closest('.move-ledger-wrap')
    const toggles = () => dom.app.querySelector('.instrument-toggles')

    const chapterI = PLAYABLE_CHAPTERS.find((ch) => ch.id === 'ch1')!
    flow.highestUnlockedChapter = chapterI.index
    flow.jumpToChapter(chapterI.index)
    const hangingIdx = chapterI.scenes.findIndex((scene) => scene.id === 'c1-tutorial-hanging')
    renderScene(chapterI, chapterI.scenes[hangingIdx]!, hangingIdx, dom, play, flow, cbs)
    expect(crawl()?.classList.contains('hidden')).toBe(true)
    expect(ledgerWrap()?.classList.contains('hidden')).toBe(true)
    expect(toggles()?.classList.contains('hidden')).toBe(true)
    expect(dom.lessonNote.classList.contains('hidden')).toBe(true)
    expect(dom.narrativeBody.hasAttribute('data-puzzle-lesson')).toBe(true)
    expect(dom.narrativeBody.querySelector('.teaching-card')).toBeTruthy()
    expect(dom.narrativeBody.querySelector('.teaching')?.classList.contains('hidden')).toBe(false)

    const amaraIdx = chapterI.scenes.findIndex((scene) => scene.id === 'c1-match-amara')
    renderScene(chapterI, chapterI.scenes[amaraIdx]!, amaraIdx, dom, play, flow, cbs)
    expect(crawl()?.classList.contains('hidden')).toBe(false)
    expect(ledgerWrap()?.classList.contains('hidden')).toBe(false)
    expect(toggles()?.classList.contains('hidden')).toBe(false)
    expect(dom.lessonNote.classList.contains('hidden')).toBe(false)
    expect(dom.narrativeBody.hasAttribute('data-puzzle-lesson')).toBe(false)

    const prologue = PLAYABLE_CHAPTERS[0]!
    flow.jumpToChapter(0)
    const calibIdx = prologue.scenes.findIndex((scene) => scene.type === 'calibration')
    renderScene(prologue, prologue.scenes[calibIdx]!, calibIdx, dom, play, flow, cbs)
    expect(crawl()?.classList.contains('hidden')).toBe(false)
    expect(ledgerWrap()?.classList.contains('hidden')).toBe(false)
    expect(toggles()?.classList.contains('hidden')).toBe(false)
  })
})
