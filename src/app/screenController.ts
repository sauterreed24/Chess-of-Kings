import { setTopBarInertForLab } from './labModal'

export type TopLevelScreen = 'title' | 'chapters' | 'duel' | null

export type ScreenControllerScreens = {
  title: HTMLElement
  chapters: HTMLElement
  duel: HTMLElement
}

export type ScreenControllerOptions = {
  shell: HTMLElement
  screens: ScreenControllerScreens
  topBar: HTMLElement
  labOverlay: HTMLElement
  /** Nodes that stay interactive while a modal backdrop is inert (e.g. the modal itself). */
  modalExempt?: HTMLElement[]
}

export function setSectionVisibility(el: HTMLElement, visible: boolean): void {
  el.classList.toggle('hidden', !visible)
  el.setAttribute('aria-hidden', visible ? 'false' : 'true')
  ;(el as HTMLElement & { inert?: boolean }).inert = !visible
}

/** Mark `#shell` direct children inert except excluded nodes (lab / live modals). */
export function setShellChildrenInert(
  restore: HTMLElement[],
  shell: HTMLElement,
  active: boolean,
  exclude: HTMLElement[],
): void {
  if (!active) {
    for (const el of restore) {
      el.inert = false
      el.removeAttribute('inert')
    }
    restore.length = 0
    return
  }
  for (const ex of exclude) {
    ex.inert = false
    ex.removeAttribute('inert')
  }
  for (const node of shell.children) {
    if (!(node instanceof HTMLElement)) continue
    if (exclude.some((ex) => ex === node || node.contains(ex))) continue
    if (!node.inert) {
      node.inert = true
      node.setAttribute('inert', '')
      restore.push(node)
    }
  }
}

export type ScreenController = {
  setTopLevelScreen(active: TopLevelScreen): void
  setLabOpen(open: boolean): void
  isLabOpen(): boolean
  setShellBackdropInert(restore: HTMLElement[], active: boolean, exclude: HTMLElement[]): void
}

export function createScreenController(opts: ScreenControllerOptions): ScreenController {
  const { shell, screens, topBar, labOverlay } = opts
  const modalExempt = opts.modalExempt ?? []
  const labInertRestore: HTMLElement[] = []
  let labOpen = false

  function labExemptNodes(): HTMLElement[] {
    return [labOverlay, ...modalExempt]
  }

  return {
    setTopLevelScreen(active: TopLevelScreen) {
      setSectionVisibility(screens.title, active === 'title')
      setSectionVisibility(screens.chapters, active === 'chapters')
      setSectionVisibility(screens.duel, active === 'duel')
      document.body.scrollTop = document.documentElement.scrollTop = 0
    },

    setLabOpen(open: boolean) {
      labOpen = open
      setTopBarInertForLab(topBar, open)
      if (open) {
        this.setTopLevelScreen(null)
        setShellChildrenInert(labInertRestore, shell, true, labExemptNodes())
      } else {
        setShellChildrenInert(labInertRestore, shell, false, labExemptNodes())
      }
    },

    isLabOpen() {
      return labOpen
    },

    setShellBackdropInert(restore: HTMLElement[], active: boolean, exclude: HTMLElement[]) {
      setShellChildrenInert(restore, shell, active, exclude)
    },
  }
}
