/**
 * DOM-level coverage for the piece-movement physics in {@link BoardView}.
 *
 * jsdom implements neither layout nor the Web Animations API, so we stub
 * `getBoundingClientRect` (to hand the carry real geometry) and
 * `Element.prototype.animate` (to resolve `onfinish` on a microtask). With
 * those in place we can assert the orchestration: fly sprites are spawned and
 * cleaned up, the destination piece is hidden then revealed, captures dissolve
 * on the right square, castling carries the rook too, and the motion gates off
 * under reduced-motion.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import { BoardView } from './boardView'

const FILES = 'abcdefgh'
let originalRect: typeof Element.prototype.getBoundingClientRect
let originalAnimate: typeof Element.prototype.animate | undefined

beforeEach(() => {
  originalRect = Element.prototype.getBoundingClientRect
  originalAnimate = Element.prototype.animate
  Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
    const sq = (this as HTMLElement).dataset?.square
    let x = 0
    let y = 0
    if (sq) {
      x = FILES.indexOf(sq[0]!) * 60
      y = (8 - Number(sq[1])) * 60
    }
    return { width: 60, height: 60, left: x, top: y, right: x + 60, bottom: y + 60, x, y, toJSON() {} } as DOMRect
  }
  Element.prototype.animate = function (this: Element): Animation {
    const anim = { onfinish: null as null | (() => void), cancel() {}, finish() {} }
    queueMicrotask(() => anim.onfinish?.())
    return anim as unknown as Animation
  }
})

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalRect
  if (originalAnimate) Element.prototype.animate = originalAnimate
  document.documentElement.classList.remove('perf-lean')
  document.querySelectorAll('.piece-fly, .promo-panel, .promo-backdrop').forEach((el) => el.remove())
  // @ts-expect-error optional test shim
  delete window.matchMedia
})

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function mount(fen?: string): { view: BoardView; root: HTMLDivElement; chess: Chess } {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const view = new BoardView({ root, orientation: 'w', onMove() {} })
  const chess = fen ? new Chess(fen) : new Chess()
  view.draw(chess, null, { mode: 'free' })
  return { view, root, chess }
}

describe('BoardView piece-movement physics', () => {
  it('carries the mover, hides the destination during flight, then reveals + cleans up', async () => {
    const { view, root, chess } = mount()
    view.setSkin('obsidian-neon')
    const move = chess.move({ from: 'e2', to: 'e4' }) as Move
    view.draw(chess, move, { mode: 'free' })

    const flies = document.querySelectorAll<HTMLElement>('.piece-fly')
    expect(flies).toHaveLength(1)
    // The latent skin bug: the carried sprite must inherit the active skin.
    expect(flies[0]!.dataset.skin).toBe('obsidian-neon')

    const dest = root.querySelector<HTMLElement>('[data-square="e4"] .piece')!
    expect(dest.classList.contains('piece--fly-pending')).toBe(true)

    await flush()
    expect(document.querySelectorAll('.piece-fly')).toHaveLength(0)
    expect(dest.classList.contains('piece--fly-pending')).toBe(false)
    root.remove()
  })

  it('spawns a dissolving capture sprite on the destination of a standard capture', async () => {
    const { view, root, chess } = mount('4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1')
    const move = chess.move({ from: 'e4', to: 'd5' }) as Move
    expect(move.captured).toBe('p')
    view.draw(chess, move, { mode: 'free' })

    expect(document.querySelectorAll('.piece-capture')).toHaveLength(1)
    expect(document.querySelectorAll('.piece-fly:not(.piece-capture)')).toHaveLength(1)

    await flush()
    expect(document.querySelectorAll('.piece-fly')).toHaveLength(0)
    root.remove()
  })

  it('places the capture sprite on the taken pawn for en-passant, not on the destination', async () => {
    const { view, root, chess } = mount('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1')
    const move = chess.move({ from: 'e5', to: 'd6' }) as Move
    expect(move.flags).toContain('e')
    view.draw(chess, move, { mode: 'free' })

    const capture = document.querySelector<HTMLElement>('.piece-capture')!
    // d5 cell stub center: file 'd' => 3*60+30 = 210, rank 5 => (8-5)*60+30 = 210.
    expect(capture.style.transform).toContain('translate(210px, 210px)')
    root.remove()
  })

  it('carries both king and rook when castling', () => {
    const { view, root, chess } = mount('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const move = chess.move({ from: 'e1', to: 'g1' }) as Move
    expect(move.flags).toContain('k')
    view.draw(chess, move, { mode: 'free' })

    // King (e1->g1) and rook (h1->f1) both fly.
    expect(document.querySelectorAll('.piece-fly')).toHaveLength(2)
    expect(root.querySelector('[data-square="g1"] .piece')!.classList.contains('piece--fly-pending')).toBe(true)
    expect(root.querySelector('[data-square="f1"] .piece')!.classList.contains('piece--fly-pending')).toBe(true)
    root.remove()
  })

  it('skips the capture sprite under the lean profile but still carries the mover', () => {
    document.documentElement.classList.add('perf-lean')
    const { view, root, chess } = mount('4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1')
    const move = chess.move({ from: 'e4', to: 'd5' }) as Move
    view.draw(chess, move, { mode: 'free' })

    expect(document.querySelectorAll('.piece-capture')).toHaveLength(0)
    expect(document.querySelectorAll('.piece-fly')).toHaveLength(1)
    root.remove()
  })

  it('does not animate when prefers-reduced-motion is set', () => {
    // @ts-expect-error optional test shim
    window.matchMedia = () => ({ matches: true })
    const { view, root, chess } = mount()
    const move = chess.move({ from: 'e2', to: 'e4' }) as Move
    view.draw(chess, move, { mode: 'free' })

    expect(document.querySelectorAll('.piece-fly')).toHaveLength(0)
    expect(root.querySelector('[data-square="e4"] .piece')!.classList.contains('piece--fly-pending')).toBe(false)
    root.remove()
  })

  it('cancels a stale flight cleanup when a new draw supersedes it', async () => {
    const { view, root, chess } = mount()
    const m1 = chess.move({ from: 'e2', to: 'e4' }) as Move
    view.draw(chess, m1, { mode: 'free' })
    // A second draw lands before the first flight's onfinish microtask runs.
    const m2 = chess.move({ from: 'e7', to: 'e5' }) as Move
    view.draw(chess, m2, { mode: 'free' })

    await flush()
    // No orphaned sprites and no permanently-hidden pieces.
    expect(document.querySelectorAll('.piece-fly')).toHaveLength(0)
    expect(root.querySelectorAll('.piece--fly-pending')).toHaveLength(0)
    expect(root.querySelector('[data-square="e5"] .piece')).toBeTruthy()
    root.remove()
  })
})
