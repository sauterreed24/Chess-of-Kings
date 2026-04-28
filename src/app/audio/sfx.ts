/**
 * SFX controller for short procedural move cues.
 *
 * Wraps a single `AudioContext` and the user-toggleable enabled flag so
 * `mountApp` (and tests) only see a tiny, well-typed surface. The controller
 * is lazy: the AudioContext is not constructed until SFX are first used, and
 * iOS Safari requires the context to be created/resumed inside a user
 * gesture -- callers should invoke {@link SfxController.unlock} right after
 * the user toggles sound on, or the first cue will be silenced.
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

export interface SfxController {
  /** True when SFX are user-enabled. */
  readonly enabled: boolean
  setEnabled(on: boolean): void
  /** Plays the move-quality cue if enabled and audio is available. */
  playMoveSfx(san: string, quality: MoveQuality | null): void
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
  const factory = opts.audioContextFactory ?? defaultAudioContextFactory

  function ensure(): AudioContext | null {
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
      ensure()
    },

    playMoveSfx(san: string, quality: MoveQuality | null) {
      const c = ensure()
      if (!c) return
      const now = c.currentTime
      const osc = c.createOscillator()
      const gain = c.createGain()
      let freq = 290
      let dur = 0.065
      if (san.includes('x')) freq = 190
      if (san.includes('+')) freq = 360
      if (san.includes('#')) {
        freq = 470
        dur = 0.12
      }
      if (quality === 'brilliant') freq += 120
      else if (quality === 'blunder') freq -= 60
      osc.type = san.includes('x') ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.032, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(now)
      osc.stop(now + dur + 0.015)
    },
  }
}
