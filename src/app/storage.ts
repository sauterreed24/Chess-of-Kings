import { devWarn } from './devLog'
import type {
  CosmeticInventory,
  InProgressSnapshot,
  SavedMoveQuality,
  MatchHistoryEntry,
  PieceSkinId,
  PlayerTendencyProfile,
  RivalMemoryEntry,
} from '../types'
import { Chess } from 'chess.js'

const KEY = 'calculus-of-kings-progress-v3'

export type LastScreen = 'title' | 'chapters' | 'play' | 'world'

export interface SaveData {
  version: 3
  chapterIndex: number
  sceneIndex: number
  highestUnlockedChapter: number
  lastScreen: LastScreen
  chapter1Complete: boolean
  completedSceneIds: string[]
  completedPuzzleIds: string[]
  stratarchiaUnlocked: boolean
  duelUnlockedOpponentIds: string[]
  unlockedDuelVariantIds: string[]
  codexUnlocks: string[]
  titleUnlocks: string[]
  chronicleEchoes: string[]
  rankPoints: number
  cosmetics: CosmeticInventory
  tendencies: PlayerTendencyProfile
  matchHistory: MatchHistoryEntry[]
  rivalMemory: Record<string, RivalMemoryEntry>
  inProgress: InProgressSnapshot | null
}

const defaultSave = (): SaveData => ({
  version: 3,
  chapterIndex: 0,
  sceneIndex: 0,
  highestUnlockedChapter: 0,
  lastScreen: 'title',
  chapter1Complete: false,
  completedSceneIds: [],
  completedPuzzleIds: [],
  stratarchiaUnlocked: false,
  duelUnlockedOpponentIds: [],
  unlockedDuelVariantIds: ['alexion-mentor'],
  codexUnlocks: [],
  titleUnlocks: [],
  chronicleEchoes: [],
  rankPoints: 0,
  cosmetics: {
    unlockedPieceSkins: ['classic-royal', 'high-contrast', 'alexandrine-ornate', 'obsidian-neon'],
    selectedPieceSkin: 'classic-royal',
  },
  tendencies: {
    flankPawnPushes: 0,
    earlyQueenMoves: 0,
    repeatedChecksWithoutGain: 0,
  },
  matchHistory: [],
  rivalMemory: {},
  inProgress: null,
})

function sanitizeStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of v) {
    if (typeof raw !== 'string') continue
    const s = raw.trim()
    if (!s || seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= max) break
  }
  return out
}

function normalizeSkin(v: unknown): PieceSkinId {
  if (
    v === 'classic-royal' ||
    v === 'high-contrast' ||
    v === 'alexandrine-ornate' ||
    v === 'obsidian-neon'
  ) return v
  return 'classic-royal'
}

function isMoveQuality(v: unknown): v is SavedMoveQuality {
  return (
    v === null ||
    v === 'brilliant' ||
    v === 'good' ||
    v === 'ok' ||
    v === 'inaccuracy' ||
    v === 'mistake' ||
    v === 'blunder'
  )
}

function isFen(v: unknown): v is string {
  if (typeof v !== 'string' || !v.trim()) return false
  try {
    void new Chess(v)
    return true
  } catch {
    return false
  }
}

function sanitizeInProgress(v: unknown): InProgressSnapshot | null {
  if (!v || typeof v !== 'object') return null
  const x = v as Partial<InProgressSnapshot>
  if (
    x.mode !== 'puzzle' &&
    x.mode !== 'match' &&
    x.mode !== 'calibration' &&
    x.mode !== 'freeplay' &&
    x.mode !== 'duel'
  ) return null
  if (typeof x.chapterIndex !== 'number' || typeof x.sceneIndex !== 'number') return null
  if (!isFen(x.fen)) return null
  const history = Array.isArray(x.history) ? x.history.filter(isFen).slice(-240) : []
  const sanLog = sanitizeStringArray(x.sanLog, 240)
  const sanQuality = Array.isArray(x.sanQuality)
    ? x.sanQuality.filter(isMoveQuality).slice(0, sanLog.length)
    : []
  const sceneTendencies = {
    flankPawnPushes:
      typeof x.sceneTendencies?.flankPawnPushes === 'number'
        ? Math.max(0, Math.floor(x.sceneTendencies.flankPawnPushes))
        : 0,
    earlyQueenMoves:
      typeof x.sceneTendencies?.earlyQueenMoves === 'number'
        ? Math.max(0, Math.floor(x.sceneTendencies.earlyQueenMoves))
        : 0,
    repeatedChecksWithoutGain:
      typeof x.sceneTendencies?.repeatedChecksWithoutGain === 'number'
        ? Math.max(0, Math.floor(x.sceneTendencies.repeatedChecksWithoutGain))
        : 0,
  }
  const duel = (() => {
    const d = x.duel
    if (!d || typeof d !== 'object') return undefined
    const dx = d as Partial<NonNullable<InProgressSnapshot['duel']>>
    if (
      typeof dx.opponentId !== 'string' ||
      typeof dx.variantId !== 'string' ||
      (dx.difficulty !== 'novice' && dx.difficulty !== 'balanced' && dx.difficulty !== 'relentless') ||
      (dx.playerColor !== 'w' && dx.playerColor !== 'b') ||
      !isFen(dx.fen)
    ) return undefined
    return {
      opponentId: dx.opponentId,
      variantId: dx.variantId,
      difficulty: dx.difficulty,
      playerColor: dx.playerColor,
      fen: dx.fen,
    }
  })()
  return {
    mode: x.mode,
    chapterIndex: Math.max(0, Math.floor(x.chapterIndex)),
    sceneIndex: Math.max(0, Math.floor(x.sceneIndex)),
    fen: x.fen,
    history: history.length ? history : [x.fen],
    sanLog,
    sanQuality,
    playerColor: x.playerColor === 'b' ? 'b' : 'w',
    calibrationMoves: typeof x.calibrationMoves === 'number' ? Math.max(0, Math.floor(x.calibrationMoves)) : 0,
    scriptedMoveIndex: typeof x.scriptedMoveIndex === 'number' ? Math.max(0, Math.floor(x.scriptedMoveIndex)) : 0,
    sceneTendencies,
    duel,
  }
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Partial<SaveData> & {
      version?: number
      cosmetics?: Partial<CosmeticInventory>
    }
    if (typeof o.chapterIndex !== 'number' || typeof o.sceneIndex !== 'number') return null
    const base = defaultSave()
    const highest =
      typeof o.highestUnlockedChapter === 'number'
        ? o.highestUnlockedChapter
        : o.chapterIndex ?? 0
    const selectedSkin = normalizeSkin(o.cosmetics?.selectedPieceSkin)
    const unlockedSkins = Array.isArray(o.cosmetics?.unlockedPieceSkins)
      ? [...new Set(o.cosmetics!.unlockedPieceSkins.map(normalizeSkin))].slice(0, 16)
      : [...base.cosmetics.unlockedPieceSkins]
    if (!unlockedSkins.includes('classic-royal')) unlockedSkins.unshift('classic-royal')
    if (!unlockedSkins.includes(selectedSkin)) unlockedSkins.unshift(selectedSkin)

    return {
      ...base,
      chapterIndex: o.chapterIndex,
      sceneIndex: o.sceneIndex,
      highestUnlockedChapter: Math.max(0, Math.min(highest, 99)),
      lastScreen:
        o.lastScreen === 'chapters' ||
        o.lastScreen === 'play' ||
        o.lastScreen === 'title' ||
        o.lastScreen === 'world'
          ? o.lastScreen
          : 'chapters',
      chapter1Complete: Boolean(o.chapter1Complete),
      completedSceneIds: sanitizeStringArray(o.completedSceneIds, 1200),
      completedPuzzleIds: sanitizeStringArray(o.completedPuzzleIds, 600),
      stratarchiaUnlocked: Boolean(o.stratarchiaUnlocked),
      duelUnlockedOpponentIds: sanitizeStringArray(o.duelUnlockedOpponentIds, 120),
      unlockedDuelVariantIds: (() => {
        const ids = sanitizeStringArray(o.unlockedDuelVariantIds, 320)
        if (!ids.includes('alexion-mentor')) ids.unshift('alexion-mentor')
        return ids
      })(),
      codexUnlocks: sanitizeStringArray(o.codexUnlocks, 400),
      titleUnlocks: sanitizeStringArray(o.titleUnlocks, 200),
      chronicleEchoes: sanitizeStringArray(o.chronicleEchoes, 400),
      rankPoints: typeof o.rankPoints === 'number' ? Math.max(0, Math.floor(o.rankPoints)) : 0,
      cosmetics: {
        unlockedPieceSkins: unlockedSkins,
        selectedPieceSkin: selectedSkin,
      },
      tendencies: {
        flankPawnPushes:
          typeof o.tendencies?.flankPawnPushes === 'number'
            ? Math.max(0, Math.floor(o.tendencies.flankPawnPushes))
            : 0,
        earlyQueenMoves:
          typeof o.tendencies?.earlyQueenMoves === 'number'
            ? Math.max(0, Math.floor(o.tendencies.earlyQueenMoves))
            : 0,
        repeatedChecksWithoutGain:
          typeof o.tendencies?.repeatedChecksWithoutGain === 'number'
            ? Math.max(0, Math.floor(o.tendencies.repeatedChecksWithoutGain))
            : 0,
      },
      matchHistory: Array.isArray((o as { matchHistory?: unknown[] }).matchHistory)
        ? ((o as { matchHistory: unknown[] }).matchHistory.filter((e): e is MatchHistoryEntry => {
            if (!e || typeof e !== 'object') return false
            const x = e as Partial<MatchHistoryEntry>
            return (
              typeof x.id === 'string' &&
              typeof x.timestamp === 'number' &&
              (x.mode === 'match' || x.mode === 'duel') &&
              typeof x.sourceId === 'string' &&
              typeof x.opponentId === 'string' &&
              typeof x.opponentLabel === 'string' &&
              (x.outcome === 'win' || x.outcome === 'loss' || x.outcome === 'draw') &&
              typeof x.moves === 'number' &&
              (x.styleGrade === 'S' || x.styleGrade === 'A' || x.styleGrade === 'B' || x.styleGrade === 'C' || x.styleGrade === 'D') &&
              typeof x.turningPointSan === 'string' &&
              (x.replaySans === undefined || (Array.isArray(x.replaySans) && x.replaySans.every((s) => typeof s === 'string'))) &&
              (x.replayStartFen === undefined || typeof x.replayStartFen === 'string')
            )
          }).slice(-120))
        : [],
      rivalMemory: (() => {
        const rawRm = (o as { rivalMemory?: unknown }).rivalMemory
        if (!rawRm || typeof rawRm !== 'object') return {}
        const out: Record<string, RivalMemoryEntry> = {}
        for (const [k, v] of Object.entries(rawRm as Record<string, unknown>)) {
          if (!v || typeof v !== 'object') continue
          const x = v as Partial<RivalMemoryEntry>
          out[k] = {
            games: typeof x.games === 'number' ? Math.max(0, Math.floor(x.games)) : 0,
            wins: typeof x.wins === 'number' ? Math.max(0, Math.floor(x.wins)) : 0,
            losses: typeof x.losses === 'number' ? Math.max(0, Math.floor(x.losses)) : 0,
            draws: typeof x.draws === 'number' ? Math.max(0, Math.floor(x.draws)) : 0,
            avgMoves: typeof x.avgMoves === 'number' ? Math.max(0, x.avgMoves) : 0,
            punishedFlankPushes:
              typeof x.punishedFlankPushes === 'number'
                ? Math.max(0, Math.floor(x.punishedFlankPushes))
                : 0,
            punishedEarlyQueen:
              typeof x.punishedEarlyQueen === 'number'
                ? Math.max(0, Math.floor(x.punishedEarlyQueen))
                : 0,
            punishedCheckSpam:
              typeof x.punishedCheckSpam === 'number'
                ? Math.max(0, Math.floor(x.punishedCheckSpam))
                : 0,
          }
        }
        return out
      })(),
      inProgress: sanitizeInProgress((o as { inProgress?: unknown }).inProgress),
    }
  } catch {
    return null
  }
}

export function writeSave(data: SaveData) {
  const serialized = JSON.stringify(data)
  try {
    localStorage.setItem(KEY, serialized)
  } catch (e) {
    const quota =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.code === 22)
    if (quota) {
      try {
        const lean: SaveData = {
          ...data,
          matchHistory: data.matchHistory.slice(-32),
          rivalMemory:
            Object.keys(data.rivalMemory).length > 24
              ? Object.fromEntries(Object.entries(data.rivalMemory).slice(-24))
              : data.rivalMemory,
        }
        localStorage.setItem(KEY, JSON.stringify(lean))
      } catch {
        devWarn('writeSave: persist failed even after trimming history/rivalMemory')
      }
    }
    // Other persist failures (privacy mode, disabled storage) should not crash gameplay.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Ignore storage removal failures; callers expect best-effort semantics.
  }
}

export function hasSave(): boolean {
  return loadSave() !== null
}
