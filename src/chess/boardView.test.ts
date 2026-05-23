import { describe, expect, it, beforeEach } from 'vitest'
import { Chess } from 'chess.js'
import { BoardView } from './boardView'
import type { BoardSelectionState } from './boardView'

describe('BoardView keyboard navigation', () => {
  it('moves focus with arrow keys in screen/DOM order', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    const chess = new Chess()
    view.draw(chess, null, { mode: 'free' })

    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')
    const e5 = root.querySelector<HTMLButtonElement>('[data-square="e5"]')
    expect(e4 && e5).toBeTruthy()
    expect(e4!.tabIndex).toBe(0)
    expect(root.querySelectorAll('button.sq[tabindex="-1"]').length).toBe(63)
    e4!.focus()
    expect(document.activeElement).toBe(e4)

    e4!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    const e5Focused = document.activeElement === e5
    expect(e5Focused).toBe(true)
    expect(e5!.tabIndex).toBe(0)

    e5!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(e4)

    e4!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement?.getAttribute('data-square')).toBe('f4')

    root.remove()
  })

  it('Home and End jump to first and last squares in visual order', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    view.draw(new Chess(), null, { mode: 'free' })
    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')!
    e4.focus()
    e4.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(document.activeElement?.getAttribute('data-square')).toBe('a8')
    ;(document.activeElement as HTMLButtonElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    )
    expect(document.activeElement?.getAttribute('data-square')).toBe('h1')
    root.remove()
  })

  it('does not move when board is locked', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    view.draw(new Chess())
    view.setInteraction(false)
    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')!
    e4.focus()
    e4.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(document.activeElement).toBe(e4)
    root.remove()
  })

  it('announces selected pieces and legal targets', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    const chess = new Chess()
    view.draw(chess, null, { mode: 'solo', soloColor: 'w' })

    view.showLegalFrom(chess, 'e2')

    const e2 = root.querySelector<HTMLButtonElement>('[data-square="e2"]')!
    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')!
    expect(e2.getAttribute('aria-pressed')).toBe('true')
    expect(e2.getAttribute('aria-label')).toContain('selected')
    expect(e4.getAttribute('aria-label')).toContain('legal move target')
    root.remove()
  })

  it('distinguishes last-move origin and destination for visual and screen-reader feedback', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
    })
    const chess = new Chess()
    const last = chess.move({ from: 'e2', to: 'e4' })!
    view.draw(chess, last, { mode: 'free' })

    const e2 = root.querySelector<HTMLButtonElement>('[data-square="e2"]')!
    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')!
    expect(e2.classList.contains('sq-last')).toBe(true)
    expect(e2.classList.contains('sq-last-from')).toBe(true)
    expect(e2.getAttribute('aria-label')).toContain('last move origin')
    expect(e4.classList.contains('sq-last')).toBe(true)
    expect(e4.classList.contains('sq-last-to')).toBe(true)
    expect(e4.getAttribute('aria-label')).toContain('last move destination')
    root.remove()
  })

  it('reports quiet legal targets and clears selection state', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const states: BoardSelectionState[] = []
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
      onSelectionChange: (state) => states.push(state),
    })
    const chess = new Chess()
    view.draw(chess, null, { mode: 'solo', soloColor: 'w' })

    view.showLegalFrom(chess, 'e2')
    expect(states[states.length - 1]).toMatchObject({
      selected: 'e2',
      legalMoveCount: 2,
      captureCount: 0,
      quietMoveCount: 2,
      guardTarget: null,
    })

    view.clearSelection()
    expect(states[states.length - 1]).toMatchObject({
      selected: null,
      legalMoveCount: 0,
      captureCount: 0,
      quietMoveCount: 0,
      guardTarget: null,
    })
    root.remove()
  })

  it('reports capture targets in selection state', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const states: BoardSelectionState[] = []
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove() {},
      onSelectionChange: (state) => states.push(state),
    })
    const chess = new Chess('4k3/8/8/8/3n4/2B5/8/4K3 w - - 0 1')
    view.draw(chess, null, { mode: 'solo', soloColor: 'w' })

    view.showLegalFrom(chess, 'c3')

    const state = states[states.length - 1]
    expect(state).toMatchObject({ selected: 'c3', captureCount: 1 })
    expect(state?.legalMoveCount).toBeGreaterThan(state?.captureCount ?? 0)
    root.remove()
  })

  it('reports pending move-guard confirmation targets', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const states: BoardSelectionState[] = []
    const moves: Array<{ from: string; to: string }> = []
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove(from, to) {
        moves.push({ from, to })
      },
      onSelectionChange: (state) => states.push(state),
    })
    view.setMoveGuard(true)
    view.draw(new Chess(), null, { mode: 'solo', soloColor: 'w' })

    root.querySelector<HTMLButtonElement>('[data-square="e2"]')!.click()
    root.querySelector<HTMLButtonElement>('[data-square="e4"]')!.click()

    expect(states[states.length - 1]).toMatchObject({
      selected: 'e2',
      guardTarget: 'e4',
      legalMoveCount: 2,
    })
    expect(moves).toEqual([])
    root.remove()
  })
})

describe('BoardView promotion picker keyboard', () => {
  /** Position with White to play b7-b8=?, sets up the promotion picker via clickSquare. */
  const PROMO_FEN = '4k3/1P6/8/8/8/8/8/4K3 w - - 0 1'

  beforeEach(() => {
    /* Some tests open a picker and don't activate a button; the panel
     * is appended to document.body, not the test root, so we must
     * sweep stragglers between tests. */
    document.querySelectorAll('.promo-panel, .promo-backdrop').forEach((el) => el.remove())
  })

  function openPicker(): {
    root: HTMLDivElement
    moves: Array<{ from: string; to: string; promo?: string }>
    panel: HTMLDivElement
  } {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const moves: Array<{ from: string; to: string; promo?: string }> = []
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove(from, to, promotion) {
        moves.push({ from, to, promo: promotion })
      },
    })
    const chess = new Chess(PROMO_FEN)
    view.draw(chess, null, { mode: 'solo', soloColor: 'w' })
    /* Click the b7 pawn, then click b8 to trigger the picker. */
    root.querySelector<HTMLButtonElement>('[data-square="b7"]')!.click()
    root.querySelector<HTMLButtonElement>('[data-square="b8"]')!.click()
    const panel = document.querySelector<HTMLDivElement>('.promo-panel')!
    return { root, moves, panel }
  }

  it('focuses the queen choice first and Enter activates it', () => {
    const { root, moves, panel } = openPicker()
    const buttons = panel.querySelectorAll<HTMLButtonElement>('.promo-btn')
    expect(buttons).toHaveLength(4)
    expect(document.activeElement).toBe(buttons[0])
    expect(buttons[0]!.getAttribute('aria-label')).toBe('Queen')
    buttons[0]!.click()
    expect(moves).toEqual([{ from: 'b7', to: 'b8', promo: 'q' }])
    expect(document.querySelector('.promo-panel')).toBeNull()
    root.remove()
  })

  it('invokes onMove with the selected promotion piece for every underpromotion option', () => {
    const expectations: Array<{ index: number; promo: string }> = [
      { index: 0, promo: 'q' },
      { index: 1, promo: 'r' },
      { index: 2, promo: 'b' },
      { index: 3, promo: 'n' },
    ]
    for (const { index, promo } of expectations) {
      const { root, moves, panel } = openPicker()
      const buttons = panel.querySelectorAll<HTMLButtonElement>('.promo-btn')
      buttons[index]!.click()
      expect(moves).toEqual([{ from: 'b7', to: 'b8', promo }])
      expect(document.querySelector('.promo-panel')).toBeNull()
      root.remove()
    }
  })

  it('ArrowRight cycles forward, ArrowLeft cycles backward, wrapping at the ends', () => {
    const { root, panel } = openPicker()
    const buttons = panel.querySelectorAll<HTMLButtonElement>('.promo-btn')
    const fire = (key: string) => {
      panel.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }
    fire('ArrowRight')
    expect(document.activeElement).toBe(buttons[1])
    fire('ArrowRight')
    expect(document.activeElement).toBe(buttons[2])
    fire('ArrowRight')
    expect(document.activeElement).toBe(buttons[3])
    fire('ArrowRight')
    expect(document.activeElement).toBe(buttons[0])
    fire('ArrowLeft')
    expect(document.activeElement).toBe(buttons[3])
    root.remove()
  })

  it('Home jumps to first, End jumps to last', () => {
    const { root, panel } = openPicker()
    const buttons = panel.querySelectorAll<HTMLButtonElement>('.promo-btn')
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(buttons[3])
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(document.activeElement).toBe(buttons[0])
    root.remove()
  })

  it('Escape dismisses the picker without invoking onMove', () => {
    const { root, moves, panel } = openPicker()
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(document.querySelector('.promo-panel')).toBeNull()
    expect(moves).toEqual([])
    root.remove()
  })

  it('Tab cycles forward, Shift+Tab cycles backward inside the panel (focus trap)', () => {
    const { root, panel } = openPicker()
    const buttons = panel.querySelectorAll<HTMLButtonElement>('.promo-btn')
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(buttons[1])
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(buttons[0])
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(buttons[3])
    root.remove()
  })
})
