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
    expect(s).toContain('Before moving')
    expect(s).toContain('loose defender')
  })

  it('turns late blunders into a single endgame proof', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 2,
      mistakeCount: 0,
      moveCount: 30,
    })
    expect(s).toContain('endgame frayed after 30 ply')
    expect(s).toContain('Choose one proof')
  })

  it('responds to flank-heavy games', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, flankPawnPushes: 6 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 40,
    })
    expect(s).toContain('wings outran the center')
  })

  it('responds to early queen and empty-check habits', () => {
    expect(lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, earlyQueenMoves: 2 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 12,
    })).toContain('queen arrived before the court')

    expect(lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: { ...baseTendencies, repeatedChecksWithoutGain: 3 },
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 18,
    })).toContain('checks became noise')
  })

  it('responds to a recurring rival pattern', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 2,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 24,
    })
    expect(s).toContain('has your rhythm')
    expect(s).toContain('overreach')
  })

  it('keeps mistake-heavy losses concrete', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 4,
      moveCount: 28,
    })
    expect(s).toContain('4 mistakes')
    expect(s).toContain('loose piece')
  })

  it('falls back to default guidance', () => {
    const s = lossRecoveryMentorLine({
      lossStreakVsOpponent: 0,
      sceneTendencies: baseTendencies,
      blunderCount: 0,
      mistakeCount: 0,
      moveCount: 12,
    })
    expect(s).toContain('ledger found the hinge')
  })
})
