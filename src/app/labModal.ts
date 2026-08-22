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

/** Duel (and other non-chronicle lab modes) reuse `#narrative-body` without
 *  `renderScene`. Leftover puzzle/calibration markers would keep hiding the
 *  dossier, ledger, and sound row on phones. */
export function clearPhoneLessonMarkers(narrativeBody: HTMLElement | null | undefined): void {
  if (!narrativeBody) return
  narrativeBody.removeAttribute('data-puzzle-lesson')
  narrativeBody.removeAttribute('data-calibration-lesson')
}

/** `.primary--advance` is width:100% / column so it can sit under the manuscript.
 *  Inline overrides keep CSS gzip untouched while Prove shares the Hint row. */
function styleDockedProve(next: HTMLButtonElement, docked: boolean): void {
  const sub = next.querySelector('#btn-next-hint')
  if (docked) {
    next.style.width = 'auto'
    next.style.flex = '1 1 auto'
    next.style.minWidth = '7rem'
    next.style.flexDirection = 'row'
    next.style.padding = '0.65rem 0.7rem'
    sub?.classList.add('hidden')
  } else {
    next.style.width = ''
    next.style.flex = ''
    next.style.minWidth = ''
    next.style.flexDirection = ''
    next.style.padding = ''
    sub?.classList.remove('hidden')
  }
}

/** Phone puzzles and the opening calibration already put the command on the
 *  marble; hiding the whole body also collapses the duplicate teaching card
 *  and docks Prove next to Hint so it stays on screen. */
export function syncPhonePuzzleLesson(narrativeBody: HTMLElement | null | undefined): void {
  if (!narrativeBody) return
  const phone = isPhoneLabNav()
  const puzzle = narrativeBody.hasAttribute('data-puzzle-lesson')
  const calibration = narrativeBody.hasAttribute('data-calibration-lesson')
  const hide = phone && (puzzle || calibration)
  narrativeBody.classList.toggle('hidden', hide)
  narrativeBody.querySelectorAll(PHONE_PUZZLE_DEPTH).forEach((node) => {
    node.classList.toggle('hidden', hide)
  })
  const scope: ParentNode = narrativeBody.closest('#app') ?? narrativeBody.ownerDocument ?? narrativeBody
  const next = scope.querySelector<HTMLButtonElement>('#btn-next')
  const tools = scope.querySelector('.board-tools')
  const actions = scope.querySelector('.narrative-actions')
  const manuscript = scope.querySelector('#manuscript-panel')
  const hideMatchChrome = puzzle || (phone && calibration)
  scope.querySelector('.move-ledger-wrap')?.classList.toggle('hidden', hideMatchChrome)
  scope.querySelector('.instrument-toggles')?.classList.toggle('hidden', hideMatchChrome)
  const lessonNote = scope.querySelector('#lesson-note')
  if (lessonNote) lessonNote.classList.toggle('hidden', hideMatchChrome)
  /* Resize docks Prove without a chess update; keep Reset in lockstep.
     Phone calibration also hides Hint so Prove|Reset share one row.
     A spent Hint (Archive reply / sealed) stays hidden when the lab widens. */
  const reset = scope.querySelector<HTMLButtonElement>('#btn-reset')
  const hintBtn = scope.querySelector<HTMLButtonElement>('#btn-hint')
  const idleTools = !scope.querySelector('#move-ledger .ledger-row')
  if (reset) reset.hidden = idleTools || (phone && puzzle)
  if (hintBtn && calibration) hintBtn.hidden = phone || hintBtn.disabled
  if (!next || !tools || !actions || !manuscript) return
  if (hide) {
    const hint = tools.querySelector('#btn-hint')
    if (hint) hint.after(next)
    else tools.prepend(next)
    styleDockedProve(next, true)
    tools.classList.remove('hidden')
    manuscript.classList.add('hidden')
  } else {
    styleDockedProve(next, false)
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
