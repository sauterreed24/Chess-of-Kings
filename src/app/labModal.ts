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

export function setTopBarInertForLab(topBar: HTMLElement, labActive: boolean): void {
  topBar.inert = false
  topBar.removeAttribute('inert')
  const phoneLab = labActive && isPhoneLabNav()
  topBar.classList.toggle('hidden', phoneLab)
  topBar.setAttribute('aria-hidden', phoneLab ? 'true' : 'false')
  topBar.classList.toggle('top-bar--over-lab', labActive && !phoneLab)

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
