/**
 * SFX controller for short procedural move cues.
 *
 * Wraps a single `AudioContext` and the user-toggleable enabled flag so
 * `mountApp` (and tests) only see a tiny, well-typed surface. The controller
 * is lazy: the AudioContext is only constructed by {@link SfxController.unlock},
 * which callers run from user-gesture handlers. Move and UI cues intentionally
 * no-op until that unlock has succeeded, avoiding autoplay warnings from
 * async AI replies or restored sessions.
 *
 * Cue design (deterministic from SAN + quality):
 * - Captures   ('x' in SAN): triangle wave, lower frequency.
 * - Checks     ('+'):        higher frequency.
 * - Checkmate  ('#'):        higher still, longer envelope.
 * - Quality 'brilliant' shifts +120 Hz, 'blunder' shifts -60 Hz.
 * - Default:   sine wave, ~290 Hz, ~65 ms envelope.
 *
 * Persistence is intentionally NOT handled here -- mountApp owns the
 * localStorage key (`cok-sfx-enabled`) so this controller stays trivially
 * testable and free of browser globals beyond `AudioContext`.
 */
import type { MoveQuality } from '../gameFlow'

type AudioContextCtor = new () => AudioContext

export interface SfxControllerOptions {
  /** Initial enabled state. */
  enabled: boolean
  /**
   * Optional factory used to construct the AudioContext on first use.
   * Defaults to `window.AudioContext || window.webkitAudioContext`.
   * Tests pass a stub here to avoid pulling Web Audio into jsdom.
   */
  audioContextFactory?: () => AudioContext | null
}

/** Discrete UI events that earn their own short cue. */
export type SfxEvent =
  | 'undo'
  | 'advance'
  | 'reward'
  | 'draw'
  | 'castle'
  | 'promotion'
  | 'unlock'

export interface SfxController {
  /** True when SFX are user-enabled. */
  readonly enabled: boolean
  setEnabled(on: boolean): void
  /** Plays the move-quality cue if enabled and audio is available. */
  playMoveSfx(san: string, quality: MoveQuality | null): void
  /** Plays a non-board UI cue (undo, advance, reward, draw, etc.). */
  playEventSfx(event: SfxEvent): void
  /** Eagerly construct/resume the AudioContext (use inside a user gesture). */
  unlock(): void
}

function defaultAudioContextFactory(): AudioContext | null {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  const Ctx = w.AudioContext || w.webkitAudioContext
  if (!Ctx) return null
  return new Ctx()
}

export function createSfxController(opts: SfxControllerOptions): SfxController {
  let enabled = opts.enabled
  let ctx: AudioContext | null = null
  let unlocked = false
  const factory = opts.audioContextFactory ?? defaultAudioContextFactory

  function unlockContext(): AudioContext | null {
    if (!enabled) return null
    if (!ctx) {
      try {
        ctx = factory()
      } catch {
        ctx = null
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    unlocked = Boolean(ctx)
    return ctx
  }

  function playableContext(): AudioContext | null {
    if (!enabled || !unlocked || !ctx || ctx.state !== 'running') return null
    return ctx
  }

  return {
    get enabled() {
      return enabled
    },

    setEnabled(on: boolean) {
      enabled = on
    },

    unlock() {
      unlockContext()
    },

    playMoveSfx(san: string, quality: MoveQuality | null) {
      const c = playableContext()
      if (!c) return
      const now = c.currentTime
      const osc = c.createOscillator()
      const gain = c.createGain()
      let freq = 290
      let dur = 0.065
      let waveform: OscillatorType = 'sine'
      if (san.includes('x')) {
        freq = 190
        waveform = 'triangle'
      }
      const isCastle = san === 'O-O' || san === 'O-O-O'
      if (isCastle) {
        freq = 240
        dur = 0.09
        waveform = 'square'
      }
      const isPromotion = /=([QRBN])/.test(san)
      if (isPromotion) {
        freq = 540
        dur = 0.11
        waveform = 'triangle'
      }
      if (san.includes('+')) freq = 360
      if (san.includes('#')) {
        freq = 470
        dur = 0.12
      }
      if (quality === 'brilliant') freq += 120
      else if (quality === 'blunder') freq -= 60
      osc.type = waveform
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.032, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(now)
      osc.stop(now + dur + 0.015)
    },

    playEventSfx(event: SfxEvent) {
      const c = playableContext()
      if (!c) return
      /* Reduced-motion users still hear cues, but at a softer envelope. */
      const reduced =
        typeof matchMedia !== 'undefined' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
      const peak = reduced ? 0.018 : 0.028
      const cues: Record<SfxEvent, { freq: number; dur: number; type: OscillatorType }> = {
        undo: { freq: 220, dur: 0.05, type: 'sine' },
        advance: { freq: 320, dur: 0.06, type: 'sine' },
        reward: { freq: 520, dur: 0.13, type: 'triangle' },
        draw: { freq: 250, dur: 0.09, type: 'sine' },
        castle: { freq: 240, dur: 0.09, type: 'square' },
        promotion: { freq: 540, dur: 0.11, type: 'triangle' },
        unlock: { freq: 600, dur: 0.16, type: 'triangle' },
      }
      const cue = cues[event]
      const now = c.currentTime
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = cue.type
      osc.frequency.setValueAtTime(cue.freq, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.dur)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(now)
      osc.stop(now + cue.dur + 0.015)
    },
  }
}
