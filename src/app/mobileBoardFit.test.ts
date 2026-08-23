import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  COMPACT_MEDIA_QUERY,
  applyMobileBoardFit,
  createMobileBoardFitController,
  isCompactViewport,
} from './mobileBoardFit'

function mockRect(el: HTMLElement, rect: Partial<DOMRect>) {
  const full: DOMRect = {
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    width: rect.width ?? 100,
    height: rect.height ?? 40,
    top: rect.top ?? 0,
    left: rect.left ?? 0,
    right: (rect.left ?? 0) + (rect.width ?? 100),
    bottom: (rect.top ?? 0) + (rect.height ?? 40),
    toJSON: () => ({}),
  }
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(full)
}

describe('mobileBoardFit', () => {
  let originalMatchMedia: PropertyDescriptor | undefined

  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    })
  })

  afterEach(() => {
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia)
  })

  it('treats short landscape windows as compact', () => {
    expect(COMPACT_MEDIA_QUERY).toContain('(max-height: 620px)')
  })

  it('isCompactViewport reflects matchMedia', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: COMPACT_MEDIA_QUERY,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as MediaQueryList)
    expect(isCompactViewport()).toBe(true)
  })

  it('sets --mobile-board-max on compact board scenes', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: COMPACT_MEDIA_QUERY,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as MediaQueryList)

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })

    document.body.innerHTML = `
      <div id="lab-overlay" class="lab-overlay lab-overlay--active"></div>
      <section id="screen-play" class="screen-play--board-scene">
        <div class="instrument-frame">
          <div id="board-stage" class="board-stage">
            <div class="captured-row captured-row--bot"></div>
            <div class="board-wrap"></div>
          </div>
          <div class="move-ledger-wrap"><div class="move-ledger"></div></div>
          <div class="board-tools"></div>
          <div class="instrument-toggles"></div>
        </div>
      </section>
    `

    const playScreen = document.querySelector<HTMLElement>('#screen-play')!
    const boardStage = document.querySelector<HTMLElement>('#board-stage')!
    const labOverlay = document.querySelector<HTMLElement>('#lab-overlay')!
    const boardWrap = boardStage.querySelector<HTMLElement>('.board-wrap')!
    const ledgerWrap = document.querySelector<HTMLElement>('.move-ledger-wrap')!
    const boardTools = document.querySelector<HTMLElement>('.board-tools')!
    const toggles = document.querySelector<HTMLElement>('.instrument-toggles')!
    const capturedBot = boardStage.querySelector<HTMLElement>('.captured-row--bot')!

    mockRect(boardWrap, { top: 180, width: 320, height: 320 })
    mockRect(ledgerWrap, { height: 48 })
    mockRect(boardTools, { height: 36 })
    mockRect(toggles, { height: 28 })
    mockRect(capturedBot, { height: 18 })

    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
      const node = el as HTMLElement
      if (node.id === 'screen-play') {
        return { paddingBottom: '20' } as CSSStyleDeclaration
      }
      if (node.classList.contains('instrument-frame')) {
        return { paddingBottom: '12' } as CSSStyleDeclaration
      }
      return { fontSize: '20', paddingBottom: '0' } as CSSStyleDeclaration
    })

    applyMobileBoardFit({ playScreen, boardStage, labOverlay })

    const boardMax = playScreen.style.getPropertyValue('--mobile-board-max')
    expect(boardMax).toMatch(/px$/)
    expect(parseInt(boardMax, 10)).toBeGreaterThan(100)
  })

  it('clears --mobile-board-max on desktop', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: COMPACT_MEDIA_QUERY,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as MediaQueryList)

    document.body.innerHTML = `
      <div id="lab-overlay" class="lab-overlay lab-overlay--active"></div>
      <section id="screen-play" class="screen-play--board-scene">
        <div id="board-stage"><div class="board-wrap"></div></div>
      </section>
    `

    const playScreen = document.querySelector<HTMLElement>('#screen-play')!
    playScreen.style.setProperty('--mobile-board-max', '320px')
    const boardStage = document.querySelector<HTMLElement>('#board-stage')!
    const labOverlay = document.querySelector<HTMLElement>('#lab-overlay')!

    applyMobileBoardFit({ playScreen, boardStage, labOverlay })
    expect(playScreen.style.getPropertyValue('--mobile-board-max')).toBe('')
  })

  it('remeasures after the compact board stack settles', () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: COMPACT_MEDIA_QUERY,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as MediaQueryList)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })

    document.body.innerHTML = `
      <div id="lab-overlay" class="lab-overlay lab-overlay--active"></div>
      <section id="screen-play" class="screen-play--board-scene">
        <div id="board-stage"><div class="board-wrap"></div></div>
      </section>
    `
    const playScreen = document.querySelector<HTMLElement>('#screen-play')!
    const boardStage = document.querySelector<HTMLElement>('#board-stage')!
    const boardWrap = boardStage.querySelector<HTMLElement>('.board-wrap')!
    const labOverlay = document.querySelector<HTMLElement>('#lab-overlay')!
    let boardTop = 700
    vi.spyOn(boardWrap, 'getBoundingClientRect').mockImplementation(() => ({
      x: 20,
      y: boardTop,
      width: 350,
      height: 350,
      top: boardTop,
      left: 20,
      right: 370,
      bottom: boardTop + 350,
      toJSON: () => ({}),
    }))
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })

    const controller = createMobileBoardFitController({ playScreen, boardStage, labOverlay })
    controller.apply()
    frames.shift()?.(0)
    expect(playScreen.style.getPropertyValue('--mobile-board-max')).toBe('')

    boardTop = 180
    frames.shift()?.(16)
    expect(playScreen.style.getPropertyValue('--mobile-board-max')).toBe('350px')
  })

  it('detach removes listeners and clears board max variable', () => {
    const playScreen = document.createElement('section')
    playScreen.id = 'screen-play'
    const boardStage = document.createElement('div')
    boardStage.id = 'board-stage'
    const labOverlay = document.createElement('div')
    labOverlay.id = 'lab-overlay'
    document.body.append(playScreen, boardStage, labOverlay)

    playScreen.style.setProperty('--mobile-board-max', '300px')
    const controller = createMobileBoardFitController({ playScreen, boardStage, labOverlay })
    controller.attach()
    controller.detach()
    expect(playScreen.style.getPropertyValue('--mobile-board-max')).toBe('')
  })
})
