import { describe, expect, it } from 'vitest'
import {
  DEFAULT_RIVAL_CALIBRATION,
  expectedPlayerScore,
  formatRivalCalibrationLabel,
  sanitizeRivalCalibrationRating,
  updateRivalCalibrationRating,
} from './rivalCalibration'

describe('rivalCalibration', () => {
  it('sanitizes invalid ratings to default', () => {
    expect(sanitizeRivalCalibrationRating(undefined)).toBe(DEFAULT_RIVAL_CALIBRATION)
    expect(sanitizeRivalCalibrationRating(9999)).toBe(2200)
    expect(sanitizeRivalCalibrationRating(500)).toBe(1200)
  })

  it('raises rival rating after player losses and lowers after wins', () => {
    let r = DEFAULT_RIVAL_CALIBRATION
    r = updateRivalCalibrationRating(r, 'loss')
    expect(r).toBeGreaterThan(DEFAULT_RIVAL_CALIBRATION)
    r = updateRivalCalibrationRating(r, 'win')
    expect(r).toBeLessThan(updateRivalCalibrationRating(DEFAULT_RIVAL_CALIBRATION, 'loss'))
  })

  it('draws nudge rating toward equilibrium', () => {
    const high = updateRivalCalibrationRating(1750, 'draw')
    expect(high).toBeLessThan(1750)
    const low = updateRivalCalibrationRating(1350, 'draw')
    expect(low).toBeGreaterThan(1350)
  })

  it('maps rating bands to readable labels', () => {
    expect(formatRivalCalibrationLabel(1900)).toContain('Elite')
    expect(formatRivalCalibrationLabel(1300)).toContain('Forgiving')
  })

  it('expected score is symmetric around equal ratings', () => {
    expect(expectedPlayerScore(1500, 1500)).toBeCloseTo(0.5, 2)
  })
})

describe('rival calibration convergence', () => {
  function simulateRating(pWin: number, games = 20): number {
    let rating = DEFAULT_RIVAL_CALIBRATION
    for (let g = 0; g < games; g++) {
      const roll = ((g * 37 + Math.floor(pWin * 100)) % 100) / 100
      const outcome = roll < pWin ? 'win' : 'loss'
      rating = updateRivalCalibrationRating(rating, outcome)
    }
    return rating
  }

  it('50 rivalries × 20 games separate weak vs strong player bands', () => {
    const weakPlayerRatings: number[] = []
    const strongPlayerRatings: number[] = []
    for (let r = 0; r < 50; r++) {
      const pWeak = 0.28 + (r % 5) * 0.02
      const pStrong = 0.62 + (r % 5) * 0.02
      weakPlayerRatings.push(simulateRating(pWeak))
      strongPlayerRatings.push(simulateRating(pStrong))
    }
    const weakAvg = weakPlayerRatings.reduce((a, b) => a + b, 0) / 50
    const strongAvg = strongPlayerRatings.reduce((a, b) => a + b, 0) / 50
    expect(weakAvg - strongAvg).toBeGreaterThan(35)
    for (let i = 0; i < 50; i++) {
      expect(weakPlayerRatings[i]!).toBeGreaterThan(strongPlayerRatings[i]!)
    }
  })
})
