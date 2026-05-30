import { describe, expect, it } from 'vitest'
import {
  buildDuelArchiveRoster,
  findDuelVariant,
  isDuelOpponentUnlocked,
  isDuelVariantUnlocked,
  recommendDuelDifficulty,
  duelUnlockHint,
  type DuelUnlockContext,
} from './DuelManager'
import { DUEL_ROSTER } from '../../data/duelRoster'

const baseCtx = (): DuelUnlockContext => ({
  duelUnlockedOpponentIds: [],
  unlockedDuelVariantIds: ['alexion-mentor'],
  highestUnlockedChapter: 0,
})

describe('DuelManager unlock + roster', () => {
  it('findDuelVariant resolves roster entries', () => {
    const found = findDuelVariant('alexion-mentor')
    expect(found?.rival.opponentId).toBe('alexion')
    expect(found?.variant.id).toBe('alexion-mentor')
  })

  it('alexion opponent is always unlocked', () => {
    const alexion = DUEL_ROSTER.find((r) => r.opponentId === 'alexion')!
    expect(isDuelOpponentUnlocked(alexion, baseCtx())).toBe(true)
  })

  it('gates non-alexion variants until rival defeated and chapter reached', () => {
    const edredVariant = findDuelVariant('edred-guard')!
    expect(isDuelVariantUnlocked(edredVariant.variant.id, baseCtx())).toBe(false)
    const ctx: DuelUnlockContext = {
      ...baseCtx(),
      duelUnlockedOpponentIds: ['edred'],
      highestUnlockedChapter: edredVariant.variant.minChapterUnlock,
    }
    expect(isDuelVariantUnlocked(edredVariant.variant.id, ctx)).toBe(true)
  })

  it('buildDuelArchiveRoster marks sealed rivals with hints', () => {
    const archive = buildDuelArchiveRoster(baseCtx(), (i) => `Ch${i}`)
    const edred = archive.find((e) => e.rival.opponentId === 'edred')
    expect(edred?.isOpen).toBe(false)
    expect(edred?.unlockHint).toMatch(/unseal/i)
  })
})

describe('recommendDuelDifficulty', () => {
  it('returns balanced with no history', () => {
    expect(recommendDuelDifficulty('edred', [], {})).toBe('balanced')
  })

  it('recommends novice after loss streak', () => {
    const history = [
      { opponentId: 'edred', outcome: 'loss' as const },
      { opponentId: 'edred', outcome: 'loss' as const },
      { opponentId: 'edred', outcome: 'draw' as const },
    ]
    expect(recommendDuelDifficulty('edred', history, { edred: { wins: 0, losses: 4, punishedEarlyQueen: 0, punishedFlankPushes: 0 } })).toBe('novice')
  })

  it('recommends relentless after win streak', () => {
    const history = [
      { opponentId: 'marius', outcome: 'win' as const },
      { opponentId: 'marius', outcome: 'win' as const },
      { opponentId: 'marius', outcome: 'win' as const },
    ]
    expect(recommendDuelDifficulty('marius', history, { marius: { wins: 5, losses: 1, punishedEarlyQueen: 0, punishedFlankPushes: 0 } })).toBe('relentless')
  })
})

describe('duelUnlockHint', () => {
  it('returns open-now when rival unlocked and chapters satisfied', () => {
    const alexion = DUEL_ROSTER.find((r) => r.opponentId === 'alexion')!
    const ctx: DuelUnlockContext = { ...baseCtx(), highestUnlockedChapter: 99 }
    expect(duelUnlockHint(alexion, ctx, (i) => `Ch${i}`)).toBe('Open now.')
  })
})
