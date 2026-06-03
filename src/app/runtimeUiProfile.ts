export type RuntimeUiProfileInput = {
  coarsePointer: boolean
  reducedMotion: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

export function shouldUsePerfLean(profile: RuntimeUiProfileInput): boolean {
  const memoryLean = typeof profile.deviceMemory === 'number' && profile.deviceMemory <= 4
  const coreLean =
    typeof profile.hardwareConcurrency === 'number' && profile.hardwareConcurrency <= 4
  return profile.reducedMotion || memoryLean || coreLean
}

export function applyRuntimeUiProfile(root: HTMLElement, profile: RuntimeUiProfileInput): void {
  root.classList.toggle('coarse-pointer', profile.coarsePointer)
  root.classList.toggle('perf-lean', shouldUsePerfLean(profile))
}
