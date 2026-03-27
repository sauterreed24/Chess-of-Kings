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
    expect(s).toContain('heavy slips')
  })

  it('responds to flank-heavy games', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, flankPawnPushes: 6 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 40,
    })
    expect(s).toContain('wing')
  })

  it('falls back to default guidance', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 12,
    })
    expect(s).toContain('turning point')
  })
})
