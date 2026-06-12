/**
 * Reply cadence — how long a rival visibly "ponders" before their move
 * lands. Pure presentation: the engine has already chosen the move; this
 * shapes the tempo so the rival feels like a player, not a vending
 * machine. Human chess timing in brief:
 *  - obvious recaptures snap back almost instantly,
 *  - opening/book moves come briskly,
 *  - tactical strikes land with a short, confident beat,
 *  - quiet committal decisions earn a real pause,
 *  - deliberate personalities (higher thinkTimeMs) linger longer.
 *
 * The returned value is ADDITIONAL delay after the engine's own search
 * time; callers subtract elapsed search wall-time so total felt tempo
 * stays bounded.
 */

export interface CadenceMove {
  san: string
  captured?: string
  to: string
}

export interface CadenceContext {
  move: CadenceMove
  /** The opposing player's immediately preceding move, if any. */
  lastReply: CadenceMove | null
  /** Half-moves played so far (opening detection). */
  plyCount: number
  /** Rival deliberateness — AiProfile.thinkTimeMs (420..1800 shipped). */
  thinkTimeMs: number
  /** Uniform [0,1) source; injected for deterministic tests. */
  rng: () => number
}

const MIN_MS = 90
const MAX_MS = 1500

export function replyPresentationDelayMs(ctx: CadenceContext): number {
  const { move, lastReply } = ctx
  /* Deliberateness factor: novice ~0.65, veteran ~1.0, apex ~1.5. */
  const temperament = Math.min(1.6, Math.max(0.55, ctx.thinkTimeMs / 1100))
  const jitter = 0.75 + ctx.rng() * 0.5 /* ±25% so no two pauses feel canned */

  /* Obvious recapture on the square the player just took on: snap back. */
  const isRecapture =
    Boolean(move.captured) && lastReply !== null && Boolean(lastReply.captured) && move.to === lastReply.to
  if (isRecapture) return clamp(120 * jitter)

  /* Opening theory comes from memory, not calculation. */
  if (ctx.plyCount < 12) return clamp(280 * temperament * jitter)

  /* Forcing moves: a short, confident beat. */
  if (move.captured || move.san.includes('+') || move.san.includes('#')) {
    return clamp(380 * temperament * jitter)
  }

  /* Quiet committal decisions earn the longest pause. */
  return clamp(620 * temperament * jitter)
}

function clamp(ms: number): number {
  return Math.round(Math.min(MAX_MS, Math.max(MIN_MS, ms)))
}
