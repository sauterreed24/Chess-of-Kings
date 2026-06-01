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
    1: { e5: 3, c5: 3, d5: 3 },
    3: { Nc6: 3, Nf6: 3, e6: 2 },
    5: { Bc5: 3, d6: 3, Nf6: 3 },
    7: { Nf6: 3, Be7: 3, d6: 2 },
  },
  rowan: {
    1: { e5: 5, c5: 4 },
    3: { Nf6: 4, Nc6: 3 },
    5: { g6: 4, Bc5: 3 },
    7: { Bg7: 4, Bc5: 3 },
  },
  vega: {
    1: { e5: 6, d5: 2 },
    3: { Nc6: 5, Nf6: 4 },
    5: { Bc5: 6, Nf6: 3, Be7: 2 },
    7: { Bc5: 5, Be7: 3 },
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
