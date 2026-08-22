/**
 * SAN weight boosts keyed by documented rival id and book ply.
 * Turns {@link RivalProfile} opening signatures into live book preference.
 */
export const RIVAL_OPENING_SAN_BIAS: Record<string, Record<number, Record<string, number>>> = {
  amara: {
    1: { d5: 4, e5: 1 },
    3: { e6: 5, Nf6: 2 },
    5: { Nf6: 3, Be7: 3, d6: 2 },
  },
  lukas: {
    1: { e5: 5, d5: 2 },
    3: { Nf6: 4, Nc6: 4 },
    5: { Nc6: 5, Bc5: 4, Be7: 2 },
    7: { Bc5: 4, Be7: 3 },
  },
  edred: {
    1: { c5: 6, e5: 2 },
    3: { Nc6: 4, d6: 2 },
    5: { g6: 6, Nf6: 2 },
    7: { Bg7: 6, d6: 2 },
  },
  marius: {
    1: { e5: 4, d5: 3 },
    3: { Nf6: 4, e6: 3, Nc6: 2 },
    5: { d6: 5, Nf6: 4, Be7: 3 },
    7: { d6: 4, Be7: 3 },
  },
  demetrios: {
    1: { e5: 3, c5: 2, d5: 4 },
    3: { Nc6: 3, Nf6: 4, e6: 3 },
    5: { Bc5: 3, d6: 3, Nf6: 3 },
    7: { Nf6: 3, Be7: 4, d6: 3 },
  },
  alexion: {
    1: { d5: 5, e5: 2, c5: 1 },
    3: { Nf6: 5, e6: 4 },
    5: { e6: 4, Be7: 4, Nf6: 3 },
    7: { Be7: 4, 'O-O': 3, Nf6: 2 },
  },
  kallistos: {
    1: { e5: 4, d5: 3 },
    3: { Nf6: 5, Nc6: 3 },
    5: { d6: 4, Be7: 5, Nf6: 3 },
    7: { 'O-O': 5, Be7: 3, d6: 2 },
  },
  rowan: {
    1: { e5: 1, c5: 2, exf4: 9 },
    3: { Nf6: 7, Nc6: 1, d5: 2 },
    5: { 'Qh4+': 9, g6: 2, Bc5: 1 },
    7: { Bg7: 6, Bc5: 1, 'O-O': 2 },
  },
  vega: {
    1: { e5: 3, d5: 1, Nf6: 8 },
    3: { Nc6: 4, Nf6: 4, Bc5: 7 },
    5: { Bc5: 7, Nf6: 2, Be7: 2, d6: 7 },
    7: { Bc5: 3, Be7: 2, 'O-O': 8 },
  },
  nysa: {
    1: { g6: 8, Nf6: 4, d6: 2 },
    3: { Bg7: 9, Nf6: 3 },
    5: { Nf6: 7, d6: 5 },
    7: { 'O-O': 7, d6: 4 },
    9: { d6: 6, c5: 4 },
  },
  cassian: {
    1: { Nf6: 8, g6: 5, d6: 2 },
    3: { g6: 7, d6: 4 },
    5: { Bg7: 8, d6: 4 },
    7: { 'O-O': 7, d6: 4 },
    9: { d6: 5, c5: 5 },
  },
  gage: {
    1: { d6: 8, e5: 4, Nf6: 2 },
    3: { Nf6: 8, Be7: 3 },
    5: { Be7: 7, Nbd7: 4 },
    7: { 'O-O': 8, c6: 3 },
    9: { h6: 7, Re8: 4 },
  },
  helia: {
    1: { e6: 8, d5: 5, Nf6: 2 },
    3: { d5: 8, Nf6: 4 },
    5: { Nf6: 7, Be7: 4 },
    7: { Be7: 7, 'O-O': 4 },
    9: { 'O-O': 7, c5: 4 },
  },
  prax: {
    1: { c5: 8, e5: 3, c6: 2 },
    3: { Nc6: 8, d6: 4 },
    5: { d6: 7, Nf6: 5 },
    7: { Nf6: 7, Be7: 4 },
    9: { Be7: 6, 'O-O': 5 },
  },
  iota: {
    1: { c6: 8, d5: 4, e6: 2 },
    3: { d5: 8, Nf6: 3 },
    5: { Nf6: 7, e6: 4 },
    7: { e6: 7, Be7: 4 },
    9: { Be7: 6, 'O-O': 5 },
  },
  mira: {
    1: { e5: 8, c5: 3, e6: 2 },
    3: { Nf6: 8, Nc6: 4 },
    5: { Nc6: 7, Bc5: 5 },
    7: { Bc5: 7, d6: 4 },
    9: { d6: 6, 'O-O': 5 },
  },
  soren: {
    1: { g6: 8, d6: 4, c5: 2 },
    3: { Bg7: 8, Nf6: 3 },
    5: { d6: 7, Nf6: 4 },
    7: { Nf6: 7, 'O-O': 4 },
    9: { 'O-O': 6, c5: 5 },
  },
  voss: {
    1: { d5: 8, e6: 3, d6: 2 },
    3: { e6: 8, Nf6: 4 },
    5: { Nf6: 7, Be7: 5 },
    7: { Be7: 7, 'O-O': 4 },
    9: { 'O-O': 6, c5: 5 },
  },
  elara: {
    1: { c5: 8, e5: 3, c6: 2 },
    3: { d6: 8, Nc6: 4 },
    5: { Nf6: 7, Nc6: 5 },
    7: { Nc6: 7, g6: 4 },
    9: { g6: 6, Bg7: 5 },
  },
}

export function rivalOpeningWeightBoost(
  rivalId: string | undefined,
  plyCount: number,
  san: string,
): number {
  if (!rivalId) return 0
  return RIVAL_OPENING_SAN_BIAS[rivalId]?.[plyCount]?.[san] ?? 0
}
