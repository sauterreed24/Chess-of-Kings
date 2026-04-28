import { describe, expect, it } from 'vitest'
import { createAnnouncer } from './announcer'

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('createAnnouncer', () => {
  it('writes the message into the live region after a microtask', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const a = createAnnouncer(el)
    a.say('Match won against Amara')
    await flushMicrotasks()
    expect(el.textContent).toBe('Match won against Amara')
  })

  it('clears the region between writes so repeat messages re-announce', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const a = createAnnouncer(el)
    a.say('Rewards inscribed.')
    await flushMicrotasks()
    expect(el.textContent).toBe('Rewards inscribed.')
    a.say('Rewards inscribed.')
    /* Synchronously the region is empty (forces AT re-announcement); the
     * microtask then writes the same string back. */
    expect(el.textContent).toBe('')
    await flushMicrotasks()
    expect(el.textContent).toBe('Rewards inscribed.')
  })

  it('ignores empty messages', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    el.textContent = 'previous'
    const a = createAnnouncer(el)
    a.say('')
    await flushMicrotasks()
    expect(el.textContent).toBe('previous')
  })

  it('clear() empties the region synchronously', () => {
    const el = document.createElement('div')
    el.textContent = 'lingering'
    const a = createAnnouncer(el)
    a.clear()
    expect(el.textContent).toBe('')
  })
})
