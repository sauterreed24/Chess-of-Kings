import { createFocusTrap } from './a11y/focusTrap'

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

export type RewardOverlayControllerOptions = {
  /** Fires when visibility becomes open (true) or fully closed (false). */
  onOpenChange?: (open: boolean) => void
}

export function createRewardOverlayController(
  el: HTMLDivElement,
  options?: RewardOverlayControllerOptions,
): RewardOverlayController {
  const onOpenChange = options?.onOpenChange
  const trap = createFocusTrap(el)
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

  const deactivateTrap = () => trap.deactivate()

  return {
    close() {
      runCleanup()
      deactivateTrap()
      el.classList.add('hidden')
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML = ''
      onOpenChange?.(false)
      const prev = focusBeforeOpen
      focusBeforeOpen = null
      queueMicrotask(() => {
        if (prev && document.contains(prev)) prev.focus()
      })
    },

    open(html: string, setup?: (root: HTMLDivElement) => void, cleanup?: () => void) {
      runCleanup()
      deactivateTrap()
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
      onOpenChange?.(true)
      trap.activate()
      queueMicrotask(() => focusFirstOverlayControl(el))
    },

    replaceInner(html: string, setup?: (root: HTMLDivElement) => void) {
      el.innerHTML = html
      setup?.(el)
      trap.activate()
      queueMicrotask(() => focusFirstOverlayControl(el))
    },

    reveal() {
      const wasHidden = el.classList.contains('hidden')
      el.classList.remove('hidden')
      el.setAttribute('aria-hidden', 'false')
      if (wasHidden) onOpenChange?.(true)
      trap.activate()
      queueMicrotask(() => focusFirstOverlayControl(el))
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
