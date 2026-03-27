import { describe, it, expect } from 'vitest'
import { ledgerContentFingerprint } from './ledgerFingerprint'

describe('ledgerContentFingerprint', () => {
  it('differs when SAN list grows', () => {
    const a = ledgerContentFingerprint(['e4'], [])
    const b = ledgerContentFingerprint(['e4', 'e5'], [])
    expect(a).not.toBe(b)
  })

  it('differs when move quality changes', () => {
    const a = ledgerContentFingerprint(['e4'], [null])
    const b = ledgerContentFingerprint(['e4'], ['good'])
    expect(a).not.toBe(b)
  })

  it('is stable for identical inputs', () => {
    expect(ledgerContentFingerprint(['Nf3', 'd5'], ['ok', null])).toBe(
      ledgerContentFingerprint(['Nf3', 'd5'], ['ok', null]),
    )
  })
})
