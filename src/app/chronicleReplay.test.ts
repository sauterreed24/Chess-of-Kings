import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { buildReplayFens, formatEchoTimeline, renderEchoBoardFen } from './chronicleReplay'
import type { MatchHistoryEntry } from '../types'

function entry(partial: Partial<MatchHistoryEntry> & Pick<MatchHistoryEntry, 'id'>): MatchHistoryEntry {
  return {
    timestamp: 1,
    mode: 'duel',
    sourceId: 's',
    opponentId: 'x',
    opponentLabel: 'X',
    outcome: 'win',
    moves: 3,
    styleGrade: 'B',
    turningPointSan: 'Nf3',
    ...partial,
  }
}

describe('chronicleReplay', () => {
  it('buildReplayFens returns start position and stops on illegal SAN', () => {
    const start = new Chess().fen()
    const fens = buildReplayFens(
      entry({
        id: 'a',
        replayStartFen: start,
        replaySans: ['e4', 'zzz-invalid', 'Nf6'],
      }),
    )
    expect(fens.length).toBe(2)
    expect(fens[0]).toBe(start)
    expect(fens[1]).toMatch(/rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b/)
  })

  it('formatEchoTimeline escapes SAN text', () => {
    const html = formatEchoTimeline(
      entry({
        id: 'b',
        replaySans: ['<script>'],
        turningPointSan: 'e4',
      }),
      0,
    )
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('renderEchoBoardFen renders 64 cells', () => {
    const html = renderEchoBoardFen(new Chess().fen(), 'classic-royal')
    const cells = html.match(/class="echo-sq echo-sq--/g)
    expect(cells?.length).toBe(64)
    expect(html.match(/class="sq-facet"/g)?.length).toBe(64)
    expect(html.match(/sq-label--rank/g)?.length).toBe(8)
    expect(html.match(/sq-label--file/g)?.length).toBe(8)
    expect(html).toContain('font-size:0.7rem')
    expect(html).toContain('piece-carve')
    expect(html).toContain('class="piece piece--w"')
    expect(html).toContain('stroke-width="2.4"')
    expect(renderEchoBoardFen(new Chess().fen(), 'alexandrine-ornate')).toContain('--piece-stroke:#6b4e14')
  })

  it('renderEchoBoardFen recovers from invalid FEN', () => {
    const warn = console.warn
    const spy = (..._args: unknown[]) => {}
    console.warn = spy as typeof console.warn
    try {
      const html = renderEchoBoardFen('not-a-fen-at-all', 'classic-royal')
      const cells = html.match(/class="echo-sq echo-sq--/g)
      expect(cells?.length).toBe(64)
    } finally {
      console.warn = warn
    }
  })
})
