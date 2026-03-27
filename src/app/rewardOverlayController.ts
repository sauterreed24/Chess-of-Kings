/**
 * Centralized reward / modal overlay lifecycle: content swap, visibility, and cleanup
 * (timers, etc.) so tests can assert behavior without the full app shell.
 */
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
      el.innerHTML = ''
    },

    open(html: string, setup?: (root: HTMLDivElement) => void, cleanup?: () => void) {
      runCleanup()
      el.innerHTML = html
      el.classList.remove('hidden')
      onCleanup = cleanup ?? null
      setup?.(el)
    },

    replaceInner(html: string, setup?: (root: HTMLDivElement) => void) {
      el.innerHTML = html
      setup?.(el)
    },

    reveal() {
      el.classList.remove('hidden')
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
