import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { materialAndPst, PIECE_VALUES } from './evaluate'
import { analyzePosition } from './bitboard'

describe('evaluate feature terms (via materialAndPst)', () => {
  it('scores starting position as equal for White', () => {
    const chess = new Chess()
    expect(materialAndPst(chess, 'w')).toBe(0)
  })

  it('rewards material advantage for a missing enemy queen', () => {
    const chess = new Chess('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const score = materialAndPst(chess, 'w')
    expect(score).toBeGreaterThan(PIECE_VALUES.q - 50)
  })

  it('prefers bishop pair over a lone bishop', () => {
    const oneBishop = new Chess('8/8/8/8/8/2B5/8/4K2k w - - 0 1')
    const bishopPair = new Chess('8/8/8/8/8/2BB4/8/4K2k w - - 0 1')
    const single = materialAndPst(oneBishop, 'w')
    const pair = materialAndPst(bishopPair, 'w')
    expect(pair - single).toBeGreaterThan(15)
  })

  it('bonuses a passed pawn relative to a blocked pawn', () => {
    const blocked = new Chess('8/4k3/4p3/8/8/8/8/4K3 w - - 0 1')
    const passed = new Chess('8/4k3/8/4P3/8/8/8/4K3 w - - 0 1')
    const blockedScore = materialAndPst(blocked, 'w')
    const passedScore = materialAndPst(passed, 'w')
    expect(passedScore).toBeGreaterThan(blockedScore)
  })

  it('values a rook on an open file over a file with pawns', () => {
    const blocked = new Chess('8/4k3/4p3/8/8/8/4R3/4K3 w - - 0 1')
    const open = new Chess('8/4k3/8/8/8/8/4R3/4K3 w - - 0 1')
    expect(materialAndPst(open, 'w')).toBeGreaterThan(materialAndPst(blocked, 'w'))
  })

  it('uses piece-square tables (knight on rim vs center)', () => {
    const rim = new Chess('8/4k3/8/8/8/8/N7/4K3 w - - 0 1')
    const center = new Chess('8/4k3/8/8/3N4/8/8/4K3 w - - 0 1')
    expect(materialAndPst(center, 'w')).toBeGreaterThan(materialAndPst(rim, 'w'))
  })

  it('analyzePosition feeds consistent evaluation inputs', () => {
    const chess = new Chess()
    const pos = analyzePosition(chess)
    expect(pos.pieceList.length).toBe(32)
    expect(materialAndPst(chess, 'w', pos)).toBe(materialAndPst(chess, 'w'))
  })
})
