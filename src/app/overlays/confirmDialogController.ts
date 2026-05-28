import { createFocusTrap } from '../a11y/focusTrap'
import { buildConfirmDialogHtml, type ConfirmDialogCopy } from './confirmDialogMarkup'

function focusFirstOverlayControl(root: HTMLElement) {
  const sel =
    'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  const el = root.querySelector<HTMLElement>(sel)
  if (el) el.focus()
}

export type ConfirmDialogController = {
  open: (copy: ConfirmDialogCopy) => Promise<boolean>
  close: () => void
  isOpen: () => boolean
}

export type ConfirmDialogControllerOptions = {
  onOpenChange?: (open: boolean) => void
}

export function createConfirmDialogController(
  el: HTMLDivElement,
  options?: ConfirmDialogControllerOptions,
): ConfirmDialogController {
  const onOpenChange = options?.onOpenChange
  const trap = createFocusTrap(el)
  let focusBeforeOpen: HTMLElement | null = null
  let pending: { resolve: (v: boolean) => void } | null = null
  let onKeyDown: ((e: KeyboardEvent) => void) | null = null

  const finish = (result: boolean) => {
    if (onKeyDown) {
      el.removeEventListener('keydown', onKeyDown)
      onKeyDown = null
    }
    trap.deactivate()
    el.classList.add('hidden')
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = ''
    el.removeAttribute('role')
    el.removeAttribute('aria-modal')
    onOpenChange?.(false)
    const prev = focusBeforeOpen
    focusBeforeOpen = null
    const p = pending
    pending = null
    queueMicrotask(() => {
      if (prev && document.contains(prev)) prev.focus()
    })
    p?.resolve(result)
  }

  return {
    isOpen() {
      return !el.classList.contains('hidden')
    },

    close() {
      if (!pending) return
      finish(false)
    },

    open(copy: ConfirmDialogCopy) {
      if (pending) finish(false)

      return new Promise<boolean>((resolve) => {
        pending = { resolve }
        const ae = document.activeElement
        focusBeforeOpen = ae instanceof HTMLElement && ae !== el ? ae : null

        el.innerHTML = buildConfirmDialogHtml(copy)
        el.classList.remove('hidden')
        el.setAttribute('aria-hidden', 'false')
        el.setAttribute('role', 'alertdialog')
        el.setAttribute('aria-modal', 'true')
        onOpenChange?.(true)

        onKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            finish(false)
          }
        }
        el.addEventListener('keydown', onKeyDown)

        el.querySelector<HTMLButtonElement>('#btn-confirm-cancel')?.addEventListener('click', () => {
          finish(false)
        })
        el.querySelector<HTMLButtonElement>('#btn-confirm-ok')?.addEventListener('click', () => {
          finish(true)
        })

        trap.activate()
        queueMicrotask(() => focusFirstOverlayControl(el))
      })
    },
  }
}
