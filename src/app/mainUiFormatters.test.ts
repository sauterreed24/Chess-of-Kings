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
  spokenLineText,
  storyBeatBlock,
  tierLabel,
  aiTraitBars,
} from './mainUiFormatters'
import type { MatchHistoryEntry } from '../types'
import { AI_PROFILES } from '../chess/aiProfiles'

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
    expect(html).toContain('ledger-row--latest')
    expect(html).not.toContain('<script')
  })

  it('storyBeatBlock renders compact story context and escapes authored copy', () => {
    const html = storyBeatBlock({
      label: '<Pressure>',
      title: 'Fire & calculation',
      body: 'A poisoned <pawn> asks whether Reed can wait.',
      tone: 'fire',
    })

    expect(html).toContain('story-beat--fire')
    expect(html).toContain('&lt;Pressure&gt;')
    expect(html).toContain('Fire &amp; calculation')
    expect(html).toContain('A poisoned &lt;pawn&gt; asks whether Reed can wait.')
    expect(html).not.toContain('<Pressure>')
    expect(html).not.toContain('<pawn>')
  })

  it('spokenLineText exposes full AT text while hiding animated character spans', () => {
    const html = spokenLineText('Reed says <check>.')
    expect(html).toContain('class="sr-only"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('spoken-char')
    expect(html).toContain('Reed says &lt;check&gt;.')
    expect(html).not.toContain('<check>')
  })

  it('aiTraitBars renders escaped rival doctrine traits', () => {
    const html = aiTraitBars(AI_PROFILES.rowan_gambit)
    expect(html).toContain('AI Doctrine')
    expect(html).toContain('Risk')
    expect(html).toContain('King safety')
    expect(html).toContain('Rowan Gambit Tabiya')
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
