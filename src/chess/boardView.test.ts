import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { BoardView } from './boardView'

describe('BoardView keyboard navigation', () => {
  it('moves focus with arrow keys in screen/DOM order', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const moves: { from: string; to: string }[] = []
    const view = new BoardView({
      root,
      orientation: 'w',
      onMove(from, to) {
        moves.push({ from, to })
      },
    })
    const chess = new Chess()
    view.draw(chess, null, { mode: 'free' })

    const e4 = root.querySelector<HTMLButtonElement>('[data-square="e4"]')
    const e5 = root.querySelector<HTMLButtonElement>('[data-square="e5"]')
    expect(e4 && e5).toBeTruthy()
    e4!.focus()
    expect(document.activeElement).toBe(e4)

    e4!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    const e5Focused = document.activeElement === e5
    expect(e5Focused).toBe(true)

    e5!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(e4)

    e4!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement?.getAttribute('data-square')).toBe('f4')

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
})
