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
  })
})
