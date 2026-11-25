/** Shared compact-viewport query used by play layout and board-fit logic. */
export const COMPACT_MEDIA_QUERY =
  '(max-width: 700px), (max-width: 1024px) and (max-height: 700px), (max-height: 620px)'

export function isCompactViewport(): boolean {
  return window.matchMedia?.(COMPACT_MEDIA_QUERY)?.matches ?? false
}

export type MobileBoardFitElements = {
  playScreen: HTMLElement
  boardStage: HTMLElement
  labOverlay: HTMLElement
  /** Re-apply phone lab nav when the overlay opens or the viewport rotates. */
  syncLabNav?: (labOpen: boolean) => void
}

/** Vertical translation still applied by `el` and its ancestors (e.g. the lab
 *  sheet sliding in), so a measurement taken mid-transition reads the resting
 *  position instead. */
function pendingTranslateY(el: HTMLElement): number {
  let ty = 0
  for (let p: HTMLElement | null = el; p; p = p.parentElement) {
    const m = /^matrix\(([^)]+)\)$/.exec(window.getComputedStyle(p).transform ?? '')
    if (m) ty += Number(m[1]!.split(',')[5]) || 0
  }
  return ty
}

/** Top and bottom of the nearest scrolling ancestor at rest, clipped to the viewport. */
function visibleScrollBand(el: HTMLElement, viewportH: number): [number, number] {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const overflowY = window.getComputedStyle(p).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      const r = p.getBoundingClientRect()
      const ty = pendingTranslateY(p)
      return [Math.max(0, r.top - ty), Math.min(viewportH, r.bottom - ty)]
    }
  }
  return [0, viewportH]
}

/** Measures non-board chrome and sets `--mobile-board-max` so the grid fits the viewport. */
export function applyMobileBoardFit({
  playScreen,
  boardStage,
  labOverlay,
  syncLabNav,
}: MobileBoardFitElements): void {
  const isBoardScene = playScreen.classList.contains('screen-play--board-scene')
  const labOpen = labOverlay.classList.contains('lab-overlay--active')
  syncLabNav?.(labOpen)

  if (!isCompactViewport() || !isBoardScene || !labOpen) {
    playScreen.style.removeProperty('--mobile-board-max')
    return
  }

  const boardWrap = boardStage.querySelector<HTMLElement>('.board-wrap')
  if (!boardWrap) {
    playScreen.style.removeProperty('--mobile-board-max')
    return
  }

  const viewportW = window.visualViewport?.width ?? window.innerWidth
  const viewportH = window.visualViewport?.height ?? window.innerHeight
  const widthCap = Math.max(0, viewportW - 40)
  /* Fit the marble inside the visible band of its scroll container (below the
     lab bar), not below wherever it currently sits: Duel labs scroll it into
     view first, and landscape phones have room only once it is at the top. */
  const [bandTop, bandBottom] = visibleScrollBand(boardWrap, viewportH)
  const heightCap = bandBottom - bandTop - 16
  const boardMax = Math.min(widthCap, Math.max(160, heightCap))

  if (boardMax > 0) {
    playScreen.style.setProperty('--mobile-board-max', `${Math.floor(boardMax)}px`)
  } else {
    playScreen.style.removeProperty('--mobile-board-max')
  }
}

export function createMobileBoardFitController(elements: MobileBoardFitElements) {
  const fit = () => applyMobileBoardFit(elements)
  /** `afterFit` runs once the new size is set, e.g. to scroll the resized board into view. */
  const apply = (afterFit?: () => void) => {
    /* Wait through the opening layout before measuring the compact stack. */
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        fit()
        afterFit?.()
      }),
    )
  }

  const onResize = () => apply()

  const attach = () => {
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.addEventListener('resize', onResize)
  }

  const detach = () => {
    window.visualViewport?.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    window.removeEventListener('resize', onResize)
    elements.playScreen.style.removeProperty('--mobile-board-max')
  }

  return { apply, attach, detach }
}
