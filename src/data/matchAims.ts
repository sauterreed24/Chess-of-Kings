/** Opening ply window: after this many SAN moves the live aim yields to the census. */
export const MATCH_AIM_PLY_LIMIT = 10

export const DEFAULT_MATCH_AIM = 'Develop, castle, then contest the center.'

/** Short instrument commands for campaign matches. Dots already show destinations. */
export const MATCH_AIM_BY_SCENE_ID: Record<string, string> = {
  'c1-match-amara': "Open the center; castle before Amara's symmetry hardens.",
  'c1-match-lukas': 'Leave the book; play a center you can explain.',
  'c1-match-edred': 'Castle through the fire; deny Edred open lines.',
  'c1-match-marius': 'Make a small imbalance; do not wait for a gift.',
  'c1-match-demetrios': 'Stay accurate; no loose pieces against Demetrios.',
  'c1-boss': 'Stay accountable: no loose pieces.',
  'c2-match-rowan': "Castle; refuse Rowan's poisoned pawn.",
  'c2-match-vega': "Castle early; meet Vega's pressure with development.",
  'c3-match-demetrios-return': 'No early pawn tempi; answer quiet threats first.',
  'c3-match-kallistos': 'Name your break; do not gift Kallistos a weak square.',
  'c4-match-nysa': 'Occupy only what you can defend twice.',
  'c4-match-cassian': 'Hold the center; contest the long diagonal.',
}

export const DUEL_AIM_BY_OPPONENT_ID: Record<string, string> = {
  amara: MATCH_AIM_BY_SCENE_ID['c1-match-amara']!,
  lukas: MATCH_AIM_BY_SCENE_ID['c1-match-lukas']!,
  edred: MATCH_AIM_BY_SCENE_ID['c1-match-edred']!,
  marius: MATCH_AIM_BY_SCENE_ID['c1-match-marius']!,
  alexion: MATCH_AIM_BY_SCENE_ID['c1-boss']!,
  rowan: MATCH_AIM_BY_SCENE_ID['c2-match-rowan']!,
  vega: MATCH_AIM_BY_SCENE_ID['c2-match-vega']!,
  kallistos: MATCH_AIM_BY_SCENE_ID['c3-match-kallistos']!,
  nysa: MATCH_AIM_BY_SCENE_ID['c4-match-nysa']!,
  cassian: MATCH_AIM_BY_SCENE_ID['c4-match-cassian']!,
}

export function matchAimForSceneId(sceneId: string): string {
  return MATCH_AIM_BY_SCENE_ID[sceneId] ?? DEFAULT_MATCH_AIM
}

export function duelAimForOpponentId(opponentId: string): string {
  return DUEL_AIM_BY_OPPONENT_ID[opponentId] ?? DEFAULT_MATCH_AIM
}
