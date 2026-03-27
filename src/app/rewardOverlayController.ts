/**
 * Centralized reward / modal overlay lifecycle: content swap, visibility, and cleanup
 * (timers, etc.) so tests can assert behavior without the full app shell.
 */

function focusFirstOverlayControl(root: HTMLElement) {
  const sel =
    'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  const el = root.querySelector<HTMLElement>(sel)
  if (el) el.focus()
}

export type RewardOverlayController = {
  close: () => void
  open: (html: string, setup?: (root: HTMLDivElement) => void, cleanup?: () => void) => void
  /** Replace inner HTML while preserving the current cleanup (Chronicle Echo stepping). */
  replaceInner: (html: string, setup?: (root: HTMLDivElement) => void) => void
  reveal: () => void
  isOpen: () => boolean
  /** Replace cleanup callback (runs previous cleanup first). */
  setCleanup: (cleanup: (() => void) | null) => void
}

export function createRewardOverlayController(el: HTMLDivElement): RewardOverlayController {
  let onCleanup: (() => void) | null = null
  let focusBeforeOpen: HTMLElement | null = null

  const runCleanup = () => {
    if (!onCleanup) return
    try {
      onCleanup()
    } catch {
      /* Cleanup failures must never throw */
    }
    onCleanup = null
  }

  return {
    close() {
      runCleanup()
      el.classList.add('hidden')
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML = ''
      const prev = focusBeforeOpen
      focusBeforeOpen = null
      queueMicrotask(() => {
        if (prev && document.contains(prev)) prev.focus()
      })
    },

    open(html: string, setup?: (root: HTMLDivElement) => void, cleanup?: () => void) {
      runCleanup()
      const wasHidden = el.classList.contains('hidden')
      if (wasHidden) {
        const ae = document.activeElement
        focusBeforeOpen = ae instanceof HTMLElement && ae !== el ? ae : null
      }
      el.innerHTML = html
      el.classList.remove('hidden')
      el.setAttribute('aria-hidden', 'false')
      onCleanup = cleanup ?? null
      setup?.(el)
      queueMicrotask(() => focusFirstOverlayControl(el))
    },

    replaceInner(html: string, setup?: (root: HTMLDivElement) => void) {
      el.innerHTML = html
      setup?.(el)
      queueMicrotask(() => focusFirstOverlayControl(el))
    },

    reveal() {
      el.classList.remove('hidden')
      el.setAttribute('aria-hidden', 'false')
    },

    isOpen() {
      return !el.classList.contains('hidden')
    },

    setCleanup(cleanup: (() => void) | null) {
      runCleanup()
      onCleanup = cleanup
    },
  }
}
