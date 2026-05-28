import { describe, expect, it, vi } from 'vitest'
import { createFocusTrap, listFocusable } from './focusTrap'

describe('createFocusTrap', () => {
  it('lists visible focusable controls', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    root.innerHTML =
      '<button type="button" id="a">A</button><button type="button" id="b" disabled>B</button><button type="button" id="c">C</button>'
    expect(listFocusable(root).map((el) => el.id)).toEqual(['a', 'c'])
    root.remove()
  })

  it('cycles Tab forward through focusable elements', () => {
    const root = document.createElement('div')
    root.innerHTML = '<button type="button" id="one">1</button><button type="button" id="two">2</button>'
    document.body.appendChild(root)
    const trap = createFocusTrap(root)
    trap.activate()
    root.querySelector<HTMLButtonElement>('#one')!.focus()

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement?.id).toBe('two')

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement?.id).toBe('one')

    trap.deactivate()
    root.remove()
  })

  it('cycles Shift+Tab backward', () => {
    const root = document.createElement('div')
    root.innerHTML = '<button type="button" id="one">1</button><button type="button" id="two">2</button>'
    document.body.appendChild(root)
    const trap = createFocusTrap(root)
    trap.activate()
    root.querySelector<HTMLButtonElement>('#two')!.focus()

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement?.id).toBe('one')

    trap.deactivate()
    root.remove()
  })

  it('deactivate removes the keydown listener', () => {
    const root = document.createElement('div')
    root.innerHTML = '<button type="button" id="one">1</button>'
    document.body.appendChild(root)
    const trap = createFocusTrap(root)
    const spy = vi.spyOn(root, 'removeEventListener')
    trap.activate()
    trap.deactivate()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    root.remove()
  })
})
