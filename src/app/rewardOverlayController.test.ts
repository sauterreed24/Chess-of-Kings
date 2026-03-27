import { describe, expect, it, vi } from 'vitest'
import { createRewardOverlayController } from './rewardOverlayController'

describe('createRewardOverlayController', () => {
  it('open runs cleanup from previous open before replacing content', () => {
    const el = document.createElement('div')
    el.classList.add('hidden')
    const c = createRewardOverlayController(el)
    const first = vi.fn()
    const second = vi.fn()
    c.open('<p>a</p>', undefined, first)
    expect(c.isOpen()).toBe(true)
    c.open('<p>b</p>', undefined, second)
    expect(first).toHaveBeenCalledTimes(1)
    expect(el.innerHTML).toContain('b')
  })

  it('close runs cleanup and hides', () => {
    const el = document.createElement('div')
    const cleanup = vi.fn()
    const c = createRewardOverlayController(el)
    c.open('<p>x</p>', undefined, cleanup)
    expect(el.getAttribute('aria-hidden')).toBe('false')
    c.close()
    expect(cleanup).toHaveBeenCalled()
    expect(c.isOpen()).toBe(false)
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.innerHTML).toBe('')
  })

  it('replaceInner preserves cleanup until close', () => {
    const el = document.createElement('div')
    const cleanup = vi.fn()
    const c = createRewardOverlayController(el)
    c.setCleanup(cleanup)
    c.replaceInner('<p>step</p>')
    c.reveal()
    expect(c.isOpen()).toBe(true)
    c.close()
    expect(cleanup).toHaveBeenCalled()
  })

  it('setCleanup replaces prior cleanup', () => {
    const el = document.createElement('div')
    const a = vi.fn()
    const b = vi.fn()
    const c = createRewardOverlayController(el)
    c.setCleanup(a)
    c.setCleanup(b)
    expect(a).toHaveBeenCalledTimes(1)
    c.close()
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('focuses first control on open and restores focus on close', async () => {
    const trigger = document.createElement('button')
    trigger.id = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()

    const el = document.createElement('div')
    el.classList.add('hidden')
    document.body.appendChild(el)
    const c = createRewardOverlayController(el)
    c.open('<button type="button" id="inner">OK</button>')

    await vi.waitFor(() => expect(document.activeElement?.id).toBe('inner'))

    c.close()
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('trigger'))

    trigger.remove()
    el.remove()
  })

  it('keeps original restore target when open is called again without close', async () => {
    const trigger = document.createElement('button')
    trigger.id = 'outer'
    document.body.appendChild(trigger)
    trigger.focus()

    const el = document.createElement('div')
    el.classList.add('hidden')
    document.body.appendChild(el)
    const c = createRewardOverlayController(el)
    c.open('<p>step one</p>')
    c.open('<button type="button" id="inner">OK</button>')
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('inner'))
    c.close()
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('outer'))

    trigger.remove()
    el.remove()
  })
})
