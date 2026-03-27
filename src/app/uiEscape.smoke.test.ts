import { describe, expect, it } from 'vitest'
import { createRewardOverlayController } from './rewardOverlayController'
import { routeEscapeKey } from './escapeKeyRouting'

/**
 * Smoke: simulates the Escape priority chain used in main.ts (overlay → lab → none).
 */
describe('UI Escape smoke (controller + routing)', () => {
  it('full chain: overlay open closes via route + controller; then lab would exit', () => {
    const el = document.createElement('div')
    el.id = 'reward-overlay'
    document.body.appendChild(el)
    const ctl = createRewardOverlayController(el)

    ctl.open('<div>reward</div>')
    expect(routeEscapeKey({ rewardOverlayOpen: ctl.isOpen(), labActive: true })).toBe('close-reward-overlay')
    ctl.close()
    expect(ctl.isOpen()).toBe(false)

    expect(routeEscapeKey({ rewardOverlayOpen: ctl.isOpen(), labActive: true })).toBe('exit-lab')
    expect(routeEscapeKey({ rewardOverlayOpen: ctl.isOpen(), labActive: false })).toBe('none')

    document.body.removeChild(el)
  })

  it('vestibule-style lab exit only when overlay closed', () => {
    const labActive = true
    const overlayCtl = createRewardOverlayController(document.createElement('div'))
    overlayCtl.close()
    const action = routeEscapeKey({ rewardOverlayOpen: overlayCtl.isOpen(), labActive })
    expect(action).toBe('exit-lab')
  })
})
