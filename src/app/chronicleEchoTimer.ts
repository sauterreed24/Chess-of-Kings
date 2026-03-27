/**
 * Thin interval wrapper for Chronicle Echo auto-play so timer behavior is testable.
 */
export type EchoReplayTimer = {
  start: (intervalMs: number, onTick: () => void) => void
  stop: () => void
  readonly isRunning: boolean
}

export function createEchoReplayTimer(win: Pick<Window, 'setInterval' | 'clearInterval'>): EchoReplayTimer {
  let id: ReturnType<typeof win.setInterval> | 0 = 0
  const stop = () => {
    if (!id) return
    win.clearInterval(id)
    id = 0
  }
  return {
    start(intervalMs: number, onTick: () => void) {
      stop()
      id = win.setInterval(onTick, intervalMs)
    },
    stop,
    get isRunning() {
      return id !== 0
    },
  }
}
