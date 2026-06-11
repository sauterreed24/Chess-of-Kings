/* ─── Crown Engine v2 — tapered evaluation ────────────────────────────────
   Score = taper(mg, eg) over the engine's incremental material/PST
   accumulators, plus hand terms computed at the leaf: pawn structure,
   bishop pair, rook files, king shield, slider mobility, and tempo.

   Feature weights intentionally match the project's classic evaluator
   (src/chess/evaluate.ts) so Crown v2 keeps the product's positional
   taste: doubled 14, isolated 18, passed [10..82] (+9 protected),
   connected 3/5, bishop pair 22, open/semi-open file 18/10.

   Returns centipawns from the side-to-move's perspective.
   ────────────────────────────────────────────────────────────────────────── */

import {
  BISHOP,
  EMPTY,
  KING,
  PAWN,
  PHASE_MAX,
  QUEEN,
  ROOK,
  WHITE,
  colorOf,
  fileOf,
  rankOf,
  typeOf,
} from './position'
import type { Position } from './position'

const PASSED_BONUS = [0, 0, 10, 18, 30, 52, 82, 0]
const DOUBLED_PENALTY = 14
const ISOLATED_PENALTY = 18
const PROTECTED_PASSER_BONUS = 9
const CONNECTED_BONUS = 3
const CONNECTED_PASSER_BONUS = 5
const BISHOP_PAIR_BONUS = 22
const OPEN_FILE_BONUS = 18
const SEMI_OPEN_FILE_BONUS = 10
const TEMPO_BONUS = 10

/** Skip the hand terms when material+PST is already far outside the window. */
const LAZY_MARGIN = 320

const BISHOP_DIRS = [15, 17, -15, -17]
const ROOK_DIRS = [16, -16, 1, -1]

/* Scratch buffers — evaluation is single-threaded and non-reentrant. */
const pawnFileCount = new Int32Array(16) /* [color * 8 + file] */
const pawnRankBits = new Int32Array(16) /* bitmask of ranks per [color * 8 + file] */

/* Evaluation cache. Static evaluation is position-pure (no path
   dependence), so memoizing full evaluations by Zobrist hash is always
   sound — only lazy-exited (window-dependent) results are never stored. */
const EVAL_TABLE_MASK = (1 << 16) - 1
const evalKeyLo = new Int32Array(EVAL_TABLE_MASK + 1)
const evalKeyHi = new Int32Array(EVAL_TABLE_MASK + 1)
const evalValue = new Int32Array(EVAL_TABLE_MASK + 1)
const evalValid = new Uint8Array(EVAL_TABLE_MASK + 1)

/** Cleared alongside the transposition table so `freshTable` searches are
    bit-for-bit reproducible (a warm cache upgrades lazy exits to full
    evaluations, which legitimately perturbs node counts). */
export function clearEvalCache(): void {
  evalValid.fill(0)
}

export function evaluate(pos: Position, alpha = -32000, beta = 32000): number {
  const idx = pos.hashLo & EVAL_TABLE_MASK
  if (evalValid[idx] === 1 && evalKeyLo[idx] === pos.hashLo && evalKeyHi[idx] === pos.hashHi) {
    return evalValue[idx]!
  }

  const phase = Math.min(PHASE_MAX, pos.phase)
  const taperedBase = ((pos.mg * phase + pos.eg * (PHASE_MAX - phase)) / PHASE_MAX) | 0
  const sign = pos.sideToMove === WHITE ? 1 : -1
  const base = sign * taperedBase + TEMPO_BONUS

  if (base - LAZY_MARGIN >= beta || base + LAZY_MARGIN <= alpha) return base

  const board = pos.board
  pawnFileCount.fill(0)
  pawnRankBits.fill(0)

  let bishops = 0 /* low nibble white, high nibble black */
  let whiteExtras = 0

  /* First pass: pawn tables. */
  for (let sq = 0; sq < 128; sq++) {
    if ((sq & 0x88) !== 0) {
      sq += 7
      continue
    }
    const code = board[sq]!
    if (code === EMPTY) continue
    if (typeOf(code) === PAWN) {
      const idx = colorOf(code) * 8 + fileOf(sq)
      pawnFileCount[idx]!++
      pawnRankBits[idx] = pawnRankBits[idx]! | (1 << rankOf(sq))
    }
  }

  /* Second pass: per-piece terms. */
  for (let sq = 0; sq < 128; sq++) {
    if ((sq & 0x88) !== 0) {
      sq += 7
      continue
    }
    const code = board[sq]!
    if (code === EMPTY) continue
    const color = colorOf(code)
    const type = typeOf(code)
    const colorSign = color === WHITE ? 1 : -1
    const file = fileOf(sq)
    const rank = rankOf(sq)

    if (type === PAWN) {
      let term = 0
      const own = color * 8
      const enemy = (color ^ 1) * 8
      /* Doubled: each pawn sharing a file carries half the file penalty,
         so a doubled pair costs DOUBLED_PENALTY in total. */
      if (pawnFileCount[own + file]! > 1) {
        term -= DOUBLED_PENALTY >> 1
      }
      /* Isolated. */
      const leftOwn = file > 0 ? pawnFileCount[own + file - 1]! : 0
      const rightOwn = file < 7 ? pawnFileCount[own + file + 1]! : 0
      if (leftOwn === 0 && rightOwn === 0) term -= ISOLATED_PENALTY
      /* Passed: no enemy pawns ahead on this or adjacent files. */
      const aheadMask = color === WHITE ? ~((1 << (rank + 1)) - 1) : (1 << rank) - 1
      const enemyAhead =
        (pawnRankBits[enemy + file]! & aheadMask) |
        (file > 0 ? pawnRankBits[enemy + file - 1]! & aheadMask : 0) |
        (file < 7 ? pawnRankBits[enemy + file + 1]! & aheadMask : 0)
      const passed = enemyAhead === 0
      if (passed) {
        const rankFromHome = color === WHITE ? rank : 7 - rank
        term += PASSED_BONUS[rankFromHome]!
        /* Protected passer: an own pawn defends this square. */
        const backRank = color === WHITE ? rank - 1 : rank + 1
        if (backRank >= 0 && backRank <= 7) {
          const defends =
            (file > 0 && (pawnRankBits[own + file - 1]! & (1 << backRank)) !== 0) ||
            (file < 7 && (pawnRankBits[own + file + 1]! & (1 << backRank)) !== 0)
          if (defends) term += PROTECTED_PASSER_BONUS
        }
      }
      /* Connected: a friendly pawn on an adjacent file. */
      if (leftOwn > 0 || rightOwn > 0) {
        term += passed ? CONNECTED_PASSER_BONUS : CONNECTED_BONUS
      }
      whiteExtras += colorSign * term
      continue
    }

    if (type === BISHOP) {
      bishops += color === WHITE ? 1 : 16
      whiteExtras += colorSign * sliderMobility(board, sq, BISHOP_DIRS, 4) * 3
      continue
    }

    if (type === ROOK || type === QUEEN) {
      const own = color * 8
      const enemy = (color ^ 1) * 8
      if (pawnFileCount[own + file] === 0) {
        whiteExtras +=
          colorSign * (pawnFileCount[enemy + file] === 0 ? OPEN_FILE_BONUS : SEMI_OPEN_FILE_BONUS)
      }
      const mobility =
        type === ROOK
          ? sliderMobility(board, sq, ROOK_DIRS, 4) * 2
          : sliderMobility(board, sq, ROOK_DIRS, 4) + sliderMobility(board, sq, BISHOP_DIRS, 4)
      whiteExtras += colorSign * mobility
      continue
    }

    if (type === KING && phase > 6) {
      /* King shield, scaled by phase so it fades toward the endgame. */
      const pen = kingShieldPenalty(pos, sq, color)
      whiteExtras -= colorSign * (((pen * phase) / PHASE_MAX) | 0)
    }
  }

  if ((bishops & 15) >= 2) whiteExtras += BISHOP_PAIR_BONUS
  if (bishops >> 4 >= 2) whiteExtras -= BISHOP_PAIR_BONUS

  const full = base + sign * whiteExtras
  evalKeyLo[idx] = pos.hashLo
  evalKeyHi[idx] = pos.hashHi
  evalValue[idx] = full
  evalValid[idx] = 1
  return full
}

function sliderMobility(
  board: Int8Array,
  from: number,
  dirs: number[],
  dirCount: number,
): number {
  let count = 0
  for (let i = 0; i < dirCount; i++) {
    const dir = dirs[i]!
    let sq = from + dir
    while ((sq & 0x88) === 0) {
      count++
      if (board[sq] !== EMPTY) break
      sq += dir
    }
  }
  return count
}

function kingShieldPenalty(pos: Position, kingSq: number, color: number): number {
  const homeRank = color === WHITE ? 0 : 7
  if (rankOf(kingSq) !== homeRank) return 0
  const board = pos.board
  const file = fileOf(kingSq)
  const shieldRank = color === WHITE ? 1 : 6
  const ownPawn = PAWN | (color << 3)
  let pen = 0
  if (file >= 5) {
    for (let f = 5; f <= 7; f++) {
      if (board[shieldRank * 16 + f] !== ownPawn) pen += 22
    }
  } else if (file <= 2) {
    for (let f = 0; f <= 2; f++) {
      if (board[shieldRank * 16 + f] !== ownPawn) pen += 16
    }
  } else {
    pen += 28
  }
  /* Semi-open files adjacent to the king. */
  const own = color * 8
  for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
    if (pawnFileCount[own + f] === 0) pen += 8
  }
  return pen
}
