import type { Color, PieceSymbol, Square } from 'chess.js'

/**
 * Pure geometry/derivation helpers for the board's piece-movement physics.
 *
 * These are intentionally DOM-free so they can be unit-tested in isolation and
 * reused by {@link BoardView} without dragging layout concerns into the math.
 * `BoardView` supplies pixel coordinates (from `getBoundingClientRect`) and
 * chess.js move metadata; everything here is deterministic.
 */

export interface FlyPoint {
  x: number
  y: number
}

/** Minimal slice of a chess.js `Move` the animation layer needs. */
export interface AnimatableMove {
  from: Square
  to: Square
  color: Color
  /** chess.js flag string: 'c' capture, 'e' en-passant, 'k'/'q' castle, 'p' promotion … */
  flags: string
  captured?: PieceSymbol
}

export interface RookMove {
  from: Square
  to: Square
}

const CASTLE_RANK: Record<Color, string> = { w: '1', b: '8' }

/**
 * The square whose occupant is removed by this move, or `null` for a quiet
 * move. For a standard capture that is the destination; for en-passant the
 * taken pawn sits on the *origin* rank but the destination file.
 */
export function capturedSquareFor(move: AnimatableMove): Square | null {
  if (move.flags.includes('e')) {
    return `${move.to[0]}${move.from[1]}` as Square
  }
  if (move.captured || move.flags.includes('c')) {
    return move.to
  }
  return null
}

/**
 * For a castling move (king's `from`/`to`), the rook's travel so it can fly in
 * tandem rather than teleporting. Returns `null` for non-castling moves.
 */
export function castlingRookMove(move: AnimatableMove): RookMove | null {
  const rank = CASTLE_RANK[move.color]
  if (move.flags.includes('k')) {
    return { from: `h${rank}` as Square, to: `f${rank}` as Square }
  }
  if (move.flags.includes('q')) {
    return { from: `a${rank}` as Square, to: `d${rank}` as Square }
  }
  return null
}

/** Cubic ease-in-out — slow pickup, quick carry, gentle set-down. */
export function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

/**
 * Peak vertical lift (px) of the carry arc. Scales with travel distance so a
 * one-square nudge barely hops while a cross-board slide arcs convincingly,
 * but is clamped to the cell size so it never looks like a launch.
 */
export function flightLift(from: FlyPoint, to: FlyPoint, cellSize: number): number {
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  return Math.min(Math.max(dist * 0.22, 8), Math.max(cellSize, 1) * 0.9)
}

/**
 * Keyframes for the carry: a piece is picked up (scales past 1), arcs along an
 * eased path so it accelerates off the origin and decelerates into the target,
 * and lands back at scale 1. Time (offset) is linear; the *easing* is baked
 * into the spatial sampling so the animation's own `easing` can stay `linear`
 * (per-keyframe easing in WAAPI would otherwise re-segment the curve).
 *
 * Transforms are translate+scale only, keeping the whole carry on the GPU
 * compositor with no layout or paint per frame.
 */
export function buildFlyKeyframes(
  from: FlyPoint,
  to: FlyPoint,
  cellSize: number,
  steps = 6,
): Keyframe[] {
  const lift = flightLift(from, to, cellSize)
  const scaleBump = 0.12
  const total = Math.max(2, Math.floor(steps))
  const frames: Keyframe[] = []
  for (let i = 0; i <= total; i++) {
    const offset = i / total
    const progress = easeInOut(offset)
    const x = from.x + (to.x - from.x) * progress
    const arc = Math.sin(Math.PI * progress)
    const y = from.y + (to.y - from.y) * progress - lift * arc
    const scale = 1 + scaleBump * arc
    frames.push({
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) translate(-50%, -50%) scale(${scale.toFixed(4)})`,
      offset,
    })
  }
  return frames
}

/** Center point of a rect, in viewport coordinates. */
export function rectCenter(rect: { left: number; top: number; width: number; height: number }): FlyPoint {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
