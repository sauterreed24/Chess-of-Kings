import type { InProgressSnapshot, PlayerTendencyProfile } from '../../types'
import type { SaveData } from '../storage'
import { writeSave } from '../storage'
import { IN_PROGRESS_PLY_LIMIT } from './snapshotReplay'

/** Vitest runs with MODE=test — synchronous persist for deterministic tests. */
const SYNC_IO = import.meta.env.MODE === 'test'
export const PERSIST_DEBOUNCE_MS = 180

export type BuildSavePayload = Omit<SaveData, 'version' | 'inProgress'>

export type SnapshotBuildContext = {
  mode: InProgressSnapshot['mode'] | 'idle'
  chapterIndex: number
  sceneIndex: number
  /** True when the current scene supports a board snapshot (puzzle/match/calibration/freeplay). */
  usesBoard: boolean
  history: string[]
  sanLog: string[]
  sanQuality: Array<
    'brilliant' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder' | null
  >
  playerColor: 'w' | 'b'
  calibrationMoves: number
  scriptedMoveIndex: number
  sceneTendencies: PlayerTendencyProfile
  duel?: {
    opponentId: string
    variantId: string
    difficulty: 'novice' | 'balanced' | 'relentless'
    playerColor: 'w' | 'b'
    startFen: string
  } | null
}

export type SnapshotManagerOptions = {
  onPersistFailure?: () => void
  debounceMs?: number
  syncIo?: boolean
}

/**
 * Owns debounced SaveData persistence and in-progress snapshot lifecycle.
 */
export class SnapshotManager {
  private pendingInProgressSnapshot: InProgressSnapshot | null = null
  private persistTimer: ReturnType<typeof setTimeout> | null = null
  private readonly onPersistFailure: () => void
  private readonly debounceMs: number
  private readonly syncIo: boolean

  constructor(opts: SnapshotManagerOptions = {}) {
    this.onPersistFailure = opts.onPersistFailure ?? (() => {})
    this.debounceMs = opts.debounceMs ?? PERSIST_DEBOUNCE_MS
    this.syncIo = opts.syncIo ?? SYNC_IO
  }

  setPendingSnapshot(snap: InProgressSnapshot | null) {
    this.pendingInProgressSnapshot = snap
  }

  getPendingSnapshot(): InProgressSnapshot | null {
    return this.pendingInProgressSnapshot
  }

  clearPendingSnapshot() {
    this.pendingInProgressSnapshot = null
  }

  /**
   * Debounced localStorage write (production). Tests use synchronous flush (syncIo).
   */
  persist(
    saveProvider: () => BuildSavePayload,
    snapshotProvider: () => SnapshotBuildContext,
  ) {
    if (this.syncIo) {
      this.flushPersist(saveProvider, snapshotProvider)
      return
    }
    if (this.persistTimer !== null) window.clearTimeout(this.persistTimer)
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null
      this.flushPersist(saveProvider, snapshotProvider)
    }, this.debounceMs)
  }

  flushPersist(
    saveProvider: () => BuildSavePayload,
    snapshotProvider: () => SnapshotBuildContext,
  ) {
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer)
      this.persistTimer = null
    }
    const base = saveProvider()
    const live = buildInProgressSnapshot(snapshotProvider())
    /* Preserve a pending recovery snapshot across idle shell navigations
       (title/chapters/duel). Live board sessions still overwrite it; explicit
       clearPendingSnapshot() discards recovery after resume/jump/new game. */
    const data: SaveData = {
      version: 3,
      ...base,
      inProgress: live ?? this.pendingInProgressSnapshot,
    }
    if (!writeSave(data)) this.onPersistFailure()
  }

  /** Cancel any scheduled debounced write without flushing. */
  cancelScheduledPersist() {
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer)
      this.persistTimer = null
    }
  }
}

/**
 * Builds the live in-progress snapshot from orchestrator state (pure).
 */
export function buildInProgressSnapshot(ctx: SnapshotBuildContext): InProgressSnapshot | null {
  if (ctx.mode === 'idle') return null
  if (ctx.mode !== 'duel' && !ctx.usesBoard) return null
  if (!ctx.history.length) return null

  const plyCount = Math.min(
    ctx.sanLog.length,
    Math.max(0, ctx.history.length - 1),
    IN_PROGRESS_PLY_LIMIT,
  )
  const history = ctx.history.slice(0, plyCount + 1)
  if (!history.length) return null

  const sanLog = ctx.sanLog.slice(0, plyCount)
  const sanQuality = Array.from({ length: plyCount }, (_, i) => ctx.sanQuality[i] ?? null)

  const snap: InProgressSnapshot = {
    mode: ctx.mode,
    chapterIndex: ctx.chapterIndex,
    sceneIndex: ctx.sceneIndex,
    fen: history[history.length - 1]!,
    history,
    sanLog,
    sanQuality,
    playerColor: ctx.playerColor,
    calibrationMoves: ctx.calibrationMoves,
    scriptedMoveIndex: ctx.scriptedMoveIndex,
    sceneTendencies: { ...ctx.sceneTendencies },
    duel: undefined,
  }

  if (ctx.mode === 'duel' && ctx.duel) {
    snap.duel = {
      opponentId: ctx.duel.opponentId,
      variantId: ctx.duel.variantId,
      difficulty: ctx.duel.difficulty,
      playerColor: ctx.duel.playerColor,
      startFen: ctx.duel.startFen,
    }
  }

  return snap
}
