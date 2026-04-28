/**
 * Persistence robustness: every entry-point that reads from localStorage
 * (loadSave, readStreak) must fall back to a sensible default when the
 * stored value is corrupt, truncated, or hostile, and writeSave must
 * never throw on quota errors.
 *
 * jsdom's localStorage is a real implementation, so we can scribble
 * bytes directly and verify the recovery path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSave, writeSave, hasSave, clearSave } from './storage'
import { readStreak } from './session/streak'

const SAVE_KEY = 'calculus-of-kings-progress-v3'
const STREAK_KEY = 'cok-streak'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('loadSave robustness', () => {
  it('returns null on truncated JSON without throwing', () => {
    localStorage.setItem(SAVE_KEY, '{"chapterIndex":0,"sceneIndex":0,')
    expect(() => loadSave()).not.toThrow()
    expect(loadSave()).toBeNull()
  })

  it('returns null when the stored value is not JSON at all', () => {
    localStorage.setItem(SAVE_KEY, 'not json at all')
    expect(loadSave()).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ chapterIndex: 'x' }))
    expect(loadSave()).toBeNull()
  })

  it('survives an empty localStorage entry', () => {
    localStorage.setItem(SAVE_KEY, '')
    expect(loadSave()).toBeNull()
  })

  it('hasSave reflects loadSave decisions on corrupt strings', () => {
    localStorage.setItem(SAVE_KEY, '<not-a-save>')
    expect(hasSave()).toBe(false)
  })

  it('clearSave is idempotent and removes the key', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ chapterIndex: 0, sceneIndex: 0 }))
    clearSave()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    /* Calling again must not throw. */
    expect(() => clearSave()).not.toThrow()
  })
})

describe('writeSave robustness', () => {
  it('does not throw when localStorage.setItem refuses (private mode / quota)', () => {
    const original = Storage.prototype.setItem
    /* Force every setItem call to reject. */
    Storage.prototype.setItem = vi.fn(() => {
      const err = new DOMException('quota', 'QuotaExceededError')
      throw err
    })
    try {
      const data = {
        version: 3 as const,
        chapterIndex: 0,
        sceneIndex: 0,
        highestUnlockedChapter: 0,
        lastScreen: 'title' as const,
        chapter1Complete: false,
        completedSceneIds: [],
        completedPuzzleIds: [],
        stratarchiaUnlocked: false,
        duelUnlockedOpponentIds: [],
        unlockedDuelVariantIds: ['alexion-mentor'],
        codexUnlocks: [],
        titleUnlocks: [],
        chronicleEchoes: [],
        rankPoints: 0,
        cosmetics: {
          unlockedPieceSkins: ['classic-royal' as const, 'high-contrast' as const],
          selectedPieceSkin: 'classic-royal' as const,
        },
        tendencies: {
          flankPawnPushes: 0,
          earlyQueenMoves: 0,
          repeatedChecksWithoutGain: 0,
        },
        matchHistory: [],
        rivalMemory: {},
        inProgress: null,
      }
      expect(() => writeSave(data)).not.toThrow()
    } finally {
      Storage.prototype.setItem = original
    }
  })
})

describe('readStreak robustness', () => {
  it('returns zero state when value is missing', () => {
    expect(readStreak()).toEqual({ count: 0, lastDayKey: '' })
  })

  it('returns zero state when value is not JSON', () => {
    localStorage.setItem(STREAK_KEY, '{not-json')
    expect(readStreak()).toEqual({ count: 0, lastDayKey: '' })
  })

  it('clamps a negative count to zero on read', () => {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: -5, lastDayKey: '2026-04-28' }))
    expect(readStreak().count).toBe(0)
  })

  it('falls back gracefully when localStorage.getItem throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('storage refused')
    })
    try {
      expect(() => readStreak()).not.toThrow()
      expect(readStreak()).toEqual({ count: 0, lastDayKey: '' })
    } finally {
      Storage.prototype.getItem = original
    }
  })
})
