import { describe, expect, it, vi, afterEach } from 'vitest'
import { PHONE_LAB_NAV_QUERY, setTopBarInertForLab } from './labModal'

describe('setTopBarInertForLab', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('keeps the top bar interactive so Title / Chapters / Duel can leave the lab', () => {
    const topBar = document.createElement('header')
    topBar.className = 'top-bar'
    setTopBarInertForLab(topBar, true)
    expect(topBar.inert).toBe(false)
    expect(topBar.hasAttribute('inert')).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(true)
    expect(topBar.classList.contains('hidden')).toBe(false)

    setTopBarInertForLab(topBar, false)
    expect(topBar.inert).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(false)
  })

  it('hides the duplicate top nav on phone labs and lets the overlay sheet fill the screen', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === PHONE_LAB_NAV_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }))
    document.body.innerHTML = '<div class="lab-overlay"><div class="lab-overlay__sheet"></div></div>'
    const topBar = document.createElement('header')
    topBar.className = 'top-bar'
    document.body.append(topBar)
    const sheet = document.querySelector<HTMLElement>('.lab-overlay__sheet')!

    setTopBarInertForLab(topBar, true)
    expect(topBar.classList.contains('hidden')).toBe(true)
    expect(topBar.getAttribute('aria-hidden')).toBe('true')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(false)
    expect(sheet.style.top).toBe('0px')
    expect(sheet.style.maxHeight).toBe('100svh')

    setTopBarInertForLab(topBar, false)
    expect(topBar.classList.contains('hidden')).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(sheet.style.top).toBe('')
    expect(sheet.style.maxHeight).toBe('')
  })
})
