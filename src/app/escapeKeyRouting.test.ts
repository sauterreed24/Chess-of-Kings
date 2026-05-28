import { describe, expect, it } from 'vitest'
import { routeEscapeKey } from './escapeKeyRouting'

describe('routeEscapeKey', () => {
  it('prioritizes closing confirm dialog over reward overlay and lab exit', () => {
    expect(
      routeEscapeKey({
        confirmOpen: true,
        rewardOverlayOpen: true,
        labActive: true,
      }),
    ).toBe('close-confirm')
  })

  it('prioritizes closing reward overlay over lab exit', () => {
    expect(
      routeEscapeKey({
        confirmOpen: false,
        rewardOverlayOpen: true,
        labActive: true,
      }),
    ).toBe('close-reward-overlay')
  })

  it('exits lab when overlay is closed', () => {
    expect(
      routeEscapeKey({
        confirmOpen: false,
        rewardOverlayOpen: false,
        labActive: true,
      }),
    ).toBe('exit-lab')
  })

  it('noops when neither overlay nor lab', () => {
    expect(
      routeEscapeKey({
        confirmOpen: false,
        rewardOverlayOpen: false,
        labActive: false,
      }),
    ).toBe('none')
  })
})
