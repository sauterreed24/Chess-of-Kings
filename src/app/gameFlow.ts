import { Chess, DEFAULT_POSITION } from 'chess.js'
import type { Move, Square, PieceSymbol } from 'chess.js'
import {
  findBestMove,
  findBestMoveWithProfile,
  findRandomMove,
  materialAdvantage,
  PIECE_VALUES,
} from '../chess/ai'
import type { AIStyle } from '../chess/evaluate'
import { materialAndPst } from '../chess/evaluate'
import { BoardView } from '../chess/boardView'
import type { BoardPickMode } from '../chess/boardView'
import type {
  CalibrationScene,
  Chapter,
  MatchScene,
  PuzzleScene,
  Scene,
  DuelRosterEntry,
  DuelVariant,
  PieceSkinId,
  RewardBundle,
  RewardDefinition,
  PlayerTendencyProfile,
  AiProfile,
  InProgressSnapshot,
  MatchHistoryEntry,
  RivalMemoryEntry,
} from '../types'
import { ledgerContentFingerprint } from './ledgerFingerprint'
import { loadSave, writeSave, type LastScreen, type SaveData } from './storage'
import { devWarn } from './devLog'
import { DUEL_ROSTER } from '../data/duelRoster'
import { CHAPTER_CLEAR_REWARDS, BASE_VICTORY_REWARDS } from '../data/rewards'
import {
  adaptProfileToPhase,
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
} from '../chess/aiProfiles'
import { chooseOpeningBookMove } from '../chess/openings'
import { detectTacticalMotifs } from '../chess/motifs'
import { lossRecoveryMentorLine } from '../game/trainingTips'

/** Vitest runs with MODE=test — keep save/UI synchronous so tests stay deterministic. */
const SYNC_IO = import.meta.env.MODE === 'test'
const PERSIST_DEBOUNCE_MS = 180

export type MatchOutcome = 'win' | 'loss' | 'draw' | null
export type MoveQuality = 'brilliant' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' | null

export type ChessUiPayload = {
  chess: Chess
  /** Position key for UI memoization (material / captured rows) without extra `chess.fen()` calls. */
  fen: string
  status: string
  canUndo: boolean
  sanLog: string[]
  sanQuality: MoveQuality[]
  /** Fingerprint of SAN + quality; pair with `fen` to detect ledger HTML changes cheaply. */
  ledgerFp: number
  calibration?: { current: number; target: number }
  inCheck: boolean
  aiThinking: boolean
  coachTip: string | null
  matchOutcome: MatchOutcome
  /** Centipawns from White's perspective — for the eval bar. */
  evalScore: number
  mentorInsight: string | null
  aiPersona: string | null
  aiFlavor: string | null
  tacticalPulse: string | null
  sessionRecovered: boolean
  canRestoreStable: boolean
  /** Short hint tied to turn / mode — shown as `aria-describedby` for the board. */
  boardGuide: string
}

type DuelSession = {
  roster: DuelRosterEntry
  variant: DuelVariant
  playerColor: 'w' | 'b'
  fen: string
  difficulty: 'novice' | 'balanced' | 'relentless'
}

type LastDuelSetup = {
  opponentId: string
  variantId: string
  playerColor: 'w' | 'b'
  difficulty: 'novice' | 'balanced' | 'relentless'
}

export type FlowHandlers = {
  onSceneChange: (chapter: Chapter, scene: Scene, sceneIndex: number) => void
  onChessUpdate: (payload: ChessUiPayload) => void
  onChapterComplete: (chapter: Chapter) => void
  onCampaignFinished: () => void
}

export class GameFlow {
  chapters: Chapter[]
  chapterIndex = 0
  sceneIndex = 0
  highestUnlockedChapter = 0
  lastScreen: LastScreen = 'title'
  chapter1Complete = false
  chapter2Complete = false
  completedSceneIds: string[] = []
  completedPuzzleIds: string[] = []
  stratarchiaUnlocked = false

  chess = new Chess()
  private history: string[] = []
  private sanLog: string[] = []
  board: BoardView | null = null
  private handlers: FlowHandlers
  private mode: 'idle' | 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel' = 'idle'
  private puzzleScene: PuzzleScene | null = null
  private matchScene: MatchScene | null = null
  private calibrationScene: CalibrationScene | null = null
  private playerColor: 'w' | 'b' = 'w'
  private calibrationMoves = 0
  private scriptedMoveIndex = 0
  private aiThinking = false
  private aiTimer = 0
  private lastCoachTip: string | null = null
  private sanQuality: MoveQuality[] = []
  private pendingRewards: RewardBundle[] = []
  private duelUnlockedOpponentIds: string[] = []
  private unlockedDuelVariantIds: string[] = ['alexion-mentor']
  private codexUnlocks: string[] = []
  private titleUnlocks: string[] = []
  private chronicleEchoes: string[] = []
  private rankPoints = 0
  private selectedPieceSkin: PieceSkinId = 'classic-royal'
  private unlockedPieceSkins: PieceSkinId[] = ['classic-royal']
  private tendencies: PlayerTendencyProfile = {
    flankPawnPushes: 0,
    earlyQueenMoves: 0,
    repeatedChecksWithoutGain: 0,
  }
  private duelSession: DuelSession | null = null
  private matchHistory: MatchHistoryEntry[] = []
  private lastResolvedOutcomeKey: string | null = null
  private rivalMemory: Record<string, RivalMemoryEntry> = {}
  private sceneTendencies: PlayerTendencyProfile = {
    flankPawnPushes: 0,
    earlyQueenMoves: 0,
    repeatedChecksWithoutGain: 0,
  }
  private lastTacticalPulse: string | null = null
  /** Last engine ply (from+to+promotion) — used to discourage immediate duplicate AI moves. */
  private lastAiMoveKey: string | null = null
  private pendingInProgressSnapshot: InProgressSnapshot | null = null
  private sessionRecoveredNotice = false
  private lastDuelSetup: LastDuelSetup | null = null
  private persistTimer: ReturnType<typeof setTimeout> | null = null
  private emitRafId = 0

  constructor(chapters: Chapter[], handlers: FlowHandlers) {
    this.chapters = chapters
    this.handlers = handlers
    const s = loadSave()
    if (s) {
      this.chapterIndex = Math.min(s.chapterIndex, chapters.length - 1)
      const ch = chapters[this.chapterIndex]!
      this.sceneIndex = Math.min(s.sceneIndex, ch.scenes.length - 1)
      this.highestUnlockedChapter = Math.min(s.highestUnlockedChapter, chapters.length - 1)
      this.lastScreen = s.lastScreen
      this.chapter1Complete = s.chapter1Complete
      this.chapter2Complete = s.chapter2Complete
      this.completedSceneIds = [...s.completedSceneIds]
      this.completedPuzzleIds = [...s.completedPuzzleIds]
      this.stratarchiaUnlocked = s.stratarchiaUnlocked
      this.duelUnlockedOpponentIds = [...s.duelUnlockedOpponentIds]
      this.unlockedDuelVariantIds = [...s.unlockedDuelVariantIds]
      this.codexUnlocks = [...s.codexUnlocks]
      this.titleUnlocks = [...s.titleUnlocks]
      this.chronicleEchoes = [...s.chronicleEchoes]
      this.rankPoints = s.rankPoints
      this.selectedPieceSkin = s.cosmetics.selectedPieceSkin
      this.unlockedPieceSkins = [...s.cosmetics.unlockedPieceSkins]
      this.tendencies = { ...s.tendencies }
      this.matchHistory = [...s.matchHistory]
      this.rivalMemory = { ...s.rivalMemory }
      this.pendingInProgressSnapshot = s.inProgress
    }
  }

  setLastScreen(screen: LastScreen) {
    this.lastScreen = screen
    this.persist()
  }

  /**
   * Debounced localStorage write (production) to avoid hammering storage during rapid play.
   * Tests use synchronous writes (see SYNC_IO).
   */
  persist() {
    if (SYNC_IO) {
      this.flushPersist()
      return
    }
    if (this.persistTimer !== null) window.clearTimeout(this.persistTimer)
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null
      this.flushPersist()
    }, PERSIST_DEBOUNCE_MS)
  }

  private flushPersist() {
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer)
      this.persistTimer = null
    }
    const data: SaveData = {
      version: 3,
      chapterIndex: this.chapterIndex,
      sceneIndex: this.sceneIndex,
      highestUnlockedChapter: this.highestUnlockedChapter,
      lastScreen: this.lastScreen,
      chapter1Complete: this.chapter1Complete,
      chapter2Complete: this.chapter2Complete,
      completedSceneIds: [...this.completedSceneIds],
      completedPuzzleIds: [...this.completedPuzzleIds],
      stratarchiaUnlocked: this.stratarchiaUnlocked,
      duelUnlockedOpponentIds: [...this.duelUnlockedOpponentIds],
      unlockedDuelVariantIds: [...this.unlockedDuelVariantIds],
      codexUnlocks: [...this.codexUnlocks],
      titleUnlocks: [...this.titleUnlocks],
      chronicleEchoes: [...this.chronicleEchoes],
      rankPoints: this.rankPoints,
      cosmetics: {
        unlockedPieceSkins: [...this.unlockedPieceSkins],
        selectedPieceSkin: this.selectedPieceSkin,
      },
      tendencies: { ...this.tendencies },
      matchHistory: [...this.matchHistory],
      rivalMemory: { ...this.rivalMemory },
      inProgress: this.buildInProgressSnapshot(),
    }
    writeSave(data)
  }

  /** Flush pending debounced save + any pending UI emission (tab close / visibility). */
  flushDeferredIO() {
    this.flushPersist()
    this.flushEmit()
  }

  private flushEmit() {
    if (this.emitRafId !== 0) {
      cancelAnimationFrame(this.emitRafId)
      this.emitRafId = 0
    }
    this.emitChessNow()
  }

  private buildInProgressSnapshot(): InProgressSnapshot | null {
    if (this.mode === 'idle') return null
    const sc = this.currentScene()
    if (this.mode !== 'duel' && !this.sceneUsesBoard(sc)) return null
    if (!this.history.length) return null
    const snap: InProgressSnapshot = {
      mode: this.mode,
      chapterIndex: this.chapterIndex,
      sceneIndex: this.sceneIndex,
      fen: this.chess.fen(),
      history: [...this.history].slice(-240),
      sanLog: [...this.sanLog].slice(-240),
      sanQuality: [...this.sanQuality].slice(-240),
      playerColor: this.playerColor,
      calibrationMoves: this.calibrationMoves,
      scriptedMoveIndex: this.scriptedMoveIndex,
      sceneTendencies: { ...this.sceneTendencies },
      duel: undefined,
    }
    if (this.mode === 'duel' && this.duelSession) {
      snap.duel = {
        opponentId: this.duelSession.roster.opponentId,
        variantId: this.duelSession.variant.id,
        difficulty: this.duelSession.difficulty,
        playerColor: this.duelSession.playerColor,
        startFen: this.duelSession.fen,
      }
    }
    return snap
  }

  private maybeRestoreInProgressSnapshot(sc: Scene): boolean {
    const snap = this.pendingInProgressSnapshot
    if (!snap) return false
    this.pendingInProgressSnapshot = null
    if (snap.chapterIndex !== this.chapterIndex || snap.sceneIndex !== this.sceneIndex) return false

    if (snap.mode === 'duel' && snap.duel) {
      const roster = DUEL_ROSTER.find((r) => r.opponentId === snap.duel?.opponentId)
      const variant = roster?.variants.find((v) => v.id === snap.duel?.variantId)
      if (!roster || !variant) return false
      this.mode = 'duel'
      this.puzzleScene = null
      this.matchScene = null
      this.calibrationScene = null
      this.duelSession = {
        roster,
        variant,
        playerColor: snap.duel.playerColor,
        fen: snap.duel.startFen,
        difficulty: snap.duel.difficulty,
      }
      this.playerColor = snap.playerColor
      this.chess.load(snap.fen)
      this.history = snap.history.length ? [...snap.history] : [snap.fen]
      this.sanLog = [...snap.sanLog]
      this.sanQuality = [...snap.sanQuality]
      this.sceneTendencies = { ...snap.sceneTendencies }
      this.lastCoachTip = 'Session restored after dev-server restart.'
      this.sessionRecoveredNotice = true
      return true
    }

    const expectedMode =
      sc.type === 'puzzle'
        ? 'puzzle'
        : sc.type === 'match'
          ? 'match'
          : sc.type === 'calibration'
            ? 'calibration'
            : sc.type === 'freeplay'
              ? 'freeplay'
              : null
    if (!expectedMode || snap.mode !== expectedMode) return false

    const safeLen = Math.min(snap.sanLog.length, snap.sanQuality.length || snap.sanLog.length)
    this.playerColor = snap.playerColor
    this.chess.load(snap.fen)
    this.history = snap.history.length ? [...snap.history] : [snap.fen]
    this.sanLog = snap.sanLog.slice(0, safeLen)
    this.sanQuality = snap.sanQuality.slice(0, safeLen)
    this.calibrationMoves = snap.calibrationMoves
    this.scriptedMoveIndex = snap.scriptedMoveIndex
    this.sceneTendencies = { ...snap.sceneTendencies }
    this.lastCoachTip = 'Session restored after dev-server restart.'
    this.sessionRecoveredNotice = true
    return true
  }

  currentChapter(): Chapter {
    return this.chapters[this.chapterIndex]!
  }

  currentScene(): Scene {
    return this.currentChapter().scenes[this.sceneIndex]!
  }

  isInDuelMode(): boolean {
    return this.mode === 'duel'
  }

  getSelectedPieceSkin(): PieceSkinId {
    return this.selectedPieceSkin
  }

  getUnlockedPieceSkins(): PieceSkinId[] {
    return [...this.unlockedPieceSkins]
  }

  setPieceSkin(skin: PieceSkinId) {
    if (!this.unlockedPieceSkins.includes(skin)) return
    this.selectedPieceSkin = skin
    this.board?.setSkin(skin)
    this.board?.draw(this.chess, null, {
      mode: this.mode === 'freeplay' ? 'free' : this.mode === 'idle' ? 'off' : 'solo',
      soloColor: this.playerColor,
    })
    this.persist()
    this.emitChess()
  }

  getRankPoints(): number {
    return this.rankPoints
  }

  getUnlockedTitles(): string[] {
    return [...this.titleUnlocks]
  }

  getChronicleEchoes(): string[] {
    return [...this.chronicleEchoes]
  }

  getMatchHistory(): MatchHistoryEntry[] {
    return [...this.matchHistory]
  }

  getLatestMatchHistoryEntry(): MatchHistoryEntry | null {
    return this.matchHistory.length ? this.matchHistory[this.matchHistory.length - 1]! : null
  }

  hasRecoverableSession(): boolean {
    return this.canResumeSnapshot(this.pendingInProgressSnapshot)
  }

  resumeRecoverableSession(): boolean {
    const snap = this.pendingInProgressSnapshot
    if (!this.canResumeSnapshot(snap)) {
      if (snap) {
        // Clear stale/corrupt recovery state so UI does not keep surfacing a dead resume action.
        this.pendingInProgressSnapshot = null
        this.persist()
      }
      return false
    }
    this.chapterIndex = snap.chapterIndex
    this.sceneIndex = snap.sceneIndex
    this.lastScreen = 'play'
    this.persist()
    this.refreshScene()
    return true
  }

  private canResumeSnapshot(snap: InProgressSnapshot | null): snap is InProgressSnapshot {
    if (!snap) return false
    const ch = this.chapters[snap.chapterIndex]
    if (!ch) return false
    if (snap.sceneIndex < 0 || snap.sceneIndex >= ch.scenes.length) return false
    if (snap.chapterIndex > this.highestUnlockedChapter) return false
    return true
  }

  rematchLastDuel(): boolean {
    const s = this.lastDuelSetup
    if (!s) return false
    return this.startDuel(s.opponentId, s.variantId, s.playerColor, undefined, s.difficulty)
  }

  getAdaptiveTrainingPlan(opponentId?: string): string[] {
    const lines: string[] = []
    const globalLoss = this.recentLossStreak()
    const rivalLoss = opponentId ? this.recentLossStreak(opponentId) : 0
    const t = this.tendencies
    if (globalLoss >= 2 || rivalLoss >= 2) {
      lines.push('Run a calm opener: develop minor pieces before any pawn storm or queen excursion.')
    }
    if (t.earlyQueenMoves >= 4) {
      lines.push('Training objective: no queen move before both knights are developed unless forced.')
    }
    if (t.flankPawnPushes >= 8) {
      lines.push('Training objective: secure d/e files first; delay a/h pawn pushes until castled.')
    }
    if (t.repeatedChecksWithoutGain >= 3) {
      lines.push('Training objective: only check when it gains material, space, or a forced structural concession.')
    }
    if (opponentId) {
      const mem = this.rivalMemory[opponentId]
      if ((mem?.punishedEarlyQueen ?? 0) >= 3) {
        lines.push('Rival counter-pattern: this opponent is preloaded to punish early queen routes.')
      }
      if ((mem?.punishedFlankPushes ?? 0) >= 4) {
        lines.push('Rival counter-pattern: this opponent targets overextended wing pawns.')
      }
    }
    if (!lines.length) {
      lines.push('Focus drill: coordinate rooks on open files and improve king safety timing.')
    }
    return lines.slice(0, 4)
  }

  recommendDuelDifficulty(opponentId: string): 'novice' | 'balanced' | 'relentless' {
    const recent = this.matchHistory.filter((h) => h.opponentId === opponentId).slice(-12)
    if (!recent.length) return 'balanced'
    const score = recent.reduce((acc, h) => {
      if (h.outcome === 'win') return acc + 1
      if (h.outcome === 'draw') return acc + 0.5
      return acc - 1
    }, 0)
    const mem = this.rivalMemory[opponentId]
    const pressure = mem ? mem.losses - mem.wins : 0
    if (score <= -2 || pressure >= 3) return 'novice'
    if (score >= 3) return 'relentless'
    return 'balanced'
  }

  getTendencies(): PlayerTendencyProfile {
    return { ...this.tendencies }
  }

  getRivalMemory(): Record<string, RivalMemoryEntry> {
    return { ...this.rivalMemory }
  }

  consumePendingRewards(): RewardBundle[] {
    const out = [...this.pendingRewards]
    this.pendingRewards = []
    return out
  }

  getDuelRoster(): DuelRosterEntry[] {
    return DUEL_ROSTER.filter((r) => {
      if (r.opponentId === 'alexion') return true
      return this.duelUnlockedOpponentIds.includes(r.opponentId)
    })
  }

  isDuelVariantUnlocked(variantId: string): boolean {
    return this.unlockedDuelVariantIds.includes(variantId)
  }

  startDuel(
    opponentId: string,
    variantId: string,
    playerColor: 'w' | 'b',
    fen = DEFAULT_POSITION,
    difficulty: 'novice' | 'balanced' | 'relentless' = 'balanced',
  ): boolean {
    const roster = DUEL_ROSTER.find((r) => r.opponentId === opponentId)
    if (!roster) return false
    const variant = roster.variants.find((v) => v.id === variantId)
    if (!variant) return false
    if (!this.isDuelVariantUnlocked(variant.id)) return false
    if (this.highestUnlockedChapter < variant.minChapterUnlock) return false

    this.cancelAiTimer()
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    this.mode = 'duel'
    this.puzzleScene = null
    this.matchScene = null
    this.calibrationScene = null
    this.duelSession = {
      roster,
      variant,
      playerColor,
      fen: variant.fen ?? fen,
      difficulty,
    }
    this.lastDuelSetup = { opponentId, variantId, playerColor, difficulty }
    this.playerColor = playerColor
    this.chess.load(this.duelSession.fen)
    this.history = [this.chess.fen()]
    this.sanLog = []
    this.sanQuality = []
    this.lastAiMoveKey = null
    this.lastCoachTip = null
    this.board?.setOrientation(this.playerColor)
    this.board?.setSkin(this.selectedPieceSkin)
    this.board?.draw(this.chess, null, { mode: 'solo', soloColor: this.playerColor })
    this.board?.setInteraction(true)
    this.persist()
    this.emitChess()
    if (this.chess.turn() !== this.playerColor) this.scheduleAiMove()
    return true
  }

  stopDuel() {
    if (this.mode !== 'duel') return
    this.duelSession = null
    this.refreshScene()
  }

  sceneUsesBoard(sc: Scene): boolean {
    return (
      sc.type === 'puzzle' ||
      sc.type === 'match' ||
      sc.type === 'calibration' ||
      sc.type === 'freeplay'
    )
  }

  mountBoard(container: HTMLElement) {
    this.board = new BoardView({
      root: container,
      orientation: 'w',
      onMove: (from, to, promotion) => this.tryPlayerMove(from, to, promotion),
    })
    this.board.setSkin(this.selectedPieceSkin)
    this.refreshScene()
  }

  private cancelAiTimer() {
    if (this.aiTimer) {
      window.clearTimeout(this.aiTimer)
      this.aiTimer = 0
    }
    this.aiThinking = false
  }

  refreshScene() {
    this.cancelAiTimer()
    this.lastCoachTip = null
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.sessionRecoveredNotice = false
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }

    const ch = this.currentChapter()
    const sc = this.currentScene()
    this.handlers.onSceneChange(ch, sc, this.sceneIndex)

    this.mode = 'idle'
    this.puzzleScene = null
    this.matchScene = null
    this.calibrationScene = null
    this.duelSession = null
    this.calibrationMoves = 0
    this.scriptedMoveIndex = 0
    this.chess.reset()
    this.history = []
    this.sanLog = []
    this.sanQuality = []
    this.lastAiMoveKey = null

    if (sc.type === 'puzzle') {
      this.mode = 'puzzle'
      this.puzzleScene = sc
      this.playerColor = sc.playerColor
      this.chess.load(sc.fen)
      this.history = [this.chess.fen()]
    } else if (sc.type === 'match') {
      this.mode = 'match'
      this.matchScene = sc
      this.playerColor = sc.playerColor
      this.chess.load(sc.fen ?? DEFAULT_POSITION)
      this.history = [this.chess.fen()]
    } else if (sc.type === 'calibration') {
      this.mode = 'calibration'
      this.calibrationScene = sc
      this.playerColor = 'w'
      this.chess.load(DEFAULT_POSITION)
      this.history = [this.chess.fen()]
    } else if (sc.type === 'freeplay') {
      this.mode = 'freeplay'
      this.chess.load(sc.fen ?? DEFAULT_POSITION)
      this.history = [this.chess.fen()]
    }

    this.maybeRestoreInProgressSnapshot(sc)

    if (this.board) {
      this.board.setOrientation(this.playerColor === 'w' ? 'w' : 'b')
      this.board.setSkin(this.selectedPieceSkin)
      const duelActive = this.duelSession !== null
      const interactive = duelActive || this.sceneUsesBoard(sc)
      const pickMode: BoardPickMode =
        duelActive
          ? 'solo'
          : sc.type === 'freeplay'
            ? 'free'
            : interactive
              ? 'solo'
              : 'off'
      this.board.draw(this.chess, null, { mode: pickMode, soloColor: this.playerColor })
      this.board.setInteraction(interactive)
      if (interactive && this.chess.turn() !== this.playerColor && this.mode !== 'freeplay') {
        this.scheduleAiMove()
      }
    }
    this.persist()
    this.emitChess()
  }

  /** Coalesce multiple state updates into one RAF for smoother HUD / less main-thread work. */
  private emitChess() {
    if (SYNC_IO) {
      this.emitChessNow()
      return
    }
    if (this.emitRafId !== 0) cancelAnimationFrame(this.emitRafId)
    this.emitRafId = requestAnimationFrame(() => {
      this.emitRafId = 0
      this.emitChessNow()
    })
  }

  private emitChessNow() {
    const sc = this.currentScene()
    const chessy = this.mode === 'duel' || this.sceneUsesBoard(sc)
    const canUndo =
      chessy && this.history.length > 1 && (this.mode !== 'calibration') && !this.aiThinking
    const calibration =
      this.mode === 'calibration' && this.calibrationScene
        ? { current: this.calibrationMoves, target: this.calibrationScene.minMovesByPlayer }
        : undefined
    const matchOutcome = this.computeMatchOutcome()
    const fen = this.chess.fen()
    const ledgerFp = ledgerContentFingerprint(this.sanLog, this.sanQuality)
    this.handlers.onChessUpdate({
      chess: this.chess,
      fen,
      status: this.statusLine(sc),
      canUndo,
      sanLog: [...this.sanLog],
      sanQuality: [...this.sanQuality],
      ledgerFp,
      calibration,
      inCheck: chessy && this.chess.inCheck() && !this.isSceneTerminalForCurrentMode(),
      aiThinking: this.aiThinking,
      coachTip: this.lastCoachTip,
      matchOutcome,
      evalScore: chessy ? materialAndPst(this.chess, 'w') : 0,
      mentorInsight: this.computeMentorInsight(),
      aiPersona: this.currentAiPersona(),
      aiFlavor: this.currentAiFlavor(),
      tacticalPulse: this.lastTacticalPulse,
      sessionRecovered: this.sessionRecoveredNotice,
      canRestoreStable: this.history.length > 1 && !this.aiThinking,
      boardGuide: this.boardGuideText(sc),
    })
  }

  dismissSessionRecoveredNotice() {
    if (!this.sessionRecoveredNotice) return
    this.sessionRecoveredNotice = false
    this.emitChess()
  }

  restoreStablePosition(): boolean {
    const sc = this.currentScene()
    if (this.mode !== 'duel' && !this.sceneUsesBoard(sc)) return false
    if (!this.history.length) return false
    this.cancelAiTimer()
    const stableFen = this.history[0]!
    this.chess.load(stableFen)
    this.history = [stableFen]
    this.sanLog = []
    this.sanQuality = []
    this.lastAiMoveKey = null
    this.lastTacticalPulse = null
    this.lastResolvedOutcomeKey = null
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    if (this.mode === 'calibration') this.calibrationMoves = 0
    if (this.mode === 'match' || this.mode === 'duel') this.scriptedMoveIndex = 0
    this.lastCoachTip = 'Stable position restored. Build again with safer structure.'
    const pickMode: BoardPickMode =
      this.mode === 'duel' ? 'solo' : sc.type === 'freeplay' ? 'free' : this.sceneUsesBoard(sc) ? 'solo' : 'off'
    this.board?.draw(this.chess, null, { mode: pickMode, soloColor: this.playerColor })
    this.board?.setInteraction(true)
    this.sessionRecoveredNotice = false
    this.persist()
    this.emitChess()
    if ((this.mode === 'duel' || sc.type !== 'freeplay') && this.chess.turn() !== this.playerColor && !this.isSceneTerminalForCurrentMode()) {
      this.scheduleAiMove()
    }
    return true
  }

  private currentAiPersona(): string | null {
    if (this.mode === 'duel' && this.duelSession) {
      const base = resolveProfileByDuelVariant(this.duelSession.variant.id)
      const phase = detectGamePhase(this.chess)
      const tuned = this.tuneProfileForDuel(
        adaptProfileToPhase(base, phase, this.tendencies),
        this.duelSession.difficulty,
        this.duelSession.roster.opponentId,
      )
      return `${this.duelSession.variant.label} · ${tuned.conversionPersona}`
    }
    if (this.mode === 'match' && this.matchScene) {
      const base = resolveProfileByMatchId(this.matchScene.id)
      const phase = detectGamePhase(this.chess)
      const tuned = this.tuneProfileForMatch(adaptProfileToPhase(base, phase, this.tendencies), this.matchScene)
      return `${this.matchScene.opponentName} · ${base.label} · ${tuned.conversionPersona}`
    }
    if (this.mode === 'puzzle' && this.puzzleScene) {
      return 'Puzzle Counterplay Engine'
    }
    return null
  }

  private currentAiFlavor(): string | null {
    const phase = this.sanLog.length < 12 ? 'opening' : this.sanLog.length < 30 ? 'middlegame' : 'endgame'
    const memoryTag = (() => {
      const key =
        this.mode === 'duel'
          ? this.duelSession?.roster.opponentId
          : this.mode === 'match'
            ? this.matchScene?.id
            : undefined
      if (!key) return ''
      const mem = this.rivalMemory[key]
      if (!mem || mem.games < 2) return ''
      if (mem.punishedFlankPushes >= 6) return ' This rival now preys on early wing pawn drift.'
      if (mem.punishedEarlyQueen >= 4) return ' This rival is ready to punish early queen sorties.'
      if (mem.punishedCheckSpam >= 4) return ' This rival expects forcing-check sequences and counters them.'
      return ''
    })()
    const rivalryTag = (() => {
      const key =
        this.mode === 'duel'
          ? this.duelSession?.roster.opponentId
          : this.mode === 'match'
            ? this.matchScene?.id
            : undefined
      if (!key) return ''
      const mem = this.rivalMemory[key]
      if (!mem || mem.games < 3) return ''
      if (mem.losses >= mem.wins + 2) return ' Arc shift: this rival grows audacious after repeated victories.'
      if (mem.wins >= mem.losses + 2) return ' Arc shift: this rival becomes cautious, seeking counter-traps over direct clashes.'
      return ' Arc shift: this rivalry is balanced and tense.'
    })()
    if (this.mode === 'match' && this.matchScene) {
      const id = this.matchScene.id
      if (id.includes('amara')) {
        return phase === 'opening'
          ? `Amara is developing by principle, not pressure.${memoryTag}`
          : `Amara seeks safety first; sharp tactical shots can still break through.${memoryTag}`
      }
      if (id.includes('lukas')) {
        return phase === 'opening'
          ? `Lukas follows prepared structures; off-book transitions are your edge.${memoryTag}`
          : `Lukas stabilizes lines, but can misjudge dynamic imbalances.${memoryTag}`
      }
      if (id.includes('edred')) {
        return phase === 'opening'
          ? `Edred is loading tactical pressure on your king flank.${memoryTag}`
          : `Edred accelerates forcing lines — every tempo matters now.${memoryTag}`
      }
      if (id.includes('marius')) {
        return phase === 'opening'
          ? `Marius builds quietly; space and pawn breaks decide this battle.${memoryTag}`
          : `Marius squeezes small edges — avoid passive drift.${memoryTag}`
      }
      if (id.includes('demetrios') || id.includes('boss') || id.includes('counterpart')) {
        return phase === 'opening'
          ? `Elite court doctrine online: disciplined development and central restraint.${memoryTag}${rivalryTag}`
          : `The boss profile is converting with precision — counterplay must be concrete.${memoryTag}${rivalryTag}`
      }
    }
    if (this.mode === 'duel' && this.duelSession) {
      return `Duel calibration: ${this.duelSession.variant.label} is adapting to your tendencies.${memoryTag}${rivalryTag}`
    }
    return null
  }

  private tacticalPulseFromMove(
    move: ReturnType<Chess['move']>,
    quality: MoveQuality,
    motifs?: { fork: boolean; pin: boolean; skewer: boolean; kingHunt: boolean; givesCheck: boolean },
  ): string | null {
    if (move.san.includes('#')) return 'Tactical motif: checkmate net sealed.'
    if (motifs?.fork) {
      return 'Tactical motif: knight fork pressure pattern detected.'
    }
    if (motifs?.skewer) {
      return 'Tactical motif: line-piece skewer pattern activated.'
    }
    if (motifs?.pin) return 'Tactical motif: absolute pin geometry formed.'
    if (motifs?.kingHunt) return 'King hunt initiated: forcing checks drive the enemy king.'
    if (quality === 'brilliant') return 'Brilliant conversion: initiative spike achieved.'
    if (quality === 'mistake' || quality === 'blunder') return 'Warning: tactical liability created.'
    return null
  }

  private tuneProfileForMatch(base: AiProfile, match: MatchScene): AiProfile {
    const diff = Math.max(1, match.difficulty ?? 1)
    const chapterRamp = this.currentChapter().index * 0.04
    const diffRamp = (diff - 1) * 0.06 + chapterRamp
    const endgameRamp = this.sanLog.length >= 24 ? 0.06 : 0
    const mem = this.rivalMemory[match.id]
    const memoryRamp = mem
      ? Math.min(0.16, (mem.punishedFlankPushes + mem.punishedEarlyQueen + mem.punishedCheckSpam) * 0.006)
      : 0
    const totalRamp = diffRamp + memoryRamp
    const rivalryPressure = mem ? mem.losses - mem.wins : 0
    const fairnessSoften = rivalryPressure >= 2 ? Math.min(0.18, rivalryPressure * 0.05) : 0
    const momentumHarden = mem && mem.wins - mem.losses >= 2 ? Math.min(0.1, (mem.wins - mem.losses) * 0.03) : 0
    const tiltStreak = this.recentLossStreak(match.id)
    const antiTiltRelief = tiltStreak >= 2 ? Math.min(tiltStreak >= 4 ? 0.22 : 0.18, tiltStreak * 0.045) : 0
    return {
      ...base,
      searchDepth: Math.min(7, base.searchDepth + Math.floor((diff - 1) / 2)),
      thinkTimeMs: Math.round(
        base.thinkTimeMs * (1 + (totalRamp - fairnessSoften + momentumHarden - antiTiltRelief) * 0.6),
      ),
      blunderRate: Math.max(0.01, base.blunderRate - totalRamp * 0.45 + fairnessSoften * 0.28 + antiTiltRelief * 0.3),
      tacticalAlertness: Math.min(
        1,
        Math.max(0.2, base.tacticalAlertness + totalRamp - fairnessSoften + momentumHarden - antiTiltRelief),
      ),
      openingDiscipline: Math.min(1, base.openingDiscipline + totalRamp * 0.8),
      conversionStrictness: Math.min(
        1,
        Math.max(0.2, base.conversionStrictness + totalRamp + endgameRamp - fairnessSoften - antiTiltRelief),
      ),
      kingSafetyUrgency: Math.min(1, base.kingSafetyUrgency + totalRamp * 0.7),
      riskAppetite: Math.min(1, Math.max(0.1, base.riskAppetite + (diff >= 3 ? 0.03 : -0.02))),
      weights: {
        tactical: Math.min(
          1,
          Math.max(0.2, base.weights.tactical + totalRamp * 0.7 - fairnessSoften * 0.5 - antiTiltRelief * 0.5),
        ),
        positional: Math.min(1, base.weights.positional + totalRamp * 0.5),
        sacrificial: Math.min(1, base.weights.sacrificial + (diff >= 3 ? 0.05 : 0)),
        prophylactic: Math.min(1, base.weights.prophylactic + totalRamp * 0.6),
      },
    }
  }

  private tuneProfileForDuel(
    base: AiProfile,
    difficulty: 'novice' | 'balanced' | 'relentless',
    opponentId?: string,
  ): AiProfile {
    const mem = opponentId ? this.rivalMemory[opponentId] : undefined
    const memoryRamp = mem
      ? Math.min(0.14, (mem.punishedFlankPushes + mem.punishedEarlyQueen + mem.punishedCheckSpam) * 0.005)
      : 0
    const tunedBase: AiProfile = {
      ...base,
      tacticalAlertness: Math.min(1, base.tacticalAlertness + memoryRamp),
      openingDiscipline: Math.min(1, base.openingDiscipline + memoryRamp * 0.7),
      conversionStrictness: Math.min(1, base.conversionStrictness + memoryRamp),
    }
    const rivalryPressure = mem ? mem.losses - mem.wins : 0
    const rivalryRelief = rivalryPressure >= 2 ? Math.min(0.12, rivalryPressure * 0.04) : 0
    const tiltStreak = opponentId ? this.recentLossStreak(opponentId) : 0
    const antiTiltRelief = tiltStreak >= 2 ? Math.min(0.14, tiltStreak * 0.04) : 0
    if (difficulty === 'novice') {
      return {
        ...tunedBase,
        searchDepth: Math.max(1, tunedBase.searchDepth - 1),
        thinkTimeMs: Math.max(320, tunedBase.thinkTimeMs - 220 - Math.round(120 * (rivalryRelief + antiTiltRelief))),
        blunderRate: Math.min(0.36, tunedBase.blunderRate + 0.09 + rivalryRelief * 0.2 + antiTiltRelief * 0.2),
        tacticalAlertness: Math.max(0.2, tunedBase.tacticalAlertness - 0.14 - rivalryRelief * 0.2 - antiTiltRelief),
        conversionStrictness: Math.max(
          0.2,
          tunedBase.conversionStrictness - 0.18 - rivalryRelief * 0.2 - antiTiltRelief * 0.9,
        ),
      }
    }
    if (difficulty === 'relentless') {
      return {
        ...tunedBase,
        searchDepth: Math.min(7, tunedBase.searchDepth + 1),
        thinkTimeMs: tunedBase.thinkTimeMs + 280 - Math.round(80 * (rivalryRelief + antiTiltRelief * 0.5)),
        blunderRate: Math.max(0.01, tunedBase.blunderRate - 0.025),
        tacticalAlertness: Math.min(1, tunedBase.tacticalAlertness + 0.12),
        conversionStrictness: Math.min(
          1,
          tunedBase.conversionStrictness + 0.12 - rivalryRelief * 0.3 - antiTiltRelief * 0.2,
        ),
      }
    }
    return tunedBase
  }

  private recentLossStreak(opponentId?: string): number {
    let streak = 0
    for (let i = this.matchHistory.length - 1; i >= 0; i--) {
      const h = this.matchHistory[i]!
      if (opponentId && h.opponentId !== opponentId) continue
      if (h.outcome === 'loss') {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  private countQuality(q: MoveQuality): number {
    let n = 0
    for (const x of this.sanQuality) if (x === q) n++
    return n
  }

  private computeMentorInsight(): string | null {
    if (this.mode === 'match' || this.mode === 'duel') {
      if (this.computeMatchOutcome() === 'loss') {
        const oid = this.mode === 'duel' ? this.duelSession?.roster.opponentId : this.matchScene?.id
        return lossRecoveryMentorLine({
          lossStreakVsOpponent: this.recentLossStreak(oid),
          sceneTendencies: this.sceneTendencies,
          blunderCount: this.countQuality('blunder'),
          mistakeCount: this.countQuality('mistake'),
          moveCount: this.sanLog.length,
        })
      }
    }
    const tilt = this.recentLossStreak()
    if (tilt >= 3) {
      return 'Mentor Insight: stability protocol engaged. Simplify exchanges, castle early, and deny tactical chaos for five moves.'
    }
    if (this.sanLog.length < 8) return null
    if (this.tendencies.flankPawnPushes >= 8) {
      return 'Mentor Insight: you push wing pawns often before center control. Stabilize d/e files first, then expand.'
    }
    if (this.tendencies.earlyQueenMoves >= 4) {
      return 'Mentor Insight: early queen development is drawing tempo losses. Let minor pieces build your threats first.'
    }
    if (this.tendencies.repeatedChecksWithoutGain >= 3) {
      return 'Mentor Insight: forcing checks without gain can surrender initiative. Pair checks with concrete follow-up.'
    }
    return null
  }

  private styleGradeFromLog(): 'S' | 'A' | 'B' | 'C' | 'D' {
    let score = 0
    for (const q of this.sanQuality) {
      if (!q) continue
      if (q === 'brilliant') score += 3
      else if (q === 'good') score += 2
      else if (q === 'ok') score += 1
      else if (q === 'inaccuracy') score -= 1
      else if (q === 'mistake') score -= 2
      else if (q === 'blunder') score -= 3
    }
    if (score >= 16) return 'S'
    if (score >= 10) return 'A'
    if (score >= 5) return 'B'
    if (score >= 1) return 'C'
    return 'D'
  }

  private turningPointFromLog(): string {
    let idx = -1
    for (let i = 0; i < this.sanQuality.length; i++) {
      if (this.sanQuality[i] === 'brilliant') { idx = i; break }
    }
    if (idx < 0) {
      for (let i = 0; i < this.sanQuality.length; i++) {
        if (this.sanQuality[i] === 'good') { idx = i; break }
      }
    }
    if (idx < 0) idx = Math.max(0, this.sanLog.length - 1)
    return this.sanLog[idx] ?? '...'
  }

  private replaySliceFromLog(turningPointSan: string): { sans: string[]; startFen: string } {
    const idx = Math.max(
      0,
      this.sanLog.lastIndexOf(turningPointSan as (typeof this.sanLog)[number]),
    )
    const start = Math.max(0, idx - 3)
    const end = Math.min(this.sanLog.length, idx + 4)
    return {
      sans: this.sanLog.slice(start, end),
      startFen: this.history[start] ?? this.history[0] ?? this.chess.fen(),
    }
  }

  private recordResolvedOutcomeIfNeeded() {
    if (this.mode !== 'match' && this.mode !== 'duel') return
    const outcome = this.computeMatchOutcome()
    if (!outcome) return
    const key = `${this.mode}|${this.sanLog.length}|${this.chess.fen()}|${outcome}`
    if (this.lastResolvedOutcomeKey === key) return
    this.lastResolvedOutcomeKey = key

    const sourceId = this.mode === 'duel'
      ? this.duelSession?.variant.id ?? 'duel'
      : this.matchScene?.id ?? 'match'
    const opponentId = this.mode === 'duel'
      ? this.duelSession?.roster.opponentId ?? 'duel-opponent'
      : this.matchScene?.id ?? 'match-opponent'
    const opponentLabel = this.mode === 'duel'
      ? this.duelSession?.roster.opponentName ?? 'Duel Opponent'
      : this.matchScene?.opponentName ?? 'Opponent'

    const turningPointSan = this.turningPointFromLog()
    const replay = this.replaySliceFromLog(turningPointSan)
    this.matchHistory.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      mode: this.mode,
      sourceId,
      opponentId,
      opponentLabel,
      variantId: this.mode === 'duel' ? this.duelSession?.variant.id : undefined,
      outcome,
      moves: this.sanLog.length,
      styleGrade: this.styleGradeFromLog(),
      turningPointSan,
      replaySans: replay.sans,
      replayStartFen: replay.startFen,
    })
    if (this.matchHistory.length > 120) {
      this.matchHistory.splice(0, this.matchHistory.length - 120)
    }

    const prev: RivalMemoryEntry = this.rivalMemory[opponentId] ?? {
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      avgMoves: 0,
      punishedFlankPushes: 0,
      punishedEarlyQueen: 0,
      punishedCheckSpam: 0,
    }
    const games = prev.games + 1
    const wins = prev.wins + (outcome === 'win' ? 1 : 0)
    const losses = prev.losses + (outcome === 'loss' ? 1 : 0)
    const draws = prev.draws + (outcome === 'draw' ? 1 : 0)
    const avgMoves = (prev.avgMoves * prev.games + this.sanLog.length) / games
    const punishedScale = outcome === 'loss' ? 1 : outcome === 'draw' ? 0.5 : 0
    this.rivalMemory[opponentId] = {
      games,
      wins,
      losses,
      draws,
      avgMoves,
      punishedFlankPushes: prev.punishedFlankPushes + Math.round(this.sceneTendencies.flankPawnPushes * punishedScale),
      punishedEarlyQueen: prev.punishedEarlyQueen + Math.round(this.sceneTendencies.earlyQueenMoves * punishedScale),
      punishedCheckSpam:
        prev.punishedCheckSpam + Math.round(this.sceneTendencies.repeatedChecksWithoutGain * punishedScale),
    }

    this.persist()
  }

  private pushRewardBundle(sourceId: string, sourceLabel: string, rewards: RewardDefinition[]) {
    if (!rewards.length) return
    this.pendingRewards.push({
      sourceId,
      sourceLabel,
      rewards,
    })
  }

  private applyReward(reward: RewardDefinition) {
    if (reward.kind === 'skin' && reward.skinId) {
      if (!this.unlockedPieceSkins.includes(reward.skinId)) this.unlockedPieceSkins.push(reward.skinId)
      return
    }
    if (reward.kind === 'codex' && reward.codexId) {
      if (!this.codexUnlocks.includes(reward.codexId)) this.codexUnlocks.push(reward.codexId)
      return
    }
    if (reward.kind === 'title' && reward.titleId) {
      if (!this.titleUnlocks.includes(reward.titleId)) this.titleUnlocks.push(reward.titleId)
      return
    }
    if (reward.kind === 'duel-variant' && reward.duelVariantId) {
      if (!this.unlockedDuelVariantIds.includes(reward.duelVariantId)) {
        this.unlockedDuelVariantIds.push(reward.duelVariantId)
      }
      return
    }
    if (reward.kind === 'chronicle') {
      if (!this.chronicleEchoes.includes(reward.id)) this.chronicleEchoes.push(reward.id)
    }
  }

  private grantVictoryRewards() {
    if (this.mode === 'match') {
      const m = this.matchScene
      if (!m) return
      const unlockId = m.id.includes('amara')
        ? 'amara'
        : m.id.includes('edred')
          ? 'edred'
          : m.id.includes('boss') || m.id.includes('demetrios')
            ? 'alexion'
            : ''
      if (unlockId && !this.duelUnlockedOpponentIds.includes(unlockId)) this.duelUnlockedOpponentIds.push(unlockId)
      const rewards = BASE_VICTORY_REWARDS[m.id] ?? []
      rewards.forEach((r) => this.applyReward(r))
      this.rankPoints += 30 + Math.max(0, (m.difficulty ?? 1) - 1) * 15
      this.pushRewardBundle(m.id, m.title, rewards)
      this.persist()
      return
    }
    if (this.mode === 'duel' && this.duelSession) {
      const synthetic: RewardDefinition[] = [
        {
          id: `duel-echo-${this.duelSession.variant.id}`,
          kind: 'chronicle',
          label: 'Chronicle Echo Captured',
          description: `Your duel with ${this.duelSession.roster.opponentName} was archived.`,
        },
      ]
      synthetic.forEach((r) => this.applyReward(r))
      this.rankPoints += 10
      this.pushRewardBundle(this.duelSession.variant.id, `Duel · ${this.duelSession.variant.label}`, synthetic)
      this.persist()
    }
  }

  private sideHasOnlyKing(color: 'w' | 'b'): boolean {
    for (const row of this.chess.board()) {
      for (const piece of row) {
        if (!piece || piece.color !== color) continue
        if (piece.type !== 'k') return false
      }
    }
    return true
  }

  private sideMaterialCpExcludingKing(color: 'w' | 'b'): number {
    let s = 0
    for (const row of this.chess.board()) {
      for (const piece of row) {
        if (!piece || piece.color !== color || piece.type === 'k') continue
        s += PIECE_VALUES[piece.type]
      }
    }
    return s
  }

  /**
   * Story rule: if a lone king is fully trapped, count it as a win.
   * This prevents anti-climactic "stalemate with only king left" endings.
   */
  private isBareKingLockmate(): boolean {
    if (!this.chess.isStalemate()) return false
    const defender = this.chess.turn()
    const attacker = defender === 'w' ? 'b' : 'w'
    return this.sideHasOnlyKing(defender) && !this.sideHasOnlyKing(attacker)
  }

  /**
   * Story rule: sealed stalemate while massively ahead in force (e.g. multiple queens vs a minor)
   * counts as a win for the stronger side — not a dead draw.
   */
  private isDominanceSealedStalemate(): boolean {
    if (!this.chess.isStalemate()) return false
    const defender = this.chess.turn()
    const attacker = defender === 'w' ? 'b' : 'w'
    const defMat = this.sideMaterialCpExcludingKing(defender)
    const atkMat = this.sideMaterialCpExcludingKing(attacker)
    if (defMat > 700) return false
    return atkMat - defMat >= 800
  }

  private isTerminalMatchPosition(): boolean {
    return (
      this.chess.isCheckmate() ||
      this.isBareKingLockmate() ||
      this.isDominanceSealedStalemate() ||
      this.chess.isStalemate() ||
      this.chess.isInsufficientMaterial()
    )
  }

  private isSceneTerminalForCurrentMode(): boolean {
    if (this.mode === 'match' || this.mode === 'duel') return this.isTerminalMatchPosition()
    return this.chess.isGameOver()
  }

  private computeMatchOutcome(): MatchOutcome {
    if (this.mode !== 'match' && this.mode !== 'duel') return null
    if (this.chess.isCheckmate()) {
      return this.chess.turn() !== this.playerColor ? 'win' : 'loss'
    }
    if (this.isBareKingLockmate()) {
      return this.chess.turn() !== this.playerColor ? 'win' : 'loss'
    }
    if (this.isDominanceSealedStalemate()) {
      return this.chess.turn() !== this.playerColor ? 'win' : 'loss'
    }
    if (this.chess.isInsufficientMaterial() || this.chess.isStalemate()) return 'draw'
    return null
  }

  private statusLine(scene: Scene = this.currentScene()): string {
    if (this.mode !== 'duel' && !this.sceneUsesBoard(scene)) return ''
    if (this.isBareKingLockmate()) return 'Checkmate — lone king sealed.'
    if (this.isDominanceSealedStalemate()) return 'Victory — field sealed; decision goes to the stronger force.'
    if (this.chess.isCheckmate()) return 'Checkmate.'
    if (this.mode === 'match' || this.mode === 'duel') {
      if (this.chess.isInsufficientMaterial()) return 'Stalemate — insufficient force to mate.'
      if (this.chess.isStalemate()) return 'Stalemate — a dead lock.'
      if (this.chess.isDraw()) return 'No move cap — continue until mate or dead draw.'
    }
    if (this.chess.isStalemate()) return 'Stalemate.'
    if (this.chess.isDraw()) return 'Draw.'
    if (this.chess.inCheck()) return 'Check.'
    const t = this.chess.turn() === 'w' ? 'White' : 'Black'
    return `${t} to move.`
  }

  private boardGuideText(scene: Scene): string {
    const defaultGuide =
      'Select a piece to illuminate legal targets. Captures are framed in bronze; check is marked in crimson.'
    const chessy = this.mode === 'duel' || this.sceneUsesBoard(scene)
    if (!chessy) return defaultGuide
    if (this.isSceneTerminalForCurrentMode() || this.chess.isGameOver()) {
      return 'This passage is decided on the board. Continue from the manuscript when the next control is available.'
    }
    if (this.aiThinking) {
      return 'The opponent is choosing a move — the board will update when their reply lands.'
    }
    if (scene.type === 'freeplay') {
      return 'Select a piece of the side whose turn it is (see status above). Captures are framed in bronze; check is marked in crimson.'
    }
    if (this.chess.turn() !== this.playerColor) {
      const opp = this.playerColor === 'w' ? 'Black' : 'White'
      const mine = this.playerColor === 'w' ? 'White' : 'Black'
      return `Wait for ${opp} to move — you command ${mine}. When it returns to you, select a piece to see legal targets (captures bronze; check crimson).`
    }
    return defaultGuide
  }

  /* ─── Coaching tips ────────────────────────────────────────────────── */
  private computeCoachTip(san: string): string | null {
    const halfMoves = this.sanLog.length
    if (halfMoves > 28) return null

    if (san === 'O-O' || san === 'O-O-O') {
      return 'King housed — your rooks can now coordinate along the back rank.'
    }
    if (halfMoves <= 14 && /^Q/.test(san) && !san.includes('=') && !san.includes('#') && !san.includes('+')) {
      return 'Early queens are easy targets — knights and bishops first.'
    }
    if (san.includes('x') && !this.chess.isGameOver()) {
      const adv = materialAdvantage(this.chess, this.playerColor)
      if (adv < -50) {
        return 'You captured but the position worsened — recaptures and counter-threats can steal back what you gave.'
      }
      return 'Material won. Verify nothing is left hanging in return.'
    }
    if (san.endsWith('+') && !san.includes('x') && halfMoves <= 18) {
      const adv = materialAdvantage(this.chess, this.playerColor)
      if (adv <= 20) {
        return 'A check that doesn\'t win material alerts the king to escape sooner. Each check must threaten something concrete.'
      }
    }
    if (halfMoves <= 12 && /^[ah]/.test(san) && san[1] !== 'x') {
      return 'Wing pawn moves in the opening often lose time. Development and center first.'
    }
    return null
  }

  tryPlayerMove(from: Square, to: Square, promotion?: PieceSymbol) {
    const sc = this.currentScene()
    if (this.mode !== 'duel' && !this.sceneUsesBoard(sc)) return
    if (this.aiThinking) return

    const piece = this.chess.get(from)
    if (!piece) return

    if (this.mode === 'duel') {
      if (piece.color !== this.playerColor) return
    } else if (sc.type === 'freeplay') {
      if (piece.color !== this.chess.turn()) return
    } else {
      if (piece.color !== this.playerColor) return
    }

    const moves = this.chess.moves({ verbose: true, square: from })
    const match = moves.find((m) => m.to === to && (!promotion || m.promotion === promotion))
    if (!match) return

    /* Snapshot eval before the move (from player's perspective) */
    const evalBefore =
      this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'duel'
        ? materialAndPst(this.chess, this.playerColor)
        : 0

    const last = this.chess.move({ from, to, promotion: promotion ?? match.promotion })
    if (!last) {
      devWarn('tryPlayerMove: rejected move', { from, to, promotion })
      return
    }
    this.sanLog.push(last.san)
    this.history.push(this.chess.fen())
    if ((from[0] === 'a' || from[0] === 'h') && piece.type === 'p' && this.sanLog.length <= 16) {
      this.tendencies.flankPawnPushes++
      this.sceneTendencies.flankPawnPushes++
    }
    if (piece.type === 'q' && this.sanLog.length <= 20) {
      this.tendencies.earlyQueenMoves++
      this.sceneTendencies.earlyQueenMoves++
    }
    if (last.san.includes('+') && !last.san.includes('x')) {
      this.tendencies.repeatedChecksWithoutGain++
      this.sceneTendencies.repeatedChecksWithoutGain++
    }
    this.board?.draw(this.chess, last, {
      mode: this.mode === 'duel' ? 'solo' : sc.type === 'freeplay' ? 'free' : 'solo',
      soloColor: this.playerColor,
    })

    if (this.mode === 'calibration' && piece.color === this.playerColor) {
      this.calibrationMoves++
    }

    /* Move quality — compare eval before and after the player's move */
    let playerQuality: MoveQuality = null
    if (this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'duel') {
      const evalAfter = materialAndPst(this.chess, this.playerColor)
      const delta = evalAfter - evalBefore
      let quality: MoveQuality
      if (delta >= 200) quality = 'brilliant'
      else if (delta >= 30) quality = 'good'
      else if (delta >= -50) quality = 'ok'
      else if (delta >= -100) quality = 'inaccuracy'
      else if (delta >= -200) quality = 'mistake'
      else quality = 'blunder'
      this.sanQuality.push(quality)
      playerQuality = quality
    } else {
      this.sanQuality.push(null)
    }
    const motifs = detectTacticalMotifs(this.chess, last, piece.color)
    this.lastTacticalPulse = this.tacticalPulseFromMove(last, playerQuality, motifs)

    /* Coaching — only in match/puzzle scenes for player's own moves */
    if (this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'duel') {
      this.lastCoachTip = this.computeCoachTip(last.san)
    }

    if (this.mode === 'puzzle' && this.puzzleScene && this.puzzleSolved()) {
      this.board?.setInteraction(false)
      this.persist()
      this.emitChess()
      return
    }

    if (this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'duel') {
      if (this.isSceneTerminalForCurrentMode()) {
        this.board?.setInteraction(false)
        this.recordResolvedOutcomeIfNeeded()
        if (this.computeMatchOutcome() === 'win') this.grantVictoryRewards()
        this.persist()
        this.emitChess()
        return
      }
    }

    if (this.mode === 'calibration') {
      if (this.calibrationSolved()) {
        this.board?.setInteraction(false)
        this.persist()
        this.emitChess()
        return
      }
    }

    this.persist()
    this.emitChess()
    this.scheduleAiMove()
  }

  /**
   * Apply an engine ply; throws if `chess.js` rejected the move so outer `catch` blocks can fall back (e.g. random move).
   */
  private commitEnginePliesOrThrow(
    result: Move | null,
    drawPick: { mode: BoardPickMode; soloColor?: 'w' | 'b' },
  ): Move {
    if (!result) {
      devWarn('chess.move returned null (illegal SAN or bad verbose move)')
      throw new Error('cok-null-move')
    }
    this.sanLog.push(result.san)
    this.sanQuality.push(null)
    this.history.push(this.chess.fen())
    this.lastAiMoveKey = `${result.from}${result.to}${result.promotion ?? ''}`
    this.board?.draw(this.chess, result, drawPick)
    return result
  }

  private profileMoveOpts() {
    return { avoidMoveKey: this.lastAiMoveKey }
  }

  /**
   * Opening books use odd keys (1, 3, 5, …) for the AI's 1st, 2nd, 3rd… replies in the booked lines.
   * When the AI is black, that is `sanLog.length` (1, 3, 5, …) at its turn; when the AI is white, `sanLog.length + 1`.
   */
  private openingBookPlyIndex(): number {
    return this.chess.turn() === 'b' ? this.sanLog.length : this.sanLog.length + 1
  }

  /**
   * Mirror of the increments in `tryPlayerMove` so undo does not leave coaching / tendency stats inflated.
   */
  private revertTendencyIncrementsForUndonePly(
    san: string,
    halfMoveCountAfterThisPly: number,
    fenBeforeThisPly: string,
  ) {
    const c = new Chess(fenBeforeThisPly)
    const norm = (s: string) => s.replace(/[+#]+$/g, '')
    const verbose = c.moves({ verbose: true }).find((m) => m.san === san || norm(m.san) === norm(san))
    if (!verbose) return
    const piece = c.get(verbose.from)
    if (!piece) return

    let decFlank = false
    if (
      (verbose.from[0] === 'a' || verbose.from[0] === 'h') &&
      piece.type === 'p' &&
      halfMoveCountAfterThisPly <= 16
    ) {
      decFlank = true
    }
    let decQueen = false
    if (piece.type === 'q' && halfMoveCountAfterThisPly <= 20) {
      decQueen = true
    }
    const decCheckSpam = san.includes('+') && !san.includes('x')

    if (decFlank) {
      this.tendencies.flankPawnPushes = Math.max(0, this.tendencies.flankPawnPushes - 1)
      this.sceneTendencies.flankPawnPushes = Math.max(0, this.sceneTendencies.flankPawnPushes - 1)
    }
    if (decQueen) {
      this.tendencies.earlyQueenMoves = Math.max(0, this.tendencies.earlyQueenMoves - 1)
      this.sceneTendencies.earlyQueenMoves = Math.max(0, this.sceneTendencies.earlyQueenMoves - 1)
    }
    if (decCheckSpam) {
      this.tendencies.repeatedChecksWithoutGain = Math.max(0, this.tendencies.repeatedChecksWithoutGain - 1)
      this.sceneTendencies.repeatedChecksWithoutGain = Math.max(
        0,
        this.sceneTendencies.repeatedChecksWithoutGain - 1,
      )
    }
  }

  private scheduleAiMove() {
    const sc = this.currentScene()
    if (this.mode !== 'duel' && sc.type === 'freeplay') return
    if (this.chess.turn() === this.playerColor) return
    if (this.isSceneTerminalForCurrentMode()) return
    if (this.aiThinking || this.aiTimer) return

    this.aiThinking = true
    this.board?.setInteraction(false)
    this.emitChess()
    const pressure =
      this.mode === 'duel'
        ? this.recentLossStreak(this.duelSession?.roster.opponentId)
        : this.mode === 'match'
          ? this.recentLossStreak(this.matchScene?.id)
          : this.recentLossStreak()
    const paceDelay = pressure >= 2 ? Math.min(620, 380 + pressure * 70) : 380
    this.aiTimer = window.setTimeout(() => this.playAiMove(), paceDelay)
  }

  private playAiMove() {
    this.aiThinking = false
    this.aiTimer = 0
    /* Clear coaching tip when AI plays — keeps it focused on player actions */
    this.lastCoachTip = null
    this.lastTacticalPulse = null
    const sc = this.currentScene()
    if (this.isSceneTerminalForCurrentMode()) {
      this.board?.setInteraction(false)
      this.emitChess()
      return
    }
    if (this.chess.turn() === this.playerColor) {
      this.board?.setInteraction(true)
      this.emitChess()
      return
    }

    if (this.mode === 'duel' && this.duelSession) {
      const base = resolveProfileByDuelVariant(this.duelSession.variant.id)
      const phase = detectGamePhase(this.chess)
      const adapted = adaptProfileToPhase(base, phase, this.tendencies)
      const profile = this.tuneProfileForDuel(
        adapted,
        this.duelSession.difficulty,
        this.duelSession.roster.opponentId,
      )
      let openingPlayed = false
      if (this.sanLog.length < 18) {
        const bookSan = chooseOpeningBookMove(this.chess, profile.id, this.openingBookPlyIndex())
        if (bookSan) {
          try {
            this.commitEnginePliesOrThrow(this.chess.move(bookSan), {
              mode: 'solo',
              soloColor: this.playerColor,
            })
            openingPlayed = true
          } catch {
            openingPlayed = false
          }
        }
      }
      try {
        if (!openingPlayed) {
          const mv = findBestMoveWithProfile(this.chess, profile, this.profileMoveOpts())
          if (mv) {
            this.commitEnginePliesOrThrow(this.chess.move(mv), {
              mode: 'solo',
              soloColor: this.playerColor,
            })
          }
        }
      } catch {
        try {
          const rm = findRandomMove(this.chess, this.lastAiMoveKey)
          if (rm) {
            this.commitEnginePliesOrThrow(
              this.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
              { mode: 'solo', soloColor: this.playerColor },
            )
          }
        } catch { /* no legal move */ }
      }
      if (this.isSceneTerminalForCurrentMode()) {
        this.board?.setInteraction(false)
        this.recordResolvedOutcomeIfNeeded()
        if (this.computeMatchOutcome() === 'win') this.grantVictoryRewards()
        this.persist()
        this.emitChess()
        return
      }
      this.board?.setInteraction(true)
      this.persist()
      this.emitChess()
      if (this.chess.turn() !== this.playerColor) this.scheduleAiMove()
      return
    }

    if (sc.type === 'match' && this.matchScene) {
      const m = this.matchScene
      let lastSan: string | null = null
      const base = resolveProfileByMatchId(m.id)
      const phase = detectGamePhase(this.chess)
      const adapted = adaptProfileToPhase(base, phase, this.tendencies)
      const profile = this.tuneProfileForMatch(adapted, m)

      const script = m.scriptedBlackSans
      const shouldUseScript =
        Boolean(script?.length) &&
        this.scriptedMoveIndex < (script?.length ?? 0) &&
        this.sanLog.length < 14 &&
        Math.random() < Math.max(0.2, Math.min(0.9, profile.openingDiscipline))
      if (shouldUseScript && script) {
        const san = script[this.scriptedMoveIndex]!
        try {
          const result = this.commitEnginePliesOrThrow(this.chess.move(san), {
            mode: 'solo',
            soloColor: this.playerColor,
          })
          lastSan = result.san
          this.scriptedMoveIndex++
        } catch {
          /* scripted move illegal — fall through to engine */
        }
      }

      if (!lastSan && this.sanLog.length < 20) {
        const bookSan = chooseOpeningBookMove(this.chess, profile.id, this.openingBookPlyIndex())
        if (bookSan) {
          try {
            const result = this.commitEnginePliesOrThrow(this.chess.move(bookSan), {
              mode: 'solo',
              soloColor: this.playerColor,
            })
            lastSan = result.san
          } catch {
            // fall through to engine
          }
        }
      }

      if (!lastSan) {
        try {
          const best = findBestMoveWithProfile(
            this.chess,
            {
              ...profile,
              searchDepth: Math.max(profile.searchDepth, m.aiDepth),
              style: m.aiStyle ?? profile.style,
            },
            this.profileMoveOpts(),
          )
          if (best) {
            const result = this.commitEnginePliesOrThrow(this.chess.move(best), {
              mode: 'solo',
              soloColor: this.playerColor,
            })
            lastSan = result.san
          }
        } catch {
          try {
            const rm = findRandomMove(this.chess, this.lastAiMoveKey)
            if (rm) {
              const result = this.commitEnginePliesOrThrow(
                this.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
                { mode: 'solo', soloColor: this.playerColor },
              )
              lastSan = result.san
            }
          } catch {
            /* exhausted */
          }
        }
      }

      if (this.isSceneTerminalForCurrentMode()) {
        this.board?.setInteraction(false)
        this.recordResolvedOutcomeIfNeeded()
        if (this.computeMatchOutcome() === 'win') this.grantVictoryRewards()
        this.persist()
        this.emitChess()
        return
      }

      this.board?.setInteraction(true)
      this.persist()
      this.emitChess()
      if (this.chess.turn() !== this.playerColor) this.scheduleAiMove()
      return
    }

    if (sc.type === 'puzzle' && this.puzzleScene && this.chess.turn() !== this.playerColor) {
      const p = this.puzzleScene
      const depth = p.opponentAiDepth ?? 2
      const style: AIStyle = p.opponentAiStyle ?? 'development'
      let played = false
      try {
        const best = findBestMove(this.chess, depth, style)
        if (best) {
          this.commitEnginePliesOrThrow(this.chess.move(best), {
            mode: 'solo',
            soloColor: this.playerColor,
          })
          played = true
        }
      } catch {
        /* fall through */
      }
      if (!played) {
        try {
          const rm = findRandomMove(this.chess)
          if (rm) {
            this.commitEnginePliesOrThrow(
              this.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
              { mode: 'solo', soloColor: this.playerColor },
            )
            played = true
          }
        } catch {
          /* no legal moves */
        }
      }

      if (this.puzzleSolved()) {
        this.board?.setInteraction(false)
        this.persist()
        this.emitChess()
        return
      }
      if (this.chess.isGameOver()) {
        this.board?.setInteraction(false)
        this.persist()
        this.emitChess()
        return
      }
      this.board?.setInteraction(true)
      this.persist()
      this.emitChess()
      if (this.chess.turn() !== this.playerColor) this.scheduleAiMove()
      return
    }

    if (sc.type === 'calibration' && this.chess.turn() === 'b') {
      try {
        const rm = findRandomMove(this.chess)
        if (rm) {
          const result = this.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion })
          if (!result) {
            devWarn('calibration: random black move returned null')
          } else {
            this.sanLog.push(result.san)
            this.history.push(this.chess.fen())
            this.board?.draw(this.chess, result, { mode: 'solo', soloColor: 'w' })
          }
        }
      } catch {
        /* Random calibration move failed (illegal position); ignore and continue. */
      }

      if (this.chess.isGameOver()) {
        this.board?.setInteraction(false)
      } else {
        this.board?.setInteraction(true)
      }
      this.persist()
      this.emitChess()
      return
    }

    this.board?.setInteraction(true)
    this.persist()
    this.emitChess()
  }

  private calibrationSolved(): boolean {
    const c = this.calibrationScene
    if (!c) return false
    return this.calibrationMoves >= c.minMovesByPlayer
  }

  private puzzleSolved(): boolean {
    const p = this.puzzleScene
    if (!p) return false
    if (p.goal.kind === 'mate') {
      return this.chess.isCheckmate() && this.chess.turn() !== this.playerColor
    }
    if (p.goal.kind === 'advantage') {
      return materialAdvantage(this.chess, this.playerColor) >= p.goal.minCp
    }
    const g = p.goal
    const sq = this.chess.get(g.square)
    return Boolean(sq && sq.color === g.color && sq.type === g.pieceType)
  }

  resetChessScene() {
    this.cancelAiTimer()
    this.lastCoachTip = null
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }

    const sc = this.currentScene()
    if (this.mode === 'duel' && this.duelSession) {
      this.chess.load(this.duelSession.fen)
    } else if (sc.type === 'puzzle') {
      this.chess.load(sc.fen)
    } else if (sc.type === 'match') {
      this.chess.load(sc.fen ?? DEFAULT_POSITION)
    } else if (sc.type === 'calibration') {
      this.chess.load(DEFAULT_POSITION)
      this.calibrationMoves = 0
    } else if (sc.type === 'freeplay') {
      this.chess.load(sc.fen ?? DEFAULT_POSITION)
    } else return

    this.scriptedMoveIndex = 0
    this.sanLog = []
    this.sanQuality = []
    this.lastAiMoveKey = null
    this.history = [this.chess.fen()]
    this.board?.draw(this.chess, null, {
      mode: this.mode === 'duel' ? 'solo' : sc.type === 'freeplay' ? 'free' : 'solo',
      soloColor: this.playerColor,
    })
    this.board?.setInteraction(true)
    this.persist()
    this.emitChess()

    if ((this.mode === 'duel' || sc.type !== 'freeplay') && this.chess.turn() !== this.playerColor && !this.isSceneTerminalForCurrentMode()) {
      this.scheduleAiMove()
    }
  }

  undo() {
    const sc = this.currentScene()
    if (this.mode !== 'duel' && !this.sceneUsesBoard(sc)) return
    if (this.history.length <= 1) return

    this.cancelAiTimer()
    this.lastCoachTip = null
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.lastAiMoveKey = null

    const twoStepUndo =
      (this.mode === 'duel' || sc.type === 'match' || sc.type === 'calibration' || sc.type === 'puzzle') &&
      this.history.length > 2

    const nSans = this.sanLog.length
    let undonePlayerSan: string | null = null
    let halfMoveCountAfterPlayerPly = 0
    if (twoStepUndo && nSans >= 2) {
      undonePlayerSan = this.sanLog[nSans - 2]!
      halfMoveCountAfterPlayerPly = nSans - 1
    } else if (!twoStepUndo && nSans >= 1) {
      undonePlayerSan = this.sanLog[nSans - 1]!
      halfMoveCountAfterPlayerPly = nSans
    }

    /* FEN before the undone player ply — read before mutating `history` (must match `sanLog` / `history` pairing). */
    const fenBeforeUndonePlayerPly =
      undonePlayerSan && this.history.length >= (twoStepUndo ? 3 : 2)
        ? this.history[this.history.length - (twoStepUndo ? 3 : 2)]!
        : null

    this.history.pop()
    if (this.sanLog.length > 0) this.sanLog.pop()
    if (this.sanQuality.length > 0) this.sanQuality.pop()

    if (twoStepUndo) {
      this.history.pop()
      if (this.sanLog.length > 0) this.sanLog.pop()
      if (this.sanQuality.length > 0) this.sanQuality.pop()
    }

    if (this.mode === 'calibration') {
      this.calibrationMoves = Math.max(0, this.calibrationMoves - 1)
    }

    const fen = this.history[this.history.length - 1]!
    this.chess.load(fen)

    if (undonePlayerSan && fenBeforeUndonePlayerPly) {
      this.revertTendencyIncrementsForUndonePly(
        undonePlayerSan,
        halfMoveCountAfterPlayerPly,
        fenBeforeUndonePlayerPly,
      )
    }

    this.board?.draw(this.chess, null, {
      mode: this.mode === 'duel' ? 'solo' : sc.type === 'freeplay' ? 'free' : 'solo',
      soloColor: this.playerColor,
    })
    this.board?.setInteraction(true)
    this.persist()
    this.emitChess()
  }

  private recordLeavingScene(id: string, sc: Scene) {
    if (!this.completedSceneIds.includes(id)) this.completedSceneIds.push(id)
    if (sc.type === 'puzzle' && !this.completedPuzzleIds.includes(id)) {
      this.completedPuzzleIds.push(id)
    }
  }

  advanceScene() {
    this.cancelAiTimer()

    const ch = this.currentChapter()
    const leaving = this.currentScene()
    this.recordLeavingScene(leaving.id, leaving)
    if (leaving.id === 'c1-reflection') this.chapter1Complete = true
    if (leaving.id === 'c2-reflection') this.chapter2Complete = true

    if (this.sceneIndex < ch.scenes.length - 1) {
      this.sceneIndex++
      this.persist()
      this.refreshScene()
      return
    }

    this.handlers.onChapterComplete(ch)
    const chapterRewards = CHAPTER_CLEAR_REWARDS[ch.id] ?? []
    if (chapterRewards.length) {
      chapterRewards.forEach((r) => this.applyReward(r))
      this.rankPoints += 120
      this.pushRewardBundle(ch.id, `${ch.title} Complete`, chapterRewards)
    }

    if (this.chapterIndex < this.chapters.length - 1) {
      this.chapterIndex++
      this.sceneIndex = 0
      this.highestUnlockedChapter = Math.max(this.highestUnlockedChapter, this.chapterIndex)
      this.persist()
      this.refreshScene()
      return
    }

    this.handlers.onCampaignFinished()
    this.persist()
  }

  canAdvance(): boolean {
    if (this.aiThinking) return false
    if (this.mode === 'duel') return false
    const sc = this.currentScene()
    if (sc.type === 'dialogue' || sc.type === 'interlude' || sc.type === 'codex') return true
    if (sc.type === 'freeplay') return true
    if (sc.type === 'calibration') return this.calibrationSolved()
    if (sc.type === 'puzzle') return this.puzzleSolved()
    if (sc.type === 'match') {
      if (this.chess.isCheckmate()) return this.chess.turn() !== this.playerColor
      if (this.isBareKingLockmate()) return this.chess.turn() !== this.playerColor
      if (this.isDominanceSealedStalemate()) return this.chess.turn() !== this.playerColor
      if (this.chess.isStalemate()) return false
      if (this.chess.isInsufficientMaterial()) return false
      return false
    }
    return false
  }

  jumpToChapter(index: number) {
    if (index < 0 || index >= this.chapters.length) return
    if (index > this.highestUnlockedChapter) return
    this.chapterIndex = index
    this.sceneIndex = 0
    this.refreshScene()
    this.persist()
  }

  jumpToScene(chapterIndex: number, sceneIndex: number) {
    if (chapterIndex < 0 || chapterIndex >= this.chapters.length) return
    if (chapterIndex > this.highestUnlockedChapter) return
    const ch = this.chapters[chapterIndex]!
    if (sceneIndex < 0 || sceneIndex >= ch.scenes.length) return
    this.chapterIndex = chapterIndex
    this.sceneIndex = sceneIndex
    this.refreshScene()
    this.persist()
  }

  newGame() {
    this.cancelAiTimer()
    this.chapterIndex = 0
    this.sceneIndex = 0
    this.highestUnlockedChapter = 0
    this.lastScreen = 'title'
    this.chapter1Complete = false
    this.chapter2Complete = false
    this.completedSceneIds = []
    this.completedPuzzleIds = []
    this.stratarchiaUnlocked = false
    this.duelUnlockedOpponentIds = []
    this.unlockedDuelVariantIds = ['alexion-mentor']
    this.codexUnlocks = []
    this.titleUnlocks = []
    this.chronicleEchoes = []
    this.rankPoints = 0
    this.selectedPieceSkin = 'classic-royal'
    this.unlockedPieceSkins = ['classic-royal']
    this.tendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    this.matchHistory = []
    this.rivalMemory = {}
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.lastDuelSetup = null
    this.pendingRewards = []
    this.pendingInProgressSnapshot = null
    this.sessionRecoveredNotice = false
    this.mode = 'idle'
    this.puzzleScene = null
    this.matchScene = null
    this.calibrationScene = null
    this.duelSession = null
    this.history = []
    this.sanLog = []
    this.sanQuality = []
    this.lastAiMoveKey = null
    this.persist()
    this.refreshScene()
  }
}
