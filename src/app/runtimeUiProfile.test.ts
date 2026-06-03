import { describe, expect, it } from 'vitest'
import { applyRuntimeUiProfile, shouldUsePerfLean } from './runtimeUiProfile'

describe('runtime UI profile', () => {
  it('does not treat Chrome capped 8GB memory as lean by itself', () => {
    expect(
      shouldUsePerfLean({
        coarsePointer: false,
        reducedMotion: false,
        deviceMemory: 8,
        hardwareConcurrency: 8,
      }),
    ).toBe(false)
  })

  it('uses perf-lean for reduced motion, low memory, or low core count', () => {
    expect(shouldUsePerfLean({ coarsePointer: false, reducedMotion: true })).toBe(true)
    expect(
      shouldUsePerfLean({
        coarsePointer: false,
        reducedMotion: false,
        deviceMemory: 4,
        hardwareConcurrency: 8,
      }),
    ).toBe(true)
    expect(
      shouldUsePerfLean({
        coarsePointer: false,
        reducedMotion: false,
        deviceMemory: 8,
        hardwareConcurrency: 4,
      }),
    ).toBe(true)
  })

  it('applies coarse pointer and perf-lean classes independently', () => {
    const root = document.createElement('html')
    applyRuntimeUiProfile(root, {
      coarsePointer: true,
      reducedMotion: false,
      deviceMemory: 8,
      hardwareConcurrency: 8,
    })
    expect(root.classList.contains('coarse-pointer')).toBe(true)
    expect(root.classList.contains('perf-lean')).toBe(false)
  })
})
