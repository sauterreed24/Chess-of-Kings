import { describe, expect, it } from 'vitest'
import { setTopBarInertForLab } from './labModal'

describe('setTopBarInertForLab', () => {
  it('keeps the top bar interactive so Title / Chapters / Duel can leave the lab', () => {
    const topBar = document.createElement('header')
    topBar.className = 'top-bar'
    setTopBarInertForLab(topBar, true)
    expect(topBar.inert).toBe(false)
    expect(topBar.hasAttribute('inert')).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(true)

    setTopBarInertForLab(topBar, false)
    expect(topBar.inert).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(false)
  })
})
