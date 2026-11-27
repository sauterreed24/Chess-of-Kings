/**
 * Post-game coaching: the single move that cost the player the most.
 *
 * `evalTrace[k]` is the White-positive engine evaluation after ply `k`
 * (1:1 with `sanLog`), from the game's cheap UI probe. It only nominates
 * candidates; `verifyCostliestMoment` re-checks them with the engine
 * (injected, so this module stays pure and deterministic).
 */

export interface CostliestMoment {
  /** Index in `sanLog` of the player's costliest move. */
  ply: number
  /** SAN of the move actually played. */
  san: string
  /** Centipawns lost on that move, player's perspective (positive). */
  dropCp: number
}

/** Move-number label for a ply index, e.g. 8 -> "5... " for Black's 4th move. */
export function plyMoveLabel(ply: number): string {
  const moveNo = Math.floor(ply / 2) + 1
  return ply % 2 === 0 ? `${moveNo}.` : `${moveNo}...`
}

/**
 * Shallow-trace candidates for the verifier, largest first. A player ply's
 * drop is read two ways — right after the move, and after the rival's actual
 * reply (same side to move as before, so the probe's odd/even swing cancels
 * and a punished move shows) — and ranked by the larger.
 */
export function costlyCandidates(
  sanLog: readonly string[],
  evalTrace: readonly number[],
  playerColor: 'w' | 'b',
  minDropCp = 120,
): CostliestMoment[] {
  if (sanLog.length === 0 || evalTrace.length !== sanLog.length) return []
  const sign = playerColor === 'w' ? 1 : -1
  const playerMovesOnEven = playerColor === 'w'
  const out: CostliestMoment[] = []
  for (let i = 1; i < sanLog.length; i++) {
    if ((i % 2 === 0) !== playerMovesOnEven) continue
    const before = evalTrace[i - 1]! * sign
    const after = evalTrace[i]! * sign
    const afterReply = i + 1 < evalTrace.length ? evalTrace[i + 1]! * sign : after
    if (!Number.isFinite(before) || !Number.isFinite(after) || !Number.isFinite(afterReply)) continue
    const drop = Math.max(before - after, before - afterReply)
    if (drop >= minDropCp) out.push({ ply: i, san: sanLog[i]!, dropCp: Math.round(drop) })
  }
  return out.sort((a, b) => b.dropCp - a.dropCp || a.ply - b.ply)
}

/** A lesson the archive has re-checked: what the move really cost, and what it preferred. */
export interface VerifiedMoment extends CostliestMoment {
  /** SAN of the archive's preferred move from the same position. */
  preferredSan: string
  /** The move allowed a forced mate the preferred move avoided. */
  allowedMate: boolean
  /** The preferred move forced mate and the played one did not. */
  missedMate: boolean
}

/**
 * Engine access, injected so this module stays pure and testable. Scores
 * are centipawns from the side to move (±mate encoded as the engine does).
 * `scoreRoots`: every legal move from one position searched to the same
 * depth, best first. `scorePosition`: one position's score at the same
 * node budget. (Capping that search two plies below the root depth was
 * tried: more accurate but silent on more real blunders — IMPROVE.md.)
 */
export interface LessonEngine {
  scoreRoots(fen: string): Array<{ san: string; score: number }> | null
  scorePosition(fen: string): number | null
}

/**
 * The game's eval trace comes from a cheap 12 ms probe that flips with
 * search parity and misses deeper tactics, so its largest "drop" often lands
 * on a move that was fine (measured: under half of lessons named a move that
 * truly cost a pawn). Re-check the few largest candidates from their own
 * positions: the move is a lesson only if the archive preferred another
 * move, and what it cost is the larger of the spectrum gap and the fall
 * once the rival's actual reply landed. Null when nothing truly cost
 * `minDropCp` — an honest silence beats a wrong lesson.
 */
export function verifyCostliestMoment(
  sanLog: readonly string[],
  evalTrace: readonly number[],
  fensBefore: readonly string[],
  playerColor: 'w' | 'b',
  engine: LessonEngine,
  { candidates = 4, minDropCp = 100, mateBound = 29_000, clipCp = 1200 } = {},
): VerifiedMoment | null {
  const clip = (v: number) => Math.max(-clipCp, Math.min(clipCp, v))
  let best: VerifiedMoment | null = null
  for (const cand of costlyCandidates(sanLog, evalTrace, playerColor).slice(0, candidates)) {
    const fen = fensBefore[cand.ply]
    /* Only grade positions where the player was on move (custom start FENs). */
    if (!fen || fen.split(' ')[1] !== playerColor) continue
    const roots = engine.scoreRoots(fen)
    if (!roots || roots.length === 0) continue
    const top = roots[0]!
    const mine = roots.find((r) => r.san === cand.san)
    if (!mine || mine.san === top.san) continue
    let drop = clip(top.score) - clip(mine.score)
    let mateAfterReply = false
    const afterReply = fensBefore[cand.ply + 2]
    if (afterReply) {
      const score = engine.scorePosition(afterReply)
      if (score !== null) {
        drop = Math.max(drop, clip(top.score) - clip(score))
        mateAfterReply = score <= -mateBound && top.score > -mateBound
      }
    }
    if (drop < minDropCp) continue
    if (best && drop <= best.dropCp) continue
    best = {
      ply: cand.ply,
      san: cand.san,
      dropCp: Math.round(drop),
      preferredSan: top.san,
      allowedMate: (mine.score <= -mateBound && top.score > -mateBound) || mateAfterReply,
      missedMate: top.score >= mateBound && mine.score < mateBound,
    }
  }
  return best
}

/** The recap's one-line lesson for a verified moment. */
export function costliestLessonLine(m: VerifiedMoment): string {
  const head = `${plyMoveLabel(m.ply)} ${m.san}`
  if (m.allowedMate) return `${head} allowed a forced mate — the archive preferred ${m.preferredSan}.`
  if (m.missedMate) return `${head} missed a forced mate — ${m.preferredSan} was the finish.`
  return `${head} cost about ${(m.dropCp / 100).toFixed(1)} pawns — the archive preferred ${m.preferredSan}.`
}
