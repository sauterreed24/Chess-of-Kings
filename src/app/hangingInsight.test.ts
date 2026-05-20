import { describe, it, expect } from 'vitest'
import { Chess } from 'chess.js'
import { findHangingPiece, hangingCoachTip } from './hangingInsight'

describe('findHangingPiece', () => {
  it('flags an undefended minor piece left en prise', () => {
    // White knight on f3 attacked by a black bishop on c6, no white defender.
    const c = new Chess('4k3/8/2b5/8/8/5N2/8/4K3 b - - 0 1')
    const t = findHangingPiece(c, 'w')
    expect(t).not.toBeNull()
    expect(t!.square).toBe('f3')
    expect(t!.pieceType).toBe('n')
    expect(t!.oppGain).toBeGreaterThanOrEqual(300)
  })

  it('does not flag a piece defended by an equal-value attacker (fair trade)', () => {
    // White knight e5 attacked by black bishop d6, defended by white pawn d4.
    // Opponent gain ≈ 320 − 330 < 0 → no warning.
    const c = new Chess('4k3/8/3b4/4N3/3P4/8/8/4K3 b - - 0 1')
    expect(findHangingPiece(c, 'w')).toBeNull()
  })

  it('flags a piece that loses material even though defended (won by a cheaper attacker)', () => {
    // White rook on d4 defended by the white pawn on c3, attacked by a black
    // knight on c6. Opponent wins rook (500) for a knight (320) → nets ~170.
    const c = new Chess('4k3/8/2n5/8/3R4/2P5/8/4K3 b - - 0 1')
    const t = findHangingPiece(c, 'w')
    expect(t).not.toBeNull()
    expect(t!.square).toBe('d4')
    expect(t!.pieceType).toBe('r')
    expect(t!.oppGain).toBeGreaterThanOrEqual(160)
  })

  it('does not raise a false alarm for a pinned attacker (illegal capture)', () => {
    // Black bishop g4 "attacks" a white knight on f3, but the bishop is pinned
    // to its king by the white rook on g1 — so the capture is illegal.
    const c = new Chess('6k1/8/8/8/6b1/5N2/8/4K1R1 b - - 0 1')
    expect(findHangingPiece(c, 'w')).toBeNull()
  })

  it('returns null when the side to move is in check', () => {
    // Black king on e8 is checked by the white rook on e7; forcing dynamics.
    const checked = new Chess('4k3/4R3/8/8/8/8/8/4K3 b - - 0 1')
    expect(checked.inCheck()).toBe(true)
    expect(findHangingPiece(checked, 'w')).toBeNull()
  })

  it('ignores loose lone pawns below the material threshold', () => {
    // A single undefended pawn (100cp) is below MIN_GAIN and should not nag.
    const c = new Chess('4k3/8/8/3p4/4P3/8/8/4K3 b - - 0 1')
    // black pawn d5 can take e4 pawn; that's only ~100 → no warning
    const t = findHangingPiece(c, 'w')
    expect(t).toBeNull()
  })

  it('formats a readable coaching tip', () => {
    const tip = hangingCoachTip({ square: 'f3', pieceType: 'n', oppGain: 320 })
    expect(tip).toContain('knight on f3')
    expect(tip.length).toBeGreaterThan(20)
  })
})
