import { Chess } from 'chess.js'
import { rivalOpeningWeightBoost } from './rivalOpeningBias'

type WeightedSan = { san: string; weight: number }
type OpeningBook = Record<number, WeightedSan[]>

const BOOKS: Record<string, OpeningBook> = {
  novice_court: {
    1: [{ san: 'd5', weight: 6 }, { san: 'e5', weight: 4 }],
    3: [{ san: 'e6', weight: 7 }, { san: 'Nf6', weight: 3 }],
    5: [{ san: 'Nf6', weight: 8 }, { san: 'Be7', weight: 2 }],
  },
  apprentice_court: {
    1: [{ san: 'e5', weight: 7 }, { san: 'd5', weight: 3 }],
    3: [{ san: 'Nf6', weight: 7 }, { san: 'Nc6', weight: 3 }],
    5: [{ san: 'Nc6', weight: 6 }, { san: 'Bc5', weight: 4 }],
    7: [{ san: 'Bc5', weight: 6 }, { san: 'Be7', weight: 4 }],
  },
  scholar_guard: {
    1: [{ san: 'c5', weight: 7 }, { san: 'e5', weight: 3 }],
    3: [{ san: 'Nc6', weight: 8 }, { san: 'd6', weight: 2 }],
    5: [{ san: 'g6', weight: 8 }, { san: 'Nf6', weight: 2 }],
    7: [{ san: 'Bg7', weight: 8 }, { san: 'd6', weight: 2 }],
  },
  veteran_scholar: {
    1: [{ san: 'e5', weight: 7 }, { san: 'd5', weight: 3 }],
    3: [{ san: 'Nc6', weight: 7 }, { san: 'Nf6', weight: 3 }],
    5: [{ san: 'Nf6', weight: 7 }, { san: 'd6', weight: 3 }],
    7: [{ san: 'd6', weight: 6 }, { san: 'Be7', weight: 4 }],
  },
  advisor_boss: {
    1: [{ san: 'e5', weight: 6 }, { san: 'c5', weight: 4 }],
    3: [{ san: 'Nc6', weight: 6 }, { san: 'Nf6', weight: 4 }],
    5: [{ san: 'Bc5', weight: 5 }, { san: 'd6', weight: 5 }],
    7: [{ san: 'Nf6', weight: 6 }, { san: 'Be7', weight: 4 }],
  },
  counterpart_apex: {
    1: [{ san: 'e5', weight: 5 }, { san: 'c5', weight: 5 }],
    3: [{ san: 'Nc6', weight: 6 }, { san: 'Nf6', weight: 4 }],
    5: [{ san: 'd6', weight: 6 }, { san: 'Bc5', weight: 4 }],
    7: [{ san: 'Be6', weight: 6 }, { san: 'd6', weight: 4 }],
  },
  alexion_mentor: {
    1: [{ san: 'd5', weight: 5 }, { san: 'e5', weight: 5 }],
    3: [{ san: 'Nf6', weight: 6 }, { san: 'e6', weight: 4 }],
    5: [{ san: 'e6', weight: 6 }, { san: 'Be7', weight: 4 }],
  },
  alexion_strategos: {
    1: [{ san: 'e5', weight: 6 }, { san: 'd5', weight: 4 }],
    3: [{ san: 'Nc6', weight: 6 }, { san: 'Nf6', weight: 4 }],
    5: [{ san: 'Nf6', weight: 6 }, { san: 'Bc5', weight: 4 }],
    7: [{ san: 'Bc5', weight: 6 }, { san: 'd6', weight: 4 }],
  },
  alexion_apex: {
    1: [{ san: 'e5', weight: 5 }, { san: 'c5', weight: 5 }],
    3: [{ san: 'Nc6', weight: 5 }, { san: 'Nf6', weight: 5 }],
    5: [{ san: 'd6', weight: 8 }, { san: 'Bc5', weight: 2 }],
    7: [{ san: 'Be7', weight: 6 }, { san: 'Nf6', weight: 4 }],
    9: [{ san: 'O-O', weight: 8 }, { san: 'd6', weight: 2 }],
  },
  rowan_gambit: {
    1: [{ san: 'exf4', weight: 12 }, { san: 'e5', weight: 3 }, { san: 'Nc6', weight: 1 }],
    3: [{ san: 'Nf6', weight: 9 }, { san: 'd5', weight: 2 }],
    5: [{ san: 'Qh4+', weight: 9 }, { san: 'Bc5', weight: 3 }],
    7: [{ san: 'O-O', weight: 5 }, { san: 'd6', weight: 3 }],
    9: [{ san: 'Bg4', weight: 6 }, { san: 'Re8', weight: 5 }],
  },
  vega_italian: {
    1: [{ san: 'Nf6', weight: 9 }, { san: 'e5', weight: 5 }, { san: 'Bc5', weight: 2 }],
    3: [{ san: 'Bc5', weight: 8 }, { san: 'Nf6', weight: 3 }],
    5: [{ san: 'd6', weight: 8 }, { san: 'O-O', weight: 5 }],
    7: [{ san: 'O-O', weight: 9 }, { san: 'Be6', weight: 3 }],
    9: [{ san: 'Re8', weight: 7 }, { san: 'h6', weight: 3 }],
  },
}

export function getBookTopLines(
  profileId: string,
  maxPlies = 8,
): Array<{ ply: number; san: string }> {
  const book = BOOKS[profileId]
  if (!book) return []
  const out: Array<{ ply: number; san: string }> = []
  const plies = Object.keys(book)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0 && n <= maxPlies)
    .sort((a, b) => a - b)
  for (const ply of plies) {
    const opts = book[ply] ?? []
    if (!opts.length) continue
    const top = [...opts].sort((a, b) => b.weight - a.weight)[0]
    if (!top) continue
    out.push({ ply, san: top.san })
  }
  return out
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const sum = items.reduce((a, i) => a + Math.max(1, i.weight), 0)
  let roll = Math.random() * sum
  for (const item of items) {
    roll -= Math.max(1, item.weight)
    if (roll <= 0) return item
  }
  return items[items.length - 1]!
}

export function chooseOpeningBookMove(
  chess: Chess,
  profileId: string,
  plyCount: number,
  rivalId?: string,
): string | null {
  const book = BOOKS[profileId]
  if (!book) return null
  const options = book[plyCount]
  if (!options?.length) return null
  const legalSanSet = new Set(chess.moves())
  const legalSans = options
    .filter((o) => legalSanSet.has(o.san))
    .map((o) => ({
      ...o,
      weight: o.weight + rivalOpeningWeightBoost(rivalId, plyCount, o.san),
    }))
  if (!legalSans.length) return null
  return weightedPick(legalSans).san
}

/** Rank book options for a ply by descending weight (for bias / repertoire tests). */
export function rankOpeningCandidates(
  chess: Chess,
  profileId: string,
  plyCount: number,
): Array<{ san: string; weight: number; bias: number }> {
  const book = BOOKS[profileId]
  if (!book) return []
  const options = book[plyCount]
  if (!options?.length) return []
  const legalSanSet = new Set(chess.moves())
  const legal = options.filter((o) => legalSanSet.has(o.san))
  if (!legal.length) return []
  return [...legal]
    .sort((a, b) => b.weight - a.weight)
    .map((o) => ({
      san: o.san,
      weight: o.weight,
      bias: openingSanBias(chess, profileId, plyCount, o.san),
    }))
}

/** Heuristic bonus when the engine falls back but should stay on-book. */
export function openingSanBias(
  chess: Chess,
  profileId: string,
  plyCount: number,
  san: string,
): number {
  const book = BOOKS[profileId]
  if (!book) return 0
  const options = book[plyCount]
  if (!options?.length) return 0
  const legalSanSet = new Set(chess.moves())
  if (!legalSanSet.has(san)) return 0
  const match = options.find((o) => o.san === san)
  if (!match) return 0
  const maxWeight = Math.max(...options.map((o) => o.weight))
  const ratio = match.weight / Math.max(1, maxWeight)
  return Math.round(12 + ratio * 28)
}
