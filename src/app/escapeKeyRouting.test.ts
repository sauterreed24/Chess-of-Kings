import { describe, expect, it } from 'vitest'
import { routeEscapeKey } from './escapeKeyRouting'

describe('routeEscapeKey', () => {
  it('prioritizes closing reward overlay over lab exit', () => {
    expect(
      routeEscapeKey({
        rewardOverlayOpen: true,
        labActive: true,
      }),
    ).toBe('close-reward-overlay')
  })

  it('exits lab when overlay is closed', () => {
    expect(
      routeEscapeKey({
        rewardOverlayOpen: false,
        labActive: true,
      }),
    ).toBe('exit-lab')
  })

  it('noops when neither overlay nor lab', () => {
    expect(
      routeEscapeKey({
        rewardOverlayOpen: false,
        labActive: false,
      }),
    ).toBe('none')
  })
})
