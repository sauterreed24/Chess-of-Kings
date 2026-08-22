import { Chess } from 'chess.js'
import { describe, expect, it, vi } from 'vitest'
import { createAnnouncer } from '../a11y/announcer'
import { createSfxController } from '../audio/sfx'
import type { ChessUiPayload } from '../gameFlow'
import { createMountPlayState, type MountDomRefs } from '../mountContext'
import { applyChessUi } from './applyChessUi'

function node<T extends HTMLElement>(tag: keyof HTMLElementTagNameMap = 'div'): T {
  return document.createElement(tag) as T
}

function refs(): MountDomRefs {
  const app = node<HTMLDivElement>()
  const calibrationRail = node<HTMLDivElement>()
  calibrationRail.classList.add('hidden')
  const calibrationLabel = document.createElement('span')
  calibrationLabel.className = 'calibration-rail__label'
  calibrationLabel.textContent = 'White moves inscribed'
  calibrationRail.appendChild(calibrationLabel)
  const boardStatus = node<HTMLSpanElement>('span')
  const wrap = document.createElement('div')
  wrap.className = 'status-pill-wrap'
  wrap.appendChild(boardStatus)
  const aiPersonaEl = node<HTMLParagraphElement>('p')
  const aiFlavorEl = node<HTMLParagraphElement>('p')
  const tacticalPulseEl = node<HTMLParagraphElement>('p')
  const recoveryControls = node()
  const header = document.createElement('div')
  header.className = 'instrument-header'
  header.append(wrap, aiPersonaEl, aiFlavorEl, tacticalPulseEl, recoveryControls)
  return {
    app,
    playScreen: node(),
    boardPanel: node(),
    manuscriptPanel: node(),
    boardStage: node(),
    narrativeBody: node(),
    sceneTag: node<HTMLParagraphElement>('p'),
    chapterRail: node(),
    sceneProgress: node<HTMLSpanElement>('span'),
    lessonNote: node<HTMLParagraphElement>('p'),
    coachTipEl: node<HTMLParagraphElement>('p'),
    btnReset: node<HTMLButtonElement>('button'),
    btnNext: node<HTMLButtonElement>('button'),
    btnNextHint: node<HTMLSpanElement>('span'),
    boardStatus,
    turnPulseEl: node<HTMLSpanElement>('span'),
    moveCounterEl: node<HTMLSpanElement>('span'),
    aiPersonaEl,
    aiFlavorEl,
    tacticalPulseEl,
    boardGuide: node<HTMLParagraphElement>('p'),
    mobileBoardGuide: node<HTMLParagraphElement>('p'),
    recoveryControls,
    btnRecoveryRestore: node<HTMLButtonElement>('button'),
    btnUndo: node<HTMLButtonElement>('button'),
    btnRunBack: node<HTMLButtonElement>('button'),
    btnHint: node<HTMLButtonElement>('button'),
    moveLedger: node(),
    calibrationRail,
    calibrationTrack: node(),
    evalBarWrap: node(),
    evalBarFill: node(),
    evalBarScore: node<HTMLSpanElement>('span'),
    capturedTop: node(),
    capturedBot: node(),
    duelList: node(),
    duelPanel: node(),
    labEraLabel: node<HTMLSpanElement>('span'),
  }
}

function payload(chess: Chess): ChessUiPayload {
  return {
    chess,
    fen: chess.fen(),
    status: 'Black to move.',
    canUndo: false,
    sanLog: ['e4'],
    sanQuality: [null],
    ledgerFp: 1,
    calibration: { current: 4, target: 4 },
    inCheck: false,
    aiThinking: false,
    coachTip: null,
    matchOutcome: null,
    evalScore: 0,
    canRetry: false,
    canHint: false,
    mentorInsight: null,
    aiPersona: null,
    aiFlavor: null,
    tacticalPulse: null,
    sessionRecovered: false,
    canRestoreStable: false,
    boardGuide: 'Calibration complete.',
  }
}

describe('applyChessUi', () => {
  it('prioritizes a sealed calibration proof over the raw side to move', () => {
    const chess = new Chess()
    chess.move('e4')
    const dom = refs()

    applyChessUi(
      payload(chess),
      {
        dom,
        play: createMountPlayState(),
        getFlow: () => null,
        sfx: createSfxController({ enabled: false }),
        announcer: createAnnouncer(node()),
      },
      {
        showRewardBundles: vi.fn(),
        maybeShowPendingChapterPrompt: vi.fn(),
        revealBoardScene: vi.fn(),
      },
    )

    expect(dom.turnPulseEl.textContent).toBe('Sealed')
    expect(dom.turnPulseEl.classList.contains('play-chip--done')).toBe(true)
    expect(dom.turnPulseEl.classList.contains('play-chip--black')).toBe(false)
    expect(dom.boardStatus.textContent).toBe('Proof sealed.')
    expect(dom.boardStage.classList.contains('board-stage--black-turn')).toBe(false)
    expect(dom.moveCounterEl.textContent).toBe('4/4 White moves')
    expect(dom.calibrationRail.classList.contains('hidden')).toBe(false)
    expect(dom.calibrationRail.querySelector('.calibration-rail__label')?.textContent).toBe('4 / 4 inscribed')
    expect(dom.calibrationTrack.querySelectorAll('.cal-dot--on')).toHaveLength(4)
    expect(dom.boardStatus.classList.contains('hidden')).toBe(false)
    expect(dom.boardStatus.closest('.instrument-header')?.classList.contains('hidden')).toBe(false)
  })

  it('hides the ordinary side-to-move pill so the instrument command leads', () => {
    const chess = new Chess()
    const dom = refs()
    applyChessUi(
      { ...payload(chess), calibration: undefined, status: 'White to move.', boardGuide: 'Open the center' },
      {
        dom,
        play: createMountPlayState(),
        getFlow: () => null,
        sfx: createSfxController({ enabled: false }),
        announcer: createAnnouncer(node()),
      },
      {
        showRewardBundles: vi.fn(),
        maybeShowPendingChapterPrompt: vi.fn(),
        revealBoardScene: vi.fn(),
      },
    )
    expect(dom.boardStatus.textContent).toBe('White to move.')
    expect(dom.boardStatus.classList.contains('hidden')).toBe(true)
    expect(dom.boardStatus.parentElement?.classList.contains('hidden')).toBe(true)
    expect(dom.boardStatus.closest('.instrument-header')?.classList.contains('hidden')).toBe(true)
  })

  it('announces a quiet teaching seal without showing Draw', () => {
    const chess = new Chess('8/8/8/4k3/3B4/8/8/3K4 b - - 0 1')
    const dom = refs()
    const announcer = { say: vi.fn(), clear: vi.fn() }
    applyChessUi(
      {
        ...payload(chess),
        calibration: undefined,
        status: '',
        sanLog: ['Bxd4'],
        canUndo: true,
        boardGuide: 'Proof sealed. Continue when Advance appears.',
      },
      {
        dom,
        play: createMountPlayState(),
        getFlow: () => null,
        sfx: createSfxController({ enabled: false }),
        announcer,
      },
      {
        showRewardBundles: vi.fn(),
        maybeShowPendingChapterPrompt: vi.fn(),
        revealBoardScene: vi.fn(),
      },
    )
    expect(chess.isGameOver()).toBe(true)
    expect(dom.boardStatus.classList.contains('hidden')).toBe(true)
    expect(dom.boardStatus.closest('.instrument-header')?.classList.contains('hidden')).toBe(true)
    expect(dom.turnPulseEl.textContent).toBe('Sealed')
    expect(dom.turnPulseEl.classList.contains('play-chip--black')).toBe(false)
    expect(announcer.say).toHaveBeenCalledWith('Proof sealed. Advance when ready.')
  })

  it('keeps check and thinking on the status pill', () => {
    const chess = new Chess()
    const dom = refs()
    const rt = {
      dom,
      play: createMountPlayState(),
      getFlow: () => null,
      sfx: createSfxController({ enabled: false }),
      announcer: createAnnouncer(node()),
    }
    const cbs = {
      showRewardBundles: vi.fn(),
      maybeShowPendingChapterPrompt: vi.fn(),
      revealBoardScene: vi.fn(),
    }

    applyChessUi({ ...payload(chess), calibration: undefined, status: 'Check.', inCheck: true }, rt, cbs)
    expect(dom.boardStatus.textContent).toBe('Check.')
    expect(dom.boardStatus.classList.contains('hidden')).toBe(false)
    expect(dom.boardStatus.closest('.instrument-header')?.classList.contains('hidden')).toBe(false)

    applyChessUi({ ...payload(chess), calibration: undefined, aiThinking: true, status: 'White to move.' }, rt, cbs)
    expect(dom.boardStatus.textContent).toBe('Thinking…')
    expect(dom.boardStatus.classList.contains('hidden')).toBe(false)
  })

  it('files a court dossier for living rivals, not teaching puzzles', () => {
    const chess = new Chess()
    const dom = refs()
    const rt = {
      dom,
      play: createMountPlayState(),
      getFlow: () => null,
      sfx: createSfxController({ enabled: false }),
      announcer: createAnnouncer(node()),
    }
    const cbs = {
      showRewardBundles: vi.fn(),
      maybeShowPendingChapterPrompt: vi.fn(),
      revealBoardScene: vi.fn(),
    }

    applyChessUi({ ...payload(chess), aiPersona: 'Lukas · Phalanx · ledger school' }, rt, cbs)
    expect(dom.aiPersonaEl.classList.contains('hidden')).toBe(false)
    expect(dom.aiPersonaEl.textContent).toBe('Court dossier — Lukas · Phalanx · ledger school')
    expect(dom.boardStatus.closest('.instrument-header')?.classList.contains('hidden')).toBe(false)

    applyChessUi({ ...payload(chess), aiPersona: null }, rt, cbs)
    expect(dom.aiPersonaEl.classList.contains('hidden')).toBe(true)
  })

  it('hides Take back and Reset until a ply exists', () => {
    const chess = new Chess()
    const tools = document.createElement('div')
    tools.className = 'board-tools'
    const dom = refs()
    tools.append(dom.btnHint, dom.btnUndo, dom.btnRunBack, dom.btnReset)
    const rt = {
      dom,
      play: createMountPlayState(),
      getFlow: () => null,
      sfx: createSfxController({ enabled: false }),
      announcer: createAnnouncer(node()),
    }
    const cbs = {
      showRewardBundles: vi.fn(),
      maybeShowPendingChapterPrompt: vi.fn(),
      revealBoardScene: vi.fn(),
    }

    applyChessUi(
      {
        ...payload(chess),
        calibration: undefined,
        status: 'White to move.',
        canUndo: false,
        sanLog: [],
        sanQuality: [],
        canHint: true,
      },
      rt,
      cbs,
    )
    expect(dom.btnUndo.hidden).toBe(true)
    expect(dom.btnReset.hidden).toBe(true)
    expect(dom.btnHint.hidden).toBe(false)
    expect(tools.classList.contains('hidden')).toBe(false)

    applyChessUi(
      {
        ...payload(chess),
        calibration: undefined,
        status: 'White to move.',
        canUndo: true,
        sanLog: ['Bxd4'],
        sanQuality: [null],
        canHint: true,
      },
      rt,
      cbs,
    )
    expect(dom.btnUndo.hidden).toBe(false)
    expect(dom.btnUndo.disabled).toBe(false)
    expect(dom.btnReset.hidden).toBe(false)
  })

  it('keeps the tool row when Prove is docked even if Hint is idle', () => {
    const chess = new Chess()
    const tools = document.createElement('div')
    tools.className = 'board-tools'
    const dom = refs()
    tools.append(dom.btnHint, dom.btnNext, dom.btnUndo, dom.btnRunBack, dom.btnReset)
    const rt = {
      dom,
      play: createMountPlayState(),
      getFlow: () => null,
      sfx: createSfxController({ enabled: false }),
      announcer: createAnnouncer(node()),
    }
    const cbs = {
      showRewardBundles: vi.fn(),
      maybeShowPendingChapterPrompt: vi.fn(),
      revealBoardScene: vi.fn(),
    }

    applyChessUi(
      {
        ...payload(chess),
        calibration: undefined,
        status: 'White to move.',
        canUndo: false,
        sanLog: [],
        sanQuality: [],
        canHint: false,
      },
      rt,
      cbs,
    )
    expect(dom.btnHint.hidden).toBe(true)
    expect(tools.classList.contains('hidden')).toBe(false)
  })

  it('hides Reset on a docked puzzle so Advance and Take back share one row', () => {
    const chess = new Chess()
    const tools = document.createElement('div')
    tools.className = 'board-tools'
    const dom = refs()
    tools.append(dom.btnHint, dom.btnNext, dom.btnUndo, dom.btnRunBack, dom.btnReset)
    const rt = {
      dom,
      play: createMountPlayState(),
      getFlow: () => null,
      sfx: createSfxController({ enabled: false }),
      announcer: createAnnouncer(node()),
    }
    const cbs = {
      showRewardBundles: vi.fn(),
      maybeShowPendingChapterPrompt: vi.fn(),
      revealBoardScene: vi.fn(),
    }

    applyChessUi(
      {
        ...payload(chess),
        calibration: undefined,
        status: '',
        canUndo: true,
        sanLog: ['Bxd4'],
        sanQuality: [null],
        canHint: false,
      },
      rt,
      cbs,
    )
    expect(dom.btnReset.hidden).toBe(true)
    expect(dom.btnUndo.hidden).toBe(false)

    applyChessUi(
      {
        ...payload(chess),
        calibration: { current: 1, target: 4 },
        status: 'White to move.',
        canUndo: true,
        sanLog: ['e4'],
        sanQuality: [null],
        canHint: true,
      },
      rt,
      cbs,
    )
    expect(dom.btnReset.hidden).toBe(false)
  })
})
