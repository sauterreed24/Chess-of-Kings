/**
 * Global keyboard shortcuts attached to `window`:
 *
 * - **Escape**: routed through {@link import('../escapeKeyRouting').routeEscapeKey}.
 *   Closes the reward overlay if open, otherwise exits the lab to the
 *   chapters screen, otherwise no-op.
 * - **Enter / Space**: when the lab is active and focus is NOT on the
 *   chess board or promotion panel, advances the current scene if
 *   {@link GlobalShortcutDeps.canAdvance} permits.
 * - **?** (Shift+/): toggles a parchment-styled keyboard help overlay
 *   listing every global shortcut.
 *
 * The handler is a pure function over its event + deps so it is easy to
 * unit-test without a real window. {@link attachGlobalShortcuts} only
 * adds/removes the listener.
 *
 * Inputs that are explicitly NOT handled here (handled elsewhere):
 * - Board roving tabindex / arrow keys (BoardView).
 * - Promotion picker (BoardView's promotion panel).
 * - Modal focus trapping (rewardOverlayController).
 */
import { routeEscapeKey } from '../escapeKeyRouting'

export interface GlobalShortcutDeps {
  isConfirmOpen(): boolean
  closeConfirm(): void
  isRewardOverlayOpen(): boolean
  isLabActive(): boolean
  closeRewardOverlay(): void
  exitLab(): void
  canAdvance(): boolean
  advance(): void
  toggleKeyboardHelp(): void
}

/** Selectors that, when an ancestor of the active element, opt out of advance. */
const ADVANCE_OPT_OUT_SELECTORS = ['.chess-grid', '.promo-panel']

function isFocusInForm(): boolean {
  const ae = document.activeElement
  if (ae instanceof HTMLInputElement || ae instanceof HTMLTextAreaElement) return true
  if (ae instanceof HTMLElement && ae.isContentEditable) return true
  return ae?.closest?.('[contenteditable="true"]') != null
}

function isFocusInBoardOrPromotion(): boolean {
  const ae = document.activeElement
  if (!(ae instanceof Element)) return false
  return ADVANCE_OPT_OUT_SELECTORS.some((sel) => ae.closest(sel) !== null)
}

/**
 * A focused native control (button, link, select) handles its own
 * Enter/Space activation — the global "advance the scene" shortcut must
 * defer to it, or affordances like Skip-ahead and the top nav would be
 * keyboard-dead (Enter would silently advance instead of activating them).
 */
function isFocusOnInteractiveControl(): boolean {
  const ae = document.activeElement
  return ae instanceof HTMLElement && ae.matches('button, a[href], select')
}

/**
 * Pure handler: returns true when the event was consumed (default
 * prevented + handled). Exported for unit tests.
 */
export function handleGlobalKey(e: KeyboardEvent, deps: GlobalShortcutDeps): boolean {
  if (isFocusInForm()) return false

  if (e.key === 'Escape') {
    const action = routeEscapeKey({
      confirmOpen: deps.isConfirmOpen(),
      rewardOverlayOpen: deps.isRewardOverlayOpen(),
      labActive: deps.isLabActive(),
    })
    if (action === 'close-confirm') {
      e.preventDefault()
      deps.closeConfirm()
      return true
    }
    if (action === 'close-reward-overlay') {
      e.preventDefault()
      deps.closeRewardOverlay()
      return true
    }
    if (action === 'exit-lab') {
      e.preventDefault()
      deps.exitLab()
      return true
    }
    return false
  }

  if ((e.key === 'Enter' || e.key === ' ') && deps.isLabActive()) {
    if (isFocusInBoardOrPromotion()) return false
    if (isFocusOnInteractiveControl()) return false
    e.preventDefault()
    if (deps.canAdvance()) {
      deps.advance()
      return true
    }
    return true
  }

  if (e.key === '?') {
    if (deps.isConfirmOpen()) return false
    e.preventDefault()
    deps.toggleKeyboardHelp()
    return true
  }

  return false
}

export function attachGlobalShortcuts(target: Window, deps: GlobalShortcutDeps): () => void {
  const handler = (e: KeyboardEvent): void => {
    handleGlobalKey(e, deps)
  }
  target.addEventListener('keydown', handler)
  return () => target.removeEventListener('keydown', handler)
}
