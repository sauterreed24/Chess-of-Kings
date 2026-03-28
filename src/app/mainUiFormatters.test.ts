import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import {
  capturedRow,
  diffStars,
  formatMoveLedger,
  getCaptured,
  gradeScore,
  labelForSpeaker,
  performanceDeltaLines,
  sceneTypeLabel,
  tierLabel,
} from './mainUiFormatters'
import type { MatchHistoryEntry } from '../types'

describe('mainUiFormatters', () => {
  it('tierLabel maps ladder tiers', () => {
    expect(tierLabel('boss')).toBe('Boss')
    expect(tierLabel('mini-boss')).toBe('Mini-Boss')
    expect(tierLabel(undefined)).toBe('')
  })

  it('labelForSpeaker uses map and title-cases unknown ids', () => {
    expect(labelForSpeaker('reed')).toBe('Reed')
    expect(labelForSpeaker('custom-npc')).toBe('Custom Npc')
  })

  it('sceneTypeLabel covers scene kinds', () => {
    expect(sceneTypeLabel({ type: 'dialogue', id: 'x', lines: [] })).toBe('Dialogue')
    expect(sceneTypeLabel({ type: 'codex', id: 'c', heading: 'Glossary', entries: [] })).toBe('Glossary')
  })

  it('formatMoveLedger escapes SAN and handles empty log', () => {
    expect(formatMoveLedger([], [])).toContain('No moves yet')
    const html = formatMoveLedger(['e4', 'e5'], ['good', null])
    expect(html).toContain('e4')
    expect(html).toContain('e5')
    expect(html).not.toContain('<script')
  })

  it('getCaptured and capturedRow reflect starting position', () => {
    const ch = new Chess()
    const { byWhite, byBlack } = getCaptured(ch)
    expect(byWhite).toEqual([])
    expect(byBlack).toEqual([])
    expect(capturedRow([], 'w')).toContain('captured-empty')
  })

  it('diffStars renders five stars', () => {
    const s = diffStars(3)
    expect(s.split('diff-star--on').length - 1).toBe(3)
  })

  it('gradeScore orders style grades', () => {
    expect(gradeScore('S')).toBeGreaterThan(gradeScore('C'))
  })

  it('performanceDeltaLines returns baseline when no prior rival history', () => {
    const latest: MatchHistoryEntry = {
      id: 'a',
      timestamp: Date.now(),
      mode: 'match',
      sourceId: 'ch1',
      opponentId: 'x',
      opponentLabel: 'Test',
      outcome: 'win',
      moves: 40,
      styleGrade: 'B',
      turningPointSan: 'Nf3',
    }
    const lines = performanceDeltaLines([], latest)
    expect(lines.some((l) => l.includes('Baseline'))).toBe(true)
  })
})
