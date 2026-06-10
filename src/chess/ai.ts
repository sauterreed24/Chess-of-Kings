/* ─── AI move selection (Crown Engine v2 + persona layer) ─────────────────
   Public surface kept stable for GameFlow / aiTurnController / tests:
   findBestMove, findBestMoveWithProfile, findRandomMove,
   getLastSearchNodes, PIECE_VALUES, materialAdvantage.

   How a persona picks a move
   1. Crown v2 searches the position. Weak/medium personas use "spectrum"
      mode, which scores EVERY root move exactly; the strongest personas
      take the engine's best move outright.
   2. Mistakes are modeled as *bounded shallow judgement*, never random
      legality-roulette: with probability ~blunderRate the persona
      re-searches two plies shallower (it "didn't calculate far enough"),
      and its final pick is Boltzmann-sampled over near-best moves with a
      temperature and a hard centipawn-drop cap derived from the profile.
   3. Style/risk/opening-book preferences nudge scores only inside that
      safe band, so personality can never out-vote tactics.
   4. chess.js stays the legality oracle: the chosen move is returned as
      the matching entry of chess.moves({ verbose: true }).
   ────────────────────────────────────────────────────────────────────────── */

import type { Chess, Move } from 'chess.js'
import { searchFen, MATE_BOUND, clearTranspositionTable } from './engine'
import type { EngineRootMove, EngineSearchResult } from './engine'
import { styleBias, PIECE_VALUES } from './evaluate'
import type { AIStyle } from './evaluate'
import type { AiProfile } from '../types'
import { detectGamePhase } from './aiProfiles'
import { openingSanBias } from './openings'

export type ProfileMoveOptions = {
  avoidMoveKey?: string | null
  openingBook?: { profileId: string; plyIndex: number } | null
  /** Recent game FENs (oldest first, excluding current) for cross-root
      repetition awareness; computed from the live board when absent. */
  recentFens?: string[]
  /** The persona's own previous move (anti-reversal bias). Computed from
      the live board's history when absent; pass it explicitly when the
      Chess instance was rebuilt from a bare FEN (worker requests). */
  ownLast?: { from: string; to: string; piece: string } | null
}

/**
 * Positions preceding the current one (oldest first), bounded, for the
 * engine's cross-root repetition detection. Empty when the Chess instance
 * was constructed from a bare FEN (e.g. inside the worker) — callers that
 * have the live game should pass `recentFens` through ProfileMoveOptions.
 */
export function recentHistoryFens(chess: Chess, maxPlies = 17): string[] {
  const history = chess.history({ verbose: true })
  return history.slice(-maxPlies).map((m) => m.before)
}

let lastNodes = 0

/** Nodes searched by the most recent engine call (benchmarks/telemetry). */
export function getLastSearchNodes(): number {
  return lastNodes
}

/** Record nodes searched elsewhere (worker responses) so telemetry stays honest. */
export function noteSearchNodes(nodes: number): void {
  lastNodes = nodes
}

/** Clear persistent engine caches. Call when a new game starts so
    path-dependent draw scores cannot leak between games. */
export function clearEngineCaches(): void {
  clearTranspositionTable()
}

/** Canonical move identity used for avoid/repeat comparisons everywhere. */
export function moveKey(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`
}

/** Resolve an engine move against the oracle's legal list. */
function oracleMove(legal: Move[], uci: string): Move | null {
  return legal.find((m) => moveKey(m) === uci) ?? null
}

/**
 * Strongest available move (full-strength path used by hints, puzzles,
 * and the worker). `style` is accepted for API stability but does not
 * perturb the search — personality belongs to the persona layer.
 */
export function findBestMove(
  chess: Chess,
  maxDepth: number,
  _style: AIStyle,
  timeLimitMs = 2000,
  recentFens?: string[],
): Move | null {
  const legal = chess.moves({ verbose: true })
  if (legal.length === 0) return null
  if (legal.length === 1) return legal[0]!
  const result = searchFen(chess.fen(), {
    maxDepth: Math.max(2, Math.min(63, maxDepth * 2)),
    maxTimeMs: Math.max(30, timeLimitMs),
    historyFens: recentFens ?? recentHistoryFens(chess),
  })
  lastNodes = result.nodes
  if (!result.move) return null
  return oracleMove(legal, result.move.uci) ?? null
}

/* ─── Persona model ──────────────────────────────────────────────────── */

/** Legacy profile depths (2–5) map onto real engine plies (2–10). */
function personaDepth(profile: AiProfile): number {
  const base = Math.max(2, Math.min(10, profile.searchDepth * 2 - 2))
  return base + (profile.tacticalAlertness > 0.8 ? 1 : 0)
}

/** Hard cap on how far below the best move a persona may land (centipawns). */
function personaMaxDrop(profile: AiProfile, bestScore: number): number {
  let drop = 25 + profile.blunderRate * 900
  /* Winning positions get converted with the profile's strictness. */
  if (bestScore > 150) drop *= 1 - profile.conversionStrictness * 0.45
  return Math.max(10, Math.round(drop))
}

/** Boltzmann temperature: higher = more human spread among near-equals. */
function personaTemperature(profile: AiProfile, endgame: boolean): number {
  let t = 8 + profile.blunderRate * 260 + (1 - profile.conversionStrictness) * 25
  if (endgame) t *= 1 - profile.conversionStrictness * 0.3
  return Math.max(4, t)
}

/** Style/risk flavor, applied only inside the safe band. Bounded ±40cp. */
function personaBias(move: Move, profile: AiProfile, reversalOfOwnLast: boolean): number {
  let bias = styleBias(move, profile.style) * 0.4
  if (move.captured) bias += profile.riskAppetite * 12
  if (move.san.includes('+')) bias += profile.riskAppetite * 10
  if (move.san === 'O-O' || move.san === 'O-O-O') bias += profile.kingSafetyUrgency * 14
  if (reversalOfOwnLast && !move.captured && !move.san.includes('+')) {
    bias -= 14 + profile.conversionStrictness * 12
  }
  return Math.max(-40, Math.min(40, bias))
}

interface Candidate {
  move: Move
  score: number
}

function sampleBoltzmann(candidates: Candidate[], temperature: number): Move {
  const top = candidates[0]!.score
  let total = 0
  const weights = candidates.map((c) => {
    const w = Math.exp((c.score - top) / temperature)
    total += w
    return w
  })
  let roll = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]!
    if (roll <= 0) return candidates[i]!.move
  }
  return candidates[candidates.length - 1]!.move
}

/**
 * Persona-flavored move selection. Always returns a legal move (validated
 * against chess.js) or null when the position is terminal.
 */
export function findBestMoveWithProfile(
  chess: Chess,
  profile: AiProfile,
  opts?: ProfileMoveOptions,
): Move | null {
  const legal = chess.moves({ verbose: true })
  if (legal.length === 0) return null
  if (legal.length === 1) return legal[0]!

  const fen = chess.fen()
  const avoid = opts?.avoidMoveKey ?? null
  const depth = personaDepth(profile)
  const budgetMs = Math.max(30, Math.min(4000, profile.thinkTimeMs))
  /* One shared deadline bounds every search this call may stack
     (apex fall-through, miss episode, conversion re-search). */
  const deadline = performance.now() + budgetMs
  const remainingMs = (): number => Math.max(30, deadline - performance.now())

  /* One verbose-history pass serves both repetition awareness and the
     anti-reversal bias; worker calls supply both through opts instead. */
  const history = opts?.recentFens !== undefined ? null : chess.history({ verbose: true })
  const historyFens = opts?.recentFens ?? history!.slice(-17).map((m) => m.before)
  const lastOwnMove =
    opts?.ownLast !== undefined ? opts.ownLast : (history ?? chess.history({ verbose: true })).at(-2) ?? null
  const ownLast = lastOwnMove
    ? { from: lastOwnMove.from, to: lastOwnMove.to, piece: lastOwnMove.piece }
    : null

  /* Apex-tier personas simply play the engine's best move. */
  if (profile.conversionStrictness >= 0.95) {
    const result = searchFen(fen, { maxDepth: depth, maxTimeMs: budgetMs, historyFens })
    lastNodes = result.nodes
    const best = result.move ? oracleMove(legal, result.move.uci) : null
    if (best && moveKey(best) !== avoid) return best
    /* Avoided or unresolved: fall through to a quick spectrum pick. */
  }

  /* Human-like miss: occasionally judge from a shallower search. */
  const missed = depth > 2 && Math.random() < profile.blunderRate * 0.6
  const spectrumDepth = missed ? Math.max(1, depth - 2) : depth
  let result: EngineSearchResult = searchFen(fen, {
    maxDepth: spectrumDepth,
    maxTimeMs: missed ? Math.max(30, remainingMs() / 2) : remainingMs(),
    spectrum: true,
    historyFens,
  })
  lastNodes = result.nodes
  /* search() guarantees depth >= 1 with scored root moves. */
  if (result.rootMoves.length === 0) return legal[0]!

  /* Conversion mode: clearly winning positions are played with intent —
     deeper calculation, a tight band, and no oversights. Keeps won
     endgames marching to mate instead of shuffling toward the fifty-move
     rule, at every difficulty tier. */
  const endgame = detectGamePhase(chess) === 'endgame'
  const topScore = result.rootMoves[0]?.score ?? 0
  const converting = topScore >= 500 && endgame
  if (converting && result.depth < 6) {
    const deeper = searchFen(fen, {
      maxDepth: 6,
      maxTimeMs: remainingMs(),
      spectrum: true,
      historyFens,
    })
    lastNodes += deeper.nodes
    if (deeper.rootMoves.length > 0 && deeper.depth > result.depth) result = deeper
  }

  /* Pair engine scores with oracle moves. */
  let candidates: Candidate[] = []
  for (const root of result.rootMoves as EngineRootMove[]) {
    const move = oracleMove(legal, root.uci)
    if (move) candidates.push({ move, score: root.score })
  }
  if (candidates.length === 0) return legal[0]!

  /* Anti-shuffle: avoid replaying/reversing the persona's own last move. */
  if (avoid && candidates.length > 1) {
    candidates = candidates.filter((c) => moveKey(c.move) !== avoid)
  }

  /* Opening book: stay on the rival's repertoire when it costs little. */
  const book = opts?.openingBook ?? null
  if (book) {
    let bookBest: Candidate | null = null
    let bookBias = 0
    for (const c of candidates) {
      const bias = openingSanBias(chess, book.profileId, book.plyIndex, c.move.san)
      if (bias > bookBias) {
        bookBias = bias
        bookBest = c
      }
    }
    const bestScore = candidates[0]!.score
    const bookSlack = 30 + profile.openingDiscipline * 40
    if (bookBest && bookBest.score >= bestScore - bookSlack) return bookBest.move
  }

  /* Safe band: never sample below the persona's centipawn-drop cap, and
     never walk into a seen forced mate while alternatives exist. */
  const bestScore = candidates[0]!.score
  let maxDrop = personaMaxDrop(profile, bestScore)
  if (converting) maxDrop = Math.max(15, Math.round(maxDrop * 0.3))
  let band = candidates.filter((c) => c.score >= bestScore - maxDrop)
  const survivable = band.filter((c) => c.score > -MATE_BOUND)
  if (survivable.length > 0) band = survivable
  if (band.length === 0) band = [candidates[0]!]

  /* Forced mate in the spectrum: take it. */
  if (bestScore >= MATE_BOUND) return band[0]!.move

  /* Oversight: weak personas occasionally misjudge a consequence and
     drop real material — bounded (a piece or so, capped below queen
     value even for externally tuned blunder rates, never into mate), so
     low tiers stay beatable and instructive rather than random. */
  if (!converting && Math.random() < profile.blunderRate * 0.45) {
    const widened = Math.min(850, maxDrop * 3 + 150)
    const tail = candidates.filter(
      (c) => c.score < bestScore - maxDrop && c.score >= bestScore - widened && c.score > -MATE_BOUND,
    )
    if (tail.length > 0) return tail[Math.floor(Math.random() * tail.length)]!.move
  }

  /* Flavor the band, re-rank, sample. */
  const flavored: Candidate[] = band
    .map((c) => {
      const reversal =
        ownLast !== null &&
        c.move.from === ownLast.to &&
        c.move.to === ownLast.from &&
        c.move.piece === ownLast.piece
      return { move: c.move, score: c.score + personaBias(c.move, profile, reversal) }
    })
    .sort((a, b) => b.score - a.score)

  if (flavored.length === 1) return flavored[0]!.move
  let temperature = personaTemperature(profile, endgame)
  if (converting) temperature = Math.max(4, temperature * 0.25)
  return sampleBoltzmann(flavored, temperature)
}

/** Material value map (GameFlow draw adjudication). */
export { PIECE_VALUES }

/** Static evaluation re-export (GameFlow eval readout). */
export { materialAndPst as materialAdvantage } from './evaluate'

/** Pick a random legal move — last-resort fallback only. */
export function findRandomMove(chess: Chess, avoidMoveKey?: string | null): Move | null {
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null
  const pool = avoidMoveKey ? moves.filter((m) => moveKey(m) !== avoidMoveKey) : moves
  const pickFrom = pool.length ? pool : moves
  return pickFrom[Math.floor(Math.random() * pickFrom.length)]!
}
