import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountApp } from './mountApp'
import { hasSave } from './storage'

describe('mounted duel dossier', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('does not create a resumable save just by rendering the fresh title screen', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    expect(hasSave()).toBe(false)
    expect(app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.disabled).toBe(false)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()

    expect(hasSave()).toBe(true)
  })

  it('keeps preference toggles accessible even when persistence fails', () => {
    localStorage.setItem('cok-sfx-enabled', '0')
    localStorage.setItem('cok-move-guard', '1')
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    const sound = app.querySelector<HTMLButtonElement>('#btn-sfx')!
    const moveGuard = app.querySelector<HTMLButtonElement>('#btn-move-guard')!
    expect(sound.textContent).toBe('Sound: Off')
    expect(sound.getAttribute('aria-pressed')).toBe('false')
    expect(sound.getAttribute('aria-label')).toBe('Sound effects are off')
    expect(moveGuard.textContent).toBe('Move Guard: On')
    expect(moveGuard.getAttribute('aria-pressed')).toBe('true')
    expect(moveGuard.getAttribute('aria-label')).toBe('Move Guard is on')

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'QuotaExceededError')
    })
    expect(() => sound.click()).not.toThrow()
    expect(sound.textContent).toBe('Sound: On')
    expect(sound.getAttribute('aria-pressed')).toBe('true')
    expect(sound.getAttribute('aria-label')).toBe('Sound effects are on')
    expect(() => moveGuard.click()).not.toThrow()
    expect(moveGuard.textContent).toBe('Move Guard: Off')
    expect(moveGuard.getAttribute('aria-pressed')).toBe('false')
    expect(moveGuard.getAttribute('aria-label')).toBe('Move Guard is off')
  })

  it('keeps duel launch controls in the first dossier section without duplicate ids', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('.duel-row')?.click()

    const launch = app.querySelector('.duel-launch')
    const panelText = app.querySelector('#duel-panel')?.textContent ?? ''
    expect(launch).not.toBeNull()
    expect(launch?.querySelector('#btn-start-duel')).not.toBeNull()
    expect(app.querySelectorAll('#btn-start-duel')).toHaveLength(1)
    expect(app.querySelectorAll('#duel-variant')).toHaveLength(1)
    expect(app.querySelectorAll('#btn-preview-skin')).toHaveLength(1)
    expect(panelText.indexOf('Start Duel')).toBeLessThan(panelText.indexOf('Duel Analytics'))
  })

  it('closes the simulation layer before top-nav screen changes', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn[data-idx="0"]')?.click()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)

    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()

    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(false)
    expect(app.querySelector('#screen-duel')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#btn-duel')?.getAttribute('aria-current')).toBe('page')
  })

  it('renders a duel briefing instead of stale campaign text after starting from a lab session', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn[data-idx="0"]')?.click()
    expect(app.querySelector('#narrative-body')?.textContent).toContain('Rain threads the window')

    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('.duel-row')?.click()
    app.querySelector<HTMLButtonElement>('#btn-start-duel')?.click()

    const narrative = app.querySelector('#narrative-body')?.textContent ?? ''
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    expect(app.querySelector('#play-chapter-label')?.textContent).toContain('Duel Archive')
    expect(narrative).toContain('No move cap')
    expect(narrative).not.toContain('Rain threads the window')
    expect(app.querySelector<HTMLButtonElement>('#btn-next')?.disabled).toBe(true)
    expect(app.querySelector<HTMLButtonElement>('#btn-next')?.classList.contains('hidden')).toBe(true)
  })

  it('restores a reloaded duel session with duel briefing copy', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('.duel-row')?.click()
    app.querySelector<HTMLButtonElement>('#btn-start-duel')?.click()
    window.dispatchEvent(new Event('beforeunload'))

    document.body.innerHTML = ''
    const reloaded = document.createElement('div')
    document.body.appendChild(reloaded)
    mountApp(reloaded)

    const narrative = reloaded.querySelector('#narrative-body')?.textContent ?? ''
    expect(reloaded.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    expect(reloaded.querySelector('#play-chapter-label')?.textContent).toContain('Duel Archive')
    expect(reloaded.querySelector('#scene-tag')?.textContent).toContain('duel')
    expect(narrative).toContain('No move cap')
    expect(narrative).not.toContain('Make at least four moves as White')
    expect(reloaded.querySelector('#recovery-controls')?.classList.contains('hidden')).toBe(false)
  })
})
