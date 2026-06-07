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
    boardStatus: node<HTMLSpanElement>('span'),
    turnPulseEl: node<HTMLSpanElement>('span'),
    moveCounterEl: node<HTMLSpanElement>('span'),
    aiPersonaEl: node<HTMLParagraphElement>('p'),
    aiFlavorEl: node<HTMLParagraphElement>('p'),
    tacticalPulseEl: node<HTMLParagraphElement>('p'),
    boardGuide: node<HTMLParagraphElement>('p'),
    mobileBoardGuide: node<HTMLParagraphElement>('p'),
    recoveryControls: node(),
    btnRecoveryRestore: node<HTMLButtonElement>('button'),
    btnUndo: node<HTMLButtonElement>('button'),
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
    expect(dom.calibrationTrack.querySelectorAll('.cal-dot--on')).toHaveLength(4)
  })
})
