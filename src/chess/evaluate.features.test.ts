import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import {
  centerControlBonus,
  evaluateBishopPairBonus,
  evaluateConnectedPawnBonus,
  evaluateDoubledPawnPenalty,
  evaluateIsolatedPawnPenalty,
  evaluateKingSafetyPenalty,
  evaluateMobilityBonus,
  evaluatePassedPawnBonus,
  evaluateRookFileBonus,
  evaluateSpaceBonus,
  evaluateTempoBonus,
  kingPressureBonus,
  knightOutpostBonus,
  loosePiecePressureBonus,
  materialAndPst,
  pieceSquareValue,
  PIECE_VALUES,
  resolveEvalPhase,
  rookSeventhBonus,
} from './evaluate'
import { analyzePosition } from './bitboard'

describe('evaluate feature terms (via materialAndPst)', () => {
  it('scores starting position with only tempo/space skew for White', () => {
    const chess = new Chess()
    const score = materialAndPst(chess, 'w')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(20)
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

describe('evaluate feature exports (direct)', () => {
  it('evaluateBishopPairBonus awards 22 for two bishops', () => {
    const pair = analyzePosition(new Chess('8/8/8/8/8/2BB4/8/4K2k w - - 0 1'))
    const lone = analyzePosition(new Chess('8/8/8/8/8/2B5/8/4K2k w - - 0 1'))
    expect(evaluateBishopPairBonus(pair, 'w')).toBe(22)
    expect(evaluateBishopPairBonus(lone, 'w')).toBe(0)
  })

  it('evaluatePassedPawnBonus exceeds blocked pawn material delta alone', () => {
    const blocked = analyzePosition(new Chess('8/4k3/4p3/8/8/8/8/4K3 w - - 0 1'))
    const passed = analyzePosition(new Chess('8/4k3/8/4P3/8/8/8/4K3 w - - 0 1'))
    expect(evaluatePassedPawnBonus(passed, 'w')).toBeGreaterThan(evaluatePassedPawnBonus(blocked, 'w'))
  })

  it('evaluateRookFileBonus prefers open files', () => {
    const blocked = analyzePosition(new Chess('8/4k3/4p3/8/8/8/4R3/4K3 w - - 0 1'))
    const open = analyzePosition(new Chess('8/4k3/8/8/8/8/4R3/4K3 w - - 0 1'))
    expect(evaluateRookFileBonus(open, 'w')).toBeGreaterThan(evaluateRookFileBonus(blocked, 'w'))
  })

  it('evaluateDoubledPawnPenalty penalizes stacked pawns', () => {
    const doubled = analyzePosition(new Chess('8/8/3P4/3P4/8/4k3/8/4K3 w - - 0 1'))
    const single = analyzePosition(new Chess('8/8/8/3P4/8/4k3/8/4K3 w - - 0 1'))
    expect(evaluateDoubledPawnPenalty(doubled, 'w')).toBeGreaterThan(evaluateDoubledPawnPenalty(single, 'w'))
  })

  it('evaluateIsolatedPawnPenalty penalizes pawns without neighbors', () => {
    const isolated = analyzePosition(new Chess('8/4k3/8/3P4/8/8/8/4K3 w - - 0 1'))
    const supported = analyzePosition(new Chess('8/4k3/8/2PP4/8/8/8/4K3 w - - 0 1'))
    expect(evaluateIsolatedPawnPenalty(isolated, 'w')).toBeGreaterThan(evaluateIsolatedPawnPenalty(supported, 'w'))
  })

  it('evaluateMobilityBonus increases with side mobility', () => {
    const start = analyzePosition(new Chess())
    const open = analyzePosition(new Chess('rnbqkb1r/pppp1ppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 2 3'))
    expect(evaluateMobilityBonus(open, 'w', false)).toBeGreaterThanOrEqual(evaluateMobilityBonus(start, 'w', false))
  })

  it('evaluateKingSafetyPenalty punishes a broken kingside pawn shield', () => {
    const shielded = analyzePosition(new Chess('r1bqkb1r/pppp1ppp/2n5/8/4P3/8/PPPP1PPP/RNB1RK2 w KQkq - 0 1'))
    const broken = analyzePosition(new Chess('r1bqkb1r/pppp1ppp/2n5/8/4P3/8/PPPP2PP/RNB1RK2 w KQkq - 0 1'))
    expect(evaluateKingSafetyPenalty(broken, 'w')).toBeGreaterThan(evaluateKingSafetyPenalty(shielded, 'w'))
  })

  it('evaluateConnectedPawnBonus rewards chained pawns', () => {
    const chain = analyzePosition(new Chess('8/4k3/8/2PP4/8/8/8/4K3 w - - 0 1'))
    const lone = analyzePosition(new Chess('8/4k3/8/3P4/8/8/8/4K3 w - - 0 1'))
    expect(evaluateConnectedPawnBonus(chain, 'w')).toBeGreaterThan(evaluateConnectedPawnBonus(lone, 'w'))
  })

  it('coordination helpers return non-negative bonuses on active positions', () => {
    const pos = analyzePosition(new Chess('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4'))
    const knight = pos.pieceList.find((p) => p.type === 'n' && p.color === 'b')
    const rook = pos.pieceList.find((p) => p.type === 'r' && p.color === 'w')
    if (knight) expect(knightOutpostBonus(pos, knight)).toBeGreaterThanOrEqual(0)
    if (rook) expect(rookSeventhBonus(pos, rook)).toBeGreaterThanOrEqual(0)
    expect(kingPressureBonus(pos, 'w', false)).toBeGreaterThanOrEqual(0)
    expect(loosePiecePressureBonus(pos, 'w')).toBeGreaterThanOrEqual(0)
    expect(centerControlBonus(pos, 'w')).toBeGreaterThan(0)
  })

  it('evaluateSpaceBonus and evaluateTempoBonus are non-zero in typical middlegames', () => {
    const chess = new Chess()
    const pos = analyzePosition(chess)
    expect(evaluateSpaceBonus(pos, 'w')).toBeGreaterThan(0)
    expect(evaluateTempoBonus('w', 'w', 'middlegame')).toBeGreaterThan(0)
  })

  it('resolveEvalPhase classifies opening vs endgame material', () => {
    expect(resolveEvalPhase(analyzePosition(new Chess()))).toBe('opening')
    expect(resolveEvalPhase(analyzePosition(new Chess('8/4k3/8/8/8/8/4R3/4K3 w - - 0 1')))).toBe('endgame')
  })

  it('pieceSquareValue differs by phase for developing knights', () => {
    const square = 'c3' as const
    const opening = pieceSquareValue('n', square, 'w', 'opening', false)
    const endgame = pieceSquareValue('n', square, 'w', 'endgame', true)
    expect(opening).not.toBe(endgame)
  })
})
