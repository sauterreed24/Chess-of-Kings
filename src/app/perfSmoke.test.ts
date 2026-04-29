/**
 * Perf smoke: 500 board-redraw cycles in jsdom must complete under a
 * generous wall-time threshold. The threshold is deliberately loose
 * (CI runners vary wildly) -- the test exists to catch accidental
 * O(n^2) DOM writes, not to gate on absolute milliseconds.
 *
 * Real-world budget on an iPhone 13 Pro Max via Safari is much tighter,
 * but jsdom layout is far slower than a real browser. We assert that
 * 500 redraws stay under 5 seconds; a regression that broke memoization
 * would push this into 15-30 seconds easily.
 */
import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { BoardView } from '../chess/boardView'

describe('BoardView redraw perf smoke', () => {
  it('500 redraws after a real cycle stays under a generous threshold', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    const ch = new Chess()
    /* Prime the redraw signature cache once. */
    view.draw(ch, null, { mode: 'free' })

    const t0 = performance.now()
    for (let i = 0; i < 500; i++) {
      /* Alternate two positions to force the diff path on every iter. */
      if (i % 2 === 0) ch.move({ from: 'e2', to: 'e4' })
      else ch.undo()
      view.draw(ch, null, { mode: 'free' })
    }
    const elapsed = performance.now() - t0

    expect(elapsed).toBeLessThan(5000)

    root.remove()
  })

  it('repeatedly drawing the same position is fast (memoization is intact)', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    const ch = new Chess()
    view.draw(ch, null, { mode: 'free' })

    const t0 = performance.now()
    for (let i = 0; i < 500; i++) view.draw(ch, null, { mode: 'free' })
    const sameElapsed = performance.now() - t0

    const t1 = performance.now()
    for (let i = 0; i < 500; i++) {
      if (i % 2 === 0) ch.move({ from: 'e2', to: 'e4' })
      else ch.undo()
      view.draw(ch, null, { mode: 'free' })
    }
    const alternatingElapsed = performance.now() - t1

    /* Same position 500 times should be much faster than alternating
     * positions (every cell hits the lastPieceSig early-return). */
    expect(sameElapsed).toBeLessThan(4000)
    expect(sameElapsed).toBeLessThan(alternatingElapsed * 0.88)

    root.remove()
  })
})
