/**
 * Shell structural smoke: the HTML produced by getShellMarkup must
 * remain crawlable, ARIA-correct, and contain every id mountApp depends
 * on. jsdom does not run CSS layout so this is a structural assertion,
 * not a visual one.
 *
 * If any of these breaks, mountApp will throw at boot ("querySelector
 * returned null" with the non-null assertions in mountApp.ts).
 */
import { describe, expect, it } from 'vitest'
import { getShellMarkup } from './shellMarkup'

const REQUIRED_IDS = [
  'shell',
  'lab-overlay',
  'screen-title',
  'screen-chapters',
  'screen-duel',
  'screen-play',
  'board-panel',
  'manuscript-panel',
  'board-stage',
  'btn-resume',
  'btn-new',
  'btn-enter-archive',
  'btn-title',
  'btn-chapters',
  'btn-duel',
  'btn-chapters-back',
  'btn-vestibule',
  'chapter-list',
  'duel-list',
  'duel-panel',
  'btn-next',
  'btn-next-hint',
  'btn-undo',
  'btn-reset',
  'narrative-body',
  'scene-tag',
  'chapter-rail',
  'scene-progress',
  'board-status',
  'turn-pulse',
  'move-counter',
  'recovery-controls',
  'btn-recovery-restore',
  'btn-recovery-dismiss',
  'ai-persona',
  'ai-flavor',
  'tactical-pulse',
  'btn-sfx',
  'btn-move-guard',
  'lesson-note',
  'coach-tip',
  'mvp-flag',
  'title-rating',
  'daily-ribbon',
  'move-ledger',
  'calibration-rail',
  'calibration-track',
  'lab-era-label',
  'eval-bar-fill',
  'eval-bar-score',
  'captured-top',
  'captured-bot',
  'eval-bar-wrap',
  'reward-overlay',
  'confirm-overlay',
  'storage-failure-banner',
  'btn-storage-banner-dismiss',
  'chapter-progress-slot',
  'mobile-board-guide',
  'mobile-tips',
  'title-settings',
  'btn-title-sfx',
  'btn-title-move-guard',
  'btn-title-motion',
  'title-skin',
  'btn-title-kbdhelp',
  'btn-lab-kbdhelp',
  'live-announcer',
  'chess-root',
  'chapter-quick-actions',
  'narrative-kbd-hint',
  'board-guide',
]

describe('shell markup structural integrity', () => {
  it('contains every id mountApp depends on', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    document.body.appendChild(host)
    try {
      for (const id of REQUIRED_IDS) {
        expect(host.querySelector(`#${id}`), `expected #${id} in shell markup`).not.toBeNull()
      }
    } finally {
      host.remove()
    }
  })

  it('declares the live announcer with aria-live="polite"', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    const announcer = host.querySelector('#live-announcer')!
    expect(announcer.getAttribute('aria-live')).toBe('polite')
    expect(announcer.getAttribute('aria-atomic')).toBe('false')
  })

  it('declares the reward overlay as a modal dialog with aria-hidden initially', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    const overlay = host.querySelector('#reward-overlay')!
    expect(overlay.getAttribute('role')).toBe('dialog')
    expect(overlay.getAttribute('aria-modal')).toBe('true')
    expect(overlay.hasAttribute('aria-live')).toBe(false)
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(overlay.classList.contains('hidden')).toBe(true)
  })

  it('declares player preference toggles with pressed state', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    expect(host.querySelector('#btn-sfx')?.getAttribute('aria-pressed')).toBe('true')
    expect(host.querySelector('#btn-move-guard')?.getAttribute('aria-pressed')).toBe('false')
  })

  it('declares the lab overlay hidden from assistive tech until opened', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    const lab = host.querySelector('#lab-overlay')!
    expect(lab.getAttribute('aria-hidden')).toBe('true')
  })

  it('links to privacy and accessibility statements from the title plate', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    expect(host.innerHTML).toContain('href="./privacy.html"')
    expect(host.innerHTML).toContain('href="./accessibility.html"')
  })

  it('declares Long Reign world markers on the title and Chronicle Index', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    expect(host.querySelector('.title-ornament__map')).not.toBeNull()
    expect(host.querySelector('.title-world-panel')?.textContent).toContain('Alexandrine Reckoning')
    expect(host.querySelector('.chronicle-index-codex')?.textContent).toContain('Civic Chess')
    expect(host.textContent).toContain('Alexander III')
  })

  it('declares the chess board with aria-describedby including the kbd hint and board guide', () => {
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    const root = host.querySelector('#chess-root')!
    const described = root.getAttribute('aria-describedby') ?? ''
    expect(described).toContain('narrative-kbd-hint')
    expect(described).toContain('board-guide')
  })

  it('uses the iPhone-13-Pro-Max viewport meta on the host page (sanity)', () => {
    /* The shell markup itself does not include the meta tag (that is
     * in index.html), but every dynamic id that the shell exposes
     * must remain identical for the iOS PWA install path. This
     * asserts the daily-ribbon container exists -- without it the
     * iPhone home-screen install would render the title with no
     * Daily Calculus call-to-action. */
    const host = document.createElement('div')
    host.innerHTML = getShellMarkup()
    expect(host.querySelector('#daily-ribbon')).not.toBeNull()
  })
})
