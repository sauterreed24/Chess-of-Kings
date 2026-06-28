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

  it('does not construct the AudioContext from play calls before unlock', () => {
    const factory = vi.fn(() => makeFakeAudioContext() as unknown as AudioContext)
    const sfx = createSfxController({ enabled: true, audioContextFactory: factory })
    sfx.playMoveSfx('e4', null)
    sfx.playEventSfx('advance')
    expect(factory).not.toHaveBeenCalled()
  })

  it('constructs the AudioContext on unlock and then reuses it for cues', () => {
    const fake = makeFakeAudioContext()
    const factory = vi.fn(() => fake as unknown as AudioContext)
    const sfx = createSfxController({ enabled: true, audioContextFactory: factory })
    expect(factory).not.toHaveBeenCalled()
    sfx.unlock()
    expect(factory).toHaveBeenCalledTimes(1)
    sfx.playMoveSfx('e4', null)
    expect(factory).toHaveBeenCalledTimes(1)
    sfx.playMoveSfx('Nf3', 'good')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(fake.oscillators).toHaveLength(2)
  })

  it('resumes a suspended AudioContext only during unlock', () => {
    const fake = makeFakeAudioContext('suspended')
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
    expect(fake.resumed).toBe(1)
    sfx.playMoveSfx('e4', null)
    expect(fake.resumed).toBe(1)
    fake.state = 'suspended'
    sfx.playMoveSfx('Nf3', null)
    expect(fake.resumed).toBe(1)
    expect(fake.oscillators).toHaveLength(1)
  })

  it('encodes capture / check / mate / quality into oscillator type and frequency', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
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

  it('castle SAN gets a distinct square-wave cue at 240 Hz', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
    sfx.playMoveSfx('O-O', null)
    sfx.playMoveSfx('O-O-O', null)
    expect(fake.oscillators[0]!.type).toBe('square')
    expect(fake.oscillators[1]!.type).toBe('square')
    expect(fake.oscillators[0]!.frequency.setValueAtTime.mock.calls[0]![0]).toBe(240)
  })

  it('promotion SAN gets a triangle-wave cue at 540 Hz (when not also check/mate)', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
    sfx.playMoveSfx('e8=Q', null)
    expect(fake.oscillators[0]!.type).toBe('triangle')
    expect(fake.oscillators[0]!.frequency.setValueAtTime.mock.calls[0]![0]).toBe(540)
  })

  it('capture-promotion and check-promotion SANs use the promotion cue precedence', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
    sfx.playMoveSfx('exd8=N', null)
    expect(fake.oscillators[0]!.type).toBe('triangle')
    expect(fake.oscillators[0]!.frequency.setValueAtTime.mock.calls[0]![0]).toBe(540)

    fake.oscillators.length = 0
    sfx.playMoveSfx('exd8=Q+', null)
    expect(fake.oscillators[0]!.frequency.setValueAtTime.mock.calls[0]![0]).toBe(360)

    fake.oscillators.length = 0
    sfx.playMoveSfx('axb8=R#', null)
    expect(fake.oscillators[0]!.frequency.setValueAtTime.mock.calls[0]![0]).toBe(470)
  })

  it('playEventSfx fires every cue label with its expected frequency', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: true,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.unlock()
    sfx.playEventSfx('undo')
    sfx.playEventSfx('advance')
    sfx.playEventSfx('reward')
    sfx.playEventSfx('draw')
    sfx.playEventSfx('castle')
    sfx.playEventSfx('promotion')
    sfx.playEventSfx('unlock')
    sfx.playEventSfx('hint')
    const freqs = fake.oscillators.map(
      (o) => o.frequency.setValueAtTime.mock.calls[0]![0] as number,
    )
    expect(freqs).toEqual([220, 320, 520, 250, 240, 540, 600, 420])
  })

  it('playEventSfx is silent when disabled', () => {
    const fake = makeFakeAudioContext()
    const sfx = createSfxController({
      enabled: false,
      audioContextFactory: () => fake as unknown as AudioContext,
    })
    sfx.playEventSfx('reward')
    expect(fake.oscillators).toHaveLength(0)
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
    expect(() => sfx.unlock()).not.toThrow()
    expect(() => sfx.playMoveSfx('e4', null)).not.toThrow()
  })
})
