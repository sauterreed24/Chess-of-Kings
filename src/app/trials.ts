/**
 * Playtest trials: changes to rules or balance that ship switched off, so
 * the game plays exactly as before until the owner turns one on to compare.
 *
 * Turn on from any device with a URL flag, e.g. `?try=early-relief`
 * (comma-separate several); `?try=off` clears them all. The choice is kept
 * under its own storage key — never inside the save — so a trial cannot
 * touch saved progress and survives the home-screen PWA dropping the query.
 */

export const TRIAL_IDS = ['early-relief'] as const
export type TrialId = (typeof TRIAL_IDS)[number]

export const TRIALS_STORAGE_KEY = 'calculus-of-kings-trials-v1'

const isTrialId = (value: string): value is TrialId => (TRIAL_IDS as readonly string[]).includes(value)

type TrialStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Read (and persist) the active trials from a `?try=` query and storage. */
export function readTrials(search: string, storage: TrialStorage | null): Set<TrialId> {
  const requested = new URLSearchParams(search).get('try')
  if (requested !== null) {
    const ids = requested
      .split(',')
      .map((s) => s.trim())
      .filter(isTrialId)
    try {
      if (ids.length === 0) storage?.removeItem(TRIALS_STORAGE_KEY)
      else storage?.setItem(TRIALS_STORAGE_KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable: the trial still applies to this visit */
    }
    return new Set(ids)
  }
  try {
    const raw = storage?.getItem(TRIALS_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is TrialId => typeof v === 'string' && isTrialId(v)) : [])
  } catch {
    return new Set()
  }
}

/** Active trials for this page (browser only; tests and the evaluator pass their own). */
export function activeTrials(): Set<TrialId> {
  if (typeof window === 'undefined') return new Set()
  let storage: TrialStorage | null
  try {
    storage = window.localStorage
  } catch {
    storage = null /* private mode / blocked storage: trials last for this visit */
  }
  return readTrials(window.location?.search ?? '', storage)
}
