import { describe, expect, it } from 'vitest'
import { syncTitleActionGroups } from './titleActions'

function setup() {
  const saveGroup = document.createElement('div')
  const freshGroup = document.createElement('div')
  const resumeButton = document.createElement('button')
  const newButton = document.createElement('button')
  const enterButton = document.createElement('button')
  return { saveGroup, freshGroup, resumeButton, newButton, enterButton }
}

describe('title action groups', () => {
  it('shows only the fresh-start action when no save exists', () => {
    const controls = setup()
    syncTitleActionGroups(false, controls)
    expect(controls.saveGroup.classList.contains('hidden')).toBe(true)
    expect(controls.saveGroup.getAttribute('aria-hidden')).toBe('true')
    expect(controls.saveGroup.hasAttribute('inert')).toBe(true)
    expect((controls.saveGroup as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(controls.freshGroup.classList.contains('hidden')).toBe(false)
    expect(controls.freshGroup.getAttribute('aria-hidden')).toBe('false')
    expect(controls.freshGroup.hasAttribute('inert')).toBe(false)
    expect(controls.resumeButton.disabled).toBe(true)
    expect(controls.newButton.disabled).toBe(true)
    expect(controls.enterButton.disabled).toBe(false)
  })

  it('shows only resume/new actions when a save exists', () => {
    const controls = setup()
    syncTitleActionGroups(true, controls)
    expect(controls.saveGroup.classList.contains('hidden')).toBe(false)
    expect(controls.saveGroup.getAttribute('aria-hidden')).toBe('false')
    expect(controls.saveGroup.hasAttribute('inert')).toBe(false)
    expect(controls.freshGroup.classList.contains('hidden')).toBe(true)
    expect(controls.freshGroup.getAttribute('aria-hidden')).toBe('true')
    expect(controls.freshGroup.hasAttribute('inert')).toBe(true)
    expect((controls.freshGroup as HTMLElement & { inert?: boolean }).inert).toBe(true)
    expect(controls.resumeButton.disabled).toBe(false)
    expect(controls.newButton.disabled).toBe(false)
    expect(controls.enterButton.disabled).toBe(true)
  })
})
