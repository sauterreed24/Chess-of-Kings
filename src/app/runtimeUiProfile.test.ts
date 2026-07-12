import { describe, expect, it } from 'vitest'
import { applyRuntimeUiProfile, resolvePerfLean, shouldUsePerfLean } from './runtimeUiProfile'

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

  it('honours full and lean visual quality overrides', () => {
    const leanDevice = {
      coarsePointer: false,
      reducedMotion: false,
      deviceMemory: 2,
      hardwareConcurrency: 2,
    }
    expect(resolvePerfLean(leanDevice, 'full')).toBe(false)
    expect(resolvePerfLean(leanDevice, 'lean')).toBe(true)
    expect(
      resolvePerfLean(
        { coarsePointer: false, reducedMotion: false, deviceMemory: 8, hardwareConcurrency: 8 },
        'lean',
      ),
    ).toBe(true)
  })
})
