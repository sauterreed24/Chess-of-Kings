import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import {
  analyzePosition,
  hasPassedPawn,
  isOpenFile,
  isPawnPassed,
  isSquareAttacked,
  pawnDefendsSquare,
  squareIndex,
} from './bitboard'
import { materialAndPst } from './evaluate'

describe('bitboard position analysis', () => {
  it('summarizes the starting position without rescanning per heuristic', () => {
    const position = analyzePosition(new Chess())

    expect(position.pieceList).toHaveLength(32)
    expect(position.nonKingPieceCount).toBe(30)
    expect(position.heavyPieceCount).toBe(6)
    expect(position.kingIndex.w).toBe(squareIndex('e1'))
    expect(position.kingIndex.b).toBe(squareIndex('e8'))
    expect(position.pawnsByFile.w.every((count) => count === 1)).toBe(true)
    expect(position.pawnsByFile.b.every((count) => count === 1)).toBe(true)
    expect(position.mobility.w).toBe(position.mobility.b)
    expect(position.kingPressure.w).toBe(0)
    expect(position.kingPressure.b).toBe(0)
  })

  it('detects passed pawns and open files from masks', () => {
    const blocked = analyzePosition(new Chess('8/8/8/3p4/4P3/8/8/4K2k w - - 0 1'))
    const passer = analyzePosition(new Chess('8/8/8/8/4P3/8/8/4K2k w - - 0 1'))

    expect(isPawnPassed(blocked, 'w', squareIndex('e4'))).toBe(false)
    expect(hasPassedPawn(blocked, 'w')).toBe(false)
    expect(isPawnPassed(passer, 'w', squareIndex('e4'))).toBe(true)
    expect(hasPassedPawn(passer, 'w')).toBe(true)
    expect(isOpenFile(passer, 0)).toBe(true)
    expect(isOpenFile(passer, 4)).toBe(false)
  })

  it('feeds positional evaluation for protected and advanced passers', () => {
    const supported = new Chess('8/4P3/3P4/8/8/8/8/4K2k w - - 0 1')
    const unsupported = new Chess('8/4P3/P7/8/8/8/8/4K2k w - - 0 1')
    const supportedPosition = analyzePosition(supported)

    expect(pawnDefendsSquare(supportedPosition, 'w', squareIndex('e7'))).toBe(true)
    expect(materialAndPst(supported, 'w')).toBeGreaterThan(materialAndPst(unsupported, 'w'))
  })

  it('builds attack maps and loose-piece pressure from the same analysis pass', () => {
    const knightProbe = analyzePosition(new Chess('8/8/8/8/4n3/8/8/4K2k b - - 0 1'))
    const looseQueen = analyzePosition(new Chess('7k/8/8/8/4q3/8/8/K3R3 w - - 0 1'))

    expect(isSquareAttacked(knightProbe, 'b', squareIndex('f2'))).toBe(true)
    expect(isSquareAttacked(knightProbe, 'b', squareIndex('e2'))).toBe(false)
    expect(looseQueen.loosePiecePressure.w).toBeGreaterThanOrEqual(48)
    expect(looseQueen.mobility.w).toBeGreaterThan(0)
  })
})
