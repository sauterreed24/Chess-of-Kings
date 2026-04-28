import { describe, expect, it, vi } from 'vitest'
import { createSfxController } from './sfx'

interface FakeOscillator {
  type: OscillatorType
  frequency: { setValueAtTime: ReturnType<typeof vi.fn> }
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

interface FakeGain {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>
  }
  connect: ReturnType<typeof vi.fn>
}

interface FakeAudioContext {
  currentTime: number
  state: 'suspended' | 'running'
  destination: object
  createOscillator: () => FakeOscillator
  createGain: () => FakeGain
  resume: () => Promise<void>
  oscillators: FakeOscillator[]
  resumed: number
}

function makeFakeAudioContext(initial: 'suspended' | 'running' = 'running'): FakeAudioContext {
  const oscillators: FakeOscillator[] = []
  const ctx: FakeAudioContext = {
    currentTime: 0,
    state: initial,
    destination: {},
    oscillators,
    resumed: 0,
    createOscillator: () => {
      const osc: FakeOscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      oscillators.push(osc)
      return osc
    },
    createGain: () => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }),
    resume: () => {
      ctx.state = 'running'
      ctx.resumed += 1
      return Promise.resolve()
    },
  }
  return ctx
}

describe('createSfxController', () => {
  it('starts with the requested enabled flag and toggles via setEnabled', () => {
    const sfx = createSfxController({ enabled: false, audioContextFactory: () => null })
    expect(sfx.enabled).toBe(false)
    sfx.setEnabled(true)
    expect(sfx.enabled).toBe(true)
    sfx.setEnabled(false)
    expect(sfx.enabled).toBe(false)
  })

  it('does not construct the AudioContext when disabled, even when called', () => {
    const factory = vi.fn(() => makeFakeAudioContext() as unknown as AudioContext)
    const sfx = createSfxController({ enabled: false, audioContextFactory: factory })
    sfx.unlock()
    sfx.playMoveSfx('e4', null)
    expect(factory).not.toHaveBeenCalled()
  })

  it('lazily constructs the AudioContext on first use when enabled', () => {
    const fake = makeFakeAudioContext()
    const factory = vi.fn(() => fake as unknown as AudioContext)
    const sfx = createSfxController({ enabled: true, audioContextFactory: factory })
    expect(factory).not.toHaveBeenCalled()
    sfx.playMoveSfx('e4', null)
    expect(factory).toHaveBeenCalledTimes(1)
    sfx.playMoveSfx('Nf3', 'good')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(fake.oscillators).toHaveLength(2)
  })

  it('resumes a suspended AudioContext on each play', () => {
    const fake = makeFakeAudioContext('suspended')
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.playMoveSfx('e4', null)
    expect(fake.resumed).toBe(1)
    fake.state = 'suspended'
    sfx.playMoveSfx('Nf3', null)
    expect(fake.resumed).toBe(2)
  })

  it('encodes capture / check / mate / quality into oscillator type and frequency', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.playMoveSfx('e4', null)
    sfx.playMoveSfx('exd5', null)
    sfx.playMoveSfx('Qh5+', null)
    sfx.playMoveSfx('Qxf7#', null)
    sfx.playMoveSfx('Bxh7+', 'brilliant')
    sfx.playMoveSfx('Nf3', 'blunder')
    const types = fake.oscillators.map((o) => o.type)
    expect(types[0]).toBe('sine')
    expect(types[1]).toBe('triangle')
    expect(types[3]).toBe('triangle')
    const freqOf = (i: number): number => {
      const calls = fake.oscillators[i]!.frequency.setValueAtTime.mock.calls
      return calls[0]![0] as number
    }
    expect(freqOf(0)).toBe(290)
    expect(freqOf(1)).toBe(190)
    expect(freqOf(2)).toBe(360)
    expect(freqOf(3)).toBe(470)
    expect(freqOf(4)).toBe(480)
    expect(freqOf(5)).toBe(230)
  })

  it('silently no-ops when the factory returns null (unsupported environment)', () => {
    const sfx = createSfxController({ enabled: true, audioContextFactory: () => null })
    expect(() => sfx.playMoveSfx('e4', null)).not.toThrow()
    expect(() => sfx.unlock()).not.toThrow()
  })

  it('survives a throwing factory without bubbling exceptions', () => {
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => {
        throw new Error('audio not allowed')
      },
    })
    expect(() => sfx.playMoveSfx('e4', null)).not.toThrow()
  })
})
