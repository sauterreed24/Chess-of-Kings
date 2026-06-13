import type { Announcer } from './a11y/announcer'
import type { SfxController } from './audio/sfx'
import type { ChessUiPayload } from './gameFlow'
import type { GameFlow } from './gameFlow'

/** Mutable play-surface state shared by chess UI and scene rendering. */
export type MountPlayState = {
  showEvalBar: boolean
  prevSanLen: number
  lastLedgerKey: string
  lastCapturedFen: string
  lastCalKey: string
  lastEvalScore: number
  pendingBoardReveal: boolean
  prevSessionRecovered: boolean
  announcedOutcomeKey: string
  latestResolvedForRecap: ChessUiPayload | null
  lastAdvanceSig: string
  advanceWasReady: boolean
}

export function createMountPlayState(): MountPlayState {
  return {
    showEvalBar: false,
    prevSanLen: 0,
    lastLedgerKey: '',
    lastCapturedFen: '',
    lastCalKey: '',
    lastEvalScore: Number.NaN,
    pendingBoardReveal: false,
    prevSessionRecovered: false,
    announcedOutcomeKey: '',
    latestResolvedForRecap: null,
    lastAdvanceSig: '',
    advanceWasReady: false,
  }
}

/** DOM refs used by chess UI, scene, and duel renderers. */
export type MountDomRefs = {
  app: HTMLDivElement
  playScreen: HTMLElement
  boardPanel: HTMLDivElement
  manuscriptPanel: HTMLDivElement
  boardStage: HTMLDivElement
  narrativeBody: HTMLDivElement
  sceneTag: HTMLParagraphElement
  chapterRail: HTMLDivElement
  sceneProgress: HTMLSpanElement
  lessonNote: HTMLParagraphElement
  coachTipEl: HTMLParagraphElement
  btnReset: HTMLButtonElement
  btnNext: HTMLButtonElement
  btnNextHint: HTMLSpanElement
  btnSkipAhead: HTMLButtonElement
  boardStatus: HTMLSpanElement
  turnPulseEl: HTMLSpanElement
  moveCounterEl: HTMLSpanElement
  aiPersonaEl: HTMLParagraphElement
  aiFlavorEl: HTMLParagraphElement
  tacticalPulseEl: HTMLParagraphElement
  boardGuide: HTMLParagraphElement
  mobileBoardGuide: HTMLParagraphElement
  recoveryControls: HTMLDivElement
  btnRecoveryRestore: HTMLButtonElement
  btnUndo: HTMLButtonElement
  btnRunBack: HTMLButtonElement
  moveLedger: HTMLDivElement
  calibrationRail: HTMLDivElement
  calibrationTrack: HTMLDivElement
  evalBarWrap: HTMLDivElement
  evalBarFill: HTMLDivElement
  evalBarScore: HTMLSpanElement
  capturedTop: HTMLDivElement
  capturedBot: HTMLDivElement
  duelList: HTMLDivElement
  duelPanel: HTMLDivElement
  labEraLabel: HTMLSpanElement
}

export type MountRuntime = {
  dom: MountDomRefs
  play: MountPlayState
  getFlow: () => GameFlow | null
  sfx: SfxController
  announcer: Announcer
}
