/** Logical hall size — positions are in these units; the runner maps them to pixels. */
export const WORLD = { w: 220, h: 100 }
/** Camera window in world units (width matches viewport width at scale 1). */
export const VIEW = { w: 92, h: 56 }

export type WorldSite = {
  id: string
  /** World-space X (0 … WORLD.w) */
  x: number
  /** World-space Y (0 … WORLD.h) */
  y: number
  /** Distance in world units at which [E] activates */
  interactRadius: number
  title: string
  subtitle: string
  kind: 'simulation' | 'catalogue' | 'duel'
  chapterIndex?: number
  sceneIndex?: number
}

export type WorldNPC = {
  id: string
  x: number
  y: number
  interactRadius: number
  name: string
  title: string
  variant: 'scholar' | 'guard' | 'scribe'
  /** Shown in order; minChapter gates visibility */
  lines: string[]
  minChapter?: number
}

/** The History Lab vestibule — plinths and colonnades in an expanded floor plan. */
export const HUB_SITES: WorldSite[] = [
  {
    id: 'threshold',
    x: 110,
    y: 22,
    interactRadius: 14,
    title: 'The Threshold',
    subtitle: 'Prologue · white screen',
    kind: 'simulation',
    chapterIndex: 0,
    sceneIndex: 0,
  },
  {
    id: 'catalogue',
    x: 34,
    y: 68,
    interactRadius: 12,
    title: 'The Catalogue',
    subtitle: 'Chronicle index & sealed ages',
    kind: 'catalogue',
  },
  {
    id: 'ancient',
    x: 186,
    y: 68,
    interactRadius: 12,
    title: 'Ancient Court',
    subtitle: 'Chapter I · the scholarly board',
    kind: 'simulation',
    chapterIndex: 1,
    sceneIndex: 0,
  },
  {
    id: 'duel-archive',
    x: 110,
    y: 84,
    interactRadius: 12,
    title: 'Archive of Rivals',
    subtitle: 'Duel mode · rematches and mentor variants',
    kind: 'duel',
  },
]

export const HUB_NPCS: WorldNPC[] = [
  {
    id: 'npc-alexion',
    x: 110,
    y: 44,
    interactRadius: 11,
    name: 'Alexion',
    title: 'Keeper of the vestibule',
    variant: 'scholar',
    minChapter: 0,
    lines: [
      'Every footstep here is a datum. The Archive does not forget — it only waits for a reader brave enough to parse it.',
      'The Calculus of Kings is not cruelty. It is the honest sum of choices under pressure.',
      'When you stand at the board, you are already writing history. I merely file the marginalia.',
    ],
  },
  {
    id: 'npc-heliodoros',
    x: 48,
    y: 78,
    interactRadius: 10,
    name: 'Heliodoros',
    title: 'Column guard',
    variant: 'guard',
    minChapter: 0,
    lines: [
      'The Catalogue hall is open to all who bear the seal of progress. No scroll leaves without a counter-move.',
      'I have watched scholars lose on move twelve and win on move forty. Patience is also tactics.',
    ],
  },
  {
    id: 'npc-kephalopoulos',
    x: 172,
    y: 52,
    interactRadius: 10,
    name: 'Kephalopoulos',
    title: 'Scribe of the ancient court',
    variant: 'scribe',
    minChapter: 1,
    lines: [
      'The old games still hum in the stone. We do not replay them for sport — we study how thought once moved.',
      'If your opening feels small, good. The middlegame is where the Archive tests your nerve.',
    ],
  },
  {
    id: 'npc-theron',
    x: 85,
    y: 58,
    interactRadius: 10,
    name: 'Theron',
    title: 'Archive warden',
    variant: 'guard',
    minChapter: 1,
    lines: [
      'The Archive contains every game ever played. Some scholars believe it contains every game that will be played. Chess is closed — the positions are finite. Only the choosing is infinite.',
      'A position repeated three times is a draw by agreement of logic — the game has become a loop with no escape. Avoiding repetition is not cowardice. It is craft.',
      'Your best move is not always the most aggressive. It is the one that leaves your opponent with the fewest good answers.',
    ],
  },
]

export function isSiteUnlocked(site: WorldSite, highestUnlockedChapter: number): boolean {
  if (site.kind === 'catalogue') return true
  if (site.kind === 'duel') return highestUnlockedChapter >= 1
  const ch = site.chapterIndex ?? 0
  return ch <= highestUnlockedChapter
}

export function isNpcVisible(npc: WorldNPC, highestUnlockedChapter: number): boolean {
  const min = npc.minChapter ?? 0
  return highestUnlockedChapter >= min
}

export function distanceToSite(px: number, py: number, site: WorldSite): number {
  return Math.hypot(site.x - px, site.y - py)
}

export function distanceToNpc(px: number, py: number, npc: WorldNPC): number {
  return Math.hypot(npc.x - px, npc.y - py)
}
