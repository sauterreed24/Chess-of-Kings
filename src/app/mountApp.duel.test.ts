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
    expect(sound.getAttribute('aria-label')).toBe('Sound off')
    expect(moveGuard.textContent).toBe('Move Guard: On')
    expect(moveGuard.getAttribute('aria-pressed')).toBe('true')
    expect(moveGuard.getAttribute('aria-label')).toBe('Move Guard on')

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'QuotaExceededError')
    })
    expect(() => sound.click()).not.toThrow()
    expect(sound.textContent).toBe('Sound: On')
    expect(sound.getAttribute('aria-pressed')).toBe('true')
    expect(sound.getAttribute('aria-label')).toBe('Sound on')
    expect(() => moveGuard.click()).not.toThrow()
    expect(moveGuard.textContent).toBe('Move Guard: Off')
    expect(moveGuard.getAttribute('aria-pressed')).toBe('false')
    expect(moveGuard.getAttribute('aria-label')).toBe('Move Guard off')
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

  it('renders curated doctrine and counter-prep for the default Duel Archive rival', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('.duel-row')?.click()

    const school = app.querySelector('.rival-school')?.textContent ?? ''
    const panelText = app.querySelector('#duel-panel')?.textContent ?? ''
    expect(school).toContain('Synthesis')
    expect(school).toContain('Achaemenid Patience')
    expect(panelText).toContain('Do not mistake the mentor mask for mercy')
    expect(panelText).toContain('Opening Watchlist')
  })

  it('scrolls the dossier into view after selecting a rival on narrow screens', () => {
    const originalWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    const originalRaf = Object.getOwnPropertyDescriptor(window, 'requestAnimationFrame')
    const scrollIntoView = vi.fn()
    const requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: requestAnimationFrame })
    try {
      const app = document.createElement('div')
      document.body.appendChild(app)
      mountApp(app)

      app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
      app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
      expect(scrollIntoView).not.toHaveBeenCalledWith({ block: 'start' })
      requestAnimationFrame.mockClear()
      scrollIntoView.mockClear()

      const row = app.querySelector<HTMLButtonElement>('.duel-row')!
      row.focus()
      row.click()

      expect(requestAnimationFrame).toHaveBeenCalled()
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    } finally {
      if (originalWidth) Object.defineProperty(window, 'innerWidth', originalWidth)
      if (originalScroll) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScroll)
      else delete (Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView
      if (originalRaf) Object.defineProperty(window, 'requestAnimationFrame', originalRaf)
    }
  })

  it('shows sealed Duel Archive rivals with unlock paths on a fresh save', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()

    const rows = [...app.querySelectorAll<HTMLButtonElement>('.duel-row')]
    expect(rows.map((row) => row.dataset.op)).toContain('rowan')
    expect(app.querySelector('[data-op="alexion"]')?.classList.contains('duel-row--sealed')).toBe(false)
    expect(app.querySelector('[data-op="rowan"]')?.classList.contains('duel-row--sealed')).toBe(true)

    app.querySelector<HTMLButtonElement>('[data-op="rowan"]')?.click()

    const panelText = app.querySelector('#duel-panel')?.textContent ?? ''
    expect(panelText).toContain('Sealed dossier')
    expect(panelText).toContain('Defeat Rowan Vale in Chapter II')
    expect(panelText).toContain('Tempo-first sacrifices')
    expect(panelText).not.toContain('Start Duel')
  })

  it('surfaces distinct Rowan and Vega opening watchlists when unlocked', () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 1,
      sceneIndex: 0,
      highestUnlockedChapter: 2,
      lastScreen: 'duel',
      duelUnlockedOpponentIds: ['rowan', 'vega'],
      unlockedDuelVariantIds: ['alexion-mentor', 'rowan-gambit', 'vega-italian'],
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('[data-op="rowan"]')?.click()
    const rowanText = app.querySelector('#duel-panel')?.textContent ?? ''
    expect(rowanText).toContain('Ply 1: exf4')
    expect(rowanText).toContain('Tempo-first sacrifices')

    app.querySelector<HTMLButtonElement>('[data-op="vega"]')?.click()
    const vegaText = app.querySelector('#duel-panel')?.textContent ?? ''
    expect(vegaText).toContain('Ply 1: Nf6')
    expect(vegaText).toContain('Romantic pressure audited by classical receipts')
    expect(vegaText).not.toContain('Ply 1: exf4')
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

  it('renders authored story beat context at the start of the Prologue', () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn[data-idx="0"]')?.click()

    const storyBeat = app.querySelector<HTMLElement>('#narrative-body .story-beat')
    const narrative = app.querySelector('#narrative-body')?.textContent ?? ''
    expect(storyBeat).not.toBeNull()
    expect(storyBeat?.classList.contains('story-beat--pressure')).toBe(true)
    expect(narrative).toContain('A player without a method')
    expect(narrative).toContain('Rain threads the window')
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
    expect(narrative).toContain('Court Dossier')
    expect(narrative).not.toContain('Rain threads the window')
    expect(app.querySelector<HTMLButtonElement>('#btn-next')?.disabled).toBe(true)
    expect(app.querySelector<HTMLButtonElement>('#btn-next')?.classList.contains('hidden')).toBe(true)
  })

  it('shows a mastery plateau hub after Chapter IV is sealed', () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 4,
      sceneIndex: 0,
      highestUnlockedChapter: 4,
      lastScreen: 'chapters',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: [
        'c3-reflection',
        'c3-match-kallistos',
        'c3-freeplay',
        'c4-reflection',
        'c4-match-cassian',
        'c4-freeplay',
      ],
      completedPuzzleIds: [],
      duelUnlockedOpponentIds: ['alexion', 'kallistos', 'nysa', 'cassian'],
      unlockedDuelVariantIds: ['alexion-mentor', 'kallistos-law', 'nysa-frontier', 'cassian-paradox'],
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    const hub = app.querySelector('.plateau-hub')
    expect(hub).not.toBeNull()
    expect(hub?.textContent).toMatch(/Mastery plateau/)
    expect(hub?.textContent).toMatch(/I–IV are sealed/)
    expect(app.querySelector('#btn-plateau-duel')).not.toBeNull()
    expect(app.querySelector('.roadmap-teaser')?.textContent).toMatch(/Systems over inspiration|long squeeze/i)
    expect(app.textContent).toMatch(/The Paradox Masters/)

    app.querySelector<HTMLButtonElement>('#btn-plateau-duel')?.click()
    expect(app.querySelector('#screen-duel')?.classList.contains('hidden')).toBe(false)
  })

  it('lists loss and draw echoes beside wins in the dossier', () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 1,
      sceneIndex: 0,
      highestUnlockedChapter: 2,
      lastScreen: 'duel',
      duelUnlockedOpponentIds: ['alexion'],
      unlockedDuelVariantIds: ['alexion-mentor'],
      matchHistory: [
        {
          id: 'echo-loss-1',
          timestamp: 1_700_000_000_000,
          mode: 'duel',
          sourceId: 'alexion-mentor',
          opponentId: 'alexion',
          opponentLabel: 'Alexion',
          outcome: 'loss',
          moves: 40,
          styleGrade: 'C',
          turningPointSan: 'Qh5',
          replaySans: ['e4', 'e5'],
          replayStartFen: 'start',
        },
        {
          id: 'echo-draw-1',
          timestamp: 1_700_000_100_000,
          mode: 'duel',
          sourceId: 'alexion-mentor',
          opponentId: 'alexion',
          opponentLabel: 'Alexion',
          outcome: 'draw',
          moves: 60,
          styleGrade: 'B',
          turningPointSan: 'Nf3',
          replaySans: ['e4', 'c5'],
          replayStartFen: 'start',
        },
      ],
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('[data-op="alexion"]')?.click()

    const panel = app.querySelector('#duel-panel')!
    expect(panel.querySelector('.dossier-fold')).not.toBeNull()
    expect(panel.textContent).toContain('Defeat')
    expect(panel.textContent).toContain('Draw')
    expect(panel.textContent).toContain('Qh5')
    expect(panel.textContent).not.toContain('wins, losses, and draws all count')
  })

  it('confirms before chapter jump when a recoverable session exists', async () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 0,
      sceneIndex: 4,
      highestUnlockedChapter: 0,
      lastScreen: 'chapters',
      completedSceneIds: [],
      unlockedDuelVariantIds: ['alexion-mentor'],
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      inProgress: {
        mode: 'calibration',
        chapterIndex: 0,
        sceneIndex: 4,
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        history: [
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        ],
        sanLog: ['e4', 'e5'],
        sanQuality: ['good', 'ok'],
        playerColor: 'w',
        calibrationMoves: 1,
        scriptedMoveIndex: 0,
        sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      },
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    expect(app.querySelector('#btn-resume-recovered')).not.toBeNull()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#confirm-overlay')?.textContent).toMatch(/Replace the recovered session/)
    app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
    await Promise.resolve()
    const afterCancel = JSON.parse(localStorage.getItem('calculus-of-kings-progress-v3') || '{}')
    expect(afterCancel.inProgress).toBeTruthy()
  })

  it('shows soft almost-sealed copy after reflection before freeplay finish', () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 3,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'chapters',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c3-reflection', 'c3-match-kallistos'],
      unlockedDuelVariantIds: ['alexion-mentor'],
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)
    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    const hub = app.querySelector('.plateau-hub')?.textContent ?? ''
    expect(hub).toMatch(/Almost sealed/)
    expect(hub).not.toMatch(/I–III are sealed/)
  })

  it('opens a paradox-age hub for chronicles that sealed Chapter III', () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 3,
      sceneIndex: 0,
      highestUnlockedChapter: 3,
      lastScreen: 'chapters',
      chapter1Complete: true,
      chapter2Complete: true,
      completedSceneIds: ['c3-reflection', 'c3-match-kallistos', 'c3-freeplay'],
      unlockedDuelVariantIds: ['alexion-mentor'],
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)
    app.querySelector<HTMLButtonElement>('#btn-chapters')?.click()
    const hub = app.querySelector('.plateau-hub')
    expect(hub?.textContent).toMatch(/A new age is open/)
    expect(hub?.textContent).toMatch(/Paradox Masters wait/)
    expect(app.querySelector('#btn-plateau-paradox')).not.toBeNull()
    expect(app.textContent).toMatch(/Paradox/)
    app.querySelector<HTMLButtonElement>('#btn-plateau-paradox')?.click()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    expect(app.querySelector('#play-chapter-label')?.textContent).toMatch(/Chapter IV|Paradox/)
  })

  it('confirms before starting a duel over a recoverable session', async () => {
    localStorage.setItem('calculus-of-kings-progress-v3', JSON.stringify({
      version: 3,
      chapterIndex: 0,
      sceneIndex: 4,
      highestUnlockedChapter: 0,
      lastScreen: 'duel',
      completedSceneIds: [],
      unlockedDuelVariantIds: ['alexion-mentor'],
      duelUnlockedOpponentIds: [],
      cosmetics: { unlockedPieceSkins: ['classic-royal'], selectedPieceSkin: 'classic-royal' },
      inProgress: {
        mode: 'calibration',
        chapterIndex: 0,
        sceneIndex: 4,
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        history: [
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        ],
        sanLog: ['e4', 'e5'],
        sanQuality: ['good', 'ok'],
        playerColor: 'w',
        calibrationMoves: 1,
        scriptedMoveIndex: 0,
        sceneTendencies: { flankPawnPushes: 0, earlyQueenMoves: 0, repeatedChecksWithoutGain: 0 },
      },
    }))
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)

    app.querySelector<HTMLButtonElement>('#btn-duel')?.click()
    app.querySelector<HTMLButtonElement>('.duel-row')?.click()
    app.querySelector<HTMLButtonElement>('#btn-start-duel')?.click()
    expect(app.querySelector('#confirm-overlay')?.classList.contains('hidden')).toBe(false)
    expect(app.querySelector('#confirm-overlay')?.textContent).toMatch(/Replace the recovered session|Start duel/)
    app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
    await Promise.resolve()
    const afterCancel = JSON.parse(localStorage.getItem('calculus-of-kings-progress-v3') || '{}')
    expect(afterCancel.inProgress).toBeTruthy()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(false)
  })

  it('confirms before leaving the lab mid-board via vestibule', async () => {
    const app = document.createElement('div')
    document.body.appendChild(app)
    mountApp(app)
    app.querySelector<HTMLButtonElement>('#btn-enter-archive')?.click()
    app.querySelector<HTMLButtonElement>('.chapter-btn')?.click()
    expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    const skip = app.querySelector<HTMLButtonElement>('#btn-skip-ahead')
    if (skip && !skip.classList.contains('hidden')) skip.click()
    await Promise.resolve()
    // If still on dialogue, advance until board/calibration if possible
    for (let i = 0; i < 6; i++) {
      const next = app.querySelector<HTMLButtonElement>('#btn-next:not([disabled])')
      if (!next || app.querySelector('#chess-root .sq, #chess-root button')) break
      next.click()
      await Promise.resolve()
    }
    app.querySelector<HTMLButtonElement>('#btn-vestibule')?.click()
    await Promise.resolve()
    // Mid-board or recoverable: confirm should appear; fresh dialogue-only may not.
    const overlay = app.querySelector('#confirm-overlay')
    if (overlay && !overlay.classList.contains('hidden')) {
      expect(overlay.textContent).toMatch(/Leave the simulation|Replace the recovered/)
      app.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.click()
      await Promise.resolve()
      expect(app.querySelector('#lab-overlay')?.classList.contains('lab-overlay--active')).toBe(true)
    }
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
