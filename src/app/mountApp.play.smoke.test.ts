import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountApp } from './mountApp'
import { hasSave, clearSave, loadSave } from './storage'
import { KEYBOARD_HELP_HEADING } from '../data/strings'

describe('mounted app play smoke (maximum-effort flows)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    document.documentElement.classList.remove('force-reduced-motion')
    vi.restoreAllMocks()
  })

  function boot() {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)
    return app
  }

  it('inerts top bar while lab is open and restores on exit', () => {
    const app = boot()
    const topBar = app.querySelector<HTMLElement>('.top-bar')!

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    expect(topBar.inert).toBe(true)
    expect(topBar.getAttribute('aria-hidden')).toBe('true')

    app.querySelector<HTMLButtonElement>('#btn-vestibule')?.click()
    expect(topBar.inert).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
  })

  it('shows chapter progress on the chronicle index', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()

    const progress = app.querySelector('#chapter-progress')
    expect(progress?.textContent).toMatch(/\d+ of \d+ ages inscribed/)
  })

  it('opens keyboard help from title screen and lab bar', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-title-kbdhelp')?.click()
    expect(app.querySelector('#reward-overlay')?.textContent).toContain(KEYBOARD_HELP_HEADING)
    app.querySelector<HTMLButtonElement>('#btn-kbdhelp-close')?.click()
    expect(app.querySelector('#reward-overlay')?.classList.contains('hidden')).toBe(true)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    app.querySelector<HTMLButtonElement>('#btn-lab-kbdhelp')?.click()
    expect(app.querySelector('#reward-overlay')?.classList.contains('hidden')).toBe(false)
  })

  it('gates New chronicle behind confirm when a save exists', async () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    expect(hasSave()).toBe(true)

    app.querySelector<HTMLButtonElement>('#btn-title')?.click()
    app.querySelector<HTMLButtonElement>('#btn-new')?.click()

    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#confirm-overlay')?.textContent).toContain('Begin a new chronicle')

    app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
    await Promise.resolve()
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(true)
    expect(hasSave()).toBe(true)

    app.querySelector<HTMLButtonElement>('#btn-new')?.click()
    app.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.click()
    await Promise.resolve()
    const fresh = loadSave()
    expect(fresh?.chapterIndex).toBe(0)
    expect(fresh?.rankPoints).toBe(0)
    expect(fresh?.completedSceneIds).toEqual([])
  })

  it('keeps title and lab preference toggles in sync', () => {
    const app = boot()
    expect(app.querySelector('#btn-title-sfx')?.textContent).toBe('Sound: On')

    app.querySelector<HTMLButtonElement>('#btn-title-sfx')?.click()
    expect(app.querySelector('#btn-title-sfx')?.textContent).toBe('Sound: Off')

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    expect(app.querySelector('#btn-sfx')?.textContent).toBe('Sound: Off')
  })

  it('ignores untrusted programmatic clicks for the ambient sound unlock', () => {
    let constructed = 0
    let resumed = 0
    const original = Object.getOwnPropertyDescriptor(window, 'AudioContext')
    class FakeAudioContext {
      currentTime = 0
      state: 'suspended' | 'running' = 'suspended'
      destination = {}

      constructor() {
        constructed += 1
      }

      resume() {
        resumed += 1
        this.state = 'running'
        return Promise.resolve()
      }

      createOscillator() {
        return {
          type: 'sine' as OscillatorType,
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        }
      }

      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        }
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    })
    try {
      const app = boot()
      expect(constructed).toBe(0)
      app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
      expect(constructed).toBe(0)
      expect(resumed).toBe(0)
    } finally {
      if (original) Object.defineProperty(window, 'AudioContext', original)
      else delete (window as typeof window & { AudioContext?: unknown }).AudioContext
    }
  })

  it('mirrors board guide into the mobile tips drawer during play', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    const guide = app.querySelector<HTMLParagraphElement>('#board-guide')!
    const mobile = app.querySelector<HTMLParagraphElement>('#mobile-board-guide')!
    expect(guide.textContent?.length).toBeGreaterThan(0)
    expect(mobile.textContent).toBe(guide.textContent)
  })

  it('shows storage failure banner when streak persist fails at boot', () => {
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === 'cok-streak') throw new DOMException('blocked', 'QuotaExceededError')
      return original.call(this, key, value)
    })

    const app = boot()
    expect(app.querySelector('#storage-failure-banner')?.classList.contains('hidden')).toBe(false)
  })

  it('applies reduce-motion override from title settings', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-title-motion')?.click()
    expect(document.documentElement.classList.contains('force-reduced-motion')).toBe(true)
    expect(localStorage.getItem('cok-reduce-motion')).toBe('1')

    app.querySelector<HTMLButtonElement>('#btn-title-motion')?.click()
    expect(document.documentElement.classList.contains('force-reduced-motion')).toBe(false)
  })

  it('Escape dismisses confirm via global shortcut', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-title')?.click()
    app.querySelector<HTMLButtonElement>('#btn-new')?.click()

    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(true)
  })

  it('resets chronicle state on confirmed new game', async () => {
    clearSave()
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-title')?.click()

    app.querySelector<HTMLButtonElement>('#btn-new')?.click()
    app.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.click()
    await Promise.resolve()

    const fresh = loadSave()
    expect(fresh?.chapterIndex).toBe(0)
    expect(fresh?.rankPoints).toBe(0)
    expect(app.querySelector('#screen-chapters')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#chapter-progress')?.textContent).toMatch(/1 of/)
  })
})
