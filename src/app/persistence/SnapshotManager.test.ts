import { describe, expect, it } from 'vitest'
import { SnapshotManager } from './SnapshotManager'
import type { InProgressSnapshot } from '../../types'

describe('SnapshotManager (PR2 seam foundation)', () => {
  it('stores and clears pending snapshot', () => {
    const mgr = new SnapshotManager()
    const snap = { mode: 'match', chapterIndex: 0, sceneIndex: 0 } as unknown as InProgressSnapshot

    expect(mgr.getPendingSnapshot()).toBeNull()
    mgr.setPendingSnapshot(snap)
    expect(mgr.getPendingSnapshot()).toBe(snap)
    mgr.clearPendingSnapshot()
    expect(mgr.getPendingSnapshot()).toBeNull()
  })

  it('accepts onPersistFailure callback (no-op by default)', () => {
    let called = false
    const mgr = new SnapshotManager({ onPersistFailure: () => { called = true } })
    // In PR2 the real persist path will invoke it on write failure.
    // For the seam we just ensure construction + callback wiring works.
    expect(called).toBe(false)
  })
})
