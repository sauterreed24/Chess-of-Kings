/**
 * Session streak: how many consecutive local days the player has opened
 * the app. Stored in a dedicated localStorage key (`cok-streak`) so it
 * stays orthogonal to the versioned `SaveData` and never participates in
 * a save migration.
 *
 * Shape on disk (JSON-encoded):
 *   { count: number; lastDayKey: string }
 * - lastDayKey is the YYYY-MM-DD of the most recent recorded day, in
 *   the player's local timezone. We do not record UTC because a streak
 *   means "consecutive days from where the player lives".
 *
 * Behavior of {@link recordToday}:
 *   - If `today` is the same day as `lastDayKey` -> no change.
 *   - If `today` is exactly one day after -> count incremented.
 *   - If `today` is two or more days after -> count resets to 1.
 *   - If `today` is before `lastDayKey` (clock skew / DST) -> no change.
 *
 * The function is pure over (clock, storage); both can be substituted
 * for tests.
 */
export interface StreakState {
  count: number
  lastDayKey: string
}

export interface StreakStorage {
  read(): string | null
  /** Returns whether the value was persisted (false on quota / private mode). */
  write(value: string): boolean
}

const STORAGE_KEY = 'cok-streak'

export function localStorageStreakStore(): StreakStorage {
  return {
    read() {
      try {
        return localStorage.getItem(STORAGE_KEY)
      } catch {
        return null
      }
    },
    write(value: string) {
      try {
        localStorage.setItem(STORAGE_KEY, value)
        return true
      } catch {
        return false
      }
    },
  }
}

export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function parseDayKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const [, y, mo, d] = m
  return new Date(Number(y), Number(mo) - 1, Number(d))
}

function dayDelta(prev: string, today: string): number {
  const a = parseDayKey(prev)
  const b = parseDayKey(today)
  if (!a || !b) return Number.POSITIVE_INFINITY
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function readStreak(store: StreakStorage = localStorageStreakStore()): StreakState {
  const raw = store.read()
  if (!raw) return { count: 0, lastDayKey: '' }
  try {
    const parsed = JSON.parse(raw) as Partial<StreakState>
    const count = typeof parsed.count === 'number' && parsed.count >= 0 ? Math.floor(parsed.count) : 0
    const lastDayKey = typeof parsed.lastDayKey === 'string' ? parsed.lastDayKey : ''
    return { count, lastDayKey }
  } catch {
    return { count: 0, lastDayKey: '' }
  }
}

export interface RecordResult {
  state: StreakState
  /** True when today's recording bumped the streak (new day, or first day). */
  isFreshDay: boolean
  /** True when today's recording reset the streak after a gap. */
  wasReset: boolean
  /** False when localStorage rejected the write (streak may not persist across reloads). */
  persistOk: boolean
}

export function recordToday(
  now: Date = new Date(),
  store: StreakStorage = localStorageStreakStore(),
): RecordResult {
  const today = dayKey(now)
  const prev = readStreak(store)

  if (prev.lastDayKey === today) {
    return { state: prev, isFreshDay: false, wasReset: false, persistOk: true }
  }

  const delta = dayDelta(prev.lastDayKey, today)
  let next: StreakState
  let wasReset = false
  if (!prev.lastDayKey || delta < 0 || delta > 1) {
    next = { count: 1, lastDayKey: today }
    wasReset = prev.count > 1
  } else {
    /* delta === 1 (consecutive day) */
    next = { count: prev.count + 1, lastDayKey: today }
  }
  const persistOk = store.write(JSON.stringify(next))
  const state = persistOk ? next : readStreak(store)
  return { state, isFreshDay: true, wasReset, persistOk }
}
