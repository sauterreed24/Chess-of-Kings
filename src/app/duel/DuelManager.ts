import { DEFAULT_POSITION } from 'chess.js'
import { DUEL_ROSTER } from '../../data/duelRoster'
import type {
  DuelRosterEntry,
  DuelVariant,
  InProgressSnapshot,
  MatchHistoryEntry,
  RivalMemoryEntry,
} from '../../types'

export type DuelDifficulty = 'novice' | 'balanced' | 'relentless'

export type DuelSession = {
  roster: DuelRosterEntry
  variant: DuelVariant
  playerColor: 'w' | 'b'
  fen: string
  difficulty: DuelDifficulty
}

export type LastDuelSetup = {
  opponentId: string
  variantId: string
  playerColor: 'w' | 'b'
  difficulty: DuelDifficulty
}

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

export type ActiveDuelBrief = {
  rival: DuelRosterEntry
  variant: DuelVariant
  playerColor: 'w' | 'b'
  difficulty: DuelDifficulty
}

/**
 * Owns duel session lifecycle (active session + last setup for rematch)
 * and pure unlock/roster helpers used by GameFlow and UI.
 */
export class DuelManager {
  private session: DuelSession | null = null
  private lastSetup: LastDuelSetup | null = null

  getSession(): DuelSession | null {
    return this.session
  }

  setSession(session: DuelSession | null) {
    this.session = session
  }

  clearSession() {
    this.session = null
  }

  getLastSetup(): LastDuelSetup | null {
    return this.lastSetup
  }

  clearLastSetup() {
    this.lastSetup = null
  }

  getActiveBrief(inDuelMode: boolean): ActiveDuelBrief | null {
    if (!inDuelMode || !this.session) return null
    return {
      rival: this.session.roster,
      variant: this.session.variant,
      playerColor: this.session.playerColor,
      difficulty: this.session.difficulty,
    }
  }

  getRematchParams(): LastDuelSetup | null {
    return this.lastSetup ? { ...this.lastSetup } : null
  }

  /**
   * Validates unlock/chapter gates and starts a new duel session.
   * Returns the session on success; GameFlow applies chess/board side effects.
   */
  tryBeginDuel(
    opponentId: string,
    variantId: string,
    playerColor: 'w' | 'b',
    ctx: DuelUnlockContext,
    fen = DEFAULT_POSITION,
    difficulty: DuelDifficulty = 'balanced',
  ): DuelSession | null {
    const roster = DUEL_ROSTER.find((r) => r.opponentId === opponentId)
    if (!roster) return null
    const variant = roster.variants.find((v) => v.id === variantId)
    if (!variant) return null
    if (!isDuelVariantUnlocked(variant.id, ctx)) return null
    if (ctx.highestUnlockedChapter < variant.minChapterUnlock) return null

    const session: DuelSession = {
      roster,
      variant,
      playerColor,
      fen: variant.fen ?? fen,
      difficulty,
    }
    this.session = session
    this.lastSetup = { opponentId, variantId, playerColor, difficulty }
    return session
  }

  /** Reconstruct session from persisted in-progress duel metadata. */
  restoreSessionFromSnapshot(duel: NonNullable<InProgressSnapshot['duel']>): DuelSession | null {
    const setup = resolveSnapshotDuelSetup(duel)
    if (!setup) return null
    const session: DuelSession = {
      roster: setup.roster,
      variant: setup.variant,
      playerColor: duel.playerColor,
      fen: duel.startFen,
      difficulty: duel.difficulty,
    }
    this.session = session
    return session
  }

  endSession() {
    this.clearSession()
  }
}

export function resolveSnapshotDuelSetup(
  duel: NonNullable<InProgressSnapshot['duel']>,
): { roster: DuelRosterEntry; variant: DuelVariant } | null {
  const roster = DUEL_ROSTER.find((r) => r.opponentId === duel.opponentId)
  const variant = roster?.variants.find((v) => v.id === duel.variantId)
  if (!roster || !variant) return null
  return { roster, variant }
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
