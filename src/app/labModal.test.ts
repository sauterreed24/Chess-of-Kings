import { describe, expect, it } from 'vitest'
import { setTopBarInertForLab } from './labModal'

describe('setTopBarInertForLab', () => {
  it('marks the top bar inert and aria-hidden while lab is active', () => {
    const topBar = document.createElement('header')
    topBar.className = 'top-bar'
    setTopBarInertForLab(topBar, true)
    expect(topBar.inert).toBe(true)
    expect(topBar.getAttribute('aria-hidden')).toBe('true')

    setTopBarInertForLab(topBar, false)
    expect(topBar.inert).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
  })
})
