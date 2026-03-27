import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createEchoReplayTimer } from './chronicleEchoTimer'

describe('createEchoReplayTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stops ticking after stop()', () => {
    const tick = vi.fn()
    const t = createEchoReplayTimer(window)
    t.start(100, tick)
    vi.advanceTimersByTime(250)
    expect(tick.mock.calls.length).toBeGreaterThanOrEqual(2)
    const n = tick.mock.calls.length
    t.stop()
    expect(t.isRunning).toBe(false)
    vi.advanceTimersByTime(500)
    expect(tick.mock.calls.length).toBe(n)
  })

  it('restart replaces previous interval', () => {
    const a = vi.fn()
    const b = vi.fn()
    const t = createEchoReplayTimer(window)
    t.start(100, a)
    t.start(100, b)
    vi.advanceTimersByTime(100)
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalled()
  })
})
