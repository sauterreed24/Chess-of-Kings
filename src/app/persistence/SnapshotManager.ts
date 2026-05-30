import type { InProgressSnapshot } from '../../types'
import type { BuildSavePayload } from './snapshotReplay' // will be expanded in later PRs

export type SnapshotManagerOptions = {
  onPersistFailure?: () => void
}

/**
 * Owns debounced SaveData persistence and in-progress snapshot lifecycle.
 * This is the production seam that will eventually own flushPersist, the
 * provider contract, and recovery orchestration currently inside GameFlow.
 *
 * PR2 will flesh out the full implementation + heavy tests.
 */
export class SnapshotManager {
  private pendingInProgressSnapshot: InProgressSnapshot | null = null
  private readonly onPersistFailure: () => void

  constructor(opts: SnapshotManagerOptions = {}) {
    this.onPersistFailure = opts.onPersistFailure ?? (() => {})
  }

  setPendingSnapshot(snap: InProgressSnapshot | null) {
    this.pendingInProgressSnapshot = snap
  }

  getPendingSnapshot(): InProgressSnapshot | null {
    return this.pendingInProgressSnapshot
  }

  clearPendingSnapshot() {
    this.pendingInProgressSnapshot = null
  }

  /**
   * Future: will accept a provider that returns the complete BuildSavePayload
   * and perform the actual debounced (or sync-in-test) write.
   */
  persist(_provider: () => BuildSavePayload) {
    // Placeholder — real implementation + SYNC_IO handling + quota trim
    // will land in the body of PR2.
    // For now the seam exists and GameFlow can begin delegating calls.
  }

  /**
   * Future: will own the full build + validation logic currently duplicated
   * in GameFlow.buildInProgressSnapshot and the recovery methods.
   */
  buildInProgressSnapshot(_state: unknown): InProgressSnapshot | null {
    return null // placeholder
  }
}
