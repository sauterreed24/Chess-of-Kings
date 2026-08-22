/**
 * Top nav stays the way out of a live simulation on wide screens.
 * Phone labs already have ← Chapters on the overlay bar; stacking
 * Title / Chapters / Duel above it was duplicate chrome. Hide with
 * `.hidden` (display:none), not inert — inert left the buttons looking
 * enabled while swallowing clicks.
 */
export const PHONE_LAB_NAV_QUERY = '(max-width: 700px)'

export function isPhoneLabNav(): boolean {
  return window.matchMedia?.(PHONE_LAB_NAV_QUERY)?.matches ?? false
}

/** Phone overlay bars are too narrow for `Chapter I · Early chess — scholarly court`. */
export function applyLabOverlayCaption(el: HTMLElement, full: string, short: string): void {
  el.dataset.labFull = full
  el.dataset.labShort = short
  el.setAttribute('title', full)
  syncLabOverlayCaption(el)
}

export function syncLabOverlayCaption(el: HTMLElement | null | undefined): void {
  if (!el) return
  const full = el.dataset.labFull
  const short = el.dataset.labShort
  if (!full) return
  const phone = isPhoneLabNav()
  const text = phone && short ? short : full
  el.textContent = text
  if (phone && short && short !== full) {
    el.setAttribute('aria-label', full)
  } else {
    el.removeAttribute('aria-label')
  }
}

const PHONE_PUZZLE_DEPTH = '.story-beat, .teaching, .teaching-more, .hint-block, .lesson-lead'

/** Phone puzzles already put the command on the marble; hiding the whole body
 *  also collapses the empty min-height hole the duplicate cards left behind.
 *  Prove docks next to Hint so the empty manuscript card can hide. */
export function syncPhonePuzzleLesson(narrativeBody: HTMLElement | null | undefined): void {
  if (!narrativeBody) return
  const hide = isPhoneLabNav() && narrativeBody.hasAttribute('data-puzzle-lesson')
  narrativeBody.classList.toggle('hidden', hide)
  narrativeBody.querySelectorAll(PHONE_PUZZLE_DEPTH).forEach((node) => {
    node.classList.toggle('hidden', hide)
  })
  const scope: ParentNode = narrativeBody.closest('#app') ?? narrativeBody.ownerDocument ?? narrativeBody
  const next = scope.querySelector<HTMLButtonElement>('#btn-next')
  const tools = scope.querySelector('.board-tools')
  const actions = scope.querySelector('.narrative-actions')
  const manuscript = scope.querySelector('#manuscript-panel')
  if (!next || !tools || !actions || !manuscript) return
  if (hide) {
    const hint = tools.querySelector('#btn-hint')
    if (hint) hint.after(next)
    else tools.prepend(next)
    manuscript.classList.add('hidden')
  } else {
    actions.prepend(next)
    manuscript.classList.remove('hidden')
  }
}

export function setTopBarInertForLab(topBar: HTMLElement, labActive: boolean): void {
  topBar.inert = false
  topBar.removeAttribute('inert')
  const phoneLab = labActive && isPhoneLabNav()
  topBar.classList.toggle('hidden', phoneLab)
  topBar.setAttribute('aria-hidden', phoneLab ? 'true' : 'false')
  topBar.classList.toggle('top-bar--over-lab', labActive && !phoneLab)
  topBar.ownerDocument.getElementById('narrative-kbd-hint')?.classList.toggle('hidden', phoneLab)

  const sheet = topBar.ownerDocument.querySelector<HTMLElement>('.lab-overlay__sheet')
  if (!sheet) return
  if (phoneLab) {
    sheet.style.top = '0px'
    sheet.style.maxHeight = '100svh'
  } else {
    sheet.style.removeProperty('top')
    sheet.style.removeProperty('max-height')
  }
}
