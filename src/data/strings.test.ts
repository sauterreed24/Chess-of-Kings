import { describe, expect, it } from 'vitest'
import { CONFIRM_COPY, confirmCopyForLabExit } from './strings'

describe('confirmCopyForLabExit', () => {
  it('names the destination when leaving a campaign board', () => {
    expect(confirmCopyForLabExit('duel', false)).toBe(CONFIRM_COPY.leaveLabToDuel)
    expect(confirmCopyForLabExit('title', false)).toBe(CONFIRM_COPY.leaveLabToTitle)
    expect(confirmCopyForLabExit('chapters', false)).toBe(CONFIRM_COPY.leaveLabToChapters)
  })

  it('keeps recovered-session copy when the open lab is a duel', () => {
    expect(confirmCopyForLabExit('chapters', true)).toBe(CONFIRM_COPY.replaceRecoveredSession)
  })
})
