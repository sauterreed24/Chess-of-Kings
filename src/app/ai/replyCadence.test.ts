import { describe, expect, it } from 'vitest'
import { replyPresentationDelayMs } from './replyCadence'
import type { CadenceContext } from './replyCadence'

const fixedRng = (value: number) => () => value

function ctx(overrides: Partial<CadenceContext>): CadenceContext {
  return {
    move: { san: 'Nf3', to: 'f3' },
    lastReply: null,
    plyCount: 24,
    thinkTimeMs: 1100,
    rng: fixedRng(0.5),
    ...overrides,
  }
}

describe('replyPresentationDelayMs', () => {
  it('snaps back obvious recaptures regardless of temperament', () => {
    const recapture = ctx({
      move: { san: 'Qxd5', captured: 'q', to: 'd5' },
      lastReply: { san: 'Qxd5', captured: 'p', to: 'd5' },
      thinkTimeMs: 1800,
    })
    expect(replyPresentationDelayMs(recapture)).toBeLessThan(200)
  })

  it('plays opening moves briskly and quiet decisions slowly', () => {
    const book = replyPresentationDelayMs(ctx({ plyCount: 4 }))
    const quiet = replyPresentationDelayMs(ctx({ plyCount: 30 }))
    expect(book).toBeLessThan(quiet)
  })

  it('gives forcing moves a shorter beat than quiet committal ones', () => {
    const strike = replyPresentationDelayMs(
      ctx({ move: { san: 'Bxf7+', captured: 'p', to: 'f7' } }),
    )
    const quiet = replyPresentationDelayMs(ctx({}))
    expect(strike).toBeLessThan(quiet)
  })

  it('scales with the rival temperament (thinkTimeMs)', () => {
    const brisk = replyPresentationDelayMs(ctx({ thinkTimeMs: 420 }))
    const deliberate = replyPresentationDelayMs(ctx({ thinkTimeMs: 1800 }))
    expect(brisk).toBeLessThan(deliberate)
  })

  it('varies with the rng so pauses never feel canned, within bounds', () => {
    const low = replyPresentationDelayMs(ctx({ rng: fixedRng(0) }))
    const high = replyPresentationDelayMs(ctx({ rng: fixedRng(0.999) }))
    expect(low).toBeLessThan(high)
    expect(low).toBeGreaterThanOrEqual(90)
    expect(high).toBeLessThanOrEqual(1500)
  })
})
