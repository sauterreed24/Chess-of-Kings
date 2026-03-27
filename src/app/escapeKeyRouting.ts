/**
 * Pure routing for Escape: prioritize closing modal overlays, then exiting the lab.
 * Used by the main window keyboard handler and unit-tested for regression safety.
 */
export type EscapeKeyAction = 'close-reward-overlay' | 'exit-lab' | 'none'

export function routeEscapeKey(input: {
  rewardOverlayOpen: boolean
  labActive: boolean
}): EscapeKeyAction {
  if (input.rewardOverlayOpen) return 'close-reward-overlay'
  if (input.labActive) return 'exit-lab'
  return 'none'
}
