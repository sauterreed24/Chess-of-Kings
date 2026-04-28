import { describe, expect, it } from 'vitest'
import { rankLabel, nextRankThreshold } from './rankLabels'

describe('rankLabel', () => {
  it('maps rank-points into the band labels', () => {
    expect(rankLabel(0)).toBe('Initiate')
    expect(rankLabel(139)).toBe('Initiate')
    expect(rankLabel(140)).toBe('Apprentice Analyst')
    expect(rankLabel(279)).toBe('Apprentice Analyst')
    expect(rankLabel(280)).toBe('Senior Scholar')
    expect(rankLabel(449)).toBe('Senior Scholar')
    expect(rankLabel(450)).toBe('Court Strategos')
    expect(rankLabel(649)).toBe('Court Strategos')
    expect(rankLabel(650)).toBe('Archive Grandmaster')
    expect(rankLabel(9999)).toBe('Archive Grandmaster')
  })
})

describe('nextRankThreshold', () => {
  it('returns floor / next / nextLabel triple covering every band', () => {
    expect(nextRankThreshold(0)).toEqual({ currentFloor: 0, next: 140, nextLabel: 'Apprentice Analyst' })
    expect(nextRankThreshold(139)).toEqual({ currentFloor: 0, next: 140, nextLabel: 'Apprentice Analyst' })
    expect(nextRankThreshold(140)).toEqual({ currentFloor: 140, next: 280, nextLabel: 'Senior Scholar' })
    expect(nextRankThreshold(279)).toEqual({ currentFloor: 140, next: 280, nextLabel: 'Senior Scholar' })
    expect(nextRankThreshold(280)).toEqual({ currentFloor: 280, next: 450, nextLabel: 'Court Strategos' })
    expect(nextRankThreshold(449)).toEqual({ currentFloor: 280, next: 450, nextLabel: 'Court Strategos' })
    expect(nextRankThreshold(450)).toEqual({ currentFloor: 450, next: 650, nextLabel: 'Archive Grandmaster' })
    expect(nextRankThreshold(649)).toEqual({ currentFloor: 450, next: 650, nextLabel: 'Archive Grandmaster' })
    expect(nextRankThreshold(650)).toEqual({ currentFloor: 650, next: 900, nextLabel: 'Legendary Archivist' })
    expect(nextRankThreshold(9999)).toEqual({ currentFloor: 650, next: 900, nextLabel: 'Legendary Archivist' })
  })

  it('produces a progress fraction that monotonically increases with points within a band', () => {
    const a = nextRankThreshold(150)
    const b = nextRankThreshold(200)
    const fa = (150 - a.currentFloor) / (a.next - a.currentFloor)
    const fb = (200 - b.currentFloor) / (b.next - b.currentFloor)
    expect(fb).toBeGreaterThan(fa)
  })
})
