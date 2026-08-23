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

  const chromeAbove = Math.max(0, boardWrap.getBoundingClientRect().top)

  const viewportW = window.visualViewport?.width ?? window.innerWidth
  const viewportH = window.visualViewport?.height ?? window.innerHeight
  const widthCap = Math.max(0, viewportW - 40)
  /* Tools under the marble can scroll. Size the grid so the starting ranks
     stay on screen even when wrap.top is already deep in a short window. */
  const heightCap = viewportH - chromeAbove - 16
  const boardMax = Math.min(widthCap, Math.max(160, heightCap))

  if (boardMax > 0) {
    playScreen.style.setProperty('--mobile-board-max', `${Math.floor(boardMax)}px`)
  } else {
    playScreen.style.removeProperty('--mobile-board-max')
  }
}

export function createMobileBoardFitController(elements: MobileBoardFitElements) {
  const fit = () => applyMobileBoardFit(elements)
  const apply = () => {
    /* Wait through the opening layout before measuring the compact stack. */
    window.requestAnimationFrame(() => window.requestAnimationFrame(fit))
  }

  const attach = () => {
    window.visualViewport?.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    window.addEventListener('resize', apply)
  }

  const detach = () => {
    window.visualViewport?.removeEventListener('resize', apply)
    window.removeEventListener('orientationchange', apply)
    window.removeEventListener('resize', apply)
    elements.playScreen.style.removeProperty('--mobile-board-max')
  }

  return { apply, attach, detach }
}
