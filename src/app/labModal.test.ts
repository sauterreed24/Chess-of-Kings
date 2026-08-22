import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  PHONE_LAB_NAV_QUERY,
  applyLabOverlayCaption,
  clearPhoneLessonMarkers,
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
    document.body.innerHTML =
      '<div class="lab-overlay"><div class="lab-overlay__sheet"></div></div>' +
      '<p id="narrative-kbd-hint">Enter or Space advances</p>'
    const topBar = document.createElement('header')
    topBar.className = 'top-bar'
    document.body.append(topBar)
    const sheet = document.querySelector<HTMLElement>('.lab-overlay__sheet')!
    const kbd = document.getElementById('narrative-kbd-hint')!

    setTopBarInertForLab(topBar, true)
    expect(topBar.classList.contains('hidden')).toBe(true)
    expect(topBar.getAttribute('aria-hidden')).toBe('true')
    expect(topBar.classList.contains('top-bar--over-lab')).toBe(false)
    expect(sheet.style.top).toBe('0px')
    expect(sheet.style.maxHeight).toBe('100svh')
    expect(kbd.classList.contains('hidden')).toBe(true)

    setTopBarInertForLab(topBar, false)
    expect(topBar.classList.contains('hidden')).toBe(false)
    expect(topBar.getAttribute('aria-hidden')).toBe('false')
    expect(sheet.style.top).toBe('')
    expect(sheet.style.maxHeight).toBe('')
    expect(kbd.classList.contains('hidden')).toBe(false)
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

  it('hides the puzzle manuscript body on phone labs so the empty hole collapses', () => {
    stubPhoneLabNav(true)
    const body = document.createElement('div')
    body.setAttribute('data-puzzle-lesson', '')
    body.innerHTML =
      '<aside class="story-beat"><strong>first lesson</strong></aside>' +
      '<div class="teaching"><div class="teaching-card">goal</div></div>' +
      '<p class="hint-block">hint</p><p class="lesson-lead">lead</p>'
    syncPhonePuzzleLesson(body)
    expect(body.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.story-beat')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.teaching')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.hint-block')?.classList.contains('hidden')).toBe(true)
    expect(body.querySelector('.lesson-lead')?.classList.contains('hidden')).toBe(true)
  })

  it('keeps puzzle teaching cards on wide labs', () => {
    stubPhoneLabNav(false)
    const body = document.createElement('div')
    body.setAttribute('data-puzzle-lesson', '')
    body.innerHTML =
      '<div class="teaching"><div class="teaching-card">goal</div></div><p class="lesson-lead">lead</p>'
    syncPhonePuzzleLesson(body)
    expect(body.classList.contains('hidden')).toBe(false)
    expect(body.querySelector('.teaching')?.classList.contains('hidden')).toBe(false)
    expect(body.querySelector('.lesson-lead')?.classList.contains('hidden')).toBe(false)
  })

  it('docks Prove next to Hint and hides the manuscript on phone puzzles', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-puzzle-lesson></div>
          <div class="narrative-actions"><button id="btn-next">Prove<span id="btn-next-hint">Requires objective met</span></button></div>
        </article>
        <div class="board-tools"><button id="btn-hint">Hint</button></div>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const next = document.querySelector('#btn-next')!
    syncPhonePuzzleLesson(body)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(true)
    expect(next.parentElement?.classList.contains('board-tools')).toBe(true)
    expect(next.parentElement?.classList.contains('hidden')).toBe(false)
    expect(next.previousElementSibling?.id).toBe('btn-hint')
    expect(next.style.width).toBe('auto')
    expect(next.style.flexDirection).toBe('row')
    expect(document.querySelector('#btn-next-hint')?.classList.contains('hidden')).toBe(true)

    stubPhoneLabNav(false)
    syncPhonePuzzleLesson(body)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(false)
    expect(next.parentElement?.classList.contains('narrative-actions')).toBe(true)
    expect(next.style.width).toBe('')
    expect(document.querySelector('#btn-next-hint')?.classList.contains('hidden')).toBe(false)
  })

  it('hides Reset when a phone puzzle docks Prove after a ply and restores it on a wide lab', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-puzzle-lesson></div>
          <div class="narrative-actions"><button id="btn-next">Advance</button></div>
        </article>
        <div class="move-ledger-wrap"><div id="move-ledger"><div class="ledger-row">1. Bxd4</div></div></div>
        <div class="board-tools">
          <button id="btn-hint">Hint</button>
          <button id="btn-undo">Take back</button>
          <button id="btn-reset">Reset</button>
        </div>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const reset = document.querySelector<HTMLButtonElement>('#btn-reset')!
    reset.hidden = false
    syncPhonePuzzleLesson(body)
    expect(reset.hidden).toBe(true)
    expect(document.querySelector('#btn-next')?.parentElement?.classList.contains('board-tools')).toBe(true)

    stubPhoneLabNav(false)
    syncPhonePuzzleLesson(body)
    expect(reset.hidden).toBe(false)
    expect(document.querySelector('#btn-next')?.parentElement?.classList.contains('narrative-actions')).toBe(true)
  })

  it('hides Hint on phone calibration so Prove can share a row with Reset', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-calibration-lesson></div>
          <div class="narrative-actions"><button id="btn-next">Prove</button></div>
        </article>
        <div class="move-ledger-wrap"><div id="move-ledger"><div class="ledger-row">1. e4</div></div></div>
        <div class="board-tools">
          <button id="btn-hint">Hint</button>
          <button id="btn-reset">Reset</button>
        </div>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const hint = document.querySelector<HTMLButtonElement>('#btn-hint')!
    const reset = document.querySelector<HTMLButtonElement>('#btn-reset')!
    hint.hidden = false
    reset.hidden = false
    syncPhonePuzzleLesson(body)
    expect(hint.hidden).toBe(true)
    expect(reset.hidden).toBe(false)

    stubPhoneLabNav(false)
    syncPhonePuzzleLesson(body)
    expect(hint.hidden).toBe(false)
  })

  it('keeps a spent Hint hidden when calibration widens after an Archive reply', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-calibration-lesson></div>
          <div class="narrative-actions"><button id="btn-next">Prove</button></div>
        </article>
        <div class="move-ledger-wrap"><div id="move-ledger"><div class="ledger-row">1. e4</div></div></div>
        <div class="board-tools">
          <button id="btn-hint">Hint</button>
          <button id="btn-reset">Reset</button>
        </div>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const hint = document.querySelector<HTMLButtonElement>('#btn-hint')!
    hint.hidden = true
    hint.disabled = true
    syncPhonePuzzleLesson(body)
    expect(hint.hidden).toBe(true)

    stubPhoneLabNav(false)
    syncPhonePuzzleLesson(body)
    expect(hint.hidden).toBe(true)
    expect(hint.disabled).toBe(true)
  })

  it('docks Prove and hides the empty ledger on phone calibration', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-calibration-lesson>
            <div class="teaching"><div class="teaching-card">goal</div></div>
            <p class="lesson-lead">lead</p>
          </div>
          <div class="narrative-actions"><button id="btn-next">Prove<span id="btn-next-hint">4 remaining</span></button></div>
        </article>
        <div class="move-ledger-wrap"><div id="move-ledger">No moves yet.</div></div>
        <div class="board-tools"><button id="btn-hint">Hint</button></div>
        <div class="instrument-toggles"></div>
        <p id="lesson-note">White moves are tallied on the rail; the Lab is listening.</p>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const next = document.querySelector('#btn-next')!
    syncPhonePuzzleLesson(body)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(true)
    expect(document.querySelector('.move-ledger-wrap')?.classList.contains('hidden')).toBe(true)
    expect(document.querySelector('.instrument-toggles')?.classList.contains('hidden')).toBe(true)
    expect(document.querySelector('#lesson-note')?.classList.contains('hidden')).toBe(true)
    expect(next.parentElement?.classList.contains('board-tools')).toBe(true)
    expect(next.previousElementSibling?.id).toBe('btn-hint')

    stubPhoneLabNav(false)
    syncPhonePuzzleLesson(body)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('.move-ledger-wrap')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('.instrument-toggles')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('#lesson-note')?.classList.contains('hidden')).toBe(false)
    expect(next.parentElement?.classList.contains('narrative-actions')).toBe(true)
  })

  it('clears leftover calibration markers so a later sync cannot hide duel chrome', () => {
    stubPhoneLabNav(true)
    document.body.innerHTML = `
      <div id="app">
        <article id="manuscript-panel">
          <div id="narrative-body" data-calibration-lesson></div>
          <div class="narrative-actions"><button id="btn-next">Prove<span id="btn-next-hint">4 remaining</span></button></div>
        </article>
        <div class="move-ledger-wrap"></div>
        <div class="board-tools"><button id="btn-hint">Hint</button></div>
        <div class="instrument-toggles"></div>
        <p id="lesson-note">note</p>
      </div>`
    const body = document.querySelector<HTMLElement>('#narrative-body')!
    const next = document.querySelector('#btn-next')!
    syncPhonePuzzleLesson(body)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(true)
    expect(next.parentElement?.classList.contains('board-tools')).toBe(true)

    clearPhoneLessonMarkers(body)
    syncPhonePuzzleLesson(body)
    expect(body.hasAttribute('data-calibration-lesson')).toBe(false)
    expect(document.querySelector('#manuscript-panel')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('.move-ledger-wrap')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('.instrument-toggles')?.classList.contains('hidden')).toBe(false)
    expect(document.querySelector('#lesson-note')?.classList.contains('hidden')).toBe(false)
    expect(next.parentElement?.classList.contains('narrative-actions')).toBe(true)
  })
})
