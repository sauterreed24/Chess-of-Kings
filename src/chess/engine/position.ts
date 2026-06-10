/* ─── Crown Engine v2 — position core ─────────────────────────────────────
   A self-contained 0x88 board with make/unmake, incremental Zobrist
   hashing, and incremental tapered material/PST accumulators.

   This module exists for SEARCH SPEED only. chess.js remains the legality
   oracle at every system boundary: the engine's final move is replayed
   through chess.js before it touches game state, and the move generator is
   proven equivalent to chess.js by perft fixtures plus randomized
   cross-validation tests (see engine/*.test.ts).

   Conventions
   - Squares are 0x88 indices: sq = rank * 16 + file, a1 = 0, h8 = 0x77.
     A square is on the board iff (sq & 0x88) === 0.
   - Piece codes pack type and color: code = type | (color << 3).
   - Scores are integer centipawns from White's perspective in the
     accumulators; search converts to side-to-move perspective.
   ────────────────────────────────────────────────────────────────────────── */

export const WHITE = 0
export const BLACK = 1

export const EMPTY = 0
export const PAWN = 1
export const KNIGHT = 2
export const BISHOP = 3
export const ROOK = 4
export const QUEEN = 5
export const KING = 6

export function typeOf(code: number): number {
  return code & 7
}

export function colorOf(code: number): number {
  return code >> 3
}

export function makePiece(type: number, color: number): number {
  return type | (color << 3)
}

/* Castling right bits. */
export const CASTLE_WK = 1
export const CASTLE_WQ = 2
export const CASTLE_BK = 4
export const CASTLE_BQ = 8

export const NO_SQUARE = -1

/* ─── Square helpers ─────────────────────────────────────────────────── */

export function fileOf(sq: number): number {
  return sq & 7
}

export function rankOf(sq: number): number {
  return sq >> 4
}

export function squareName(sq: number): string {
  return String.fromCharCode(97 + fileOf(sq)) + String(rankOf(sq) + 1)
}

export function squareFromName(name: string): number {
  return (Number(name[1]) - 1) * 16 + (name.charCodeAt(0) - 97)
}

/* ─── Move encoding (32-bit int) ─────────────────────────────────────────
   bits 0-7   from square          bits 19-21 captured piece type
   bits 8-15  to square            bits 22-24 promotion piece type
   bits 16-18 moved piece type     bits 25-27 flags (EP / castle / double)
   ──────────────────────────────────────────────────────────────────────── */

export const FLAG_EP = 1 << 25
export const FLAG_CASTLE = 1 << 26
export const FLAG_DOUBLE = 1 << 27

export function encodeMove(
  from: number,
  to: number,
  piece: number,
  captured: number,
  promotion: number,
  flags: number,
): number {
  return from | (to << 8) | (piece << 16) | (captured << 19) | (promotion << 22) | flags
}

export function moveFrom(m: number): number {
  return m & 0xff
}

export function moveTo(m: number): number {
  return (m >> 8) & 0xff
}

export function movePiece(m: number): number {
  return (m >> 16) & 7
}

export function moveCaptured(m: number): number {
  return (m >> 19) & 7
}

export function movePromotion(m: number): number {
  return (m >> 22) & 7
}

const PROMO_CHARS = ['', '', 'n', 'b', 'r', 'q']

/** UCI-style coordinate string, e.g. "e2e4", "e7e8q". */
export function moveToUci(m: number): string {
  return squareName(moveFrom(m)) + squareName(moveTo(m)) + (PROMO_CHARS[movePromotion(m)] ?? '')
}

/* ─── Direction tables ───────────────────────────────────────────────── */

const KNIGHT_OFFSETS = [31, 33, 14, 18, -31, -33, -14, -18]
const KING_OFFSETS = [15, 16, 17, -1, 1, -15, -16, -17]
const BISHOP_DIRS = [15, 17, -15, -17]
const ROOK_DIRS = [16, -16, 1, -1]

/* ─── Zobrist keys (two independent 32-bit halves; deterministic) ────── */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (t ^ (t >>> 14)) >>> 0
  }
}

const zrand = mulberry32(0x9e3779b9)
/* Indexed [pieceCode * 128 + sq]; piece codes go up to 14. */
const Z_PIECE_LO = new Int32Array(16 * 128)
const Z_PIECE_HI = new Int32Array(16 * 128)
const Z_CASTLE_LO = new Int32Array(16)
const Z_CASTLE_HI = new Int32Array(16)
const Z_EP_LO = new Int32Array(8)
const Z_EP_HI = new Int32Array(8)
let Z_SIDE_LO = 0
let Z_SIDE_HI = 0

for (let p = 0; p < 16; p++) {
  for (let sq = 0; sq < 128; sq++) {
    Z_PIECE_LO[p * 128 + sq] = zrand() | 0
    Z_PIECE_HI[p * 128 + sq] = zrand() | 0
  }
}
for (let i = 0; i < 16; i++) {
  Z_CASTLE_LO[i] = zrand() | 0
  Z_CASTLE_HI[i] = zrand() | 0
}
for (let i = 0; i < 8; i++) {
  Z_EP_LO[i] = zrand() | 0
  Z_EP_HI[i] = zrand() | 0
}
Z_SIDE_LO = zrand() | 0
Z_SIDE_HI = zrand() | 0

/* ─── Tapered piece values and piece-square tables ────────────────────────
   Values follow the project's existing evaluation taste (evaluate.ts):
   the classic simplified-evaluation tables, with endgame variants that
   centralize kings/minors and push passed-pawn ranks. Tables are stored
   a1-first (rank 1 = white's home rank) and mirrored for black.
   ──────────────────────────────────────────────────────────────────────── */

export const PIECE_VALUE = new Int32Array([0, 100, 320, 330, 500, 900, 0])
const PIECE_VALUE_EG = new Int32Array([0, 118, 305, 330, 520, 920, 0])
/* Game phase weights: total 24 at the initial position. */
const PHASE_WEIGHT = new Int32Array([0, 0, 1, 1, 2, 4, 0])
export const PHASE_MAX = 24

const PST_PAWN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  5, 10, 10, -20, -20, 10, 10, 5,
  5, -5, -10, 0, 0, -10, -5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, 5, 10, 25, 25, 10, 5, 5,
  10, 10, 20, 30, 30, 20, 10, 10,
  50, 50, 50, 50, 50, 50, 50, 50,
  0, 0, 0, 0, 0, 0, 0, 0,
]
const PST_PAWN_EG = [
  0, 0, 0, 0, 0, 0, 0, 0,
  2, 4, 4, 0, 0, 4, 4, 2,
  4, 2, 0, 4, 4, 0, 2, 4,
  8, 8, 8, 16, 16, 8, 8, 8,
  18, 18, 20, 28, 28, 20, 18, 18,
  34, 34, 40, 44, 44, 40, 34, 34,
  64, 64, 64, 64, 64, 64, 64, 64,
  0, 0, 0, 0, 0, 0, 0, 0,
]
const PST_KNIGHT = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
]
const PST_BISHOP = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
]
const PST_ROOK = [
  0, 0, 5, 10, 10, 5, 0, 0,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  5, 10, 10, 10, 10, 10, 10, 5,
  0, 0, 0, 5, 5, 0, 0, 0,
]
const PST_QUEEN = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -10, 5, 5, 5, 5, 5, 0, -10,
  0, 0, 5, 5, 5, 5, 0, -5,
  -5, 0, 5, 5, 5, 5, 0, -5,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
]
const PST_KING_MG = [
  20, 30, 10, 0, 0, 10, 30, 20,
  20, 20, 0, 0, 0, 0, 20, 20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
]
const PST_KING_EG = [
  -50, -30, -30, -30, -30, -30, -30, -50,
  -30, -20, -5, -5, -5, -5, -20, -30,
  -30, -5, 10, 15, 15, 10, -5, -30,
  -30, -5, 15, 20, 20, 15, -5, -30,
  -30, -5, 15, 20, 20, 15, -5, -30,
  -30, -5, 10, 15, 15, 10, -5, -30,
  -30, -20, -5, -5, -5, -5, -20, -30,
  -50, -30, -30, -30, -30, -30, -30, -50,
]
const PST_KNIGHT_EG = PST_KNIGHT.map((v, i) => {
  const f = i % 8
  const r = (i / 8) | 0
  return f >= 2 && f <= 5 && r >= 2 && r <= 5 ? v + 10 : v
})
const PST_BISHOP_EG = PST_BISHOP.map((v, i) => {
  const f = i % 8
  const r = (i / 8) | 0
  return f >= 2 && f <= 5 && r >= 2 && r <= 5 ? v + 6 : v
})

/* Flattened [pieceCode * 128 + sq0x88] tables with material baked in.
   White reads tables directly; black mirrors the rank. */
export const TAPER_MG = new Int32Array(16 * 128)
export const TAPER_EG = new Int32Array(16 * 128)

function fillTaper(type: number, mg: number[], eg: number[], mgValue: number, egValue: number): void {
  for (let sq = 0; sq < 128; sq++) {
    if ((sq & 0x88) !== 0) continue
    const idx64 = rankOf(sq) * 8 + fileOf(sq)
    const mirror64 = (7 - rankOf(sq)) * 8 + fileOf(sq)
    const w = makePiece(type, WHITE)
    const b = makePiece(type, BLACK)
    TAPER_MG[w * 128 + sq] = mgValue + mg[idx64]!
    TAPER_EG[w * 128 + sq] = egValue + eg[idx64]!
    TAPER_MG[b * 128 + sq] = mgValue + mg[mirror64]!
    TAPER_EG[b * 128 + sq] = egValue + eg[mirror64]!
  }
}

fillTaper(PAWN, PST_PAWN, PST_PAWN_EG, PIECE_VALUE[PAWN]!, PIECE_VALUE_EG[PAWN]!)
fillTaper(KNIGHT, PST_KNIGHT, PST_KNIGHT_EG, PIECE_VALUE[KNIGHT]!, PIECE_VALUE_EG[KNIGHT]!)
fillTaper(BISHOP, PST_BISHOP, PST_BISHOP_EG, PIECE_VALUE[BISHOP]!, PIECE_VALUE_EG[BISHOP]!)
fillTaper(ROOK, PST_ROOK, PST_ROOK, PIECE_VALUE[ROOK]!, PIECE_VALUE_EG[ROOK]!)
fillTaper(QUEEN, PST_QUEEN, PST_QUEEN, PIECE_VALUE[QUEEN]!, PIECE_VALUE_EG[QUEEN]!)
fillTaper(KING, PST_KING_MG, PST_KING_EG, 0, 0)

/* Castling-rights mask, indexed by square: rights &= mask[from] & mask[to]. */
const CASTLE_MASK = new Int32Array(128).fill(15)
CASTLE_MASK[squareFromName('a1')] = 15 & ~CASTLE_WQ
CASTLE_MASK[squareFromName('h1')] = 15 & ~CASTLE_WK
CASTLE_MASK[squareFromName('e1')] = 15 & ~(CASTLE_WK | CASTLE_WQ)
CASTLE_MASK[squareFromName('a8')] = 15 & ~CASTLE_BQ
CASTLE_MASK[squareFromName('h8')] = 15 & ~CASTLE_BK
CASTLE_MASK[squareFromName('e8')] = 15 & ~(CASTLE_BK | CASTLE_BQ)

const MAX_GAME_PLY = 1024
const UNDO_STRIDE = 16

/* ─── Position ───────────────────────────────────────────────────────── */

export class Position {
  board = new Int8Array(128)
  sideToMove = WHITE
  castling = 0
  /** En-passant target square (the square behind the double-pushed pawn), or NO_SQUARE. */
  ep = NO_SQUARE
  halfmove = 0
  fullmove = 1
  kingSq = new Int32Array([NO_SQUARE, NO_SQUARE])
  hashLo = 0
  hashHi = 0
  /** Incremental tapered accumulators, White-positive, material included. */
  mg = 0
  eg = 0
  phase = 0
  /** Non-pawn material per color (for null-move zugzwang guard). */
  nonPawnMaterial = new Int32Array(2)

  private undoStack = new Int32Array(MAX_GAME_PLY * UNDO_STRIDE)
  /** Path hashes for repetition detection; parallel to undo stack depth. */
  private pathLo = new Int32Array(MAX_GAME_PLY + 1)
  private pathHi = new Int32Array(MAX_GAME_PLY + 1)
  ply = 0

  /* ── Setup ── */

  setFromFen(fen: string): void {
    const parts = fen.trim().split(/\s+/)
    if (parts.length < 4) throw new Error(`invalid FEN: ${fen}`)
    this.board.fill(EMPTY)
    this.kingSq[WHITE] = NO_SQUARE
    this.kingSq[BLACK] = NO_SQUARE
    this.mg = 0
    this.eg = 0
    this.phase = 0
    this.nonPawnMaterial[WHITE] = 0
    this.nonPawnMaterial[BLACK] = 0
    this.ply = 0

    const TYPE_OF_CHAR: Record<string, number> = { p: PAWN, n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN, k: KING }
    let rank = 7
    let file = 0
    for (const ch of parts[0]!) {
      if (ch === '/') {
        rank--
        file = 0
      } else if (ch >= '1' && ch <= '8') {
        file += Number(ch)
      } else {
        const type = TYPE_OF_CHAR[ch.toLowerCase()]
        if (type === undefined || rank < 0 || file > 7) throw new Error(`invalid FEN board: ${fen}`)
        const color = ch === ch.toLowerCase() ? BLACK : WHITE
        this.putPiece(makePiece(type, color), rank * 16 + file)
        file++
      }
    }

    this.sideToMove = parts[1] === 'b' ? BLACK : WHITE
    this.castling = 0
    if (parts[2]!.includes('K')) this.castling |= CASTLE_WK
    if (parts[2]!.includes('Q')) this.castling |= CASTLE_WQ
    if (parts[2]!.includes('k')) this.castling |= CASTLE_BK
    if (parts[2]!.includes('q')) this.castling |= CASTLE_BQ
    this.ep = parts[3] === '-' ? NO_SQUARE : squareFromName(parts[3]!)
    this.halfmove = parts.length > 4 ? Number(parts[4]) || 0 : 0
    this.fullmove = parts.length > 5 ? Number(parts[5]) || 1 : 1

    this.recomputeHash()
    this.pathLo[0] = this.hashLo
    this.pathHi[0] = this.hashHi
  }

  toFen(): string {
    const CHAR_OF_TYPE = ['', 'p', 'n', 'b', 'r', 'q', 'k']
    let boardPart = ''
    for (let rank = 7; rank >= 0; rank--) {
      let empties = 0
      for (let file = 0; file < 8; file++) {
        const code = this.board[rank * 16 + file]!
        if (code === EMPTY) {
          empties++
          continue
        }
        if (empties > 0) {
          boardPart += String(empties)
          empties = 0
        }
        const ch = CHAR_OF_TYPE[typeOf(code)]!
        boardPart += colorOf(code) === WHITE ? ch.toUpperCase() : ch
      }
      if (empties > 0) boardPart += String(empties)
      if (rank > 0) boardPart += '/'
    }
    let castle = ''
    if (this.castling & CASTLE_WK) castle += 'K'
    if (this.castling & CASTLE_WQ) castle += 'Q'
    if (this.castling & CASTLE_BK) castle += 'k'
    if (this.castling & CASTLE_BQ) castle += 'q'
    return [
      boardPart,
      this.sideToMove === WHITE ? 'w' : 'b',
      castle || '-',
      this.ep === NO_SQUARE ? '-' : squareName(this.ep),
      String(this.halfmove),
      String(this.fullmove),
    ].join(' ')
  }

  private putPiece(code: number, sq: number): void {
    this.board[sq] = code
    if (typeOf(code) === KING) this.kingSq[colorOf(code)] = sq
    const sign = colorOf(code) === WHITE ? 1 : -1
    this.mg += sign * TAPER_MG[code * 128 + sq]!
    this.eg += sign * TAPER_EG[code * 128 + sq]!
    this.phase += PHASE_WEIGHT[typeOf(code)]!
    if (typeOf(code) !== PAWN && typeOf(code) !== KING) {
      this.nonPawnMaterial[colorOf(code)] += PIECE_VALUE[typeOf(code)]!
    }
  }

  recomputeHash(): void {
    let lo = 0
    let hi = 0
    for (let sq = 0; sq < 128; sq++) {
      if ((sq & 0x88) !== 0) continue
      const code = this.board[sq]!
      if (code === EMPTY) continue
      lo ^= Z_PIECE_LO[code * 128 + sq]!
      hi ^= Z_PIECE_HI[code * 128 + sq]!
    }
    lo ^= Z_CASTLE_LO[this.castling]!
    hi ^= Z_CASTLE_HI[this.castling]!
    if (this.ep !== NO_SQUARE) {
      lo ^= Z_EP_LO[fileOf(this.ep)]!
      hi ^= Z_EP_HI[fileOf(this.ep)]!
    }
    if (this.sideToMove === BLACK) {
      lo ^= Z_SIDE_LO
      hi ^= Z_SIDE_HI
    }
    this.hashLo = lo | 0
    this.hashHi = hi | 0
  }

  /* ── Attack detection ── */

  isAttacked(sq: number, byColor: number): boolean {
    const board = this.board
    /* Pawns: a square is attacked by a white pawn sitting one rank below. */
    if (byColor === WHITE) {
      const p = makePiece(PAWN, WHITE)
      let s = sq - 15
      if ((s & 0x88) === 0 && board[s] === p) return true
      s = sq - 17
      if ((s & 0x88) === 0 && board[s] === p) return true
    } else {
      const p = makePiece(PAWN, BLACK)
      let s = sq + 15
      if ((s & 0x88) === 0 && board[s] === p) return true
      s = sq + 17
      if ((s & 0x88) === 0 && board[s] === p) return true
    }
    const knight = makePiece(KNIGHT, byColor)
    for (let i = 0; i < 8; i++) {
      const s = sq + KNIGHT_OFFSETS[i]!
      if ((s & 0x88) === 0 && board[s] === knight) return true
    }
    const king = makePiece(KING, byColor)
    for (let i = 0; i < 8; i++) {
      const s = sq + KING_OFFSETS[i]!
      if ((s & 0x88) === 0 && board[s] === king) return true
    }
    const bishop = makePiece(BISHOP, byColor)
    const rook = makePiece(ROOK, byColor)
    const queen = makePiece(QUEEN, byColor)
    for (let i = 0; i < 4; i++) {
      const dir = BISHOP_DIRS[i]!
      let s = sq + dir
      while ((s & 0x88) === 0) {
        const code = board[s]!
        if (code !== EMPTY) {
          if (code === bishop || code === queen) return true
          break
        }
        s += dir
      }
    }
    for (let i = 0; i < 4; i++) {
      const dir = ROOK_DIRS[i]!
      let s = sq + dir
      while ((s & 0x88) === 0) {
        const code = board[s]!
        if (code !== EMPTY) {
          if (code === rook || code === queen) return true
          break
        }
        s += dir
      }
    }
    return false
  }

  inCheck(): boolean {
    return this.isAttacked(this.kingSq[this.sideToMove]!, this.sideToMove ^ 1)
  }

  /* ── Move generation (pseudo-legal; legality settled by make()) ── */

  /** Appends pseudo-legal moves to `out`, returns the new length. */
  generateMoves(out: number[], capturesOnly = false): number {
    const board = this.board
    const us = this.sideToMove
    const them = us ^ 1
    const pawnDir = us === WHITE ? 16 : -16
    const promoRank = us === WHITE ? 7 : 0
    const doubleRank = us === WHITE ? 1 : 6
    let n = out.length

    for (let from = 0; from < 128; from++) {
      if ((from & 0x88) !== 0) {
        from += 7
        continue
      }
      const code = board[from]!
      if (code === EMPTY || colorOf(code) !== us) continue
      const type = typeOf(code)

      if (type === PAWN) {
        const oneUp = from + pawnDir
        /* Captures (including promotions and en passant). */
        for (const side of [pawnDir - 1, pawnDir + 1]) {
          const to = from + side
          if ((to & 0x88) !== 0) continue
          const target = board[to]!
          if (target !== EMPTY && colorOf(target) === them) {
            if (rankOf(to) === promoRank) {
              out[n++] = encodeMove(from, to, PAWN, typeOf(target), QUEEN, 0)
              out[n++] = encodeMove(from, to, PAWN, typeOf(target), KNIGHT, 0)
              out[n++] = encodeMove(from, to, PAWN, typeOf(target), ROOK, 0)
              out[n++] = encodeMove(from, to, PAWN, typeOf(target), BISHOP, 0)
            } else {
              out[n++] = encodeMove(from, to, PAWN, typeOf(target), 0, 0)
            }
          } else if (to === this.ep) {
            out[n++] = encodeMove(from, to, PAWN, PAWN, 0, FLAG_EP)
          }
        }
        /* Pushes. */
        if ((oneUp & 0x88) === 0 && board[oneUp] === EMPTY) {
          if (rankOf(oneUp) === promoRank) {
            out[n++] = encodeMove(from, oneUp, PAWN, 0, QUEEN, 0)
            if (!capturesOnly) {
              out[n++] = encodeMove(from, oneUp, PAWN, 0, KNIGHT, 0)
              out[n++] = encodeMove(from, oneUp, PAWN, 0, ROOK, 0)
              out[n++] = encodeMove(from, oneUp, PAWN, 0, BISHOP, 0)
            }
          } else if (!capturesOnly) {
            out[n++] = encodeMove(from, oneUp, PAWN, 0, 0, 0)
            const twoUp = oneUp + pawnDir
            if (rankOf(from) === doubleRank && board[twoUp] === EMPTY) {
              out[n++] = encodeMove(from, twoUp, PAWN, 0, 0, FLAG_DOUBLE)
            }
          }
        }
        continue
      }

      if (type === KNIGHT || type === KING) {
        const offsets = type === KNIGHT ? KNIGHT_OFFSETS : KING_OFFSETS
        for (let i = 0; i < 8; i++) {
          const to = from + offsets[i]!
          if ((to & 0x88) !== 0) continue
          const target = board[to]!
          if (target === EMPTY) {
            if (!capturesOnly) out[n++] = encodeMove(from, to, type, 0, 0, 0)
          } else if (colorOf(target) === them) {
            out[n++] = encodeMove(from, to, type, typeOf(target), 0, 0)
          }
        }
        continue
      }

      /* Sliders. */
      const dirs = type === BISHOP ? BISHOP_DIRS : type === ROOK ? ROOK_DIRS : KING_OFFSETS
      const dirCount = type === QUEEN ? 8 : 4
      for (let i = 0; i < dirCount; i++) {
        const dir = dirs[i]!
        let to = from + dir
        while ((to & 0x88) === 0) {
          const target = board[to]!
          if (target === EMPTY) {
            if (!capturesOnly) out[n++] = encodeMove(from, to, type, 0, 0, 0)
          } else {
            if (colorOf(target) === them) out[n++] = encodeMove(from, to, type, typeOf(target), 0, 0)
            break
          }
          to += dir
        }
      }
    }

    /* Castling: rights present, path empty, king not crossing attacked squares. */
    if (!capturesOnly) {
      if (us === WHITE) {
        if (
          this.castling & CASTLE_WK &&
          board[0x05] === EMPTY && board[0x06] === EMPTY &&
          !this.isAttacked(0x04, them) && !this.isAttacked(0x05, them) && !this.isAttacked(0x06, them)
        ) {
          out[n++] = encodeMove(0x04, 0x06, KING, 0, 0, FLAG_CASTLE)
        }
        if (
          this.castling & CASTLE_WQ &&
          board[0x03] === EMPTY && board[0x02] === EMPTY && board[0x01] === EMPTY &&
          !this.isAttacked(0x04, them) && !this.isAttacked(0x03, them) && !this.isAttacked(0x02, them)
        ) {
          out[n++] = encodeMove(0x04, 0x02, KING, 0, 0, FLAG_CASTLE)
        }
      } else {
        if (
          this.castling & CASTLE_BK &&
          board[0x75] === EMPTY && board[0x76] === EMPTY &&
          !this.isAttacked(0x74, them) && !this.isAttacked(0x75, them) && !this.isAttacked(0x76, them)
        ) {
          out[n++] = encodeMove(0x74, 0x76, KING, 0, 0, FLAG_CASTLE)
        }
        if (
          this.castling & CASTLE_BQ &&
          board[0x73] === EMPTY && board[0x72] === EMPTY && board[0x71] === EMPTY &&
          !this.isAttacked(0x74, them) && !this.isAttacked(0x73, them) && !this.isAttacked(0x72, them)
        ) {
          out[n++] = encodeMove(0x74, 0x72, KING, 0, 0, FLAG_CASTLE)
        }
      }
    }
    return n
  }

  /** Fully legal move list (filters pseudo-legal through make/unmake). */
  legalMoves(): number[] {
    const pseudo: number[] = []
    this.generateMoves(pseudo)
    const legal: number[] = []
    for (const m of pseudo) {
      if (this.make(m)) legal.push(m)
      this.unmake()
    }
    return legal
  }

  /* ── Make / unmake ──
     make() always applies the move and pushes undo state; it returns
     false when the mover's king is left attacked (caller must unmake). */

  make(move: number): boolean {
    const us = this.sideToMove
    const them = us ^ 1
    const from = moveFrom(move)
    const to = moveTo(move)
    const type = movePiece(move)
    const promo = movePromotion(move)
    const board = this.board

    /* Push undo record. */
    const base = this.ply * UNDO_STRIDE
    const stack = this.undoStack
    stack[base] = move
    stack[base + 1] = this.castling
    stack[base + 2] = this.ep
    stack[base + 3] = this.halfmove
    stack[base + 4] = this.hashLo
    stack[base + 5] = this.hashHi
    stack[base + 6] = this.mg
    stack[base + 7] = this.eg
    stack[base + 8] = this.phase
    stack[base + 9] = this.nonPawnMaterial[WHITE]!
    stack[base + 10] = this.nonPawnMaterial[BLACK]!
    stack[base + 11] = board[to]!
    this.ply++

    const movedCode = makePiece(type, us)
    const sign = us === WHITE ? 1 : -1
    let lo = this.hashLo
    let hi = this.hashHi

    /* Clear old EP / castling hash contributions. */
    if (this.ep !== NO_SQUARE) {
      lo ^= Z_EP_LO[fileOf(this.ep)]!
      hi ^= Z_EP_HI[fileOf(this.ep)]!
    }
    lo ^= Z_CASTLE_LO[this.castling]!
    hi ^= Z_CASTLE_HI[this.castling]!

    /* Capture. */
    const directCapture = board[to]!
    if (directCapture !== EMPTY) {
      lo ^= Z_PIECE_LO[directCapture * 128 + to]!
      hi ^= Z_PIECE_HI[directCapture * 128 + to]!
      this.mg += sign * TAPER_MG[directCapture * 128 + to]!
      this.eg += sign * TAPER_EG[directCapture * 128 + to]!
      this.phase -= PHASE_WEIGHT[typeOf(directCapture)]!
      const capType = typeOf(directCapture)
      if (capType !== PAWN && capType !== KING) {
        this.nonPawnMaterial[them] -= PIECE_VALUE[capType]!
      }
    } else if (move & FLAG_EP) {
      const capSq = to - (us === WHITE ? 16 : -16)
      const capCode = makePiece(PAWN, them)
      board[capSq] = EMPTY
      lo ^= Z_PIECE_LO[capCode * 128 + capSq]!
      hi ^= Z_PIECE_HI[capCode * 128 + capSq]!
      this.mg += sign * TAPER_MG[capCode * 128 + capSq]!
      this.eg += sign * TAPER_EG[capCode * 128 + capSq]!
    }

    /* Move the piece (with promotion). */
    board[from] = EMPTY
    lo ^= Z_PIECE_LO[movedCode * 128 + from]!
    hi ^= Z_PIECE_HI[movedCode * 128 + from]!
    this.mg -= sign * TAPER_MG[movedCode * 128 + from]!
    this.eg -= sign * TAPER_EG[movedCode * 128 + from]!

    const placedCode = promo !== 0 ? makePiece(promo, us) : movedCode
    board[to] = placedCode
    lo ^= Z_PIECE_LO[placedCode * 128 + to]!
    hi ^= Z_PIECE_HI[placedCode * 128 + to]!
    this.mg += sign * TAPER_MG[placedCode * 128 + to]!
    this.eg += sign * TAPER_EG[placedCode * 128 + to]!
    if (promo !== 0) {
      this.phase += PHASE_WEIGHT[promo]!
      this.nonPawnMaterial[us] += PIECE_VALUE[promo]!
    }

    if (type === KING) this.kingSq[us] = to

    /* Castle: move the rook too. */
    if (move & FLAG_CASTLE) {
      let rookFrom: number
      let rookTo: number
      if (to === 0x06) {
        rookFrom = 0x07
        rookTo = 0x05
      } else if (to === 0x02) {
        rookFrom = 0x00
        rookTo = 0x03
      } else if (to === 0x76) {
        rookFrom = 0x77
        rookTo = 0x75
      } else {
        rookFrom = 0x70
        rookTo = 0x73
      }
      const rookCode = makePiece(ROOK, us)
      board[rookFrom] = EMPTY
      board[rookTo] = rookCode
      lo ^= Z_PIECE_LO[rookCode * 128 + rookFrom]! ^ Z_PIECE_LO[rookCode * 128 + rookTo]!
      hi ^= Z_PIECE_HI[rookCode * 128 + rookFrom]! ^ Z_PIECE_HI[rookCode * 128 + rookTo]!
      this.mg += sign * (TAPER_MG[rookCode * 128 + rookTo]! - TAPER_MG[rookCode * 128 + rookFrom]!)
      this.eg += sign * (TAPER_EG[rookCode * 128 + rookTo]! - TAPER_EG[rookCode * 128 + rookFrom]!)
    }

    /* New state fields. */
    this.castling &= CASTLE_MASK[from]! & CASTLE_MASK[to]!
    this.ep = move & FLAG_DOUBLE ? from + (us === WHITE ? 16 : -16) : NO_SQUARE
    this.halfmove = type === PAWN || moveCaptured(move) !== 0 ? 0 : this.halfmove + 1
    if (us === BLACK) this.fullmove++
    this.sideToMove = them

    lo ^= Z_CASTLE_LO[this.castling]!
    hi ^= Z_CASTLE_HI[this.castling]!
    if (this.ep !== NO_SQUARE) {
      lo ^= Z_EP_LO[fileOf(this.ep)]!
      hi ^= Z_EP_HI[fileOf(this.ep)]!
    }
    lo ^= Z_SIDE_LO
    hi ^= Z_SIDE_HI
    this.hashLo = lo | 0
    this.hashHi = hi | 0
    this.pathLo[this.ply] = this.hashLo
    this.pathHi[this.ply] = this.hashHi

    return !this.isAttacked(this.kingSq[us]!, them)
  }

  /** Null move (pass): flips side, clears EP. For null-move pruning only. */
  makeNull(): void {
    const base = this.ply * UNDO_STRIDE
    const stack = this.undoStack
    stack[base] = 0
    stack[base + 1] = this.castling
    stack[base + 2] = this.ep
    stack[base + 3] = this.halfmove
    stack[base + 4] = this.hashLo
    stack[base + 5] = this.hashHi
    stack[base + 6] = this.mg
    stack[base + 7] = this.eg
    stack[base + 8] = this.phase
    stack[base + 9] = this.nonPawnMaterial[WHITE]!
    stack[base + 10] = this.nonPawnMaterial[BLACK]!
    stack[base + 11] = EMPTY
    this.ply++

    let lo = this.hashLo
    let hi = this.hashHi
    if (this.ep !== NO_SQUARE) {
      lo ^= Z_EP_LO[fileOf(this.ep)]!
      hi ^= Z_EP_HI[fileOf(this.ep)]!
    }
    lo ^= Z_SIDE_LO
    hi ^= Z_SIDE_HI
    this.ep = NO_SQUARE
    this.halfmove++
    this.sideToMove ^= 1
    this.hashLo = lo | 0
    this.hashHi = hi | 0
    this.pathLo[this.ply] = this.hashLo
    this.pathHi[this.ply] = this.hashHi
  }

  unmakeNull(): void {
    this.ply--
    const base = this.ply * UNDO_STRIDE
    const stack = this.undoStack
    this.castling = stack[base + 1]!
    this.ep = stack[base + 2]!
    this.halfmove = stack[base + 3]!
    this.hashLo = stack[base + 4]!
    this.hashHi = stack[base + 5]!
    this.sideToMove ^= 1
  }

  unmake(): void {
    this.ply--
    const base = this.ply * UNDO_STRIDE
    const stack = this.undoStack
    const move = stack[base]!
    this.castling = stack[base + 1]!
    this.ep = stack[base + 2]!
    this.halfmove = stack[base + 3]!
    this.hashLo = stack[base + 4]!
    this.hashHi = stack[base + 5]!
    this.mg = stack[base + 6]!
    this.eg = stack[base + 7]!
    this.phase = stack[base + 8]!
    this.nonPawnMaterial[WHITE] = stack[base + 9]!
    this.nonPawnMaterial[BLACK] = stack[base + 10]!
    const directCapture = stack[base + 11]!

    this.sideToMove ^= 1
    const us = this.sideToMove
    if (us === BLACK) this.fullmove--

    const from = moveFrom(move)
    const to = moveTo(move)
    const type = movePiece(move)
    const board = this.board

    board[from] = makePiece(type, us)
    board[to] = directCapture
    if (type === KING) this.kingSq[us] = from

    if (move & FLAG_EP) {
      const capSq = to - (us === WHITE ? 16 : -16)
      board[capSq] = makePiece(PAWN, us ^ 1)
    } else if (move & FLAG_CASTLE) {
      let rookFrom: number
      let rookTo: number
      if (to === 0x06) {
        rookFrom = 0x07
        rookTo = 0x05
      } else if (to === 0x02) {
        rookFrom = 0x00
        rookTo = 0x03
      } else if (to === 0x76) {
        rookFrom = 0x77
        rookTo = 0x75
      } else {
        rookFrom = 0x70
        rookTo = 0x73
      }
      board[rookFrom] = makePiece(ROOK, us)
      board[rookTo] = EMPTY
    }
  }

  /**
   * True when the current position repeats an earlier position on the
   * make/unmake path (two-fold is enough to score a draw inside search).
   */
  isRepetition(): boolean {
    const span = Math.min(this.halfmove, this.ply)
    for (let back = 4; back <= span; back += 2) {
      const idx = this.ply - back
      if (this.pathLo[idx] === this.hashLo && this.pathHi[idx] === this.hashHi) return true
    }
    return false
  }
}
