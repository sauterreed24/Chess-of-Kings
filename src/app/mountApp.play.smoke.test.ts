import { describe, expect, it, beforeEach, vi } from 'vitest'
import { Chess } from 'chess.js'
import { mountApp } from './mountApp'
import { hasSave, clearSave, loadSave } from './storage'
import { CONFIRM_COPY, KEYBOARD_HELP_HEADING } from '../data/strings'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import { pickDailyCalculus } from './session/dailyCalculus'

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

  it('inerts shell chrome while lab is open except the lab overlay', { timeout: 10000 }, () => {
    const app = boot()
    const topBar = app.querySelector<HTMLElement>('.top-bar')!
    const title = app.querySelector<HTMLElement>('#screen-title')!

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    expect(topBar.inert).toBe(true)
    expect(title.inert).toBe(true)
    expect(app.querySelector('#lab-overlay')?.hasAttribute('inert')).toBe(false)
    expect(app.querySelector('#btn-title')?.closest('.top-bar')?.hasAttribute('inert')).toBe(true)
  })

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
    expect(app.querySelector('#reward-overlay .reward-hero')).not.toBeNull()
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

  it('keeps the blocked Advance hint visible on board objectives', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    const next = app.querySelector<HTMLButtonElement>('#btn-next')!
    const tag = app.querySelector<HTMLElement>('#scene-tag')!
    for (let i = 0; i < 8 && !tag.textContent?.startsWith('Calibration'); i += 1) {
      expect(next.disabled).toBe(false)
      next.click()
    }

    expect(tag.textContent).toContain('Calibration')
    expect(next.disabled).toBe(true)
    expect(app.querySelector('.btn-advance-label')?.textContent).toBe('Prove')
    expect(next.getAttribute('aria-label')).toBe('Finish proof')
    expect(app.querySelector('#btn-next-hint')?.textContent).toContain('4 White moves')

    app.querySelector<HTMLButtonElement>('[data-square="e2"]')?.click()
    app.querySelector<HTMLButtonElement>('[data-square="e4"]')?.click()
    expect(app.querySelector('#btn-next-hint')?.textContent).toContain('3 White moves')
  })

  it('reveals active dialogue before advancing to the next passage', async () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    const next = app.querySelector<HTMLButtonElement>('#btn-next')!
    const label = app.querySelector<HTMLSpanElement>('.btn-advance-label')!
    const progress = app.querySelector<HTMLSpanElement>('#scene-progress')!

    expect(label.textContent).toBe('Reveal')
    expect(progress.textContent).toContain('Passage 1')

    next.click()
    expect(label.textContent).toBe('Advance')
    expect(progress.textContent).toContain('Passage 1')
    expect(app.querySelector('.narrative-body--revealed')).not.toBeNull()
    expect(app.querySelector<HTMLElement>('.spoken-char')?.style.animation).toBe('none')
    await Promise.resolve()
    expect(app.querySelector('#live-announcer')?.textContent).toContain('Passage fully revealed')

    next.click()
    expect(progress.textContent).toContain('Passage 2')
  })

  it('lets dialogue finish naturally without announcing an explicit reveal', () => {
    vi.useFakeTimers()
    try {
      const app = boot()
      app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
      app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

      const label = app.querySelector<HTMLSpanElement>('.btn-advance-label')!
      expect(label.textContent).toBe('Reveal')

      vi.advanceTimersByTime(7000)

      expect(label.textContent).toBe('Advance')
      expect(app.querySelector('.narrative-body--revealed')).not.toBeNull()
      expect(app.querySelector('#live-announcer')?.textContent).not.toContain('Passage fully revealed')
    } finally {
      vi.useRealTimers()
    }
  })

  it('anchors the board reveal on desktop so the ledger stays in view', async () => {
    const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    })

    try {
      const app = boot()
      app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
      app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
      const next = app.querySelector<HTMLButtonElement>('#btn-next')!
      const playScreen = app.querySelector<HTMLElement>('#screen-play')!
      for (let i = 0; i < 5; i++) next.click()
      playScreen.scrollTop = 321
      next.click()
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
      expect(playScreen.scrollTop).toBe(0)
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end', behavior: 'smooth' })
    } finally {
      if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll)
      else delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView
      if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia)
      else delete (window as typeof window & { matchMedia?: unknown }).matchMedia
    }
  })

  it('anchors the board reveal on compact viewports to the board stage', async () => {
    const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('700px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    })

    try {
      const app = boot()
      app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
      app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
      const next = app.querySelector<HTMLButtonElement>('#btn-next')!
      for (let i = 0; i < 5; i++) next.click()
      next.click()
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
      const boardStage = app.querySelector<HTMLElement>('#board-stage')!
      expect(scrollIntoView).toHaveBeenCalled()
      const boardCalls = scrollIntoView.mock.calls.filter((args) => {
        const el = scrollIntoView.mock.contexts[scrollIntoView.mock.calls.indexOf(args)] as Element | undefined
        return el === boardStage
      })
      expect(boardCalls.some((args) => args[0]?.block === 'nearest')).toBe(true)
    } finally {
      if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll)
      else delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView
      if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia)
      else delete (window as typeof window & { matchMedia?: unknown }).matchMedia
    }
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

  it('surfaces the Stratarch Rating on the title once rated games exist', () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        chapterIndex: 0,
        sceneIndex: 0,
        lastScreen: 'title',
        ladder: { rating: 845, peak: 870, rated: 6 },
      }),
    )
    const app = boot()
    const rating = app.querySelector<HTMLParagraphElement>('#title-rating')!
    expect(rating.classList.contains('hidden')).toBe(false)
    expect(rating.textContent).toContain('845')
    expect(rating.textContent).toContain('peak 870')
  })

  it('hides the Stratarch Rating until the first rated game', () => {
    clearSave()
    const app = boot()
    const rating = app.querySelector<HTMLParagraphElement>('#title-rating')!
    expect(rating.classList.contains('hidden')).toBe(true)
    expect(rating.textContent).toBe('')
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

  it('hides title and duel from assistive tech while the chronicle index is active', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()

    const title = app.querySelector<HTMLElement>('#screen-title')!
    const chapters = app.querySelector<HTMLElement>('#screen-chapters')!
    const duel = app.querySelector<HTMLElement>('#screen-duel')!
    expect(title.classList.contains('hidden')).toBe(true)
    expect(title.getAttribute('aria-hidden')).toBe('true')
    expect((title as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(duel.classList.contains('hidden')).toBe(true)
    expect(duel.getAttribute('aria-hidden')).toBe('true')
    expect((duel as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(chapters.classList.contains('hidden')).toBe(false)
    expect(chapters.getAttribute('aria-hidden')).toBe('false')
    expect((chapters as HTMLElement & { inert?: boolean }).inert).toBe(false)
  })

  it('hides title and chapters from assistive tech while the duel screen is active', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()

    const title = app.querySelector<HTMLElement>('#screen-title')!
    const chapters = app.querySelector<HTMLElement>('#screen-chapters')!
    const duel = app.querySelector<HTMLElement>('#screen-duel')!
    expect(title.classList.contains('hidden')).toBe(true)
    expect(title.getAttribute('aria-hidden')).toBe('true')
    expect((title as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(chapters.classList.contains('hidden')).toBe(true)
    expect(chapters.getAttribute('aria-hidden')).toBe('true')
    expect((chapters as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(duel.classList.contains('hidden')).toBe(false)
    expect(duel.getAttribute('aria-hidden')).toBe('false')
    expect((duel as HTMLElement & { inert?: boolean }).inert).toBe(false)
  })

  it('gates Daily Calculus behind confirm when a recoverable session exists', async () => {
    const daily = pickDailyCalculus(PLAYABLE_CHAPTERS)
    expect(daily).not.toBeNull()
    const calIdx = PLAYABLE_CHAPTERS[0]!.scenes.findIndex((s) => s.type === 'calibration')
    expect(calIdx).toBeGreaterThanOrEqual(0)
    const chess = new Chess()
    const startFen = chess.fen()
    chess.move('e4')
    const fen = chess.fen()

    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        version: 3,
        chapterIndex: 0,
        sceneIndex: calIdx,
        highestUnlockedChapter: Math.max(daily!.chapterIndex, 0),
        lastScreen: 'title',
        chapter1Complete: false,
        chapter2Complete: false,
        completedSceneIds: [],
        completedPuzzleIds: [],
        stratarchiaUnlocked: false,
        duelUnlockedOpponentIds: [],
        unlockedDuelVariantIds: ['alexion-mentor'],
        codexUnlocks: [],
        titleUnlocks: [],
        chronicleEchoes: [],
        rankPoints: 0,
        cosmetics: {
          unlockedPieceSkins: ['classic-royal'],
          selectedPieceSkin: 'classic-royal',
        },
        tendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
        matchHistory: [],
        rivalMemory: {},
        ladder: { rating: 800, peak: 800, rated: 0 },
        inProgress: {
          mode: 'calibration',
          chapterIndex: 0,
          sceneIndex: calIdx,
          fen,
          history: [startFen, fen],
          sanLog: ['e4'],
          sanQuality: ['good'],
          playerColor: 'w',
          calibrationMoves: 1,
          scriptedMoveIndex: 0,
          sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
        },
      }),
    )

    const app = boot()
    const dailyBtn = app.querySelector<HTMLButtonElement>('#btn-daily-calculus')
    expect(dailyBtn).not.toBeNull()

    dailyBtn!.click()
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#confirm-overlay')?.textContent).toContain(CONFIRM_COPY.dailyCalculus.title)

    app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
    await Promise.resolve()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(false)

    dailyBtn!.click()
    app.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.click()
    await Promise.resolve()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
  })

  it('resets Stratarch Rating on confirmed new chronicle', async () => {
    localStorage.setItem(
      'calculus-of-kings-progress-v3',
      JSON.stringify({
        version: 3,
        chapterIndex: 1,
        sceneIndex: 0,
        highestUnlockedChapter: 1,
        lastScreen: 'title',
        ladder: { rating: 845, peak: 870, rated: 6 },
      }),
    )
    const app = boot()
    expect(app.querySelector('#title-rating')?.textContent).toContain('845')

    app.querySelector<HTMLButtonElement>('#btn-new')?.click()
    app.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.click()
    await Promise.resolve()

    expect(loadSave()?.ladder).toEqual({ rating: 800, peak: 800, rated: 0 })
    expect(app.querySelector('#title-rating')?.classList.contains('hidden')).toBe(true)
  })

  it('surfaces resume after leaving the lab mid-match', () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    const next = app.querySelector<HTMLButtonElement>('#btn-next')!
    const tag = app.querySelector<HTMLElement>('#scene-tag')!
    for (let i = 0; i < 8 && !tag.textContent?.startsWith('Calibration'); i += 1) {
      next.click()
    }

    app.querySelector<HTMLButtonElement>('[data-square="e2"]')?.click()
    app.querySelector<HTMLButtonElement>('[data-square="e4"]')?.click()
    app.querySelector<HTMLButtonElement>('#btn-vestibule')?.click()

    expect(app.querySelector('#btn-resume-recovered')).not.toBeNull()
    expect(app.querySelector('#chapter-quick-actions')?.classList.contains('hidden')).toBe(false)
  })

  it('gates chapter switches behind confirm when a recoverable session exists', async () => {
    const app = boot()
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()

    const next = app.querySelector<HTMLButtonElement>('#btn-next')!
    const tag = app.querySelector<HTMLElement>('#scene-tag')!
    for (let i = 0; i < 8 && !tag.textContent?.startsWith('Calibration'); i += 1) {
      next.click()
    }

    app.querySelector<HTMLButtonElement>('[data-square="e2"]')?.click()
    app.querySelector<HTMLButtonElement>('[data-square="e4"]')?.click()
    app.querySelector<HTMLButtonElement>('#btn-vestibule')?.click()

    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#confirm-overlay')?.textContent).toContain(CONFIRM_COPY.leavePassage.title)

    app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
    await Promise.resolve()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(false)

    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    app.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.click()
    await Promise.resolve()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
  })
})
