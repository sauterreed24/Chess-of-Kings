import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { findRandomMove, type ProfileMoveOptions } from '../../chess/ai'
import { findBestMoveWithProfileAsync } from '../../chess/aiAsync'
import type { AIStyle } from '../../chess/evaluate'
import {
  AI_PROFILES,
  adaptProfileToPhase,
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
} from '../../chess/aiProfiles'
import { chooseOpeningBookMove } from '../../chess/openings'
import { replyPresentationDelayMs } from './replyCadence'
import type { CadenceMove } from './replyCadence'
import { inferRivalIdFromSceneId } from '../../data/rivals'
import type { BoardPickMode } from '../../chess/boardView'
import { devWarn } from '../devLog'
import type { DuelSession } from '../duel/DuelManager'
import type {
  AiProfile,
  CalibrationScene,
  MatchScene,
  PlayerTendencyProfile,
  PuzzleScene,
  Scene,
} from '../../types'

export type GameMode = 'idle' | 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel'
export type MatchOutcome = 'win' | 'loss' | 'draw' | null

export type AiTurnHost = {
  chess: Chess
  mode: GameMode
  playerColor: 'w' | 'b'
  sanLog: string[]
  getScriptedMoveIndex(): number
  incrementScriptedMoveIndex(): void
  lastAiMoveKey: string | null
  duelSession: DuelSession | null
  matchScene: MatchScene | null
  puzzleScene: PuzzleScene | null
  calibrationScene: CalibrationScene | null
  tendencies: PlayerTendencyProfile

  currentScene(): Scene
  isSceneTerminal(): boolean
  computeMatchOutcome(): MatchOutcome
  puzzleSolved(): boolean

  commitEngineMove(
    result: Move | null,
    drawPick: { mode: BoardPickMode; soloColor?: 'w' | 'b' },
  ): Move
  setBoardInteraction(on: boolean): void
  emitChess(): void
  persist(): void
  recordResolvedOutcomeIfNeeded(): void
  grantVictoryRewards(): void
  scheduleAiMove(): void

  tuneProfileForMatch(base: AiProfile, match: MatchScene): AiProfile
  tuneProfileForDuel(
    base: AiProfile,
    difficulty: 'novice' | 'balanced' | 'relentless',
    opponentId?: string,
  ): AiProfile
  profileMoveOpts(profile?: { id: string }): ProfileMoveOptions
  openingBookPlyIndex(): number
  /** False once the scene/turn this host was built for has been superseded. */
  isTurnCurrent?: () => boolean
}

function turnIsStale(host: AiTurnHost): boolean {
  return host.isTurnCurrent !== undefined && !host.isTurnCurrent()
}

/* Reply cadence is presentation only — disabled under vitest so the
   deterministic suite never waits on theatrical pauses. */
const CADENCE_LIVE = import.meta.env.MODE !== 'test'

/**
 * Let the rival visibly "ponder" before the move lands. The engine's own
 * search time (since `startedMs`) counts toward the pause, so fast
 * searches gain presence without slow ones dragging.
 */
async function cadencePause(
  host: AiTurnHost,
  move: CadenceMove,
  thinkTimeMs: number,
  startedMs: number,
): Promise<void> {
  if (!CADENCE_LIVE) return
  const lastReply = host.chess.history({ verbose: true }).at(-1) ?? null
  const target = replyPresentationDelayMs({
    move,
    lastReply: lastReply
      ? { san: lastReply.san, captured: lastReply.captured, to: lastReply.to }
      : null,
    plyCount: host.sanLog.length,
    thinkTimeMs,
    rng: Math.random,
  })
  const remaining = target - (performance.now() - startedMs)
  if (remaining > 15) await new Promise((resolve) => setTimeout(resolve, remaining))
}

export function shouldScheduleAi(opts: {
  mode: GameMode
  scene: Scene
  chessTurn: 'w' | 'b'
  playerColor: 'w' | 'b'
  terminal: boolean
  aiThinking: boolean
  aiTimer: number
}): boolean {
  if (opts.mode !== 'duel' && opts.scene.type === 'freeplay') return false
  if (opts.chessTurn === opts.playerColor) return false
  if (opts.terminal) return false
  if (opts.aiThinking || opts.aiTimer) return false
  return true
}

export function computeAiPaceDelay(lossPressure: number): number {
  return lossPressure >= 2 ? Math.min(540, 300 + lossPressure * 70) : 300
}

export async function runAiTurn(host: AiTurnHost): Promise<void> {
  const sc = host.currentScene()
  if (host.isSceneTerminal()) {
    host.setBoardInteraction(false)
    host.emitChess()
    return
  }
  if (host.chess.turn() === host.playerColor) {
    host.setBoardInteraction(true)
    host.emitChess()
    return
  }

  const soloPick = { mode: 'solo' as const, soloColor: host.playerColor }

  if (host.mode === 'duel' && host.duelSession) {
    const base = resolveProfileByDuelVariant(host.duelSession.variant.id)
    const phase = detectGamePhase(host.chess)
    const adapted = adaptProfileToPhase(base, phase, host.tendencies)
    const profile = host.tuneProfileForDuel(
      adapted,
      host.duelSession.difficulty,
      host.duelSession.roster.opponentId,
    )
    let openingPlayed = false
    if (host.sanLog.length < 18) {
      const bookSan = chooseOpeningBookMove(
        host.chess,
        profile.id,
        host.openingBookPlyIndex(),
        host.duelSession.roster.opponentId,
      )
      if (bookSan) {
        try {
          await cadencePause(host, { san: bookSan, to: '' }, profile.thinkTimeMs, performance.now())
          if (turnIsStale(host)) return
          host.commitEngineMove(host.chess.move(bookSan), soloPick)
          openingPlayed = true
        } catch {
          openingPlayed = false
        }
      }
    }
    try {
      if (!openingPlayed) {
        const searchStarted = performance.now()
        const mv = await findBestMoveWithProfileAsync(
          host.chess,
          profile,
          host.profileMoveOpts(profile),
        )
        if (turnIsStale(host)) return
        if (mv) {
          await cadencePause(
            host,
            { san: mv.san, captured: mv.captured, to: mv.to },
            profile.thinkTimeMs,
            searchStarted,
          )
          if (turnIsStale(host)) return
          host.commitEngineMove(host.chess.move(mv), soloPick)
        }
      }
    } catch {
      if (turnIsStale(host)) return
      try {
        const rm = findRandomMove(host.chess, host.lastAiMoveKey)
        if (rm) {
          host.commitEngineMove(
            host.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
            soloPick,
          )
        }
      } catch {
        /* no legal move */
      }
    }
    if (host.isSceneTerminal()) {
      host.setBoardInteraction(false)
      host.recordResolvedOutcomeIfNeeded()
      if (host.computeMatchOutcome() === 'win') host.grantVictoryRewards()
      host.persist()
      host.emitChess()
      return
    }
    host.setBoardInteraction(true)
    host.persist()
    host.emitChess()
    if (host.chess.turn() !== host.playerColor) host.scheduleAiMove()
    return
  }

  if (sc.type === 'match' && host.matchScene) {
    const m = host.matchScene
    let lastSan: string | null = null
    const base = resolveProfileByMatchId(m.id)
    const phase = detectGamePhase(host.chess)
    const adapted = adaptProfileToPhase(base, phase, host.tendencies)
    const profile = host.tuneProfileForMatch(adapted, m)

    const script = m.scriptedBlackSans
    const shouldUseScript =
      Boolean(script?.length) &&
      host.getScriptedMoveIndex() < (script?.length ?? 0) &&
      host.sanLog.length < 14 &&
      Math.random() < Math.max(0.2, Math.min(0.9, profile.openingDiscipline))
    if (shouldUseScript && script) {
      const san = script[host.getScriptedMoveIndex()]!
      try {
        await cadencePause(host, { san, to: '' }, profile.thinkTimeMs, performance.now())
        if (turnIsStale(host)) return
        const result = host.commitEngineMove(host.chess.move(san), soloPick)
        lastSan = result.san
        host.incrementScriptedMoveIndex()
      } catch {
        /* scripted move illegal */
      }
    }

    if (!lastSan && host.sanLog.length < 20) {
      const bookSan = chooseOpeningBookMove(
        host.chess,
        profile.id,
        host.openingBookPlyIndex(),
        inferRivalIdFromSceneId(m.id) ?? undefined,
      )
      if (bookSan) {
        try {
          await cadencePause(host, { san: bookSan, to: '' }, profile.thinkTimeMs, performance.now())
          if (turnIsStale(host)) return
          const result = host.commitEngineMove(host.chess.move(bookSan), soloPick)
          lastSan = result.san
        } catch {
          /* fall through */
        }
      }
    }

    if (!lastSan) {
      try {
        const searchStarted = performance.now()
        const best = await findBestMoveWithProfileAsync(
          host.chess,
          {
            ...profile,
            searchDepth: Math.max(profile.searchDepth, m.aiDepth),
            style: m.aiStyle ?? profile.style,
          },
          host.profileMoveOpts(profile),
        )
        if (turnIsStale(host)) return
        if (best) {
          await cadencePause(
            host,
            { san: best.san, captured: best.captured, to: best.to },
            profile.thinkTimeMs,
            searchStarted,
          )
          if (turnIsStale(host)) return
          const result = host.commitEngineMove(host.chess.move(best), soloPick)
          lastSan = result.san
        }
      } catch {
        if (turnIsStale(host)) return
        try {
          const rm = findRandomMove(host.chess, host.lastAiMoveKey)
          if (rm) {
            host.commitEngineMove(
              host.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
              soloPick,
            )
          }
        } catch {
          /* exhausted */
        }
      }
    }

    if (host.isSceneTerminal()) {
      host.setBoardInteraction(false)
      host.recordResolvedOutcomeIfNeeded()
      if (host.computeMatchOutcome() === 'win') host.grantVictoryRewards()
      host.persist()
      host.emitChess()
      return
    }

    host.setBoardInteraction(true)
    host.persist()
    host.emitChess()
    if (host.chess.turn() !== host.playerColor) host.scheduleAiMove()
    return
  }

  if (sc.type === 'puzzle' && host.puzzleScene && host.chess.turn() !== host.playerColor) {
    const p = host.puzzleScene
    const depth = p.opponentAiDepth ?? 2
    const style: AIStyle = p.opponentAiStyle ?? 'development'
    /* Puzzle defenders are calibrated game content: route them through a
       tier-matched persona (bounded human-like softness) rather than the
       full-strength engine, which would refuse the baits puzzle solutions
       rely on. opponentAiDepth 1/2/3+ maps to the existing court tiers. */
    const baseProfile =
      depth <= 1
        ? AI_PROFILES.novice_court!
        : depth === 2
          ? AI_PROFILES.apprentice_court!
          : AI_PROFILES.scholar_guard!
    const profile = { ...baseProfile, style, thinkTimeMs: Math.min(baseProfile.thinkTimeMs, 700) }
    let played = false
    try {
      const searchStarted = performance.now()
      const best = await findBestMoveWithProfileAsync(host.chess, profile)
      if (turnIsStale(host)) return
      if (best) {
        await cadencePause(
          host,
          { san: best.san, captured: best.captured, to: best.to },
          profile.thinkTimeMs,
          searchStarted,
        )
        if (turnIsStale(host)) return
        host.commitEngineMove(host.chess.move(best), soloPick)
        played = true
      }
    } catch {
      /* fall through */
    }
    if (!played) {
      if (turnIsStale(host)) return
      try {
        const rm = findRandomMove(host.chess)
        if (rm) {
          host.commitEngineMove(
            host.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion }),
            soloPick,
          )
          played = true
        }
      } catch {
        /* no legal moves */
      }
    }

    if (host.puzzleSolved()) {
      host.setBoardInteraction(false)
      host.persist()
      host.emitChess()
      return
    }
    if (host.chess.isGameOver()) {
      host.setBoardInteraction(false)
      host.persist()
      host.emitChess()
      return
    }
    host.setBoardInteraction(true)
    host.persist()
    host.emitChess()
    if (host.chess.turn() !== host.playerColor) host.scheduleAiMove()
    return
  }

  if (sc.type === 'calibration' && host.chess.turn() === 'b') {
    try {
      const rm = findRandomMove(host.chess)
      if (rm) {
        const result = host.chess.move({ from: rm.from, to: rm.to, promotion: rm.promotion })
        if (!result) {
          devWarn('calibration: random black move returned null')
        } else {
          host.commitEngineMove(result, { mode: 'solo', soloColor: 'w' })
        }
      }
    } catch {
      /* ignore */
    }

    host.setBoardInteraction(!host.chess.isGameOver())
    host.persist()
    host.emitChess()
    return
  }

  host.setBoardInteraction(true)
  host.persist()
  host.emitChess()
}
