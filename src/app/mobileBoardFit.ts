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
}

/** Measures non-board chrome and sets `--mobile-board-max` so the grid fits the viewport. */
export function applyMobileBoardFit({ playScreen, boardStage, labOverlay }: MobileBoardFitElements): void {
  const isBoardScene = playScreen.classList.contains('screen-play--board-scene')
  const labOpen = labOverlay.classList.contains('lab-overlay--active')

  if (!isCompactViewport() || !isBoardScene || !labOpen) {
    playScreen.style.removeProperty('--mobile-board-max')
    return
  }

  const boardWrap = boardStage.querySelector<HTMLElement>('.board-wrap')
  if (!boardWrap) {
    playScreen.style.removeProperty('--mobile-board-max')
    return
  }

  const wrapRect = boardWrap.getBoundingClientRect()
  const chromeAbove = Math.max(0, wrapRect.top)

  let chromeBelow = 0
  const instrumentFrame = boardStage.closest<HTMLElement>('.instrument-frame')
  if (instrumentFrame) {
    for (const selector of ['.move-ledger-wrap', '.board-tools', '.instrument-toggles', '.lesson-note', '.coach-tip']) {
      const el = instrumentFrame.querySelector<HTMLElement>(selector)
      if (!el || el.classList.contains('hidden')) continue
      const rect = el.getBoundingClientRect()
      if (rect.height > 0) chromeBelow += rect.height
    }
    const frameStyle = window.getComputedStyle(instrumentFrame)
    chromeBelow += parseFloat(frameStyle.paddingBottom) || 0
  }

  const capturedBot = boardStage.querySelector<HTMLElement>('.captured-row--bot')
  if (capturedBot) {
    const capturedRect = capturedBot.getBoundingClientRect()
    if (capturedRect.height > 0) chromeBelow += capturedRect.height
  }

  const playStyle = window.getComputedStyle(playScreen)
  chromeBelow += parseFloat(playStyle.paddingBottom) || 0

  const viewportW = window.visualViewport?.width ?? window.innerWidth
  const viewportH = window.visualViewport?.height ?? window.innerHeight
  const widthCap = Math.max(0, viewportW - 40)
  const heightCap = Math.max(0, viewportH - chromeAbove - chromeBelow - 12)
  const boardMax = Math.min(widthCap, heightCap)

  if (boardMax > 0) {
    playScreen.style.setProperty('--mobile-board-max', `${Math.floor(boardMax)}px`)
  } else {
    playScreen.style.removeProperty('--mobile-board-max')
  }
}

export function createMobileBoardFitController(elements: MobileBoardFitElements) {
  const apply = () => applyMobileBoardFit(elements)

  const scheduleApply = () => {
    window.requestAnimationFrame(apply)
  }

  const attach = () => {
    window.visualViewport?.addEventListener('resize', scheduleApply)
    window.addEventListener('orientationchange', scheduleApply)
    window.addEventListener('resize', scheduleApply)
  }

  const detach = () => {
    window.visualViewport?.removeEventListener('resize', scheduleApply)
    window.removeEventListener('orientationchange', scheduleApply)
    window.removeEventListener('resize', scheduleApply)
    elements.playScreen.style.removeProperty('--mobile-board-max')
  }

  return { apply, attach, detach }
}
