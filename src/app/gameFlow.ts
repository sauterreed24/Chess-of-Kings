import { Chess, DEFAULT_POSITION } from 'chess.js'
import type { Move, Square, PieceSymbol } from 'chess.js'
import { materialAdvantage, moveKey, PIECE_VALUES } from '../chess/ai'
import type { ProfileMoveOptions } from '../chess/ai'
import { resetAiGameContext } from '../chess/aiAsync'
import { searchFen } from '../chess/engine'
import { gradeMoveByEval } from './moveGrading'
import { findCostliestMoment, plyMoveLabel } from './recap/costliestMoment'
import { materialAndPst } from '../chess/evaluate'
import { BoardView } from '../chess/boardView'
import type { BoardPickMode, BoardSelectionState } from '../chess/boardView'
import type {
  CalibrationScene,
  Chapter,
  MatchScene,
  PuzzleScene,
  Scene,
  DuelRosterEntry,
  PieceSkinId,
  RewardBundle,
  PlayerTendencyProfile,
  AiProfile,
  InProgressSnapshot,
  MatchHistoryEntry,
  RivalMemoryEntry,
} from '../types'
import { ledgerContentFingerprint } from './ledgerFingerprint'
import { loadSave, type LastScreen } from './storage'
import { devWarn } from './devLog'
import {
  DuelManager,
  buildDuelArchiveRoster,
  filterUnlockedDuelRoster,
  isDuelVariantUnlocked,
  recommendDuelDifficulty as recommendDuelDifficultyFromHistory,
  resolveSnapshotDuelSetup,
  type DuelSession,
  type DuelUnlockContext,
} from './duel/DuelManager'
import { CampaignOrchestrator } from './campaign/CampaignOrchestrator'
import {
  computeAiPaceDelay,
  runAiTurn,
  shouldScheduleAi,
  type AiTurnHost,
} from './ai/aiTurnController'
import {
  applyRewardToInventory,
  createChapterRewardBundle,
  grantDuelVictory,
  grantMatchVictory,
  type RewardInventoryState,
} from './rewards/RewardGrantService'

export type { DuelArchiveRosterEntry, DuelSession, LastDuelSetup } from './duel/DuelManager'
import {
  adaptProfileToPhase,
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
} from '../chess/aiProfiles'
import { detectTacticalMotifs } from '../chess/motifs'
import {
  accuracyFromQualities,
  applyRatingResult,
  DUEL_DIFFICULTY_RATING_OFFSET,
  BASE_RATING,
  defaultLadderRating,
  opponentRatingFromProfile,
} from '../game/rating'
import type { LadderRating } from '../types'
import { lossRecoveryMentorLine } from '../game/trainingTips'
import { getRivalProfile, inferRivalIdFromSceneId, postGameTalkLine, selectTalkLine } from '../data/rivals'
import {
  DEFAULT_RIVAL_CALIBRATION,
  updateRivalCalibrationRating,
} from './duel/rivalCalibration'
import { moveInsightFor, type MoveInsightMode } from './moveInsight'
import { findHangingPiece, hangingCoachTip } from './hangingInsight'
import { validateAndReplaySnapshot, IN_PROGRESS_PLY_LIMIT, type SnapshotRecoveryState } from './persistence/snapshotReplay'
import {
  SnapshotManager,
  type BuildSavePayload,
  type SnapshotBuildContext,
} from './persistence/SnapshotManager'

/** Vitest runs with MODE=test — keep save/UI synchronous so tests stay deterministic. */
const SYNC_IO = import.meta.env.MODE === 'test'
const CHAPTER_LABELS = ['Prologue', 'Chapter I', 'Chapter II', 'Chapter III', 'Chapter IV', 'Chapter V']

function chapterLabel(index: number): string {
  return CHAPTER_LABELS[index] ?? `Chapter ${index}`
}

function emptyBoardSelection(): BoardSelectionState {
  return {
    selected: null,
    legalMoveCount: 0,
    captureCount: 0,
    quietMoveCount: 0,
    guardTarget: null,
  }
}

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
  /** White-positive eval after each ply; recap ignores it when its length drifts from `sanLog`. */
  evalTrace: number[]
  playerColor: 'w' | 'b'
  mentorInsight: string | null
  aiPersona: string | null
  aiFlavor: string | null
  tacticalPulse: string | null
  sessionRecovered: boolean
  canRestoreStable: boolean
  /** Show the one-tap rematch affordance (finished duel/match, not won). */
  canRetry: boolean
  /** Short hint tied to turn / mode — shown as `aria-describedby` for the board. */
  boardGuide: string
}

/** Conversion persona, spoken as the court would file it. */
function conversionSchoolNoun(persona: string): string {
  if (persona === 'technical') return 'ledger school'
  if (persona === 'tactical') return 'sword school'
  return 'open school'
}

export type FlowHandlers = {
  onSceneChange: (chapter: Chapter, scene: Scene, sceneIndex: number) => void
  onChessUpdate: (payload: ChessUiPayload) => void
  onChapterComplete: (chapter: Chapter) => void
  onCampaignFinished: () => void
  /** Fires when localStorage save could not be written (quota, private mode, etc.). */
  onPersistFailure?: () => void
}

export class GameFlow {
  readonly chapters: Chapter[]
  private readonly campaign: CampaignOrchestrator
  lastScreen: LastScreen = 'title'

  get chapterIndex(): number {
    return this.campaign.progress.chapterIndex
  }
  set chapterIndex(v: number) {
    this.campaign.progress.chapterIndex = v
  }
  get sceneIndex(): number {
    return this.campaign.progress.sceneIndex
  }
  set sceneIndex(v: number) {
    this.campaign.progress.sceneIndex = v
  }
  get highestUnlockedChapter(): number {
    return this.campaign.progress.highestUnlockedChapter
  }
  set highestUnlockedChapter(v: number) {
    this.campaign.progress.highestUnlockedChapter = v
  }
  get chapter1Complete(): boolean {
    return this.campaign.progress.chapter1Complete
  }
  set chapter1Complete(v: boolean) {
    this.campaign.progress.chapter1Complete = v
  }
  get chapter2Complete(): boolean {
    return this.campaign.progress.chapter2Complete
  }
  set chapter2Complete(v: boolean) {
    this.campaign.progress.chapter2Complete = v
  }
  get completedSceneIds(): string[] {
    return this.campaign.progress.completedSceneIds
  }
  get completedPuzzleIds(): string[] {
    return this.campaign.progress.completedPuzzleIds
  }
  get stratarchiaUnlocked(): boolean {
    return this.campaign.progress.stratarchiaUnlocked
  }
  set stratarchiaUnlocked(v: boolean) {
    this.campaign.progress.stratarchiaUnlocked = v
  }

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
  private aiTurnEpoch = 0
  private aiTimer = 0
  private lastCoachTip: string | null = null
  /** The rival's spoken reaction to the finished game (shown on the
      board ticker and the verdict recap). */
  private lastRivalRemark: string | null = null
  /** The just-finished game's costliest-move lesson (session-only). */
  private lastCostliestLine: string | null = null
  private sanQuality: MoveQuality[] = []
  /** White-positive engine eval after each ply (session-only; consumers
      must ignore it whenever its length drifts from `sanLog`). */
  private evalTrace: number[] = []
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
  private readonly duels = new DuelManager()
  private matchHistory: MatchHistoryEntry[] = []
  private lastResolvedOutcomeKey: string | null = null
  private rivalMemory: Record<string, RivalMemoryEntry> = {}
  private ladder: LadderRating = defaultLadderRating()
  /** Signed rating change from the most recently resolved rated game (for UI). */
  private lastRatingDelta = 0
  private sceneTendencies: PlayerTendencyProfile = {
    flankPawnPushes: 0,
    earlyQueenMoves: 0,
    repeatedChecksWithoutGain: 0,
  }
  private lastTacticalPulse: string | null = null
  private boardSelection: BoardSelectionState = emptyBoardSelection()
  /** Last engine ply (from+to+promotion) — used to discourage immediate duplicate AI moves. */
  private lastAiMoveKey: string | null = null
  private readonly snapshots = new SnapshotManager({
    onPersistFailure: () => this.handlers.onPersistFailure?.(),
    syncIo: SYNC_IO,
  })
  private sessionRecoveredNotice = false
  private emitRafId = 0

  private get duelSession(): DuelSession | null {
    return this.duels.getSession()
  }

  private set duelSession(session: DuelSession | null) {
    this.duels.setSession(session)
  }

  constructor(chapters: Chapter[], handlers: FlowHandlers) {
    this.handlers = handlers
    const s = loadSave()
    this.campaign = CampaignOrchestrator.hydrateFromSave(chapters, s)
    this.chapters = this.campaign.chapters
    if (s) {
      this.lastScreen = s.lastScreen
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
      this.ladder = { ...s.ladder }
      this.snapshots.setPendingSnapshot(s.inProgress)
    }
  }

  setLastScreen(screen: LastScreen) {
    this.lastScreen = screen
    this.persist()
  }

  /** Debounced localStorage write (production). Tests flush synchronously via SnapshotManager. */
  persist() {
    this.snapshots.persist(
      () => this.buildSavePayload(),
      () => this.snapshotBuildContext(),
    )
  }

  private buildSavePayload(): BuildSavePayload {
    return {
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
      ladder: { ...this.ladder },
    }
  }

  private snapshotBuildContext(): SnapshotBuildContext {
    const sc = this.currentScene()
    return {
      mode: this.mode,
      chapterIndex: this.chapterIndex,
      sceneIndex: this.sceneIndex,
      usesBoard: this.sceneUsesBoard(sc),
      history: this.history,
      sanLog: this.sanLog,
      sanQuality: this.sanQuality,
      playerColor: this.playerColor,
      calibrationMoves: this.calibrationMoves,
      scriptedMoveIndex: this.scriptedMoveIndex,
      sceneTendencies: this.sceneTendencies,
      duel:
        this.mode === 'duel' && this.duelSession
          ? {
              opponentId: this.duelSession.roster.opponentId,
              variantId: this.duelSession.variant.id,
              difficulty: this.duelSession.difficulty,
              playerColor: this.duelSession.playerColor,
              startFen: this.duelSession.fen,
            }
          : null,
    }
  }

  /** Flush pending debounced save + any pending UI emission (tab close / visibility). */
  flushDeferredIO() {
    this.snapshots.flushPersist(
      () => this.buildSavePayload(),
      () => this.snapshotBuildContext(),
    )
    this.flushEmit()
  }

  private flushEmit() {
    if (this.emitRafId !== 0) {
      cancelAnimationFrame(this.emitRafId)
      this.emitRafId = 0
    }
    this.emitChessNow()
  }

  private maybeRestoreInProgressSnapshot(sc: Scene): boolean {
    const snap = this.snapshots.getPendingSnapshot()
    if (!snap) return false
    this.snapshots.clearPendingSnapshot()
    if (snap.chapterIndex !== this.chapterIndex || snap.sceneIndex !== this.sceneIndex) return false
    const recovery = this.snapshotRecoveryState(snap, sc)
    if (!recovery) return false

    if (snap.mode === 'duel' && snap.duel) {
      const session = this.duels.restoreSessionFromSnapshot(snap.duel)
      if (!session) return false
      this.mode = 'duel'
      this.puzzleScene = null
      this.matchScene = null
      this.calibrationScene = null
      this.playerColor = snap.playerColor
      this.chess.load(snap.fen)
      this.history = recovery.history
      this.sanLog = recovery.sanLog
      this.sanQuality = recovery.sanQuality
      this.evalTrace = [] /* session-only; recap falls back gracefully */
      this.sceneTendencies = { ...snap.sceneTendencies }
      this.lastCoachTip = 'Restored'
      this.sessionRecoveredNotice = true
      return true
    }

    const expectedMode = this.expectedSnapshotMode(sc)
    if (!expectedMode || snap.mode !== expectedMode) return false

    this.playerColor = snap.playerColor
    this.chess.load(snap.fen)
    this.history = recovery.history
    this.sanLog = recovery.sanLog
    this.sanQuality = recovery.sanQuality
      this.evalTrace = [] /* session-only; recap falls back gracefully */
    this.calibrationMoves = snap.calibrationMoves
    this.scriptedMoveIndex = snap.scriptedMoveIndex
    this.sceneTendencies = { ...snap.sceneTendencies }
    this.lastCoachTip = 'Restored'
    this.sessionRecoveredNotice = true
    return true
  }

  currentChapter(): Chapter {
    return this.campaign.currentChapter()
  }

  currentScene(): Scene {
    return this.campaign.currentScene()
  }

  isInDuelMode(): boolean {
    return this.mode === 'duel'
  }

  getActiveDuelBrief() {
    return this.duels.getActiveBrief(this.mode === 'duel')
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

  /** Persistent Stratarch Rating snapshot (current / peak / rated-game count). */
  getLadderRating(): LadderRating {
    return { ...this.ladder }
  }

  /** Signed rating change from the most recently resolved rated game. */
  getLastRatingDelta(): number {
    return this.lastRatingDelta
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
    return this.canResumeSnapshot(this.snapshots.getPendingSnapshot())
  }

  /**
   * True when the player has an active board/puzzle/duel session that would be
   * lost or replaced by a scene jump (e.g. Daily Calculus from the title).
   */
  hasUnsavedPassageProgress(): boolean {
    if (this.mode === 'idle') return false
    const sc = this.currentScene()
    if (this.mode !== 'duel' && !this.sceneUsesBoard(sc)) return false
    return this.history.length > 0
  }

  resumeRecoverableSession(): boolean {
    const snap = this.snapshots.getPendingSnapshot()
    if (!this.canResumeSnapshot(snap)) {
      if (snap) {
        // Clear stale/corrupt recovery state so UI does not keep surfacing a dead resume action.
        this.snapshots.clearPendingSnapshot()
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
    if (typeof snap.chapterIndex !== 'number' || typeof snap.sceneIndex !== 'number') return false
    const ch = this.chapters[snap.chapterIndex]
    if (!ch) return false
    if (snap.sceneIndex < 0 || snap.sceneIndex >= ch.scenes.length) return false
    if (snap.chapterIndex > this.highestUnlockedChapter) return false
    const sc = ch.scenes[snap.sceneIndex]!
    if (snap.mode === 'duel' && (!snap.duel || !resolveSnapshotDuelSetup(snap.duel))) return false
    if (!this.snapshotRecoveryState(snap, sc)) return false
    return true
  }

  private expectedSnapshotMode(sc: Scene): InProgressSnapshot['mode'] | null {
    if (sc.type === 'puzzle') return 'puzzle'
    if (sc.type === 'match') return 'match'
    if (sc.type === 'calibration') return 'calibration'
    if (sc.type === 'freeplay') return 'freeplay'
    return null
  }

  private snapshotStartFen(sc: Scene, snap: InProgressSnapshot): string | null {
    if (snap.mode === 'duel') return snap.duel?.startFen ?? null
    if (sc.type === 'puzzle') return sc.fen
    if (sc.type === 'match') return sc.fen ?? DEFAULT_POSITION
    if (sc.type === 'calibration') return DEFAULT_POSITION
    if (sc.type === 'freeplay') return sc.fen ?? DEFAULT_POSITION
    return null
  }

  private snapshotMoveQualityAt(snap: InProgressSnapshot, index: number): MoveQuality {
    const raw = Array.isArray(snap.sanQuality) ? (snap.sanQuality as unknown[])[index] : null
    return (
      raw === null ||
      raw === 'brilliant' ||
      raw === 'good' ||
      raw === 'ok' ||
      raw === 'inaccuracy' ||
      raw === 'mistake' ||
      raw === 'blunder'
    )
      ? raw
      : null
  }

  private snapshotRecoveryState(snap: InProgressSnapshot, sc: Scene): SnapshotRecoveryState | null {
    if (typeof snap.fen !== 'string' || !Array.isArray(snap.sanLog)) return null
    if (snap.sanLog.length > IN_PROGRESS_PLY_LIMIT) return null
    if (snap.mode !== 'duel') {
      const expectedMode = this.expectedSnapshotMode(sc)
      if (!expectedMode || snap.mode !== expectedMode) return null
    }
    const startFen = this.snapshotStartFen(sc, snap)
    if (!startFen) return null

    const replayed = validateAndReplaySnapshot(snap, startFen)
    if (!replayed) return null

    return {
      history: replayed.history,
      sanLog: replayed.sanLog,
      sanQuality: replayed.sanLog.map((_, i) => this.snapshotMoveQualityAt(snap, i)),
    }
  }

  rematchLastDuel(): boolean {
    const s = this.duels.getRematchParams()
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
    return recommendDuelDifficultyFromHistory(opponentId, this.matchHistory, this.rivalMemory)
  }

  private duelUnlockContext(): DuelUnlockContext {
    return {
      duelUnlockedOpponentIds: this.duelUnlockedOpponentIds,
      unlockedDuelVariantIds: this.unlockedDuelVariantIds,
      highestUnlockedChapter: this.highestUnlockedChapter,
    }
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
    return filterUnlockedDuelRoster(this.duelUnlockContext())
  }

  getDuelArchiveRoster() {
    return buildDuelArchiveRoster(this.duelUnlockContext(), chapterLabel)
  }

  isDuelVariantUnlocked(variantId: string): boolean {
    return isDuelVariantUnlocked(variantId, this.duelUnlockContext())
  }

  startDuel(
    opponentId: string,
    variantId: string,
    playerColor: 'w' | 'b',
    fen = DEFAULT_POSITION,
    difficulty: 'novice' | 'balanced' | 'relentless' = 'balanced',
  ): boolean {
    const session = this.duels.tryBeginDuel(
      opponentId,
      variantId,
      playerColor,
      this.duelUnlockContext(),
      fen,
      difficulty,
    )
    if (!session) return false

    this.cancelAiTimer()
    resetAiGameContext()
    this.lastRivalRemark = null
    this.lastCostliestLine = null
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.boardSelection = emptyBoardSelection()
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    this.mode = 'duel'
    this.puzzleScene = null
    this.matchScene = null
    this.calibrationScene = null
    this.playerColor = playerColor
    this.chess.load(session.fen)
    this.history = [this.chess.fen()]
    this.sanLog = []
    this.sanQuality = []
    this.evalTrace = []
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
    this.duels.endSession()
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
      onSelectionChange: (state) => {
        this.boardSelection = state
        this.emitChess()
      },
    })
    this.board.setSkin(this.selectedPieceSkin)
    if (this.mode === 'duel' && this.duelSession) {
      this.board.setOrientation(this.playerColor)
      this.board.draw(this.chess, null, { mode: 'solo', soloColor: this.playerColor })
      this.board.setInteraction(true)
      this.emitChess()
      if (this.chess.turn() !== this.playerColor) this.scheduleAiMove()
      return
    }
    this.refreshScene()
  }

  private cancelAiTimer() {
    if (this.aiTimer) {
      window.clearTimeout(this.aiTimer)
      this.aiTimer = 0
    }
    this.aiThinking = false
    /* Invalidate any AI turn already in flight (async worker searches):
       its host checks this epoch before committing a move. */
    this.aiTurnEpoch++
  }

  refreshScene() {
    this.cancelAiTimer()
    resetAiGameContext()
    this.lastRivalRemark = null
    this.lastCostliestLine = null
    this.lastCoachTip = null
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.boardSelection = emptyBoardSelection()
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
    this.evalTrace = []
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
    const evalScore = chessy ? this.evalScoreForUi(fen) : 0
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
      evalScore,
      evalTrace: [...this.evalTrace],
      playerColor: this.playerColor,
      mentorInsight: this.computeMentorInsight(),
      aiPersona: this.currentAiPersona(),
      aiFlavor: this.currentAiFlavor(),
      tacticalPulse: this.lastTacticalPulse,
      sessionRecovered: this.sessionRecoveredNotice,
      canRestoreStable: this.history.length > 1 && !this.aiThinking,
      canRetry:
        (this.mode === 'duel' || this.mode === 'match') &&
        (matchOutcome === 'loss' || matchOutcome === 'draw'),
      boardGuide: this.boardGuideText(sc),
    })
  }

  /**
   * Eval readout for the UI bar: a tiny tactically-aware engine search
   * instead of bare material counting, so the bar no longer reads "+0.0"
   * while a queen hangs. Memoized per position (emits happen on every
   * selection change), bounded to a few milliseconds, mate scores clamped
   * to the bar's display range. White-positive, in centipawns.
   */
  private evalUiFen = ''
  private evalUiScore = 0

  private evalScoreForUi(fen: string): number {
    if (fen === this.evalUiFen) return this.evalUiScore
    let score: number
    try {
      const result = searchFen(fen, { maxDepth: 3, maxTimeMs: 12, maxNodes: 9000 })
      const whitePov = this.chess.turn() === 'w' ? result.score : -result.score
      score = Math.max(-1200, Math.min(1200, whitePov))
    } catch {
      score = materialAndPst(this.chess, 'w')
    }
    this.evalUiFen = fen
    this.evalUiScore = score
    return score
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
    this.evalTrace = []
    this.lastAiMoveKey = null
    this.lastTacticalPulse = null
    this.lastResolvedOutcomeKey = null
    this.boardSelection = emptyBoardSelection()
    this.sceneTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }
    if (this.mode === 'calibration') this.calibrationMoves = 0
    if (this.mode === 'match' || this.mode === 'duel') this.scriptedMoveIndex = 0
    this.lastCoachTip = 'Stable position restored; rebuild safely.'
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
      return `${this.duelSession.variant.label} · ${conversionSchoolNoun(tuned.conversionPersona)}`
    }
    if (this.mode === 'match' && this.matchScene) {
      const base = resolveProfileByMatchId(this.matchScene.id)
      const phase = detectGamePhase(this.chess)
      const tuned = this.tuneProfileForMatch(adaptProfileToPhase(base, phase, this.tendencies), this.matchScene)
      return `${this.matchScene.opponentName} · ${base.label} · ${conversionSchoolNoun(tuned.conversionPersona)}`
    }
    if (this.mode === 'puzzle' && this.puzzleScene) {
      return 'Puzzle Counterplay Engine'
    }
    return null
  }

  private rivalTalkLineForCurrentSession(): string | null {
    let rivalKey: string | null = null
    if (this.mode === 'duel' && this.duelSession) {
      rivalKey = this.duelSession.roster.opponentId
    } else if (this.mode === 'match' && this.matchScene) {
      rivalKey = inferRivalIdFromSceneId(this.matchScene.id)
    }
    if (!rivalKey) return null
    const profile = getRivalProfile(rivalKey)
    if (!profile) return null
    const recent = this.matchHistory.filter((h) => h.opponentId === rivalKey).slice(-4)
    const recentWins = recent.filter((h) => h.outcome === 'win').length
    const recentLosses = recent.filter((h) => h.outcome === 'loss').length
    const seed = this.sanLog.length * 31 + this.history.length * 11
    return selectTalkLine(profile, recentWins, recentLosses, seed)
  }

  private withRivalTalkPrefix(body: string): string {
    const line = this.rivalTalkLineForCurrentSession()
    return line ? `${line} — ${body}` : body
  }

  private duelDoctrineLine(opponentId: string, variantLabel: string): string {
    if (opponentId === 'alexion') {
      return `${variantLabel}: Alexion audits plans like civic law; govern your structure before he breaks it.`
    }
    if (opponentId === 'rowan') {
      return `${variantLabel}: Rowan turns imbalance into fire. Castle before greed; make the sacrifice pay rent.`
    }
    if (opponentId === 'vega') {
      return `${variantLabel}: Vega audits romance with law. Shelter the king; answer pressure with development.`
    }
    if (opponentId === 'amara') {
      return `${variantLabel}: Amara treats symmetry as jurisprudence. Open the center before the mirror hardens.`
    }
    if (opponentId === 'edred') {
      return `${variantLabel}: Edred hunts flight squares. Castle, blunt the file, and count forcing moves.`
    }
    return `Duel calibration: ${variantLabel} is adapting to your tendencies.`
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
        return this.withRivalTalkPrefix(
          phase === 'opening'
            ? `Amara is developing by principle, not pressure.${memoryTag}`
            : `Amara seeks safety first; sharp tactical shots can still break through.${memoryTag}`,
        )
      }
      if (id.includes('lukas')) {
        return this.withRivalTalkPrefix(
          phase === 'opening'
            ? `Lukas follows prepared structures; off-book transitions are your edge.${memoryTag}`
            : `Lukas stabilizes lines, but can misjudge dynamic imbalances.${memoryTag}`,
        )
      }
      if (id.includes('edred')) {
        return this.withRivalTalkPrefix(
          phase === 'opening'
            ? `Edred is loading tactical pressure on your king flank.${memoryTag}`
            : `Edred accelerates forcing lines — every tempo matters now.${memoryTag}`,
        )
      }
      if (id.includes('marius')) {
        return this.withRivalTalkPrefix(
          phase === 'opening'
            ? `Marius builds quietly; space and pawn breaks decide this battle.${memoryTag}`
            : `Marius squeezes small edges — avoid passive drift.${memoryTag}`,
        )
      }
      if (id.includes('demetrios') || id.includes('boss') || id.includes('counterpart')) {
        return this.withRivalTalkPrefix(
          phase === 'opening'
            ? `Elite court doctrine online: disciplined development and central restraint.${memoryTag}${rivalryTag}`
            : `The boss profile is converting with precision — counterplay must be concrete.${memoryTag}${rivalryTag}`,
        )
      }
    }
    if (this.mode === 'duel' && this.duelSession) {
      return this.withRivalTalkPrefix(
        `${this.duelDoctrineLine(
          this.duelSession.roster.opponentId,
          this.duelSession.variant.label,
        )}${memoryTag}${rivalryTag}`,
      )
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
      return 'Tactical seal: fork geometry. Two threats now demand one answer.'
    }
    if (motifs?.skewer) {
      return 'Tactical seal: skewer pressure. The front piece must move; the prize behind it remains.'
    }
    if (motifs?.pin) return 'Tactical seal: pin geometry. One piece now answers for the king behind it.'
    if (motifs?.kingHunt) return 'King hunt initiated. The rival king is being driven, not merely checked.'
    if (quality === 'brilliant') return 'Brilliant: initiative granted. Keep asking forcing questions.'
    if (quality === 'mistake' || quality === 'blunder') return 'Liability appeared. Count checks, captures, loose pieces.'
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
        thinkTimeMs: Math.max(260, tunedBase.thinkTimeMs - 260 - Math.round(120 * (rivalryRelief + antiTiltRelief))),
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
    const accuracy = accuracyFromQualities(this.sanQuality)
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
      accuracy: accuracy ?? undefined,
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
      calibrationRating: DEFAULT_RIVAL_CALIBRATION,
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
      calibrationRating: updateRivalCalibrationRating(prev.calibrationRating, outcome),
    }

    const prevRating = this.ladder.rating
    this.ladder = applyRatingResult(this.ladder, this.currentOpponentRating(), outcome, accuracy)
    this.lastRatingDelta = this.ladder.rating - prevRating

    /* Let the rival react in their own voice — they should feel like a
       player who remembers you, not an engine with a label. */
    const rivalId =
      this.mode === 'duel' ? opponentId : inferRivalIdFromSceneId(sourceId) ?? ''
    const rivalProfile = getRivalProfile(rivalId)
    if (rivalProfile) {
      let winStreakVsRival = 0
      for (let i = this.matchHistory.length - 1; i >= 0; i--) {
        const entry = this.matchHistory[i]!
        if (entry.opponentId !== opponentId) continue
        if (entry.outcome !== 'win') break
        winStreakVsRival++
        if (winStreakVsRival >= 4) break
      }
      const remark = postGameTalkLine(
        rivalProfile,
        outcome,
        winStreakVsRival,
        this.matchHistory.length,
      )
      if (remark) {
        this.lastRivalRemark = `${opponentLabel}: “${remark}”`
        this.lastTacticalPulse = this.lastRivalRemark
      }
    }

    this.lastCostliestLine = this.buildCostliestMomentLine()

    this.persist()
  }

  /** Rival's post-game line for the verdict recap (null when none). */
  getLastRivalRemark(): string | null {
    return this.lastRivalRemark
  }

  /**
   * The just-finished game's costliest move, named with the engine's
   * preferred alternative — the single most actionable lesson, computed
   * from the per-ply eval trace captured during play. Session-only.
   */
  getCostliestMomentLine(): string | null {
    return this.lastCostliestLine
  }

  private buildCostliestMomentLine(): string | null {
    const moment = findCostliestMoment(this.sanLog, this.evalTrace, this.playerColor)
    if (!moment) return null
    const fenBefore = this.history[moment.ply]
    let preferred: string | null = null
    if (fenBefore) {
      try {
        const result = searchFen(fenBefore, { maxDepth: 6, maxTimeMs: 60, freshTable: true })
        if (result.move) {
          const probe = new Chess(fenBefore)
          const played = probe.move({
            from: result.move.from,
            to: result.move.to,
            promotion: result.move.promotion,
          })
          if (played && played.san !== moment.san) preferred = played.san
        }
      } catch {
        preferred = null
      }
    }
    const pawns = (moment.dropCp / 100).toFixed(1)
    const head = `${plyMoveLabel(moment.ply)} ${moment.san} cost about ${pawns} pawns`
    return preferred ? `${head} — the archive preferred ${preferred}.` : `${head}.`
  }

  /**
   * One-tap "run it back" after a finished board: duels restart the same
   * pairing; campaign scenes reload from their opening position. A loss
   * should invite the next attempt, not a menu crawl.
   */
  retryCurrentBattle(): boolean {
    if (!this.computeMatchOutcome()) return false
    if (this.mode === 'duel') return this.rematchLastDuel()
    if (this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'calibration') {
      this.snapshots.clearPendingSnapshot()
      this.lastRivalRemark = null
    this.lastCostliestLine = null
      this.refreshScene()
      return true
    }
    return false
  }

  /**
   * Stable rating for the current rival, derived from its BASE profile plus a
   * per-mode difficulty offset. Uses the base (untuned) profile so the rival's
   * published strength is not perturbed by anti-tilt / momentum ramps.
   */
  private currentOpponentRating(): number {
    if (this.mode === 'duel' && this.duelSession) {
      const base = resolveProfileByDuelVariant(this.duelSession.variant.id)
      return opponentRatingFromProfile(
        base,
        DUEL_DIFFICULTY_RATING_OFFSET[this.duelSession.difficulty],
      )
    }
    if (this.mode === 'match' && this.matchScene) {
      const base = resolveProfileByMatchId(this.matchScene.id)
      const aiDepth = this.matchScene.aiDepth ?? base.searchDepth
      const depthOffset = Math.max(0, aiDepth - base.searchDepth) * 80
      const diffOffset = (Math.max(1, this.matchScene.difficulty ?? 1) - 1) * 40
      return opponentRatingFromProfile(base, depthOffset + diffOffset)
    }
    return BASE_RATING
  }

  private rewardInventory(): RewardInventoryState {
    return {
      unlockedPieceSkins: this.unlockedPieceSkins,
      codexUnlocks: this.codexUnlocks,
      titleUnlocks: this.titleUnlocks,
      unlockedDuelVariantIds: this.unlockedDuelVariantIds,
      chronicleEchoes: this.chronicleEchoes,
      duelUnlockedOpponentIds: this.duelUnlockedOpponentIds,
    }
  }

  private grantVictoryRewards() {
    const inv = this.rewardInventory()
    if (this.mode === 'match' && this.matchScene) {
      const result = grantMatchVictory(inv, this.matchScene)
      this.rankPoints += result.rankPointsDelta
      if (result.bundle) this.pendingRewards.push(result.bundle)
      this.persist()
      return
    }
    if (this.mode === 'duel' && this.duelSession) {
      const result = grantDuelVictory(this.duelSession)
      for (const r of result.bundle?.rewards ?? []) applyRewardToInventory(inv, r)
      this.rankPoints += result.rankPointsDelta
      if (result.bundle) this.pendingRewards.push(result.bundle)
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

  private openingAimGuide(): string {
    if ((this.mode !== 'match' && this.mode !== 'duel') || this.sanLog.length >= 10) return ''
    const key =
      this.mode === 'duel'
        ? this.duelSession?.roster.opponentId
        : this.matchScene?.id
    if (key?.includes('rowan')) {
      return " Aim: castle; bleed Rowan's fire"
    }
    if (key?.includes('vega')) {
      return ' Aim: castle; use development vs Vega pressure'
    }
    if (key?.includes('alexion') || key?.includes('boss') || key?.includes('counterpart')) {
      return ' Aim: accountable: no loose pieces'
    }
    return ''
  }

  private boardGuideText(scene: Scene): string {
    const defaultGuide =
      'Select piece. Targets glow; captures bronze, check crimson.'
    const chessy = this.mode === 'duel' || this.sceneUsesBoard(scene)
    if (!chessy) return defaultGuide
    if (this.isSceneTerminalForCurrentMode() || this.chess.isGameOver()) {
      return 'Proof sealed. Continue when Advance appears.'
    }
    if (this.aiThinking) {
      return 'Opponent calculating - board resolves after reply.'
    }
    if (this.chess.turn() !== this.playerColor && scene.type !== 'freeplay') {
      const opp = this.playerColor === 'w' ? 'Black' : 'White'
      const mine = this.playerColor === 'w' ? 'White' : 'Black'
      return `${opp} to move - command ${mine}. Targets return.`
    }
    if (this.chess.inCheck()) {
      const replies = this.chess.moves().length
      const word = replies === 1 ? 'reply' : 'replies'
      return `Check: ${replies} legal ${word}. Save king: move, block, capture.`
    }
    const selectionGuide = this.boardSelectionGuide()
    if (selectionGuide) return selectionGuide
    if (scene.type === 'calibration' && this.calibrationScene) {
      const remaining = Math.max(0, this.calibrationScene.minMovesByPlayer - this.calibrationMoves)
      return `Archive proof: ${remaining} White move(s). Develop center; guard king.`
    }
    if (scene.type === 'puzzle') return 'Goal: solve proof. Advance when sealed.'
    if (scene.type === 'freeplay') {
      return 'Select side. Targets glow; captures bronze, check crimson.'
    }
    return `${defaultGuide}${this.openingAimGuide()}`
  }

  private boardSelectionGuide(): string | null {
    const s = this.boardSelection
    if (!s.selected) return null
    const piece = this.chess.get(s.selected)
    const pieceName =
      piece?.type === 'p'
        ? 'pawn'
        : piece?.type === 'n'
          ? 'knight'
          : piece?.type === 'b'
            ? 'bishop'
            : piece?.type === 'r'
              ? 'rook'
              : piece?.type === 'q'
                ? 'queen'
                : piece?.type === 'k'
                  ? 'king'
                  : 'piece'
    if (s.guardTarget) {
      return `${s.selected} ${pieceName} is staged for ${s.guardTarget}. Activate ${s.guardTarget} again to confirm the guarded move.`
    }
    const targetWord = s.legalMoveCount === 1 ? 'target' : 'targets'
    const captureLine = s.captureCount
      ? `${s.captureCount} capture${s.captureCount === 1 ? '' : 's'} available`
      : 'no captures from this square'
    return `${s.selected} ${pieceName} selected: ${s.legalMoveCount} legal ${targetWord}; ${captureLine}. Choose a highlighted square or select another piece.`
  }

  /* ─── Coaching tips ────────────────────────────────────────────────── */
  private computeCoachTip(
    move: Move,
    mover: 'w' | 'b',
    quality: MoveQuality,
  ): string | null {
    if (this.mode === 'idle') return null
    return moveInsightFor({
      move,
      halfMoveCount: this.sanLog.length,
      materialAfterCp: materialAdvantage(this.chess, mover),
      playerColor: mover,
      mode: this.mode as MoveInsightMode,
      quality,
      opponentKey:
        this.mode === 'duel'
          ? `${this.duelSession?.roster.opponentId ?? ''} ${this.duelSession?.variant.id ?? ''}`
          : this.mode === 'match'
            ? this.matchScene?.id
            : null,
    })
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

    /* Engine eval before the move (White-positive, memoized — normally a
       cache hit from the last UI emit). */
    const gradedMode = this.mode === 'match' || this.mode === 'puzzle' || this.mode === 'duel'
    const whiteEvalBefore = gradedMode ? this.evalScoreForUi(this.chess.fen()) : 0

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

    /* Engine-truthful move quality: both probes see the opponent's best
       reply, so captures into recaptures grade as losses and sound
       sacrifices stop grading as blunders. The "after" probe doubles as
       the eval-bar value on the next emit. */
    const whiteEvalAfter = this.evalScoreForUi(this.chess.fen())
    this.evalTrace.push(whiteEvalAfter)
    const threat = findHangingPiece(this.chess, piece.color)
    let playerQuality: MoveQuality = null
    if (gradedMode) {
      const sign = this.playerColor === 'w' ? 1 : -1
      const quality = gradeMoveByEval({
        povBefore: sign * whiteEvalBefore,
        povAfter: sign * whiteEvalAfter,
        offeredGain: threat?.oppGain ?? 0,
      })
      this.sanQuality.push(quality)
      playerQuality = quality
    } else {
      this.sanQuality.push(null)
    }
    const motifs = detectTacticalMotifs(this.chess, last, piece.color)
    this.lastTacticalPulse = this.tacticalPulseFromMove(last, playerQuality, motifs)

    /* Coaching follows player moves across every board mode. */
    this.lastCoachTip = this.computeCoachTip(last, piece.color, playerQuality)

    /* Highest-priority real-world lesson: did this move leave material to be
     * won on the reply? Skip puzzles, where curated sacrifices are the point. */
    if (this.mode === 'match' || this.mode === 'duel' || sc.type === 'freeplay') {
      if (threat && playerQuality !== 'brilliant') this.lastCoachTip = hangingCoachTip(threat)
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
    this.evalTrace.push(this.evalScoreForUi(this.chess.fen()))
    this.lastAiMoveKey = moveKey(result)
    this.board?.draw(this.chess, result, drawPick)
    this.lastTacticalPulse = `${this.duelSession?.roster.opponentName ?? this.matchScene?.opponentName ?? 'Archive'} reply: ${result.san}`
    return result
  }

  private profileMoveOpts(profile?: { id: string }): ProfileMoveOptions {
    const opts: ProfileMoveOptions = { avoidMoveKey: this.lastAiMoveKey }
    if (profile && this.sanLog.length < 20) {
      opts.openingBook = { profileId: profile.id, plyIndex: this.openingBookPlyIndex() }
    }
    return opts
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

  private buildAiHost(): AiTurnHost {
    const epoch = this.aiTurnEpoch
    return {
      chess: this.chess,
      mode: this.mode,
      playerColor: this.playerColor,
      sanLog: this.sanLog,
      getScriptedMoveIndex: () => this.scriptedMoveIndex,
      incrementScriptedMoveIndex: () => {
        this.scriptedMoveIndex++
      },
      lastAiMoveKey: this.lastAiMoveKey,
      duelSession: this.duelSession,
      matchScene: this.matchScene,
      puzzleScene: this.puzzleScene,
      calibrationScene: this.calibrationScene,
      tendencies: this.tendencies,
      currentScene: () => this.currentScene(),
      isSceneTerminal: () => this.isSceneTerminalForCurrentMode(),
      computeMatchOutcome: () => this.computeMatchOutcome(),
      puzzleSolved: () => this.puzzleSolved(),
      commitEngineMove: (result, drawPick) => {
        if (epoch !== this.aiTurnEpoch) {
          /* Stale turn: the board was already mutated (chess.move() is
             evaluated before this call) — roll that back, then refuse. */
          try {
            this.chess.undo()
          } catch {
            /* nothing to undo */
          }
          throw new Error('stale AI turn')
        }
        return this.commitEnginePliesOrThrow(result, drawPick)
      },
      setBoardInteraction: (on) => this.board?.setInteraction(on),
      emitChess: () => this.emitChess(),
      persist: () => this.persist(),
      recordResolvedOutcomeIfNeeded: () => this.recordResolvedOutcomeIfNeeded(),
      grantVictoryRewards: () => this.grantVictoryRewards(),
      scheduleAiMove: () => this.scheduleAiMove(),
      tuneProfileForMatch: (base, m) => this.tuneProfileForMatch(base, m),
      tuneProfileForDuel: (base, diff, oid) => this.tuneProfileForDuel(base, diff, oid),
      profileMoveOpts: (profile) => this.profileMoveOpts(profile),
      openingBookPlyIndex: () => this.openingBookPlyIndex(),
      isTurnCurrent: () => epoch === this.aiTurnEpoch,
    }
  }

  private executeAiTurn() {
    this.aiTimer = 0
    this.lastTacticalPulse = null
    /* aiThinking stays true for the whole async turn so a fast player
       cannot slip a move in while the engine is still deciding. */
    this.aiThinking = true
    const epoch = this.aiTurnEpoch
    const pliesBefore = this.chess.history().length
    void runAiTurn(this.buildAiHost())
      .catch(() => {})
      .finally(() => {
        if (epoch !== this.aiTurnEpoch) return /* scene changed mid-turn */
        this.aiThinking = false
        /* Re-schedule only when this turn actually advanced the game —
           a no-op turn must not retry forever on inconsistent state. */
        const progressed = this.chess.history().length > pliesBefore
        if (progressed && this.chess.turn() !== this.playerColor) this.scheduleAiMove()
      })
  }

  private scheduleAiMove() {
    const sc = this.currentScene()
    if (
      !shouldScheduleAi({
        mode: this.mode,
        scene: sc,
        chessTurn: this.chess.turn(),
        playerColor: this.playerColor,
        terminal: this.isSceneTerminalForCurrentMode(),
        aiThinking: this.aiThinking,
        aiTimer: this.aiTimer,
      })
    ) {
      return
    }

    this.aiThinking = true
    this.board?.setInteraction(false)
    this.emitChess()
    const pressure =
      this.mode === 'duel'
        ? this.recentLossStreak(this.duelSession?.roster.opponentId)
        : this.mode === 'match'
          ? this.recentLossStreak(this.matchScene?.id)
          : this.recentLossStreak()
    this.aiTimer = window.setTimeout(() => this.executeAiTurn(), computeAiPaceDelay(pressure))
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
    this.boardSelection = emptyBoardSelection()
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
    this.evalTrace = []
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
    this.boardSelection = emptyBoardSelection()

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
    if (this.evalTrace.length > 0) this.evalTrace.pop()

    if (twoStepUndo) {
      this.history.pop()
      if (this.sanLog.length > 0) this.sanLog.pop()
      if (this.sanQuality.length > 0) this.sanQuality.pop()
    if (this.evalTrace.length > 0) this.evalTrace.pop()
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

  advanceScene() {
    this.cancelAiTimer()

    const leaving = this.currentScene()
    const result = this.campaign.advanceAfterLeaving(leaving)

    if (result.kind === 'next-scene') {
      this.persist()
      this.refreshScene()
      return
    }

    if (result.kind === 'chapter-complete') {
      this.handlers.onChapterComplete(result.chapter)
      if (result.rewards.length) {
        const inv = this.rewardInventory()
        for (const r of result.rewards) applyRewardToInventory(inv, r)
        this.rankPoints += 120
        const bundle = createChapterRewardBundle(
          result.chapter.id,
          result.chapter.title,
          result.rewards,
        )
        if (bundle) this.pendingRewards.push(bundle)
      }
      this.persist()
      this.refreshScene()
      return
    }

    this.handlers.onCampaignFinished()
    this.persist()
  }

  canAdvance(): boolean {
    return this.campaign.canAdvance({
      aiThinking: this.aiThinking,
      mode: this.mode,
      scene: this.currentScene(),
      puzzleSolved: this.puzzleSolved(),
      calibrationSolved: this.calibrationSolved(),
      chessTurn: this.chess.turn(),
      playerColor: this.playerColor,
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isInsufficientMaterial: this.chess.isInsufficientMaterial(),
      isBareKingLockmate: this.isBareKingLockmate(),
      isDominanceSealedStalemate: this.isDominanceSealedStalemate(),
    })
  }

  jumpToChapter(index: number) {
    if (!this.campaign.applyJumpToChapter(index)) return
    this.refreshScene()
  }

  jumpToScene(chapterIndex: number, sceneIndex: number) {
    if (!this.campaign.applyJumpToScene(chapterIndex, sceneIndex)) return
    this.refreshScene()
  }

  newGame() {
    this.cancelAiTimer()
    this.campaign.resetProgress()
    this.lastScreen = 'title'
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
    this.ladder = defaultLadderRating()
    this.lastRatingDelta = 0
    this.lastResolvedOutcomeKey = null
    this.lastTacticalPulse = null
    this.boardSelection = emptyBoardSelection()
    this.duels.clearLastSetup()
    this.pendingRewards = []
    this.snapshots.clearPendingSnapshot()
    this.sessionRecoveredNotice = false
    this.mode = 'idle'
    this.puzzleScene = null
    this.matchScene = null
    this.calibrationScene = null
    this.duelSession = null
    this.history = []
    this.sanLog = []
    this.sanQuality = []
    this.evalTrace = []
    this.lastAiMoveKey = null
    this.persist()
    this.refreshScene()
  }
}
