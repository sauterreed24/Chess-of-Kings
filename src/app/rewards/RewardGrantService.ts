import { BASE_VICTORY_REWARDS } from '../../data/rewards'
import type { DuelSession } from '../duel/DuelManager'
import type { MatchScene, PieceSkinId, RewardBundle, RewardDefinition } from '../../types'

export type RewardInventoryState = {
  unlockedPieceSkins: PieceSkinId[]
  codexUnlocks: string[]
  titleUnlocks: string[]
  unlockedDuelVariantIds: string[]
  chronicleEchoes: string[]
  duelUnlockedOpponentIds: string[]
}

export type VictoryGrantResult = {
  rankPointsDelta: number
  bundle: RewardBundle | null
}

/** Applies codex/skin/title/duel-variant/chronicle unlocks to inventory state. */
export function applyRewardToInventory(state: RewardInventoryState, reward: RewardDefinition): void {
  if (reward.kind === 'skin' && reward.skinId) {
    if (!state.unlockedPieceSkins.includes(reward.skinId)) state.unlockedPieceSkins.push(reward.skinId)
    return
  }
  if (reward.kind === 'codex' && reward.codexId) {
    if (!state.codexUnlocks.includes(reward.codexId)) state.codexUnlocks.push(reward.codexId)
    return
  }
  if (reward.kind === 'title' && reward.titleId) {
    if (!state.titleUnlocks.includes(reward.titleId)) state.titleUnlocks.push(reward.titleId)
    return
  }
  if (reward.kind === 'duel-variant' && reward.duelVariantId) {
    if (!state.unlockedDuelVariantIds.includes(reward.duelVariantId)) {
      state.unlockedDuelVariantIds.push(reward.duelVariantId)
    }
    return
  }
  if (reward.kind === 'chronicle') {
    if (!state.chronicleEchoes.includes(reward.id)) state.chronicleEchoes.push(reward.id)
  }
}

export function matchRivalUnlockId(matchId: string): string {
  if (matchId.includes('amara')) return 'amara'
  if (matchId.includes('edred')) return 'edred'
  if (matchId.includes('rowan')) return 'rowan'
  if (matchId.includes('vega')) return 'vega'
  if (matchId.includes('boss') || matchId.includes('demetrios')) return 'alexion'
  return ''
}

export function grantMatchVictory(state: RewardInventoryState, match: MatchScene): VictoryGrantResult {
  const unlockId = matchRivalUnlockId(match.id)
  if (unlockId && !state.duelUnlockedOpponentIds.includes(unlockId)) {
    state.duelUnlockedOpponentIds.push(unlockId)
  }
  const rewards = BASE_VICTORY_REWARDS[match.id] ?? []
  for (const r of rewards) applyRewardToInventory(state, r)
  const rankPointsDelta = 30 + Math.max(0, (match.difficulty ?? 1) - 1) * 15
  const bundle: RewardBundle | null = rewards.length
    ? { sourceId: match.id, sourceLabel: match.title, rewards }
    : null
  return { rankPointsDelta, bundle }
}

export function grantDuelVictory(duel: DuelSession): VictoryGrantResult {
  const synthetic: RewardDefinition[] = [
    {
      id: `duel-echo-${duel.variant.id}`,
      kind: 'chronicle',
      label: 'Chronicle Echo Captured',
      description: `Your duel with ${duel.roster.opponentName} was archived.`,
    },
  ]
  return {
    rankPointsDelta: 10,
    bundle: {
      sourceId: duel.variant.id,
      sourceLabel: `Duel · ${duel.variant.label}`,
      rewards: synthetic,
    },
  }
}

export function createChapterRewardBundle(
  chapterId: string,
  chapterTitle: string,
  rewards: RewardDefinition[],
): RewardBundle | null {
  if (!rewards.length) return null
  return { sourceId: chapterId, sourceLabel: `${chapterTitle} Complete`, rewards }
}
