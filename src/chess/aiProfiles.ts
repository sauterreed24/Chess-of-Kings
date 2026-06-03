import type { Chess } from 'chess.js'
import type { AiProfile, GamePhase, PlayerTendencyProfile } from '../types'

export const AI_PROFILES: Record<string, AiProfile> = {
  novice_court: {
    id: 'novice_court',
    label: 'Novice Court',
    style: 'development',
    searchDepth: 2,
    thinkTimeMs: 500,
    blunderRate: 0.2,
    riskAppetite: 0.25,
    tacticalAlertness: 0.35,
    openingDiscipline: 0.5,
    kingSafetyUrgency: 0.45,
    conversionStrictness: 0.35,
    conversionPersona: 'universal',
    weights: { tactical: 0.4, positional: 0.6, sacrificial: 0.2, prophylactic: 0.3 },
    motifBias: { fork: 0.35, pin: 0.35, skewer: 0.2, kingHunt: 0.2 },
  },
  apprentice_court: {
    id: 'apprentice_court',
    label: 'Apprentice Court',
    style: 'development',
    searchDepth: 3,
    thinkTimeMs: 700,
    blunderRate: 0.12,
    riskAppetite: 0.32,
    tacticalAlertness: 0.48,
    openingDiscipline: 0.62,
    kingSafetyUrgency: 0.58,
    conversionStrictness: 0.45,
    conversionPersona: 'universal',
    weights: { tactical: 0.5, positional: 0.7, sacrificial: 0.3, prophylactic: 0.45 },
    motifBias: { fork: 0.45, pin: 0.4, skewer: 0.3, kingHunt: 0.28 },
  },
  scholar_guard: {
    id: 'scholar_guard',
    label: 'Scholar Guard',
    style: 'romantic',
    searchDepth: 3,
    thinkTimeMs: 850,
    blunderRate: 0.1,
    riskAppetite: 0.64,
    tacticalAlertness: 0.7,
    openingDiscipline: 0.5,
    kingSafetyUrgency: 0.52,
    conversionStrictness: 0.48,
    conversionPersona: 'tactical',
    weights: { tactical: 0.86, positional: 0.4, sacrificial: 0.7, prophylactic: 0.25 },
    motifBias: { fork: 0.82, pin: 0.35, skewer: 0.55, kingHunt: 0.84 },
  },
  veteran_scholar: {
    id: 'veteran_scholar',
    label: 'Veteran Scholar',
    style: 'classical',
    searchDepth: 4,
    thinkTimeMs: 1150,
    blunderRate: 0.07,
    riskAppetite: 0.35,
    tacticalAlertness: 0.68,
    openingDiscipline: 0.76,
    kingSafetyUrgency: 0.7,
    conversionStrictness: 0.66,
    conversionPersona: 'technical',
    weights: { tactical: 0.62, positional: 0.78, sacrificial: 0.36, prophylactic: 0.66 },
    motifBias: { fork: 0.45, pin: 0.74, skewer: 0.68, kingHunt: 0.42 },
  },
  advisor_boss: {
    id: 'advisor_boss',
    label: 'Advisor Boss',
    style: 'alexandrine',
    searchDepth: 5,
    thinkTimeMs: 1400,
    blunderRate: 0.04,
    riskAppetite: 0.4,
    tacticalAlertness: 0.84,
    openingDiscipline: 0.87,
    kingSafetyUrgency: 0.84,
    conversionStrictness: 0.84,
    conversionPersona: 'technical',
    weights: { tactical: 0.78, positional: 0.86, sacrificial: 0.42, prophylactic: 0.86 },
    motifBias: { fork: 0.56, pin: 0.86, skewer: 0.8, kingHunt: 0.52 },
  },
  counterpart_apex: {
    id: 'counterpart_apex',
    label: 'Counterpart Apex',
    style: 'apotheosis',
    searchDepth: 5,
    thinkTimeMs: 1700,
    blunderRate: 0.02,
    riskAppetite: 0.46,
    tacticalAlertness: 0.9,
    openingDiscipline: 0.93,
    kingSafetyUrgency: 0.92,
    conversionStrictness: 0.93,
    conversionPersona: 'technical',
    weights: { tactical: 0.9, positional: 0.92, sacrificial: 0.5, prophylactic: 0.9 },
    motifBias: { fork: 0.7, pin: 0.92, skewer: 0.92, kingHunt: 0.64 },
  },
  alexion_mentor: {
    id: 'alexion_mentor',
    label: 'Alexion Early Mentor',
    style: 'development',
    searchDepth: 3,
    thinkTimeMs: 900,
    blunderRate: 0.11,
    riskAppetite: 0.25,
    tacticalAlertness: 0.54,
    openingDiscipline: 0.78,
    kingSafetyUrgency: 0.8,
    conversionStrictness: 0.58,
    conversionPersona: 'universal',
    weights: { tactical: 0.52, positional: 0.82, sacrificial: 0.18, prophylactic: 0.84 },
    motifBias: { fork: 0.44, pin: 0.7, skewer: 0.52, kingHunt: 0.34 },
  },
  alexion_strategos: {
    id: 'alexion_strategos',
    label: 'Alexion Court Strategos',
    style: 'classical',
    searchDepth: 4,
    thinkTimeMs: 1300,
    blunderRate: 0.06,
    riskAppetite: 0.38,
    tacticalAlertness: 0.76,
    openingDiscipline: 0.88,
    kingSafetyUrgency: 0.85,
    conversionStrictness: 0.8,
    conversionPersona: 'technical',
    weights: { tactical: 0.66, positional: 0.87, sacrificial: 0.36, prophylactic: 0.89 },
    motifBias: { fork: 0.58, pin: 0.88, skewer: 0.84, kingHunt: 0.48 },
  },
  alexion_apex: {
    id: 'alexion_apex',
    label: 'Alexion Archive Apex',
    style: 'apotheosis',
    searchDepth: 5,
    thinkTimeMs: 1800,
    blunderRate: 0.02,
    riskAppetite: 0.43,
    tacticalAlertness: 0.92,
    openingDiscipline: 0.95,
    kingSafetyUrgency: 0.94,
    conversionStrictness: 0.96,
    conversionPersona: 'technical',
    weights: { tactical: 0.92, positional: 0.93, sacrificial: 0.52, prophylactic: 0.93 },
    motifBias: { fork: 0.74, pin: 0.95, skewer: 0.94, kingHunt: 0.68 },
  },
  rowan_gambit: {
    id: 'rowan_gambit',
    label: 'Rowan Gambit Tabiya',
    style: 'romantic',
    searchDepth: 4,
    thinkTimeMs: 1050,
    blunderRate: 0.08,
    riskAppetite: 0.88,
    tacticalAlertness: 0.88,
    openingDiscipline: 0.44,
    kingSafetyUrgency: 0.52,
    conversionStrictness: 0.48,
    conversionPersona: 'tactical',
    weights: { tactical: 0.94, positional: 0.34, sacrificial: 0.94, prophylactic: 0.22 },
    motifBias: { fork: 0.86, pin: 0.48, skewer: 0.68, kingHunt: 0.95 },
  },
  vega_italian: {
    id: 'vega_italian',
    label: 'Vega Italian Pressure',
    style: 'romantic',
    searchDepth: 4,
    thinkTimeMs: 1250,
    blunderRate: 0.055,
    riskAppetite: 0.58,
    tacticalAlertness: 0.8,
    openingDiscipline: 0.78,
    kingSafetyUrgency: 0.9,
    conversionStrictness: 0.76,
    conversionPersona: 'technical',
    weights: { tactical: 0.8, positional: 0.66, sacrificial: 0.62, prophylactic: 0.64 },
    motifBias: { fork: 0.62, pin: 0.8, skewer: 0.7, kingHunt: 0.78 },
  },
}

export function detectGamePhase(chess: Chess): GamePhase {
  const pieces = chess
    .board()
    .flat()
    .filter((p) => p && p.type !== 'k')
  if (pieces.length >= 20) return 'opening'
  if (pieces.length <= 8) return 'endgame'
  return 'middlegame'
}

export function resolveProfileByMatchId(matchId: string): AiProfile {
  if (matchId.includes('amara')) return AI_PROFILES.novice_court
  if (matchId.includes('lukas')) return AI_PROFILES.apprentice_court
  if (matchId.includes('edred')) return AI_PROFILES.scholar_guard
  if (matchId.includes('rowan')) return AI_PROFILES.rowan_gambit
  if (matchId.includes('vega')) return AI_PROFILES.vega_italian
  if (matchId.includes('marius')) return AI_PROFILES.veteran_scholar
  if (matchId.includes('demetrios')) return AI_PROFILES.advisor_boss
  if (matchId.includes('boss') || matchId.includes('counterpart')) return AI_PROFILES.counterpart_apex
  return AI_PROFILES.apprentice_court
}

export function resolveProfileByDuelVariant(variantId: string): AiProfile {
  if (variantId.includes('mentor')) return AI_PROFILES.alexion_mentor
  if (variantId.includes('strategos')) return AI_PROFILES.alexion_strategos
  if (variantId.includes('apex')) return AI_PROFILES.alexion_apex
  if (variantId.includes('veteran')) return AI_PROFILES.veteran_scholar
  if (variantId.includes('rowan')) return AI_PROFILES.rowan_gambit
  if (variantId.includes('vega')) return AI_PROFILES.vega_italian
  return AI_PROFILES.apprentice_court
}

export function adaptProfileToPhase(
  base: AiProfile,
  phase: GamePhase,
  tendencies: PlayerTendencyProfile,
): AiProfile {
  const p = { ...base, weights: { ...base.weights } }
  if (phase === 'opening') {
    p.openingDiscipline = Math.min(1, p.openingDiscipline + 0.08)
  } else if (phase === 'endgame') {
    p.conversionStrictness = Math.min(1, p.conversionStrictness + 0.12)
    p.blunderRate = Math.max(0.01, p.blunderRate - 0.02)
  } else {
    p.tacticalAlertness = Math.min(1, p.tacticalAlertness + 0.06)
  }

  // Nemesis memory: if player overuses flank pawn pushes, punish with center play.
  if (tendencies.flankPawnPushes >= 8) {
    p.tacticalAlertness = Math.min(1, p.tacticalAlertness + 0.1)
    p.weights.prophylactic = Math.min(1, p.weights.prophylactic + 0.12)
  }
  if (tendencies.earlyQueenMoves >= 4) {
    p.weights.tactical = Math.min(1, p.weights.tactical + 0.08)
  }
  return p
}
