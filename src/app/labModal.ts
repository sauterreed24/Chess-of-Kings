/** Top-bar accessibility state while the lab simulation overlay is open. */
export function setTopBarInertForLab(topBar: HTMLElement, labActive: boolean): void {
  topBar.inert = labActive
  topBar.setAttribute('aria-hidden', labActive ? 'true' : 'false')
}
