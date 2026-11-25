import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chess } from 'chess.js'
import {
  findBestMoveAsync,
  getAiSearchSurface,
  preferredAiSearchSurface,
  setAiSearchSurface,
  terminateAiSearchWorker,
} from './aiAsync'

describe('aiAsync', () => {
  it('defaults to main-thread search and returns a legal move', async () => {
    setAiSearchSurface('main')
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 800, 'main')
    expect(move).not.toBeNull()
    expect(chess.moves()).toContain(move!.san)
  })

  it('worker surface returns a legal move when Worker is available', async () => {
    if (typeof Worker === 'undefined') return
    setAiSearchSurface('worker')
    const chess = new Chess()
    const move = await findBestMoveAsync(chess, 2, 'classical', 1200, 'worker')
    expect(move).not.toBeNull()
    expect(chess.moves()).toContain(move!.san)
    terminateAiSearchWorker()
  })

  it('reports preferred surface from localStorage flag', () => {
    setAiSearchSurface('worker')
    expect(getAiSearchSurface()).toBe('worker')
    setAiSearchSurface('main')
    expect(preferredAiSearchSurface()).toBe('main')
  })
})

/** A worker whose script cannot be fetched (e.g. offline before it was cached). */
class UnloadableWorker {
  static instances: UnloadableWorker[] = []
  posted = 0
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  constructor() {
    UnloadableWorker.instances.push(this)
    setTimeout(() => this.onerror?.(new Event('error')), 0)
  }
  postMessage(): void {
    this.posted++
  }
  terminate(): void {}
}

describe('aiAsync worker failure', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    UnloadableWorker.instances = []
    localStorage.removeItem('cok-ai-worker')
  })

  it('drops a worker that fails to load and searches on the main thread without waiting for the watchdog', async () => {
    vi.stubGlobal('Worker', UnloadableWorker)
    vi.resetModules()
    const ai = await import('./aiAsync')
    ai.setAiSearchSurface('worker')

    const first = new Chess()
    const t0 = Date.now()
    const a = await ai.findBestMoveAsync(first, 2, 'classical', 600, 'worker')
    expect(a).not.toBeNull()
    expect(first.moves()).toContain(a!.san)

    /* The next search must not post into the dead worker and stall ~4.6s+ on
       the watchdog: it goes straight to the main-thread engine. */
    const second = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
    const b = await ai.findBestMoveAsync(second, 2, 'classical', 600, 'worker')
    expect(b).not.toBeNull()
    expect(second.moves()).toContain(b!.san)
    expect(Date.now() - t0).toBeLessThan(4000)
    expect(UnloadableWorker.instances).toHaveLength(1)
    expect(UnloadableWorker.instances[0]!.posted).toBe(1)
    expect(ai.warmAiSearchWorker()).toBe(false)
  })

  it('warms one worker ahead of play, and none when main-thread search is chosen', async () => {
    vi.stubGlobal('Worker', class extends UnloadableWorker {
      constructor() {
        super()
        UnloadableWorker.instances.pop()
        UnloadableWorker.instances.push(this)
      }
    })
    vi.resetModules()
    let ai = await import('./aiAsync')
    ai.setAiSearchSurface('main')
    expect(ai.warmAiSearchWorker()).toBe(false)
    expect(UnloadableWorker.instances).toHaveLength(0)

    vi.resetModules()
    ai = await import('./aiAsync')
    ai.setAiSearchSurface('auto')
    expect(ai.warmAiSearchWorker()).toBe(true)
    expect(ai.warmAiSearchWorker()).toBe(true)
    expect(UnloadableWorker.instances).toHaveLength(1)
  })
})
