import { describe, expect, it, vi, beforeEach } from 'vitest'
import { attachGlobalShortcuts, handleGlobalKey, type GlobalShortcutDeps } from './globalShortcuts'

function makeDeps(over: Partial<GlobalShortcutDeps> = {}): GlobalShortcutDeps & {
  closeRewardOverlay: ReturnType<typeof vi.fn>
  exitLab: ReturnType<typeof vi.fn>
  advance: ReturnType<typeof vi.fn>
  toggleKeyboardHelp: ReturnType<typeof vi.fn>
} {
  return {
    isConfirmOpen: () => false,
    closeConfirm: vi.fn(),
    isRewardOverlayOpen: () => false,
    isLabActive: () => false,
    canAdvance: () => false,
    closeRewardOverlay: vi.fn(),
    exitLab: vi.fn(),
    advance: vi.fn(),
    toggleKeyboardHelp: vi.fn(),
    ...over,
  } as GlobalShortcutDeps & {
    closeRewardOverlay: ReturnType<typeof vi.fn>
    exitLab: ReturnType<typeof vi.fn>
    advance: ReturnType<typeof vi.fn>
    toggleKeyboardHelp: ReturnType<typeof vi.fn>
  }
}

function makeKey(key: string): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', { key, cancelable: true })
  return evt
}

beforeEach(() => {
  document.body.innerHTML = ''
  ;(document.activeElement as HTMLElement | null)?.blur?.()
})

describe('handleGlobalKey', () => {
  it('does nothing when focus is in contenteditable', () => {
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.appendChild(editable)
    editable.focus()
    const deps = makeDeps({ isRewardOverlayOpen: () => true })
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.closeRewardOverlay).not.toHaveBeenCalled()
  })

  it('does nothing when focus is in a text input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    const deps = makeDeps({ isRewardOverlayOpen: () => true })
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.closeRewardOverlay).not.toHaveBeenCalled()
  })

  it('Escape closes confirm dialog before reward overlay', () => {
    const deps = makeDeps({
      isConfirmOpen: () => true,
      isRewardOverlayOpen: () => true,
      isLabActive: () => true,
    })
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(deps.closeConfirm).toHaveBeenCalledTimes(1)
    expect(deps.closeRewardOverlay).not.toHaveBeenCalled()
    expect(deps.exitLab).not.toHaveBeenCalled()
  })

  it('Escape closes a visible reward overlay first', () => {
    const deps = makeDeps({ isRewardOverlayOpen: () => true, isLabActive: () => true })
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(e.defaultPrevented).toBe(true)
    expect(deps.closeRewardOverlay).toHaveBeenCalledTimes(1)
    expect(deps.exitLab).not.toHaveBeenCalled()
  })

  it('Escape exits the lab when reward overlay is closed but lab is active', () => {
    const deps = makeDeps({ isLabActive: () => true })
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(deps.exitLab).toHaveBeenCalledTimes(1)
  })

  it('Escape is a no-op when nothing is open', () => {
    const deps = makeDeps()
    const e = makeKey('Escape')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.exitLab).not.toHaveBeenCalled()
    expect(deps.closeRewardOverlay).not.toHaveBeenCalled()
  })

  it('Enter advances the scene when in lab and canAdvance', () => {
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const e = makeKey('Enter')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(e.defaultPrevented).toBe(true)
    expect(deps.advance).toHaveBeenCalledTimes(1)
  })

  it('Space behaves like Enter', () => {
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const e = makeKey(' ')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(deps.advance).toHaveBeenCalledTimes(1)
  })

  it('Enter consumes the event but does not advance when canAdvance is false', () => {
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => false })
    const e = makeKey('Enter')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(e.defaultPrevented).toBe(true)
    expect(deps.advance).not.toHaveBeenCalled()
  })

  it('Enter is ignored when focus is inside the chess grid', () => {
    const grid = document.createElement('div')
    grid.className = 'chess-grid'
    const sq = document.createElement('button')
    grid.appendChild(sq)
    document.body.appendChild(grid)
    sq.focus()
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const e = makeKey('Enter')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.advance).not.toHaveBeenCalled()
  })

  it('Enter is ignored when focus is inside the promotion panel', () => {
    const panel = document.createElement('div')
    panel.className = 'promo-panel'
    const btn = document.createElement('button')
    panel.appendChild(btn)
    document.body.appendChild(panel)
    btn.focus()
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const e = makeKey('Enter')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.advance).not.toHaveBeenCalled()
  })

  it('Enter is ignored when lab is not active', () => {
    const deps = makeDeps({ isLabActive: () => false, canAdvance: () => true })
    const e = makeKey('Enter')
    expect(handleGlobalKey(e, deps)).toBe(false)
  })

  it('unrelated keys are ignored entirely', () => {
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const e = makeKey('a')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.advance).not.toHaveBeenCalled()
  })

  it('? toggles the keyboard help overlay regardless of lab state', () => {
    const deps = makeDeps()
    const e = makeKey('?')
    expect(handleGlobalKey(e, deps)).toBe(true)
    expect(e.defaultPrevented).toBe(true)
    expect(deps.toggleKeyboardHelp).toHaveBeenCalledTimes(1)

    const deps2 = makeDeps({ isLabActive: () => true })
    const e2 = makeKey('?')
    expect(handleGlobalKey(e2, deps2)).toBe(true)
    expect(deps2.toggleKeyboardHelp).toHaveBeenCalledTimes(1)
  })

  it('? is suppressed when confirm dialog is open', () => {
    const deps = makeDeps({ isConfirmOpen: () => true })
    const e = makeKey('?')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.toggleKeyboardHelp).not.toHaveBeenCalled()
  })

  it('? is suppressed when focus is in a form input (typing a question mark)', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    const deps = makeDeps()
    const e = makeKey('?')
    expect(handleGlobalKey(e, deps)).toBe(false)
    expect(deps.toggleKeyboardHelp).not.toHaveBeenCalled()
  })
})

describe('attachGlobalShortcuts', () => {
  it('wires keydown on the supplied target and detaches when the returned function runs', () => {
    const deps = makeDeps({ isLabActive: () => true, canAdvance: () => true })
    const detach = attachGlobalShortcuts(window, deps)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
    expect(deps.advance).toHaveBeenCalledTimes(1)
    detach()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
    expect(deps.advance).toHaveBeenCalledTimes(1)
  })
})
