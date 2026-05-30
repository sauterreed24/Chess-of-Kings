import { DUEL_ROSTER } from '../../data/duelRoster'
import type { DuelRosterEntry, DuelVariant, MatchHistoryEntry, RivalMemoryEntry } from '../../types'

export type DuelDifficulty = 'novice' | 'balanced' | 'relentless'

export type DuelUnlockContext = {
  duelUnlockedOpponentIds: string[]
  unlockedDuelVariantIds: string[]
  highestUnlockedChapter: number
}

export type DuelArchiveRosterEntry = {
  rival: DuelRosterEntry
  isOpen: boolean
  unlockedVariantCount: number
  totalVariantCount: number
  unlockHint: string
}

export function findDuelVariant(
  variantId: string,
): { rival: DuelRosterEntry; variant: DuelVariant } | null {
  for (const rival of DUEL_ROSTER) {
    const variant = rival.variants.find((v) => v.id === variantId)
    if (variant) return { rival, variant }
  }
  return null
}

export function isDuelOpponentUnlocked(rival: DuelRosterEntry, ctx: DuelUnlockContext): boolean {
  if (rival.opponentId === 'alexion') return true
  return ctx.duelUnlockedOpponentIds.includes(rival.opponentId)
}

export function isDuelVariantUnlocked(variantId: string, ctx: DuelUnlockContext): boolean {
  if (ctx.unlockedDuelVariantIds.includes(variantId)) return true
  const found = findDuelVariant(variantId)
  if (!found) return false
  if (found.rival.opponentId === 'alexion') return false
  return (
    ctx.duelUnlockedOpponentIds.includes(found.rival.opponentId) &&
    ctx.highestUnlockedChapter >= found.variant.minChapterUnlock
  )
}

export function recommendDuelDifficulty(
  opponentId: string,
  matchHistory: MatchHistoryEntry[],
  rivalMemory: Record<string, RivalMemoryEntry>,
): DuelDifficulty {
  const recent = matchHistory.filter((h) => h.opponentId === opponentId).slice(-12)
  if (!recent.length) return 'balanced'
  const score = recent.reduce((acc, h) => {
    if (h.outcome === 'win') return acc + 1
    if (h.outcome === 'draw') return acc + 0.5
    return acc - 1
  }, 0)
  const mem = rivalMemory[opponentId]
  const pressure = mem ? mem.losses - mem.wins : 0
  if (score <= -2 || pressure >= 3) return 'novice'
  if (score >= 3) return 'relentless'
  return 'balanced'
}

export function duelUnlockHint(
  rival: DuelRosterEntry,
  ctx: DuelUnlockContext,
  chapterLabel: (chapterIndex: number) => string,
): string {
  if (isDuelOpponentUnlocked(rival, ctx)) {
    const lockedByChapter = rival.variants.find((v) => ctx.highestUnlockedChapter < v.minChapterUnlock)
    if (lockedByChapter) return `Reach ${chapterLabel(lockedByChapter.minChapterUnlock)} to open more files.`
    return 'Open now.'
  }
  const minChapter = Math.min(...rival.variants.map((v) => v.minChapterUnlock))
  return `Defeat ${rival.opponentName} in ${chapterLabel(minChapter)} to unseal this dossier.`
}

export function filterUnlockedDuelRoster(ctx: DuelUnlockContext): DuelRosterEntry[] {
  return DUEL_ROSTER.filter((r) => isDuelOpponentUnlocked(r, ctx))
}

export function buildDuelArchiveRoster(
  ctx: DuelUnlockContext,
  chapterLabel: (chapterIndex: number) => string,
): DuelArchiveRosterEntry[] {
  return DUEL_ROSTER.map((rival) => {
    const unlockedVariantCount = rival.variants.filter(
      (v) => isDuelVariantUnlocked(v.id, ctx) && ctx.highestUnlockedChapter >= v.minChapterUnlock,
    ).length
    return {
      rival,
      isOpen: isDuelOpponentUnlocked(rival, ctx) && unlockedVariantCount > 0,
      unlockedVariantCount,
      totalVariantCount: rival.variants.length,
      unlockHint: duelUnlockHint(rival, ctx, chapterLabel),
    }
  })
}
