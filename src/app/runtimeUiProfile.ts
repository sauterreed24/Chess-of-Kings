export type RuntimeUiProfileInput = {
  coarsePointer: boolean
  reducedMotion: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

/** Stored preference: auto (device heuristics), full polish, or forced lean. */
export type VisualQualityPreference = 'auto' | 'full' | 'lean'

export const VISUAL_QUALITY_PREF_KEY = 'cok-visual-quality'

export function shouldUsePerfLean(profile: RuntimeUiProfileInput): boolean {
  const memoryLean = typeof profile.deviceMemory === 'number' && profile.deviceMemory <= 4
  const coreLean =
    typeof profile.hardwareConcurrency === 'number' && profile.hardwareConcurrency <= 4
  return profile.reducedMotion || memoryLean || coreLean
}

export function getVisualQualityPreference(): VisualQualityPreference {
  try {
    const raw = localStorage.getItem(VISUAL_QUALITY_PREF_KEY)
    if (raw === 'full' || raw === 'lean' || raw === 'auto') return raw
  } catch {
    /* private mode */
  }
  return 'auto'
}

export function setVisualQualityPreference(value: VisualQualityPreference): void {
  try {
    if (value === 'auto') localStorage.removeItem(VISUAL_QUALITY_PREF_KEY)
    else localStorage.setItem(VISUAL_QUALITY_PREF_KEY, value)
  } catch {
    /* private mode */
  }
}

export function cycleVisualQualityPreference(): VisualQualityPreference {
  const order: VisualQualityPreference[] = ['auto', 'full', 'lean']
  const current = getVisualQualityPreference()
  const next = order[(order.indexOf(current) + 1) % order.length]!
  setVisualQualityPreference(next)
  return next
}

export function resolvePerfLean(
  profile: RuntimeUiProfileInput,
  preference: VisualQualityPreference = getVisualQualityPreference(),
): boolean {
  if (preference === 'full') return false
  if (preference === 'lean') return true
  return shouldUsePerfLean(profile)
}

export function applyRuntimeUiProfile(
  root: HTMLElement,
  profile: RuntimeUiProfileInput,
  preference: VisualQualityPreference = getVisualQualityPreference(),
): void {
  root.classList.toggle('coarse-pointer', profile.coarsePointer)
  root.classList.toggle('perf-lean', resolvePerfLean(profile, preference))
}

/** Re-read device heuristics + stored visual preference and apply to <html>. */
export function refreshDocumentUiProfile(root: HTMLElement = document.documentElement): void {
  const matchMedia =
    typeof window.matchMedia === 'function'
      ? window.matchMedia.bind(window)
      : (() => ({ matches: false }) as MediaQueryList)
  const mqCoarse = matchMedia('(pointer: coarse)')
  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)')
  const nav = navigator as Navigator & { deviceMemory?: number }
  applyRuntimeUiProfile(
    root,
    {
      coarsePointer: mqCoarse.matches,
      reducedMotion: mqReduced.matches || root.classList.contains('force-reduced-motion'),
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    },
    getVisualQualityPreference(),
  )
}
