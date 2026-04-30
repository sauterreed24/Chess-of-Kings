import { describe, expect, it } from 'vitest'
import {
  deriveCalibrationLens,
  antiTiltRelief,
  momentumHardening,
} from './calibrationLens'
import type { MatchHistoryEntry, RivalMemoryEntry } from '../../types'

function entry(over: Partial<MatchHistoryEntry>): MatchHistoryEntry {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    timestamp: over.timestamp ?? Date.now(),
    mode: 'duel',
    sourceId: 'src',
    opponentId: 'rival',
    opponentLabel: 'Rival',
    outcome: 'draw',
    moves: 40,
    styleGrade: 'B',
    turningPointSan: 'Nf3',
    ...over,
  }
}

describe('deriveCalibrationLens', () => {
  it('returns Equilibrium when history is empty', () => {
    const v = deriveCalibrationLens([], undefined)
    expect(v.level).toBe('Equilibrium')
    expect(v.dialPosition).toBeCloseTo(0.5)
  })

  it('flags Relentless when the player wins many in a row', () => {
    const history: MatchHistoryEntry[] = Array.from({ length: 6 }, (_, i) =>
      entry({ id: `w${i}`, outcome: 'win' }),
    )
    const v = deriveCalibrationLens(history, undefined)
    expect(v.level).toBe('Relentless')
    expect(v.dialPosition).toBe(1)
  })

  it('flags Forgiving when the player loses many in a row', () => {
    const history: MatchHistoryEntry[] = Array.from({ length: 5 }, (_, i) =>
      entry({ id: `l${i}`, outcome: 'loss' }),
    )
    const v = deriveCalibrationLens(history, undefined)
    expect(v.level).toBe('Forgiving')
    expect(v.dialPosition).toBe(0)
  })

  it('flags Measured for mild loss pressure', () => {
    const history: MatchHistoryEntry[] = [
      entry({ outcome: 'win' }),
      entry({ outcome: 'loss' }),
      entry({ outcome: 'loss' }),
    ]
    const v = deriveCalibrationLens(history, undefined)
    expect(v.level).toBe('Measured')
  })

  it('flags Sharpened for mild win streak', () => {
    const history: MatchHistoryEntry[] = [
      entry({ outcome: 'loss' }),
      entry({ outcome: 'win' }),
      entry({ outcome: 'win' }),
      entry({ outcome: 'win' }),
    ]
    const v = deriveCalibrationLens(history, undefined)
    expect(v.level).toBe('Sharpened')
  })

  it('honors a forced "novice" or "relentless" override regardless of history', () => {
    const v1 = deriveCalibrationLens([entry({ outcome: 'win' })], undefined, 'novice')
    expect(v1.level).toBe('Forgiving')
    const v2 = deriveCalibrationLens([entry({ outcome: 'loss' })], undefined, 'relentless')
    expect(v2.level).toBe('Relentless')
  })

  it('rival pressure shifts the dial toward forgiving', () => {
    const history: MatchHistoryEntry[] = [
      entry({ outcome: 'win' }),
      entry({ outcome: 'win' }),
    ]
    const mem: RivalMemoryEntry = {
      games: 8,
      wins: 1,
      losses: 6,
      draws: 1,
      avgMoves: 38,
      punishedFlankPushes: 0,
      punishedEarlyQueen: 0,
      punishedCheckSpam: 0,
    }
    /* Two wins normally would lean Sharpened, but heavy loss pressure
     * (5 net losses) drags the dial back toward Equilibrium/Forgiving. */
    const v = deriveCalibrationLens(history, mem)
    expect(['Forgiving', 'Measured', 'Equilibrium']).toContain(v.level)
  })
})

describe('antiTiltRelief', () => {
  it('is zero for streaks under 2', () => {
    expect(antiTiltRelief(0)).toBe(0)
    expect(antiTiltRelief(1)).toBe(0)
  })

  it('grows with the loss streak but is bounded above 0.22', () => {
    const r2 = antiTiltRelief(2)
    const r3 = antiTiltRelief(3)
    const r4 = antiTiltRelief(4)
    const r5 = antiTiltRelief(5)
    const r10 = antiTiltRelief(10)
    expect(r2).toBeGreaterThan(0)
    expect(r3).toBeGreaterThanOrEqual(r2)
    expect(r4).toBeGreaterThanOrEqual(r3)
    expect(r5).toBeGreaterThanOrEqual(r4)
    /* For streak >= 5 the cap (0.22) bites because streak * 0.045 > 0.22. */
    expect(r10).toBe(r5)
    expect(r10).toBeLessThanOrEqual(0.25)
  })

  it('never produces NaN or negative values', () => {
    for (let s = -2; s <= 20; s++) {
      const r = antiTiltRelief(s)
      expect(Number.isFinite(r)).toBe(true)
      expect(r).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('momentumHardening', () => {
  it('is zero for streaks under 2', () => {
    expect(momentumHardening(0)).toBe(0)
    expect(momentumHardening(1)).toBe(0)
  })

  it('grows with the win streak and is bounded at 0.18', () => {
    expect(momentumHardening(2)).toBeCloseTo(0.06)
    expect(momentumHardening(3)).toBeCloseTo(0.12)
    expect(momentumHardening(20)).toBe(0.18)
  })
})

describe('difficulty curve simulation', () => {
  /** Synthetic 200-outcome property: across alternating L/W bursts the
   * lens label cycles through the bands without ever overshooting the
   * Forgiving / Relentless ceilings. */
  it('lens label stays inside the 5-level band across 200 synthetic outcomes', () => {
    const labels = new Set<string>()
    let outcomes: MatchHistoryEntry[] = []
    for (let i = 0; i < 200; i++) {
      const phase = Math.floor(i / 8) % 4
      const outcome: MatchHistoryEntry['outcome'] =
        phase === 0 ? 'loss' : phase === 1 ? 'loss' : phase === 2 ? 'win' : 'draw'
      outcomes = [...outcomes.slice(-12), entry({ id: `s${i}`, outcome })]
      const v = deriveCalibrationLens(outcomes, undefined)
      labels.add(v.level)
      expect(['Forgiving', 'Measured', 'Equilibrium', 'Sharpened', 'Relentless']).toContain(v.level)
    }
    expect(labels.size).toBeGreaterThan(1)
  })
})
