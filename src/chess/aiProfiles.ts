import type { Chess } from 'chess.js'
import type { AiProfile, GamePhase, PlayerTendencyProfile } from '../types'

export const AI_PROFILES: Record<string, AiProfile> = {
  novice_court: {
    id: 'novice_court',
    label: 'Novice Court',
    style: 'development',
    searchDepth: 2,
    thinkTimeMs: 420,
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
    searchDepth: 2,
    thinkTimeMs: 620,
    blunderRate: 0.16,
    riskAppetite: 0.32,
    tacticalAlertness: 0.48,
    openingDiscipline: 0.62,
    kingSafetyUrgency: 0.58,
    conversionStrictness: 0.4,
    conversionPersona: 'universal',
    weights: { tactical: 0.5, positional: 0.7, sacrificial: 0.3, prophylactic: 0.45 },
    motifBias: { fork: 0.45, pin: 0.4, skewer: 0.3, kingHunt: 0.28 },
  },
  scholar_guard: {
    id: 'scholar_guard',
    label: 'Scholar Guard',
    style: 'romantic',
    searchDepth: 3,
    thinkTimeMs: 790,
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
    thinkTimeMs: 1080,
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
    blunderRate: 0.03,
    riskAppetite: 0.36,
    tacticalAlertness: 0.84,
    openingDiscipline: 0.9,
    kingSafetyUrgency: 0.84,
    conversionStrictness: 0.88,
    conversionPersona: 'technical',
    weights: { tactical: 0.78, positional: 0.88, sacrificial: 0.38, prophylactic: 0.9 },
    motifBias: { fork: 0.54, pin: 0.9, skewer: 0.84, kingHunt: 0.48 },
  },
  counterpart_apex: {
    id: 'counterpart_apex',
    label: 'Counterpart Apex',
    style: 'apotheosis',
    searchDepth: 5,
    thinkTimeMs: 1700,
    blunderRate: 0.012,
    riskAppetite: 0.26,
    tacticalAlertness: 0.95,
    openingDiscipline: 0.99,
    kingSafetyUrgency: 0.99,
    conversionStrictness: 0.99,
    conversionPersona: 'technical',
    weights: { tactical: 0.9, positional: 0.99, sacrificial: 0.42, prophylactic: 0.99 },
    motifBias: { fork: 0.66, pin: 1, skewer: 0.99, kingHunt: 0.54 },
  },
  alexion_mentor: {
    id: 'alexion_mentor',
    label: 'Alexion Early Mentor',
    style: 'development',
    searchDepth: 3,
    thinkTimeMs: 760,
    blunderRate: 0.09,
    riskAppetite: 0.2,
    tacticalAlertness: 0.54,
    openingDiscipline: 0.84,
    kingSafetyUrgency: 0.8,
    conversionStrictness: 0.66,
    conversionPersona: 'universal',
    weights: { tactical: 0.5, positional: 0.87, sacrificial: 0.16, prophylactic: 0.9 },
    motifBias: { fork: 0.44, pin: 0.7, skewer: 0.52, kingHunt: 0.34 },
  },
  alexion_strategos: {
    id: 'alexion_strategos',
    label: 'Alexion Court Strategos',
    style: 'classical',
    searchDepth: 4,
    thinkTimeMs: 1300,
    blunderRate: 0.045,
    riskAppetite: 0.26,
    tacticalAlertness: 0.78,
    openingDiscipline: 0.93,
    kingSafetyUrgency: 0.9,
    conversionStrictness: 0.9,
    conversionPersona: 'technical',
    weights: { tactical: 0.62, positional: 0.95, sacrificial: 0.26, prophylactic: 0.97 },
    motifBias: { fork: 0.5, pin: 0.95, skewer: 0.9, kingHunt: 0.4 },
  },
  alexion_apex: {
    id: 'alexion_apex',
    label: 'Alexion Archive Apex',
    style: 'apotheosis',
    searchDepth: 5,
    thinkTimeMs: 1800,
    blunderRate: 0.012,
    riskAppetite: 0.24,
    tacticalAlertness: 0.95,
    openingDiscipline: 0.99,
    kingSafetyUrgency: 0.99,
    conversionStrictness: 0.99,
    conversionPersona: 'technical',
    weights: { tactical: 0.9, positional: 0.99, sacrificial: 0.42, prophylactic: 0.99 },
    motifBias: { fork: 0.66, pin: 1, skewer: 0.99, kingHunt: 0.56 },
  },
  rowan_gambit: {
    id: 'rowan_gambit',
    label: 'Rowan Gambit Tabiya',
    style: 'romantic',
    searchDepth: 4,
    thinkTimeMs: 900,
    blunderRate: 0.085,
    riskAppetite: 0.97,
    tacticalAlertness: 0.92,
    openingDiscipline: 0.32,
    kingSafetyUrgency: 0.4,
    conversionStrictness: 0.36,
    conversionPersona: 'tactical',
    weights: { tactical: 0.97, positional: 0.28, sacrificial: 0.98, prophylactic: 0.12 },
    motifBias: { fork: 0.9, pin: 0.42, skewer: 0.72, kingHunt: 0.99 },
  },
  vega_italian: {
    id: 'vega_italian',
    label: 'Vega Italian Pressure',
    style: 'romantic',
    searchDepth: 4,
    thinkTimeMs: 1120,
    blunderRate: 0.045,
    riskAppetite: 0.42,
    tacticalAlertness: 0.82,
    openingDiscipline: 0.92,
    kingSafetyUrgency: 0.96,
    conversionStrictness: 0.88,
    conversionPersona: 'technical',
    weights: { tactical: 0.76, positional: 0.8, sacrificial: 0.48, prophylactic: 0.86 },
    motifBias: { fork: 0.56, pin: 0.92, skewer: 0.74, kingHunt: 0.7 },
  },
  kallistos_classical: {
    id: 'kallistos_classical',
    label: 'Kallistos Classical Law',
    style: 'classical',
    searchDepth: 4,
    thinkTimeMs: 1200,
    blunderRate: 0.04,
    riskAppetite: 0.22,
    tacticalAlertness: 0.8,
    openingDiscipline: 0.95,
    kingSafetyUrgency: 0.92,
    conversionStrictness: 0.9,
    conversionPersona: 'technical',
    weights: { tactical: 0.55, positional: 0.96, sacrificial: 0.18, prophylactic: 0.99 },
    motifBias: { fork: 0.42, pin: 0.88, skewer: 0.7, kingHunt: 0.28 },
  },
  nysa_frontier: {
    id: 'nysa_frontier',
    label: 'Nysa Bactrian Frontier',
    style: 'hypermodern',
    searchDepth: 4,
    thinkTimeMs: 1000,
    blunderRate: 0.055,
    riskAppetite: 0.48,
    tacticalAlertness: 0.76,
    openingDiscipline: 0.7,
    kingSafetyUrgency: 0.72,
    conversionStrictness: 0.62,
    conversionPersona: 'universal',
    weights: { tactical: 0.58, positional: 0.9, sacrificial: 0.28, prophylactic: 0.7 },
    motifBias: { fork: 0.5, pin: 0.72, skewer: 0.55, kingHunt: 0.36 },
  },
  cassian_paradox: {
    id: 'cassian_paradox',
    label: 'Cassian Paradox Master',
    style: 'hypermodern',
    searchDepth: 4,
    thinkTimeMs: 1280,
    blunderRate: 0.035,
    riskAppetite: 0.4,
    tacticalAlertness: 0.84,
    openingDiscipline: 0.88,
    kingSafetyUrgency: 0.8,
    conversionStrictness: 0.82,
    conversionPersona: 'technical',
    weights: { tactical: 0.64, positional: 0.96, sacrificial: 0.3, prophylactic: 0.86 },
    motifBias: { fork: 0.48, pin: 0.86, skewer: 0.68, kingHunt: 0.34 },
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
  if (matchId.includes('kallistos')) return AI_PROFILES.kallistos_classical
  if (matchId.includes('nysa')) return AI_PROFILES.nysa_frontier
  if (matchId.includes('cassian')) return AI_PROFILES.cassian_paradox
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
  if (variantId.includes('kallistos')) return AI_PROFILES.kallistos_classical
  if (variantId.includes('nysa')) return AI_PROFILES.nysa_frontier
  if (variantId.includes('cassian')) return AI_PROFILES.cassian_paradox
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
