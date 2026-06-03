import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import {
  findBestMoveWithProfile,
  findRandomMove,
  type ProfileMoveOptions,
} from '../../chess/ai'
import { findBestMoveAsync, getAiSearchSurface } from '../../chess/aiAsync'
import type { AIStyle } from '../../chess/evaluate'
import {
  adaptProfileToPhase,
  detectGamePhase,
  resolveProfileByDuelVariant,
  resolveProfileByMatchId,
} from '../../chess/aiProfiles'
import { chooseOpeningBookMove } from '../../chess/openings'
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
          host.commitEngineMove(host.chess.move(bookSan), soloPick)
          openingPlayed = true
        } catch {
          openingPlayed = false
        }
      }
    }
    try {
      if (!openingPlayed) {
        const mv = findBestMoveWithProfile(host.chess, profile, host.profileMoveOpts(profile))
        if (mv) host.commitEngineMove(host.chess.move(mv), soloPick)
      }
    } catch {
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
          const result = host.commitEngineMove(host.chess.move(bookSan), soloPick)
          lastSan = result.san
        } catch {
          /* fall through */
        }
      }
    }

    if (!lastSan) {
      try {
        const best = findBestMoveWithProfile(
          host.chess,
          {
            ...profile,
            searchDepth: Math.max(profile.searchDepth, m.aiDepth),
            style: m.aiStyle ?? profile.style,
          },
          host.profileMoveOpts(profile),
        )
        if (best) {
          const result = host.commitEngineMove(host.chess.move(best), soloPick)
          lastSan = result.san
        }
      } catch {
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
    let played = false
    try {
      const best = await findBestMoveAsync(
        host.chess,
        depth,
        style,
        Math.max(400, 800),
        getAiSearchSurface(),
      )
      if (best) {
        host.commitEngineMove(host.chess.move(best), soloPick)
        played = true
      }
    } catch {
      /* fall through */
    }
    if (!played) {
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
