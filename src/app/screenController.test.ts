import { describe, expect, it, beforeEach } from 'vitest'
import {
  createScreenController,
  setSectionVisibility,
  setShellChildrenInert,
} from './screenController'

describe('setSectionVisibility', () => {
  it('toggles hidden, aria-hidden, and inert together', () => {
    const el = document.createElement('section')
    setSectionVisibility(el, false)
    expect(el.classList.contains('hidden')).toBe(true)
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect((el as HTMLElement & { inert?: boolean }).inert).toBe(true)
    setSectionVisibility(el, true)
    expect(el.classList.contains('hidden')).toBe(false)
    expect(el.getAttribute('aria-hidden')).toBe('false')
    expect((el as HTMLElement & { inert?: boolean }).inert).toBe(false)
  })
})

describe('createScreenController', () => {
  let shell: HTMLElement
  let title: HTMLElement
  let chapters: HTMLElement
  let duel: HTMLElement
  let topBar: HTMLElement
  let lab: HTMLElement
  let reward: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = ''
    shell = document.createElement('main')
    topBar = document.createElement('header')
    topBar.className = 'top-bar'
    title = document.createElement('section')
    title.id = 'screen-title'
    chapters = document.createElement('section')
    chapters.id = 'screen-chapters'
    duel = document.createElement('section')
    duel.id = 'screen-duel'
    lab = document.createElement('div')
    lab.id = 'lab-overlay'
    reward = document.createElement('div')
    reward.id = 'reward-overlay'
    for (const el of [topBar, title, chapters, duel, lab, reward]) shell.appendChild(el)
    document.body.appendChild(shell)
  })

  it('shows only the active top-level screen', () => {
    const ctl = createScreenController({
      shell,
      screens: { title, chapters, duel },
      topBar,
      labOverlay: lab,
    })
    ctl.setTopLevelScreen('chapters')
    expect(title.classList.contains('hidden')).toBe(true)
    expect(chapters.classList.contains('hidden')).toBe(false)
    expect(duel.classList.contains('hidden')).toBe(true)
  })

  it('resets document scroll when changing top-level screens', () => {
    const ctl = createScreenController({
      shell,
      screens: { title, chapters, duel },
      topBar,
      labOverlay: lab,
    })
    document.documentElement.scrollTop = 280
    document.body.scrollTop = 140
    ctl.setTopLevelScreen('chapters')
    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
  })

  it('inerts shell siblings while lab is open except lab and modal exempt nodes', () => {
    const ctl = createScreenController({
      shell,
      screens: { title, chapters, duel },
      topBar,
      labOverlay: lab,
      modalExempt: [reward],
    })
    ctl.setLabOpen(true)
    expect(ctl.isLabOpen()).toBe(true)
    expect(topBar.inert).toBe(true)
    expect(title.inert).toBe(true)
    expect(chapters.inert).toBe(true)
    expect(duel.inert).toBe(true)
    expect(lab.inert).toBe(false)
    expect(reward.inert).toBe(false)
    ctl.setLabOpen(false)
    expect(topBar.inert).toBe(false)
    expect(title.inert).toBe(true)
    ctl.setTopLevelScreen('title')
    expect(title.inert).toBe(false)
    expect(chapters.inert).toBe(true)
  })
})

describe('setShellChildrenInert', () => {
  it('restores prior inert state on deactivate', () => {
    const shell = document.createElement('main')
    const a = document.createElement('div')
    const b = document.createElement('div')
    b.inert = true
    shell.append(a, b)
    const restore: HTMLElement[] = []
    setShellChildrenInert(restore, shell, true, [])
    expect(a.inert).toBe(true)
    expect(b.inert).toBe(true)
    setShellChildrenInert(restore, shell, false, [])
    expect(a.inert).toBe(false)
    expect(b.inert).toBe(true)
  })
})
