const FOCUSABLE =
  'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false
  if (el.getAttribute('aria-hidden') === 'true') return false
  if (!document.contains(el)) return false
  return true
}

export function listFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible)
}

export type FocusTrap = {
  activate: () => void
  deactivate: () => void
}

/** Tab / Shift+Tab cycle within `root`; ignores focus outside the trap. */
export function createFocusTrap(root: HTMLElement): FocusTrap {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const items = listFocusable(root)
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const active = document.activeElement
    const idx = items.indexOf(active as HTMLElement)
    e.preventDefault()
    const dir = e.shiftKey ? -1 : 1
    const cur = idx < 0 ? 0 : idx
    const next = (cur + dir + items.length) % items.length
    items[next]?.focus()
  }

  return {
    activate() {
      root.addEventListener('keydown', onKeyDown)
    },
    deactivate() {
      root.removeEventListener('keydown', onKeyDown)
    },
  }
}
