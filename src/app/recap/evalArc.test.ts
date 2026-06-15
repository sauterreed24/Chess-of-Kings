import { describe, expect, it } from 'vitest'
import { buildEvalArcSvg } from './evalArc'

const sans = (n: number) => Array.from({ length: n }, (_, i) => `m${i}`)

describe('buildEvalArcSvg', () => {
  it('returns null for short or misaligned traces', () => {
    expect(buildEvalArcSvg({ sanLog: sans(4), evalTrace: [0, 0, 0, 0], playerColor: 'w' })).toBeNull()
    expect(buildEvalArcSvg({ sanLog: sans(8), evalTrace: [0, 0], playerColor: 'w' })).toBeNull()
    expect(buildEvalArcSvg({ sanLog: [], evalTrace: [], playerColor: 'w' })).toBeNull()
  })

  it('builds a self-styled svg with a polyline and baseline', () => {
    const svg = buildEvalArcSvg({
      sanLog: sans(8),
      evalTrace: [20, 10, 40, 30, 80, 60, 120, 100],
      playerColor: 'w',
    })
    expect(svg).not.toBeNull()
    expect(svg).toContain('<svg')
    expect(svg).toContain('<polyline')
    expect(svg).toContain('role="img"')
    /* No external CSS dependency — colours are inline. */
    expect(svg).toContain('stroke="url(#eval-arc-grad)"')
    expect(svg).toContain('aria-label=')
  })

  it('marks the costliest moment when one exists', () => {
    /* White drops ~3 pawns on ply 4 (Qh5-style blunder). */
    const svg = buildEvalArcSvg({
      sanLog: ['e4', 'e5', 'Nf3', 'Nc6', 'Qh5', 'Nf6', 'Qf3', 'd6'],
      evalTrace: [25, 20, 30, 25, -300, -290, -280, -285],
      playerColor: 'w',
    })!
    expect(svg).toContain('<circle')
    expect(svg).toContain('Costliest:')
  })

  it('reads the trace from black\'s perspective (sign flip)', () => {
    /* White-positive trace rising means BLACK is losing — the arc should
       dip below the centre line (y > mid=30) for a black player. */
    const svg = buildEvalArcSvg({
      sanLog: sans(6),
      evalTrace: [50, 100, 200, 300, 500, 700],
      playerColor: 'b',
    })!
    const ys = [...svg.matchAll(/\d+\.\d+,(\d+\.\d+)/g)].map((m) => Number(m[1]))
    expect(ys.some((y) => y > 30)).toBe(true) /* dipped below centre */
  })

  it('does not throw on NaN/Infinity in the trace', () => {
    expect(() =>
      buildEvalArcSvg({
        sanLog: sans(6),
        evalTrace: [0, Number.NaN, Infinity, -Infinity, 0, 0],
        playerColor: 'w',
      }),
    ).not.toThrow()
  })
})
