/**
 * Pure routing for Escape: prioritize closing modal overlays, then exiting the lab.
 * Used by the main window keyboard handler and unit-tested for regression safety.
 */
export type EscapeKeyAction = 'close-confirm' | 'close-reward-overlay' | 'exit-lab' | 'none'

export function routeEscapeKey(input: {
  confirmOpen: boolean
  rewardOverlayOpen: boolean
  labActive: boolean
}): EscapeKeyAction {
  if (input.confirmOpen) return 'close-confirm'
  if (input.rewardOverlayOpen) return 'close-reward-overlay'
  if (input.labActive) return 'exit-lab'
  return 'none'
}
