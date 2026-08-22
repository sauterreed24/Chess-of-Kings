/**
 * Top nav stays the way out of a live simulation. Background screens are
 * inert separately; hiding Title / Chapters / Duel here made those buttons
 * look enabled while swallowing every click.
 */
export function setTopBarInertForLab(topBar: HTMLElement, labActive: boolean): void {
  topBar.inert = false
  topBar.removeAttribute('inert')
  topBar.setAttribute('aria-hidden', 'false')
  topBar.classList.toggle('top-bar--over-lab', labActive)
}
