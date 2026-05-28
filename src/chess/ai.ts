import { Chess } from 'chess.js'
import type { Color, Move } from 'chess.js'
import { materialAndPst, styleBias, PIECE_VALUES } from './evaluate'
import type { AIStyle } from './evaluate'
import type { AiProfile } from '../types'
import { detectTacticalMotifs } from './motifs'
import {
  analyzePosition,
  hasPassedPawn,
  isOpenFile,
  isPawnPassed,
  isSquareAttacked,
  opponentOf,
  rankOfIndex,
  squareFromIndex,
  squareIndex,
} from './bitboard'
import type { PositionAnalysis } from './bitboard'
import { openingSanBias } from './openings'

/* ─── Transposition table ────────────────────────────────────────────── */

const TT_FLAG_EXACT = 0
const TT_FLAG_LOWER = 1
const TT_FLAG_UPPER = 2

interface TTEntry {
  key: string
  depth: number
  score: number
  flag: 0 | 1 | 2
  bestMoveKey: string | null
}

/** Single flat map; cleared at the top of each findBestMove call. */
const TT = new Map<string, TTEntry>()
const TT_MAX = 200_000

function ttKey(chess: Chess): string {
  return chess.hash()
}

function ttProbe(
  key: string,
  depth: number,
  alpha: number,
  beta: number,
): { score: number | undefined; bestMoveKey: string | null } {
  const e = TT.get(key)
  if (!e || e.key !== key || e.depth < depth) return { score: undefined, bestMoveKey: null }
  if (e.flag === TT_FLAG_EXACT) return { score: e.score, bestMoveKey: e.bestMoveKey }
  if (e.flag === TT_FLAG_LOWER && e.score >= beta) return { score: e.score, bestMoveKey: e.bestMoveKey }
  if (e.flag === TT_FLAG_UPPER && e.score <= alpha) return { score: e.score, bestMoveKey: e.bestMoveKey }
  return { score: undefined, bestMoveKey: e.bestMoveKey }
}

function ttStore(
  key: string,
  depth: number,
  score: number,
  flag: 0 | 1 | 2,
  bestMoveKey: string | null,
): void {
  if (TT.size > TT_MAX) TT.clear()
  const existing = TT.get(key)
  if (existing && existing.depth > depth) return
  TT.set(key, { key, depth, score, flag, bestMoveKey })
}

/* ─── Move ordering helpers ──────────────────────────────────────────── */

const MVV_LVA_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const MAX_PLY = 96
const killer1: Array<string | null> = Array.from({ length: MAX_PLY }, () => null)
const killer2: Array<string | null> = Array.from({ length: MAX_PLY }, () => null)
const history = new Map<string, number>()

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((a, i) => a + Math.max(1, i.weight), 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= Math.max(1, item.weight)
    if (roll <= 0) return item
  }
  return items[items.length - 1]!
}

function moveKey(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`
}

function pickAvoidingRepeat(chosen: Move | null, avoid: string | null | undefined, alts: Move[]): Move | null {
  if (!chosen || !avoid || moveKey(chosen) !== avoid) return chosen
  const other = alts.find((m) => moveKey(m) !== avoid)
  return other ?? chosen
}

export type ProfileMoveOptions = {
  avoidMoveKey?: string | null
  openingBook?: { profileId: string; plyIndex: number } | null
}

function nonKingPieceCount(chess: Chess): number {
  return analyzePosition(chess).nonKingPieceCount
}

function centrality(square: string): number {
  const file = square.charCodeAt(0) - 97
  const rank = Number(square[1]) - 1
  const df = Math.abs(file - 3.5)
  const dr = Math.abs(rank - 3.5)
  return 4 - (df + dr) * 0.75
}

function isOpenFileForRook(position: PositionAnalysis, square: string): boolean {
  return isOpenFile(position, square.charCodeAt(0) - 97)
}

function hasFriendlyPassedPawn(position: PositionAnalysis, color: Color): boolean {
  return hasPassedPawn(position, color)
}

function rookEndgameDoctrineBonus(
  position: PositionAnalysis,
  move: Move,
  mover: Color,
  nNonKing: number,
): number {
  if (move.piece !== 'r') return 0
  if (nNonKing > 8) return 0
  let score = 0
  const targetRank = move.to[1]
  if ((mover === 'w' && targetRank === '7') || (mover === 'b' && targetRank === '2')) {
    score += 10 // 7th-rank pressure doctrine
  }
  if (isOpenFileForRook(position, move.to)) {
    score += 8 // active rook on open file
  }
  if (hasFriendlyPassedPawn(position, mover)) {
    const toFile = move.to.charCodeAt(0) - 97
    const fromFile = move.from.charCodeAt(0) - 97
    if (Math.abs(toFile - fromFile) >= 1) {
      score += 7 // rook maneuvering behind/around passed pawn races
    }
  }
  return score
}

function kingOppositionDoctrineBonus(
  position: PositionAnalysis,
  move: Move,
  mover: Color,
  nNonKing: number,
): number {
  if (move.piece !== 'k') return 0
  if (nNonKing > 8) return 0
  const enemy = opponentOf(mover)
  const myKing = move.to
  const enemyKingIndex = position.kingIndex[enemy]
  if (enemyKingIndex === null) return 0
  const enemyKing = squareFromIndex(enemyKingIndex)
  const df = Math.abs(myKing.charCodeAt(0) - enemyKing.charCodeAt(0))
  const dr = Math.abs(Number(myKing[1]) - Number(enemyKing[1]))
  // Straight opposition (one square gap on file/rank) and distant opposition patterns.
  if ((df === 0 && dr === 2) || (dr === 0 && df === 2)) return 8
  if ((df === 0 && dr === 4) || (dr === 0 && df === 4)) return 4
  return 0
}

function passedPawnPushDoctrineBonus(
  position: PositionAnalysis,
  move: Move,
  mover: Color,
  nNonKing: number,
): number {
  if (move.piece !== 'p') return 0
  if (nNonKing > 10) return 0
  const index = squareIndex(move.to)
  if (!isPawnPassed(position, mover, index)) return 0
  const advance = mover === 'w' ? rankOfIndex(index) : 7 - rankOfIndex(index)
  return 4 + advance * 0.9
}

function captureScore(move: Move): number {
  if (!move.captured) return 0
  const victim = MVV_LVA_VALUES[move.captured] ?? 0
  const attacker = MVV_LVA_VALUES[move.piece] ?? 0
  return victim * 10 - attacker
}

function captureSafetyScore(move: Move, position: PositionAnalysis | null, mover: Color): number {
  if (!move.captured || !position) return 0
  const target = squareIndex(move.to)
  const enemy = opponentOf(mover)
  const targetAttacked = isSquareAttacked(position, enemy, target)
  const targetDefended = isSquareAttacked(position, mover, target)
  if (!targetAttacked) return 18

  const victim = PIECE_VALUES[move.captured] ?? 0
  const attacker = PIECE_VALUES[move.piece] ?? 0
  let score = targetDefended ? 8 : -26
  if (attacker > victim) score -= Math.round((attacker - victim) * 0.16)
  if (move.san.includes('+')) score += 6
  return score
}

function analysisForCaptureOrdering(chess: Chess, moves: Move[]): PositionAnalysis | null {
  return moves.some((m) => Boolean(m.captured)) ? analyzePosition(chess) : null
}

function orderMoves(
  moves: Move[],
  style: AIStyle,
  ply: number,
  ttMoveKey: string | null,
  position: PositionAnalysis | null = null,
  mover?: Color,
): Move[] {
  return moves
    .map(m => {
      const k = moveKey(m)
      let s = captureScore(m) + styleBias(m, style) + (m.san.includes('+') ? 10 : 0)
      if (mover) s += captureSafetyScore(m, position, mover)
      if (ttMoveKey && k === ttMoveKey) s += 2_000
      if (killer1[ply] && k === killer1[ply]) s += 650
      if (killer2[ply] && k === killer2[ply]) s += 400
      s += history.get(k) ?? 0
      return { m, s }
    })
    .sort((a, b) => b.s - a.s)
    .map(x => x.m)
}

/* ─── Quiescence search ──────────────────────────────────────────────── */

const QUIESCE_MAX_PLY = 8

function quiesce(chess: Chess, alpha: number, beta: number, style: AIStyle, qply = 0): number {
  if (_aborted || searchExpired()) return 0
  const stand = materialAndPst(chess, chess.turn())
  if (stand >= beta) return beta
  if (stand > alpha) alpha = stand
  if (qply >= QUIESCE_MAX_PLY) return alpha

  const tactical = chess
    .moves({ verbose: true })
    .filter((m) => m.captured || m.promotion || m.san.includes('+'))
  const mover = chess.turn()
  const position = analysisForCaptureOrdering(chess, tactical)
  for (const mv of orderMoves(tactical, style, 0, null, position, mover)) {
    chess.move(mv)
    const score = -quiesce(chess, -beta, -alpha, style, qply + 1)
    chess.undo()
    if (_aborted) return 0
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

/* ─── Negamax with αβ + TT ───────────────────────────────────────────── */

const MATE_SCORE = 1_000_000
const TIME_CHECK_MASK = 127

let _deadline = 0
let _aborted = false
let _nodes = 0

function nowMs(): number {
  return globalThis.performance?.now() ?? Date.now()
}

function searchExpired(): boolean {
  _nodes++
  if ((_nodes & TIME_CHECK_MASK) !== 0) return false
  if (nowMs() <= _deadline) return false
  _aborted = true
  return true
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  style: AIStyle,
  ply: number,
): number {
  if (_aborted || searchExpired()) return 0

  const key = ttKey(chess)
  const tt = ttProbe(key, depth, alpha, beta)
  if (tt.score !== undefined) return tt.score

  if (chess.isCheckmate()) return -(MATE_SCORE - depth * 100)
  if (chess.isDraw()) return 0

  // Check extension: tactical sharpness in forcing positions.
  if (chess.inCheck() && depth > 0) depth += 1
  if (depth === 0) return quiesce(chess, alpha, beta, style)

  const origAlpha = alpha
  let best = -Infinity
  let bestMoveKey: string | null = null
  const legalMoves = chess.moves({ verbose: true })
  const moves = orderMoves(
    legalMoves,
    style,
    ply,
    tt.bestMoveKey,
    analysisForCaptureOrdering(chess, legalMoves),
    chess.turn(),
  )

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i]!
    const isTactical = Boolean(mv.captured || mv.promotion || mv.san.includes('+'))
    const childDepthBase = depth - 1
    const canReduce =
      childDepthBase >= 2 &&
      i >= 4 &&
      !isTactical &&
      !chess.inCheck() &&
      ply < MAX_PLY - 2

    let childDepth = childDepthBase
    if (canReduce) childDepth = childDepthBase - 1

    chess.move(mv)
    let score: number
    if (i === 0) {
      score = -negamax(chess, childDepth, -beta, -alpha, style, ply + 1)
    } else {
      // Principal variation search (zero-window for non-first moves).
      score = -negamax(chess, childDepth, -alpha - 1, -alpha, style, ply + 1)
      if (!_aborted && canReduce && score > alpha) {
        score = -negamax(chess, childDepthBase, -alpha - 1, -alpha, style, ply + 1)
      }
      if (score > alpha && score < beta) {
        score = -negamax(chess, childDepthBase, -beta, -alpha, style, ply + 1)
      }
    }
    chess.undo()
    if (_aborted) return 0
    if (score > best) {
      best = score
      bestMoveKey = moveKey(mv)
    }
    if (score > alpha) alpha = score
    if (alpha >= beta) {
      const k = moveKey(mv)
      if (!mv.captured) {
        if (killer1[ply] !== k) {
          killer2[ply] = killer1[ply]
          killer1[ply] = k
        }
      }
      history.set(k, (history.get(k) ?? 0) + depth * depth)
      break
    }
  }

  const flag = best >= beta ? TT_FLAG_LOWER : best <= origAlpha ? TT_FLAG_UPPER : TT_FLAG_EXACT
  ttStore(key, depth, best, flag, bestMoveKey)
  return best
}

/* ─── Public API ─────────────────────────────────────────────────────── */

/**
 * Find the best move using iterative deepening up to `maxDepth`.
 * `timeLimitMs` caps wall-clock time; the last complete iteration's best
 * move is always returned even if time expires mid-search.
 */
export function findBestMove(
  chess: Chess,
  maxDepth: number,
  style: AIStyle,
  timeLimitMs = 2000,
): Move | null {
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0]!

  TT.clear()
  history.clear()
  for (let i = 0; i < MAX_PLY; i++) {
    killer1[i] = null
    killer2[i] = null
  }
  _deadline = nowMs() + timeLimitMs
  _aborted = false
  _nodes = 0

  let bestMove: Move = moves[0]!
  let prevIterationScore: number | null = null
  let rootBestMoveKey: string | null = null
  const rootPosition = analysisForCaptureOrdering(chess, moves)

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (nowMs() > _deadline) break
    _aborted = false

    let localBest: Move | null = null
    let localScore = -Infinity
    const ordered = orderMoves(moves, style, 0, rootBestMoveKey, rootPosition, chess.turn())
    let alpha = -Infinity
    let beta = Infinity
    if (depth >= 3 && prevIterationScore !== null) {
      // Aspiration window to tighten search around previous depth score.
      alpha = prevIterationScore - 45
      beta = prevIterationScore + 45
    }
    const windowAlpha = alpha
    const windowBeta = beta

    for (const mv of ordered) {
      chess.move(mv)
      let score = -negamax(chess, depth - 1, -beta, -alpha, style, 1)
      if (!_aborted && (score <= windowAlpha || score >= windowBeta)) {
        score = -negamax(chess, depth - 1, -Infinity, Infinity, style, 1)
      }
      chess.undo()
      if (_aborted) break // time ran out mid-depth — discard partial result
      if (score > localScore) {
        localScore = score
        localBest = mv
      }
      if (score > alpha) alpha = score
    }

    if (!_aborted && localBest) {
      bestMove = localBest
      rootBestMoveKey = moveKey(localBest)
      prevIterationScore = localScore
    }
  }

  return bestMove
}

function pickRiskyMove(chess: Chess, style: AIStyle): Move | null {
  const moves = chess.moves({ verbose: true })
  const captures = moves.filter((m) => Boolean(m.captured))
  const checks = moves.filter((m) => m.san.includes('+'))
  const forcing = [...captures, ...checks]
  if (!forcing.length) return null
  return forcing.sort((a, b) => styleBias(b, style) - styleBias(a, style))[0] ?? null
}

function profileHeuristic(
  move: Move,
  profile: AiProfile,
  endgame: boolean,
  lastMove: Move | null,
  motifs: { fork: boolean; pin: boolean; skewer: boolean; kingHunt: boolean; givesCheck: boolean },
): number {
  let score = styleBias(move, profile.style)
  const motif = profile.motifBias
  if (move.captured) {
    score += 16 + profile.tacticalAlertness * 24
  }
  if (move.san.includes('+')) {
    score += 10 + profile.tacticalAlertness * 16
  }
  if (move.san === 'O-O' || move.san === 'O-O-O') {
    score += 12 + profile.kingSafetyUrgency * 20
  }
  if (move.piece === 'k' && move.san !== 'O-O' && move.san !== 'O-O-O') {
    score -= 6 + profile.kingSafetyUrgency * 14
  }
  if (move.piece === 'q') {
    // opening discipline: avoid over-early queen walks unless tactical payoff is clear
    const queenPenalty = profile.openingDiscipline * 14
    if (!move.captured && !move.san.includes('+')) score -= queenPenalty
  }
  if (move.promotion) score += 40

  if (motifs.fork) {
    score += motif.fork * 14
  }
  if (motifs.pin) {
    score += motif.pin * 9
  }
  if (motifs.skewer) {
    score += motif.skewer * 12
  }
  if (!endgame && motifs.kingHunt) {
    score += motif.kingHunt * 8
  }

  // Avoid sterile back-and-forth shuffles unless tactically justified.
  if (
    lastMove &&
    move.from === lastMove.to &&
    move.to === lastMove.from &&
    move.piece === lastMove.piece &&
    !move.captured &&
    !move.san.includes('+')
  ) {
    const reversalPenalty =
      profile.conversionPersona === 'technical'
        ? 24
        : profile.conversionPersona === 'universal'
          ? 16
          : 10
    score -= reversalPenalty
  }

  if (endgame) {
    if (profile.conversionPersona === 'technical') {
      if (move.piece === 'k') score += 6 + centrality(move.to) * 2.2
      if (move.piece === 'p') score += 5
      if (move.san.includes('+') && !move.captured) score -= 3
    } else if (profile.conversionPersona === 'tactical') {
      if (move.captured) score += 8
      if (move.san.includes('+')) score += 6
      if (move.piece === 'k') score -= 2
    } else {
      if (move.piece === 'k') score += centrality(move.to)
    }
  }
  return score
}

function scoredCandidates(
  chess: Chess,
  profile: AiProfile,
  opts?: ProfileMoveOptions,
): Array<{ move: Move; score: number }> {
  const mover: Color = chess.turn()
  const moves = chess.moves({ verbose: true })
  const endgame = nonKingPieceCount(chess) <= 8
  const openingCtx = opts?.openingBook ?? null
  const lastMove = (() => {
    const hist = chess.history({ verbose: true }) as Move[]
    return hist.length ? hist[hist.length - 1]! : null
  })()
  return moves.map((move) => {
    chess.move(move)
    const position = analyzePosition(chess)
    const nNonKing = position.nonKingPieceCount
    const staticEval = materialAndPst(chess, mover, position)
    const motifs = detectTacticalMotifs(chess, move, mover)
    const rookDoctrine = rookEndgameDoctrineBonus(position, move, mover, nNonKing)
    const oppositionDoctrine = kingOppositionDoctrineBonus(position, move, mover, nNonKing)
    const passedPawnDoctrine = passedPawnPushDoctrineBonus(position, move, mover, nNonKing)
    const captureSafety = captureSafetyScore(move, position, mover)
    const repetitionPenalty = chess.isThreefoldRepetition()
      ? Math.round(14 + profile.conversionStrictness * 26)
      : 0
    chess.undo()
    const profileScore = profileHeuristic(move, profile, endgame, lastMove, motifs)
    const mobilityScore = (position.mobility[mover] - position.mobility[opponentOf(mover)]) * 0.35
    const bookBias = openingCtx
      ? openingSanBias(chess, openingCtx.profileId, openingCtx.plyIndex, move.san)
      : 0
    return {
      move,
      score:
        staticEval +
        profileScore +
        mobilityScore +
        rookDoctrine +
        oppositionDoctrine +
        passedPawnDoctrine +
        captureSafety +
        bookBias -
        repetitionPenalty,
    }
  }).sort((a, b) => b.score - a.score)
}

export function findBestMoveWithProfile(
  chess: Chess,
  profile: AiProfile,
  opts?: ProfileMoveOptions,
): Move | null {
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null
  if (moves.length === 1) return moves[0]!

  const avoid = opts?.avoidMoveKey ?? null
  const altPool = (): Move[] => moves

  if (Math.random() < profile.blunderRate) {
    return pickAvoidingRepeat(findRandomMove(chess, avoid), avoid, altPool())
  }

  // Candidate pool keeps variety for weaker personalities while preserving quality.
  const candidates = scoredCandidates(chess, profile, opts)
  const strictness = Math.max(0.05, Math.min(0.98, profile.conversionStrictness))
  const width = Math.max(1, Math.min(6, Math.round((1 - strictness) * 6)))
  const pool = candidates.slice(0, width)
  const candidateScoreByKey = new Map<string, number>()
  for (const c of candidates) candidateScoreByKey.set(moveKey(c.move), c.score)

  /* Separate draw so risky play is not shadowed by the blunder branch (single-roll bands overlapped). */
  if (Math.random() < profile.riskAppetite * 0.18) {
    const risky = pickRiskyMove(chess, profile.style)
    if (risky) return pickAvoidingRepeat(risky, avoid, altPool())
  }

  const personalityVariance =
    profile.conversionPersona === 'technical'
      ? 0.05
      : profile.conversionPersona === 'universal'
        ? 0.12
        : 0.18
  if (pool.length > 1 && Math.random() < Math.max(0.03, personalityVariance - strictness * 0.12)) {
    const m = pool[Math.floor(Math.random() * pool.length)]!.move
    return pickAvoidingRepeat(m, avoid, pool.map((c) => c.move))
  }

  // Stronger profiles get deeper search; weaker ones can still play sensible heuristics.
  const depthBoost = profile.tacticalAlertness > 0.8 ? 1 : 0
  const engineMove = findBestMove(
    chess,
    Math.max(1, profile.searchDepth + depthBoost),
    profile.style,
    Math.max(250, profile.thinkTimeMs),
  )
  if (engineMove) {
    const bestScore = candidates[0]?.score ?? -Infinity
    const selectedScore = candidateScoreByKey.get(moveKey(engineMove))
    const guardThreshold = Math.round(30 + strictness * 95 + profile.tacticalAlertness * 20)
    // Blunder guard: strong/technical profiles avoid large heuristic drops.
    if (selectedScore !== undefined && selectedScore + guardThreshold < bestScore) {
      return pickAvoidingRepeat(pool[0]!.move, avoid, pool.map((c) => c.move))
    }
    const openingCtx = opts?.openingBook ?? null
    if (openingCtx) {
      const engineOnBook = openingSanBias(chess, openingCtx.profileId, openingCtx.plyIndex, engineMove.san) > 0
      if (!engineOnBook) {
        const bookCandidate = candidates.find(
          (c) => openingSanBias(chess, openingCtx.profileId, openingCtx.plyIndex, c.move.san) > 0,
        )
        if (bookCandidate) {
          const bookSlack = Math.round(16 + profile.openingDiscipline * 24)
          const engineHeuristic = selectedScore ?? -Infinity
          if (bookCandidate.score + bookSlack >= engineHeuristic) {
            return pickAvoidingRepeat(
              bookCandidate.move,
              avoid,
              [...pool.map((c) => c.move), ...candidates.slice(0, 12).map((c) => c.move)],
            )
          }
        }
      }
    }
    return pickAvoidingRepeat(
      engineMove,
      avoid,
      [...pool.map((c) => c.move), ...candidates.slice(0, 12).map((c) => c.move)],
    )
  }

  // Engine fallback: choose among top pool with quality-weighted randomness.
  if (pool.length > 1) {
    const top = pool[0]!.score
    const weights = pool.map((c) => ({
      move: c.move,
      weight: Math.max(1, 1 + Math.round(top - c.score <= 45 ? 8 : top - c.score <= 120 ? 3 : 1)),
    }))
    return pickAvoidingRepeat(weightedPick(weights).move, avoid, pool.map((c) => c.move))
  }
  return pickAvoidingRepeat(pool[0]!.move, avoid, altPool())
}

/** Material value of a piece, used by GameFlow draw adjudication. */
export { PIECE_VALUES }

/** Re-export for GameFlow compatibility */
export { materialAndPst as materialAdvantage } from './evaluate'

/** Pick a random legal move — used as a fallback when the engine fails. */
export function findRandomMove(chess: Chess, avoidMoveKey?: string | null): Move | null {
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null
  const pool = avoidMoveKey ? moves.filter((m) => moveKey(m) !== avoidMoveKey) : moves
  const pickFrom = pool.length ? pool : moves
  return pickFrom[Math.floor(Math.random() * pickFrom.length)]!
}
