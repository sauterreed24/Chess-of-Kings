import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  PHONE_LAB_NAV_QUERY,
  applyLabOverlayCaption,
  setTopBarInertForLab,
  syncLabOverlayCaption,
  syncPhonePuzzleLesson,
} from './labModal'

function stubPhoneLabNav(phone: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: phone && query === PHONE_LAB_NAV_QUERY,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }))
}

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
    stubPhoneLabNav(true)
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

  it('shortens the overlay caption on phone labs and keeps the era in aria-label', () => {
    stubPhoneLabNav(true)
    const el = document.createElement('span')
    applyLabOverlayCaption(
      el,
      'Chapter I · Early chess — scholarly court',
      'Chapter I',
    )
    expect(el.textContent).toBe('Chapter I')
    expect(el.getAttribute('aria-label')).toBe('Chapter I · Early chess — scholarly court')
    expect(el.getAttribute('title')).toBe('Chapter I · Early chess — scholarly court')
  })

  it('keeps the full overlay caption on wide labs', () => {
    stubPhoneLabNav(false)
    const el = document.createElement('span')
    applyLabOverlayCaption(
      el,
      'Chapter I · Early chess — scholarly court',
      'Chapter I',
    )
    expect(el.textContent).toBe('Chapter I · Early chess — scholarly court')
    expect(el.hasAttribute('aria-label')).toBe(false)
  })

  it('re-applies the short caption when a phone lab rotates into view', () => {
    stubPhoneLabNav(false)
    const el = document.createElement('span')
    applyLabOverlayCaption(el, 'Duel Archive · Ancient Court · Egyptian symmetry', 'Duel Archive')
    expect(el.textContent).toBe('Duel Archive · Ancient Court · Egyptian symmetry')
    stubPhoneLabNav(true)
    syncLabOverlayCaption(el)
    expect(el.textContent).toBe('Duel Archive')
    expect(el.getAttribute('aria-label')).toBe('Duel Archive · Ancient Court · Egyptian symmetry')
  })

  it('hides puzzle story-beat and teaching cards on phone labs and keeps the lesson lead', () => {
    stubPhoneLabNav(true)
    const body = document.createElement('div')
    body.setAttribute('data-puzzle-lesson', '')
    body.innerHTML =
      '<aside class="story-beat"><strong>first lesson</strong></aside>' +
      '<div class="teaching"><div class="teaching-card">goal</div></div>' +
      '<p class="hint-block">hint</p><p class="lesson-lead">lead</p>'
    syncPhonePuzzleLesson(body)
    expect(body.querySelector('.story-beat')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.teaching')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.hint-block')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.lesson-lead')?.classList.contains('hidden')).toBe(false)
  })

  it('keeps puzzle teaching cards on wide labs', () => {
    stubPhoneLabNav(false)
    const body = document.createElement('div')
    body.setAttribute('data-puzzle-lesson', '')
    body.innerHTML = '<div class="teaching"><div class="teaching-card">goal</div></div>'
    syncPhonePuzzleLesson(body)
    expect(body.querySelector('.teaching')?.classList.contains('hidden')).toBe(false)
  })
})
