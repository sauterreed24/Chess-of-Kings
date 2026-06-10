/* ─── Crown Engine v2 — search core ───────────────────────────────────────
   Iterative deepening + principal variation search (negamax form) with:
   - transposition table (typed arrays, generation-aged, depth-preferred)
   - quiescence search with delta pruning
   - null-move pruning (guarded against low-material zugzwang)
   - late move reductions, shallow futility pruning, check extension
   - killer/history move ordering, MVV-LVA captures
   - aspiration windows from depth 4
   - soft/hard time limits with a best-move-instability extension
   - optional "spectrum" root mode: every root move gets an exact score
     (full window), which powers the human-like difficulty model.

   The search is fully deterministic: no randomness, stable ordering.
   ────────────────────────────────────────────────────────────────────────── */

import { evaluate } from './evaluate'
import {
  moveCaptured,
  movePiece,
  movePromotion,
  moveFrom,
  moveTo,
  moveToUci,
} from './position'
import type { Position } from './position'

export const INF = 32000
export const MATE = 30000
/** Scores beyond this bound encode forced mates ("mate in (MATE - |score|) plies"). */
export const MATE_BOUND = 29000

export interface SearchLimits {
  maxDepth?: number
  maxTimeMs?: number
  maxNodes?: number
  /** Collect exact scores for every root move (costlier; used by personas). */
  spectrum?: boolean
}

export interface RootMoveScore {
  move: number
  uci: string
  /** Centipawns from the mover's perspective; ±MATE-n encodes forced mates. */
  score: number
}

export interface SearchOutcome {
  move: number
  uci: string | null
  score: number
  depth: number
  nodes: number
  timeMs: number
  pv: string[]
  rootMoves: RootMoveScore[]
}

/* ─── Transposition table ────────────────────────────────────────────── */

const TT_BITS = 18
const TT_SIZE = 1 << TT_BITS
const TT_MASK = TT_SIZE - 1
const FLAG_EXACT = 0
const FLAG_LOWER = 1
const FLAG_UPPER = 2

const ttKeyLo = new Int32Array(TT_SIZE)
const ttKeyHi = new Int32Array(TT_SIZE)
const ttMoveArr = new Int32Array(TT_SIZE)
/** Packed: (score + 32768) | depth << 16 | flag << 23 | generation << 25 */
const ttData = new Int32Array(TT_SIZE)
let ttGeneration = 0

function ttStore(pos: Position, depth: number, score: number, flag: number, move: number, ply: number): void {
  /* Depth field is 7 bits; stacked check extensions could exceed it. */
  if (depth > 127) depth = 127
  const idx = pos.hashLo & TT_MASK
  const existing = ttData[idx]!
  if (existing !== 0) {
    const existingDepth = (existing >> 16) & 0x7f
    const existingGen = (existing >>> 25) & 0x3f
    if (existingGen === ttGeneration && existingDepth > depth) return
  }
  /* Mate scores are stored relative to this node, not the root. */
  let stored = score
  if (stored > MATE_BOUND) stored += ply
  else if (stored < -MATE_BOUND) stored -= ply
  ttKeyLo[idx] = pos.hashLo
  ttKeyHi[idx] = pos.hashHi
  ttMoveArr[idx] = move
  ttData[idx] = (stored + 32768) | (depth << 16) | (flag << 23) | (ttGeneration << 25)
}

/** Returns packed data when the entry matches this position, else 0. */
function ttProbe(pos: Position): number {
  const idx = pos.hashLo & TT_MASK
  if (ttKeyLo[idx] !== pos.hashLo || ttKeyHi[idx] !== pos.hashHi) return 0
  return ttData[idx]!
}

function ttMoveFor(pos: Position): number {
  const idx = pos.hashLo & TT_MASK
  if (ttKeyLo[idx] !== pos.hashLo || ttKeyHi[idx] !== pos.hashHi) return 0
  return ttMoveArr[idx]!
}

export function clearTranspositionTable(): void {
  ttKeyLo.fill(0)
  ttKeyHi.fill(0)
  ttMoveArr.fill(0)
  ttData.fill(0)
  ttGeneration = 0
}

/* ─── Ordering state ─────────────────────────────────────────────────── */

const MAX_SEARCH_PLY = 96
const killers = new Int32Array(MAX_SEARCH_PLY * 2)
/** Indexed (side << 14) | (from << 7) | to. */
const historyTable = new Int32Array(1 << 15)

/* MVV-LVA: victim value dominates, attacker breaks ties. */
const ORDER_VALUE = new Int32Array([0, 100, 320, 330, 500, 900, 20000])

function scoreMove(move: number, ttMove: number, side: number, ply: number): number {
  if (move === ttMove) return 1 << 30
  const captured = moveCaptured(move)
  const promo = movePromotion(move)
  if (captured !== 0 || promo !== 0) {
    return (
      1_000_000 +
      ORDER_VALUE[captured]! * 32 -
      ORDER_VALUE[movePiece(move)]! / 16 +
      ORDER_VALUE[promo]! * 32
    )
  }
  if (killers[ply * 2] === move) return 900_000
  if (killers[ply * 2 + 1] === move) return 850_000
  return historyTable[(side << 14) | (moveFrom(move) << 7) | moveTo(move)]!
}

/* ─── Search state ───────────────────────────────────────────────────── */

let nodes = 0
let hardDeadline = Infinity
let nodeBudget = Infinity
let aborted = false

function timeUp(): boolean {
  if (aborted) return true
  if ((nodes & 1023) === 0) {
    if (nodes >= nodeBudget || performance.now() >= hardDeadline) {
      aborted = true
      return true
    }
  }
  return false
}

/* ─── Quiescence ─────────────────────────────────────────────────────── */

const DELTA_MARGIN = 180
const QUEEN_DELTA = 975

function qsearch(pos: Position, alpha: number, beta: number, ply: number): number {
  nodes++
  if (timeUp()) return 0

  const stand = evaluate(pos, alpha, beta)
  if (stand >= beta) return stand
  if (stand > alpha) alpha = stand
  if (stand + QUEEN_DELTA < alpha || ply >= MAX_SEARCH_PLY - 1) return alpha

  const moves: number[] = []
  pos.generateMoves(moves, true)

  /* Selection-order by MVV-LVA. */
  const scores = moves.map((m) => ORDER_VALUE[moveCaptured(m)]! * 32 + ORDER_VALUE[movePromotion(m)]! * 32)
  for (let i = 0; i < moves.length; i++) {
    let bestIdx = i
    for (let j = i + 1; j < moves.length; j++) {
      if (scores[j]! > scores[bestIdx]!) bestIdx = j
    }
    if (bestIdx !== i) {
      const tm = moves[i]!
      moves[i] = moves[bestIdx]!
      moves[bestIdx] = tm
      const ts = scores[i]!
      scores[i] = scores[bestIdx]!
      scores[bestIdx] = ts
    }
    const move = moves[i]!

    /* Per-move delta pruning: even winning this capture cannot lift alpha. */
    if (
      movePromotion(move) === 0 &&
      stand + ORDER_VALUE[moveCaptured(move)]! + DELTA_MARGIN <= alpha
    ) {
      continue
    }

    if (!pos.make(move)) {
      pos.unmake()
      continue
    }
    const score = -qsearch(pos, -beta, -alpha, ply + 1)
    pos.unmake()
    if (aborted) return 0
    if (score >= beta) return score
    if (score > alpha) alpha = score
  }
  return alpha
}

/* ─── Main alpha-beta ────────────────────────────────────────────────── */

function negamax(
  pos: Position,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
  canNull: boolean,
): number {
  nodes++
  if (timeUp()) return 0

  /* Path draws (repetition / fifty-move). */
  if (ply > 0 && (pos.halfmove >= 100 || pos.isRepetition())) return 0

  /* Mate-distance pruning. */
  if (alpha < -MATE + ply) alpha = -MATE + ply
  if (beta > MATE - ply - 1) beta = MATE - ply - 1
  if (alpha >= beta) return alpha

  const inCheck = pos.inCheck()
  if (inCheck) depth++
  if (depth <= 0 || ply >= MAX_SEARCH_PLY - 1) return qsearch(pos, alpha, beta, ply)

  const isPv = beta - alpha > 1

  /* Transposition table. */
  const entry = ttProbe(pos)
  const ttMove = entry !== 0 ? ttMoveFor(pos) : 0
  if (entry !== 0 && !isPv) {
    const entryDepth = (entry >> 16) & 0x7f
    if (entryDepth >= depth) {
      let score = (entry & 0xffff) - 32768
      if (score > MATE_BOUND) score -= ply
      else if (score < -MATE_BOUND) score += ply
      const flag = (entry >> 23) & 3
      if (flag === FLAG_EXACT) return score
      if (flag === FLAG_LOWER && score >= beta) return score
      if (flag === FLAG_UPPER && score <= alpha) return score
    }
  }

  const staticEval = inCheck ? -INF : evaluate(pos, alpha - 256, beta + 256)

  /* Null-move pruning: skip a turn; if we still beat beta, prune. Guarded
     against zugzwang by requiring non-pawn material for the mover. */
  if (
    canNull &&
    !isPv &&
    !inCheck &&
    depth >= 3 &&
    pos.nonPawnMaterial[pos.sideToMove]! > 0 &&
    staticEval >= beta
  ) {
    pos.makeNull()
    const r = 2 + (depth >> 2)
    const nullScore = -negamax(pos, depth - 1 - r, -beta, -beta + 1, ply + 1, false)
    pos.unmakeNull()
    if (aborted) return 0
    if (nullScore >= beta) return nullScore >= MATE_BOUND ? beta : nullScore
  }

  /* Shallow futility: when far below alpha, quiet moves rarely save us. */
  const futile =
    depth <= 2 && !inCheck && Math.abs(alpha) < MATE_BOUND && staticEval + 130 * depth <= alpha

  const moves: number[] = []
  pos.generateMoves(moves)
  const side = pos.sideToMove
  const scores = moves.map((m) => scoreMove(m, ttMove, side, ply))

  let best = -INF
  let bestMove = 0
  let legal = 0
  const origAlpha = alpha

  for (let i = 0; i < moves.length; i++) {
    /* Selection sort: pull the highest-scored remaining move forward. */
    let bestIdx = i
    for (let j = i + 1; j < moves.length; j++) {
      if (scores[j]! > scores[bestIdx]!) bestIdx = j
    }
    if (bestIdx !== i) {
      const tm = moves[i]!
      moves[i] = moves[bestIdx]!
      moves[bestIdx] = tm
      const ts = scores[i]!
      scores[i] = scores[bestIdx]!
      scores[bestIdx] = ts
    }
    const move = moves[i]!
    const quiet = moveCaptured(move) === 0 && movePromotion(move) === 0

    if (!pos.make(move)) {
      pos.unmake()
      continue
    }
    legal++
    const givesCheck = pos.inCheck()

    if (futile && quiet && !givesCheck && legal > 1) {
      pos.unmake()
      continue
    }

    let score: number
    if (legal === 1) {
      score = -negamax(pos, depth - 1, -beta, -alpha, ply + 1, true)
    } else {
      /* Late move reduction for quiet, non-checking moves. */
      let reduced = depth - 1
      if (depth >= 3 && legal > 3 && quiet && !inCheck && !givesCheck) {
        reduced -= legal > 12 ? 2 : 1
      }
      score = -negamax(pos, reduced, -alpha - 1, -alpha, ply + 1, true)
      if (!aborted && score > alpha && reduced < depth - 1) {
        score = -negamax(pos, depth - 1, -alpha - 1, -alpha, ply + 1, true)
      }
      if (!aborted && score > alpha && score < beta) {
        score = -negamax(pos, depth - 1, -beta, -alpha, ply + 1, true)
      }
    }
    pos.unmake()
    if (aborted) return 0

    if (score > best) {
      best = score
      bestMove = move
    }
    if (score > alpha) alpha = score
    if (alpha >= beta) {
      if (quiet) {
        const k = ply * 2
        if (killers[k] !== move) {
          killers[k + 1] = killers[k]!
          killers[k] = move
        }
        const hIdx = (side << 14) | (moveFrom(move) << 7) | moveTo(move)
        historyTable[hIdx] = historyTable[hIdx]! + depth * depth
        if (historyTable[hIdx]! > 1 << 20) {
          for (let h = 0; h < historyTable.length; h++) historyTable[h] = historyTable[h]! >> 1
        }
      }
      break
    }
  }

  if (legal === 0) return inCheck ? -MATE + ply : 0

  const flag = best >= beta ? FLAG_LOWER : best <= origAlpha ? FLAG_UPPER : FLAG_EXACT
  ttStore(pos, depth, best, flag, bestMove, ply)
  return best
}

/* ─── Root driver ────────────────────────────────────────────────────── */

function extractPv(pos: Position, firstMove: number, maxLen: number): string[] {
  const pv: string[] = [moveToUci(firstMove)]
  let made = 0
  if (!pos.make(firstMove)) {
    pos.unmake()
    return pv
  }
  made++
  while (made < maxLen) {
    const move = ttMoveFor(pos)
    if (move === 0) break
    /* Validate against the legal list to keep corrupt entries out of the PV. */
    if (!pos.legalMoves().includes(move)) break
    if (!pos.make(move)) {
      pos.unmake()
      break
    }
    made++
    pv.push(moveToUci(move))
    if (pos.isRepetition()) break
  }
  for (let i = 0; i < made; i++) pos.unmake()
  return pv
}

export function search(pos: Position, limits: SearchLimits = {}): SearchOutcome {
  const maxDepth = Math.max(1, Math.min(63, limits.maxDepth ?? 63))
  const maxTimeMs = limits.maxTimeMs ?? 2000
  const spectrum = limits.spectrum === true
  const start = performance.now()
  hardDeadline = start + maxTimeMs
  nodeBudget = limits.maxNodes ?? Infinity
  nodes = 0
  aborted = false
  ttGeneration = (ttGeneration + 1) & 0x3f
  killers.fill(0)
  historyTable.fill(0)

  const rootMoves = pos.legalMoves()
  if (rootMoves.length === 0) {
    return {
      move: 0,
      uci: null,
      score: pos.inCheck() ? -MATE : 0,
      depth: 0,
      nodes: 0,
      timeMs: 0,
      pv: [],
      rootMoves: [],
    }
  }

  /* Root list with last-iteration scores; order survives across iterations. */
  const root = rootMoves.map((move) => ({ move, score: -INF }))
  let bestIdx = 0
  let completedDepth = 0
  let lastScore = 0
  let lastBestMove = 0
  let bestMoveChanged = false

  for (let depth = 1; depth <= maxDepth; depth++) {
    const elapsed = performance.now() - start
    /* Soft limit: do not start an iteration we cannot plausibly finish.
       An unstable best move earns a longer leash (criticality extension). */
    const softBudget = maxTimeMs * (bestMoveChanged ? 0.78 : 0.55)
    if (depth > 1 && elapsed >= softBudget) break

    let iterBestIdx = -1
    let iterBestScore = -INF
    const iterScores = new Array<number>(root.length).fill(-INF)

    let alpha = -INF
    let beta = INF
    let window = 45
    if (!spectrum && depth >= 4) {
      alpha = lastScore - window
      beta = lastScore + window
    }

    let failed = false
    for (let i = 0; i < root.length; i++) {
      const entry = root[i]!
      pos.make(entry.move) /* root moves are pre-validated legal */

      let score: number
      if (spectrum) {
        /* Exact score per root move: independent full-window search. */
        score = -negamax(pos, depth - 1, -INF, INF, 1, true)
      } else if (i === 0) {
        score = -negamax(pos, depth - 1, -beta, -alpha, 1, true)
        /* Aspiration fail: re-search with a full window. */
        while (!aborted && (score <= alpha || score >= beta) && (alpha !== -INF || beta !== INF)) {
          window *= 3
          alpha = Math.max(-INF, score <= alpha ? score - window : alpha)
          beta = Math.min(INF, score >= beta ? score + window : beta)
          score = -negamax(pos, depth - 1, -beta, -alpha, 1, true)
        }
      } else {
        score = -negamax(pos, depth - 1, -alpha - 1, -alpha, 1, true)
        if (!aborted && score > alpha && score < beta) {
          score = -negamax(pos, depth - 1, -beta, -alpha, 1, true)
        }
      }
      pos.unmake()
      if (aborted) {
        failed = true
        break
      }

      iterScores[i] = score
      if (score > iterBestScore) {
        iterBestScore = score
        iterBestIdx = i
      }
      if (!spectrum && score > alpha) alpha = score
    }

    if (failed || iterBestIdx < 0) break

    /* Commit the completed iteration. */
    for (let i = 0; i < root.length; i++) {
      if (spectrum) {
        root[i]!.score = iterScores[i]!
      } else {
        /* In best-mode only the PV move's score is exact; keep relative order. */
        root[i]!.score = iterScores[i]!
      }
    }
    bestIdx = iterBestIdx
    lastScore = iterBestScore
    completedDepth = depth
    bestMoveChanged = lastBestMove !== 0 && root[bestIdx]!.move !== lastBestMove
    lastBestMove = root[bestIdx]!.move

    /* Move the best move to the front for the next iteration; in spectrum
       mode sort the whole list so persona sampling sees ranked moves. */
    root.sort((a, b) => b.score - a.score)
    bestIdx = 0

    /* Forced mate established at depth ≥ 2: deeper search cannot help. */
    if (Math.abs(lastScore) > MATE_BOUND && depth >= 2) break
  }

  const bestEntry = root[bestIdx]!
  const timeMs = performance.now() - start
  return {
    move: bestEntry.move,
    uci: moveToUci(bestEntry.move),
    /* `| 0` collapses negamax's negative zero into +0. */
    score: lastScore | 0,
    depth: completedDepth,
    nodes,
    timeMs,
    pv: completedDepth > 0 ? extractPv(pos, bestEntry.move, completedDepth) : [moveToUci(bestEntry.move)],
    rootMoves: root.map((r) => ({ move: r.move, uci: moveToUci(r.move), score: r.score | 0 })),
  }
}
