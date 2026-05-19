export interface TitleActionControls {
  saveGroup: HTMLElement
  freshGroup: HTMLElement
  resumeButton: HTMLButtonElement
  newButton: HTMLButtonElement
  enterButton: HTMLButtonElement
}

function setActionGroupVisible(group: HTMLElement, visible: boolean) {
  group.classList.toggle('hidden', !visible)
  group.setAttribute('aria-hidden', visible ? 'false' : 'true')
  group.toggleAttribute('inert', !visible)
  ;(group as HTMLElement & { inert?: boolean }).inert = !visible
}

export function syncTitleActionGroups(saved: boolean, controls: TitleActionControls) {
  setActionGroupVisible(controls.saveGroup, saved)
  setActionGroupVisible(controls.freshGroup, !saved)
  controls.resumeButton.disabled = !saved
  controls.newButton.disabled = !saved
  controls.enterButton.disabled = saved
}
