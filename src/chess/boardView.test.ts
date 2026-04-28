import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { BoardView } from './boardView'

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
})
