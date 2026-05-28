import { describe, expect, it, vi } from 'vitest'
import { createConfirmDialogController } from './confirmDialogController'

describe('createConfirmDialogController', () => {
  it('resolves true when confirm is clicked', async () => {
    const el = document.createElement('div')
    el.classList.add('hidden')
    document.body.appendChild(el)
    const hook = vi.fn()
    const c = createConfirmDialogController(el, { onOpenChange: hook })

    const p = c.open({ title: 'Leave passage?', message: 'Your simulation will be replaced.' })
    expect(hook).toHaveBeenCalledWith(true)
    await vi.waitFor(() => expect(el.querySelector('#btn-confirm-ok')).toBeTruthy())

    el.querySelector<HTMLButtonElement>('#btn-confirm-ok')!.click()
    await expect(p).resolves.toBe(true)
    expect(c.isOpen()).toBe(false)

    el.remove()
  })

  it('resolves false when cancel is clicked and restores focus', async () => {
    const trigger = document.createElement('button')
    trigger.id = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()

    const el = document.createElement('div')
    el.classList.add('hidden')
    document.body.appendChild(el)
    const c = createConfirmDialogController(el)

    const p = c.open({ title: 'New chronicle?', message: 'This clears your save.' })
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('btn-confirm-cancel'))

    el.querySelector<HTMLButtonElement>('#btn-confirm-cancel')!.click()
    await expect(p).resolves.toBe(false)
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('trigger'))

    trigger.remove()
    el.remove()
  })

  it('resolves false on Escape', async () => {
    const el = document.createElement('div')
    el.classList.add('hidden')
    document.body.appendChild(el)
    const c = createConfirmDialogController(el)

    const p = c.open({ title: 'Confirm', message: 'Sure?' })
    await vi.waitFor(() => expect(c.isOpen()).toBe(true))

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await expect(p).resolves.toBe(false)

    el.remove()
  })
})
