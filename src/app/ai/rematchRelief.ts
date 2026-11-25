import type { AiProfile } from '../../types'

/**
 * Rematch relief — the campaign's promise is that persistence gets a player
 * through, because a match scene only advances on a win. Each consecutive
 * loss to the same rival steps that rival down: it calculates less far,
 * settles for looser moves, and can no longer play the apex "engine best"
 * line. A win (or draw) ends the streak and the next meeting is as authored.
 *
 * The first attempt is never touched, so first-try challenge, the ladder's
 * published difficulty and rival ratings stay exactly as designed. The step
 * is surfaced in the rival's dossier line so the handicap is never hidden.
 */
export type RematchRelief = {
  /** 0 = as authored; 1–3 = eased steps. */
  step: number
  /** Legacy search-depth units removed (each unit ≈ two engine plies). */
  depthCut: number
  /** Added to the rival's own blunder rate (bounded misses; never random moves). */
  blunderAdd: number
  /** Minimum blunder rate after the step. */
  blunderFloor: number
  /** Cap on conversion strictness (≤ 0.9 leaves apex best-move mode). */
  strictnessCap: number
  /** Cap on tactical alertness. */
  alertnessCap: number
  /** Multiplier on the think-time budget. */
  thinkScale: number
}

const STEPS: readonly RematchRelief[] = [
  { step: 0, depthCut: 0, blunderAdd: 0, blunderFloor: 0, strictnessCap: 1, alertnessCap: 1, thinkScale: 1 },
  { step: 1, depthCut: 1, blunderAdd: 0.03, blunderFloor: 0.06, strictnessCap: 0.85, alertnessCap: 0.78, thinkScale: 0.75 },
  { step: 2, depthCut: 1, blunderAdd: 0.06, blunderFloor: 0.12, strictnessCap: 0.7, alertnessCap: 0.7, thinkScale: 0.6 },
  { step: 3, depthCut: 2, blunderAdd: 0.09, blunderFloor: 0.18, strictnessCap: 0.55, alertnessCap: 0.6, thinkScale: 0.5 },
]

export function rematchRelief(lossStreak: number): RematchRelief {
  const step = Math.max(0, Math.min(STEPS.length - 1, Math.floor(lossStreak)))
  return STEPS[step]!
}

/** Ceiling on the eased blunder rate (the Duel archive's Forgiving band reaches 0.45). */
export const RELIEF_MAX_BLUNDER = 0.32

/** Apply relief to an already-tuned profile. Step 0 returns it unchanged. */
export function applyRematchRelief(profile: AiProfile, relief: RematchRelief): AiProfile {
  if (relief.step === 0) return profile
  return {
    ...profile,
    searchDepth: Math.max(2, profile.searchDepth - relief.depthCut),
    thinkTimeMs: Math.max(260, Math.round(profile.thinkTimeMs * relief.thinkScale)),
    blunderRate: Math.max(
      profile.blunderRate,
      Math.min(RELIEF_MAX_BLUNDER, Math.max(profile.blunderRate + relief.blunderAdd, relief.blunderFloor)),
    ),
    conversionStrictness: Math.min(profile.conversionStrictness, relief.strictnessCap),
    tacticalAlertness: Math.min(profile.tacticalAlertness, relief.alertnessCap),
  }
}

const ROMAN = ['', 'I', 'II', 'III']

/**
 * Short dossier note, or null when the rival plays as authored. Says what
 * actually changed: shallower calculation only when the depth really fell
 * (the weakest rivals already sit on the depth floor).
 */
export function rematchReliefNote(relief: RematchRelief, depthReduced: boolean): string | null {
  if (relief.step === 0) return null
  return `rematch relief ${ROMAN[relief.step]}: ${depthReduced ? 'calculates shallower' : 'plays looser'}`
}

/**
 * Consecutive losses that count toward relief, newest first. A draw never
 * advances a match scene, so it neither adds to nor clears the streak; a
 * win clears it.
 */
export function reliefLossStreak(outcomes: ReadonlyArray<'win' | 'loss' | 'draw'>): number {
  let streak = 0
  for (let i = outcomes.length - 1; i >= 0; i--) {
    const outcome = outcomes[i]
    if (outcome === 'draw') continue
    if (outcome !== 'loss') break
    streak++
  }
  return streak
}
