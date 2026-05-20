import { describe, expect, it } from 'vitest'
import {
  buildFlyKeyframes,
  capturedSquareFor,
  castlingRookMove,
  easeInOut,
  flightLift,
  rectCenter,
  type AnimatableMove,
} from './boardAnimation'

function move(partial: Partial<AnimatableMove>): AnimatableMove {
  return { from: 'e2', to: 'e4', color: 'w', flags: 'n', ...partial }
}

describe('capturedSquareFor', () => {
  it('returns null for a quiet move', () => {
    expect(capturedSquareFor(move({ flags: 'n' }))).toBeNull()
  })

  it('returns the destination for a standard capture', () => {
    expect(capturedSquareFor(move({ from: 'd4', to: 'e5', flags: 'c', captured: 'p' }))).toBe('e5')
  })

  it('treats a populated `captured` field as a capture even without the flag', () => {
    expect(capturedSquareFor(move({ from: 'd4', to: 'e5', flags: 'n', captured: 'n' }))).toBe('e5')
  })

  it('returns the en-passant pawn square (destination file, origin rank) for white', () => {
    // White pawn d5xe6 e.p. removes the black pawn on e5.
    expect(capturedSquareFor(move({ from: 'd5', to: 'e6', color: 'w', flags: 'e', captured: 'p' }))).toBe('e5')
  })

  it('returns the en-passant pawn square for black', () => {
    // Black pawn e4xd3 e.p. removes the white pawn on d4.
    expect(capturedSquareFor(move({ from: 'e4', to: 'd3', color: 'b', flags: 'e', captured: 'p' }))).toBe('d4')
  })
})

describe('castlingRookMove', () => {
  it('returns null for a non-castling move', () => {
    expect(castlingRookMove(move({ flags: 'n' }))).toBeNull()
  })

  it('derives the white kingside rook travel', () => {
    expect(castlingRookMove(move({ from: 'e1', to: 'g1', color: 'w', flags: 'k' }))).toEqual({
      from: 'h1',
      to: 'f1',
    })
  })

  it('derives the white queenside rook travel', () => {
    expect(castlingRookMove(move({ from: 'e1', to: 'c1', color: 'w', flags: 'q' }))).toEqual({
      from: 'a1',
      to: 'd1',
    })
  })

  it('derives the black kingside rook travel', () => {
    expect(castlingRookMove(move({ from: 'e8', to: 'g8', color: 'b', flags: 'k' }))).toEqual({
      from: 'h8',
      to: 'f8',
    })
  })

  it('derives the black queenside rook travel', () => {
    expect(castlingRookMove(move({ from: 'e8', to: 'c8', color: 'b', flags: 'q' }))).toEqual({
      from: 'a8',
      to: 'd8',
    })
  })
})

describe('easeInOut', () => {
  it('pins the endpoints and the midpoint', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 6)
  })

  it('clamps out-of-range input', () => {
    expect(easeInOut(-1)).toBe(0)
    expect(easeInOut(2)).toBe(1)
  })

  it('is monotonically increasing', () => {
    let prev = -Infinity
    for (let i = 0; i <= 20; i++) {
      const v = easeInOut(i / 20)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})

describe('flightLift', () => {
  it('clamps tiny moves to a minimum hop', () => {
    expect(flightLift({ x: 0, y: 0 }, { x: 1, y: 0 }, 80)).toBe(6)
  })

  it('grows with distance', () => {
    const near = flightLift({ x: 0, y: 0 }, { x: 200, y: 0 }, 80)
    const far = flightLift({ x: 0, y: 0 }, { x: 360, y: 0 }, 80)
    expect(far).toBeGreaterThan(near)
    expect(near).toBeCloseTo(200 * 0.16, 6)
  })

  it('clamps to the cell-size ceiling for long slides', () => {
    const lift = flightLift({ x: 0, y: 0 }, { x: 1000, y: 0 }, 80)
    expect(lift).toBe(80 * 0.85)
  })
})

describe('buildFlyKeyframes', () => {
  const from = { x: 100, y: 500 }
  const to = { x: 420, y: 500 }

  it('produces steps + 1 keyframes with offsets ascending from 0 to 1', () => {
    const frames = buildFlyKeyframes(from, to, 80, 6)
    expect(frames).toHaveLength(7)
    expect(frames[0]!.offset).toBe(0)
    expect(frames[frames.length - 1]!.offset).toBe(1)
    let prev = -1
    for (const f of frames) {
      expect(f.offset as number).toBeGreaterThan(prev)
      prev = f.offset as number
    }
  })

  it('starts at the origin and ends at the target, both at scale 1', () => {
    const frames = buildFlyKeyframes(from, to, 80, 6)
    expect(frames[0]!.transform).toContain('translate(100.00px, 500.00px)')
    expect(frames[0]!.transform).toContain('scale(1.0000)')
    const last = frames[frames.length - 1]!
    expect(last.transform).toContain('translate(420.00px, 500.00px)')
    expect(last.transform).toContain('scale(1.0000)')
  })

  it('arcs above a horizontal path (midpoint lifted) and peaks scale > 1', () => {
    const frames = buildFlyKeyframes(from, to, 80, 6)
    const mid = frames[3]!.transform as string
    const yMatch = mid.match(/translate\([-\d.]+px, ([-\d.]+)px\)/)
    const sMatch = mid.match(/scale\(([\d.]+)\)/)
    expect(yMatch).toBeTruthy()
    expect(sMatch).toBeTruthy()
    // Screen-y decreases upward, so a lifted apex is < the shared endpoint y.
    expect(Number(yMatch![1])).toBeLessThan(500)
    expect(Number(sMatch![1])).toBeGreaterThan(1)
  })

  it('interpolates x monotonically along the travel direction', () => {
    const frames = buildFlyKeyframes(from, to, 80, 6)
    let prevX = -Infinity
    for (const f of frames) {
      const x = Number((f.transform as string).match(/translate\(([-\d.]+)px,/)![1])
      expect(x).toBeGreaterThanOrEqual(prevX)
      prevX = x
    }
  })

  it('stays robust with degenerate step counts', () => {
    expect(buildFlyKeyframes(from, to, 80, 0)).toHaveLength(3)
    expect(buildFlyKeyframes(from, to, 80, 1)).toHaveLength(3)
  })
})

describe('rectCenter', () => {
  it('returns the geometric center of a rect', () => {
    expect(rectCenter({ left: 10, top: 20, width: 40, height: 60 })).toEqual({ x: 30, y: 50 })
  })
})
