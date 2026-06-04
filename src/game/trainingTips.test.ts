import { describe, it, expect } from 'vitest'
import { lossRecoveryMentorLine } from './trainingTips'

describe('lossRecoveryMentorLine', () => {
  const baseTendencies = { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 }

  it('prioritizes heavy blunder counts', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 5,
      mistakeCount: 0,
      moveCount: 30,
    })
    expect(s).toContain('5 blunders')
    expect(s).toContain('loose defenders')
  })

  it('responds to flank-heavy games', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, flankPawnPushes: 6 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 40,
    })
    expect(s).toContain('wing pawns ran ahead')
  })

  it('responds to early queen and empty-check habits', () => {
    expect(lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, earlyQueenMoves: 2 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 12,
    })).toContain('queen came out before the court')

    expect(lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, repeatedChecksWithoutGain: 3 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 18,
    })).toContain('the checks became noise')
  })

  it('responds to a recurring rival pattern', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 2,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 24,
    })
    expect(s).toContain('knows your rhythm')
  })

  it('falls back to default guidance', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 12,
    })
    expect(s).toContain('ledger names the hinge')
  })
})
