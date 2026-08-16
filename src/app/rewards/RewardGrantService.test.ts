import { describe, expect, it } from 'vitest'
import {
  applyRewardToInventory,
  grantDuelVictory,
  grantMatchVictory,
  matchRivalUnlockId,
} from './RewardGrantService'
import type { RewardInventoryState } from './RewardGrantService'
import type { DuelSession } from '../duel/DuelManager'

const emptyInventory = (): RewardInventoryState => ({
  unlockedPieceSkins: ['classic-royal'],
  codexUnlocks: [],
  titleUnlocks: [],
  unlockedDuelVariantIds: ['alexion-mentor'],
  chronicleEchoes: [],
  duelUnlockedOpponentIds: [],
})

describe('RewardGrantService', () => {
  it('matchRivalUnlockId maps story match ids', () => {
    expect(matchRivalUnlockId('c1-match-amara')).toBe('amara')
    expect(matchRivalUnlockId('c1-match-lukas')).toBe('lukas')
    expect(matchRivalUnlockId('c1-match-marius')).toBe('marius')
    expect(matchRivalUnlockId('c2-match-edred')).toBe('edred')
    expect(matchRivalUnlockId('c3-match-kallistos')).toBe('kallistos')
    expect(matchRivalUnlockId('c4-match-nysa')).toBe('nysa')
    expect(matchRivalUnlockId('c4-match-cassian')).toBe('cassian')
    expect(matchRivalUnlockId('c4-match-nysa')).toBe('nysa')
    expect(matchRivalUnlockId('c4-match-cassian')).toBe('cassian')
    expect(matchRivalUnlockId('c3-match-demetrios-return')).toBe('')
    expect(matchRivalUnlockId('c5-boss-demetrios')).toBe('alexion')
  })

  it('applyRewardToInventory unlocks skins and codex once', () => {
    const state = emptyInventory()
    applyRewardToInventory(state, {
      id: 'skin-x',
      kind: 'skin',
      label: 'Skin',
      description: '',
      skinId: 'obsidian-neon',
    })
    expect(state.unlockedPieceSkins).toContain('obsidian-neon')
    applyRewardToInventory(state, {
      id: 'skin-x',
      kind: 'skin',
      label: 'Skin',
      description: '',
      skinId: 'obsidian-neon',
    })
    expect(state.unlockedPieceSkins.filter((s) => s === 'obsidian-neon').length).toBe(1)
  })

  it('grantMatchVictory unlocks rival and returns rank delta', () => {
    const state = emptyInventory()
    const result = grantMatchVictory(state, {
      id: 'c1-match-amara',
      type: 'match',
      title: 'Amara',
      playerColor: 'w',
      difficulty: 2,
    } as import('../../types').MatchScene)
    expect(state.duelUnlockedOpponentIds).toContain('amara')
    expect(result.rankPointsDelta).toBeGreaterThan(30)
  })

  it('grantDuelVictory returns chronicle bundle', () => {
    const duel = {
      roster: { opponentId: 'alexion', opponentName: 'Alexion', variants: [] },
      variant: { id: 'alexion-mentor', label: 'Mentor' },
      playerColor: 'w',
      fen: 'start',
      difficulty: 'balanced',
    } as unknown as DuelSession
    const result = grantDuelVictory(duel)
    expect(result.bundle?.rewards[0]?.kind).toBe('chronicle')
    expect(result.rankPointsDelta).toBe(10)
  })
})
