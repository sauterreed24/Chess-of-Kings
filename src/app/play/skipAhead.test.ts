import { describe, expect, it } from 'vitest'
import { prosePeekSkipIndex } from './skipAhead'
import type { Scene } from '../../types'

/** Minimal scene stubs — only `type` matters to the skip resolver. */
const s = (type: Scene['type']): Scene => ({ type } as Scene)

describe('prosePeekSkipIndex', () => {
  it('skips the prologue prose run to the calibration board', () => {
    /* prologue: dialogue, codex, codex, dialogue, calibration, … */
    const scenes = [s('dialogue'), s('codex'), s('codex'), s('dialogue'), s('calibration')]
    expect(prosePeekSkipIndex(scenes, 0)).toBe(4)
  })

  it('lands ON the first tutorial puzzle, never past it', () => {
    /* chapter shape: intro dialogue, codex, puzzle, … */
    const scenes = [s('dialogue'), s('codex'), s('puzzle'), s('dialogue'), s('match')]
    expect(prosePeekSkipIndex(scenes, 0)).toBe(2)
  })

  it('returns null when the next scene is already a board (Advance suffices)', () => {
    const scenes = [s('dialogue'), s('calibration')]
    expect(prosePeekSkipIndex(scenes, 0)).toBeNull()
  })

  it('returns null from a board scene (you never skip gameplay)', () => {
    const scenes = [s('calibration'), s('dialogue'), s('dialogue'), s('match')]
    expect(prosePeekSkipIndex(scenes, 0)).toBeNull()
  })

  it('returns null when prose runs to the end of the chapter', () => {
    const scenes = [s('match'), s('dialogue'), s('dialogue')]
    expect(prosePeekSkipIndex(scenes, 1)).toBeNull()
  })

  it('handles out-of-range and empty inputs without throwing', () => {
    expect(prosePeekSkipIndex([], 0)).toBeNull()
    expect(prosePeekSkipIndex([s('dialogue')], -1)).toBeNull()
    expect(prosePeekSkipIndex([s('dialogue')], 5)).toBeNull()
  })

  it('treats freeplay as a board (skips reading up to it)', () => {
    const scenes = [s('dialogue'), s('codex'), s('freeplay')]
    expect(prosePeekSkipIndex(scenes, 0)).toBe(2)
  })
})
