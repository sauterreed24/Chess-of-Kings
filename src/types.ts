import type { PieceSymbol, Square } from 'chess.js'
import type { AIStyle } from './chess/evaluate'

export type Speaker = 'reed' | 'alexion' | 'narrator' | 'scholar' | 'system' | string

export interface DialogueLine {
  speaker: Speaker
  text: string
}

export type PuzzleGoal =
  | { kind: 'mate' }
  | { kind: 'advantage'; minCp: number }
  | { kind: 'pieceOn'; square: Square; color: 'w' | 'b'; pieceType: PieceSymbol }

export interface TeachingLayer {
  threat: string
  goalPlain: string
  whyItWorks: string
  concept: string
}

export interface StoryBeat {
  label: string
  title: string
  body: string
  tone?: 'quiet' | 'pressure' | 'fire'
}

export interface PuzzleScene {
  type: 'puzzle'
  id: string
  title: string
  fen: string
  playerColor: 'w' | 'b'
  goal: PuzzleGoal
  lesson: string
  hint?: string
  teaching?: TeachingLayer
  storyBeat?: StoryBeat
  /** When your move leaves the opponent to play, they reply with the engine (default depth 2). Ramp up through the story. */
  opponentAiDepth?: number
  opponentAiStyle?: AIStyle
}

export type LadderTier =
  | 'initiate'
  | 'apprentice'
  | 'scholar'
  | 'mini-boss'
  | 'veteran'
  | 'boss'
  | 'counterpart'

export interface MatchScene {
  type: 'match'
  id: string
  title: string
  opponentName: string
  opponentNote: string
  fen?: string
  playerColor: 'w' | 'b'
  aiDepth: number
  aiStyle:
    | 'development'
    | 'romantic'
    | 'classical'
    | 'hypermodern'
    | 'soviet'
    | 'engine'
    | 'universal'
    | 'alexandrine'
    | 'apotheosis'
    | 'random'
  /** If set, black tries these SAN moves in order; falls back to engine when illegal. */
  scriptedBlackSans?: string[]
  timeControlLabel?: string
  /** Visual tier for the ladder UI */
  ladderTier?: LadderTier
  /** 1 (easy) – 5 (expert) for difficulty display */
  difficulty?: 1 | 2 | 3 | 4 | 5
  storyBeat?: StoryBeat
}

export interface CalibrationScene {
  type: 'calibration'
  id: string
  title: string
  lesson: string
  teaching?: TeachingLayer
  storyBeat?: StoryBeat
  /** Number of moves the human must complete (their color only). */
  minMovesByPlayer: number
}

export interface FreeplayScene {
  type: 'freeplay'
  id: string
  title: string
  lesson: string
  fen?: string
  teaching?: TeachingLayer
  storyBeat?: StoryBeat
}

export interface CodexScene {
  type: 'codex'
  id: string
  heading: string
  entries: { term: string; body: string }[]
  storyBeat?: StoryBeat
}

export interface DialogueScene {
  type: 'dialogue'
  id: string
  lines: DialogueLine[]
  storyBeat?: StoryBeat
}

export interface InterludeScene {
  type: 'interlude'
  id: string
  lines: string[]
  storyBeat?: StoryBeat
}

export type Scene =
  | DialogueScene
  | InterludeScene
  | PuzzleScene
  | MatchScene
  | CalibrationScene
  | FreeplayScene
  | CodexScene

export interface Chapter {
  id: string
  index: number
  title: string
  subtitle: string
  era: string
  themeClass: string
  philosophy: string
  scenes: Scene[]
}

export interface RoadmapChapter {
  id: string
  listTitle: string
  subtitle: string
  era: string
  teaser: string
}

export type PieceSkinId =
  | 'classic-royal'
  | 'high-contrast'
  | 'alexandrine-ornate'
  | 'obsidian-neon'

export interface CosmeticInventory {
  unlockedPieceSkins: PieceSkinId[]
  selectedPieceSkin: PieceSkinId
}

export type RewardKind = 'skin' | 'codex' | 'title' | 'duel-variant' | 'chronicle'

export interface RewardDefinition {
  id: string
  kind: RewardKind
  label: string
  description: string
  skinId?: PieceSkinId
  codexId?: string
  titleId?: string
  duelVariantId?: string
}

export interface RewardBundle {
  sourceId: string
  sourceLabel: string
  rewards: RewardDefinition[]
}

export interface PlayerTendencyProfile {
  flankPawnPushes: number
  earlyQueenMoves: number
  repeatedChecksWithoutGain: number
}

export interface RivalMemoryEntry {
  games: number
  wins: number
  losses: number
  draws: number
  avgMoves: number
  punishedFlankPushes: number
  punishedEarlyQueen: number
  punishedCheckSpam: number
  /** Elo-ish archive calibration for this rival (1200–2200). */
  calibrationRating: number
}

/**
 * Persistent ladder rating ("Stratarch Rating"). Evolves via an Elo-style
 * update after every rated match / duel. `peak` is the all-time high;
 * `rated` counts rating-affecting games and drives the provisional K-factor.
 */
export interface LadderRating {
  rating: number
  peak: number
  rated: number
}

export type GamePhase = 'opening' | 'middlegame' | 'endgame'

export interface AIWeights {
  tactical: number
  positional: number
  sacrificial: number
  prophylactic: number
}

export interface AIMotifBias {
  fork: number
  pin: number
  skewer: number
  kingHunt: number
}

export interface AiProfile {
  id: string
  label: string
  style: AIStyle
  searchDepth: number
  thinkTimeMs: number
  blunderRate: number
  riskAppetite: number
  tacticalAlertness: number
  openingDiscipline: number
  kingSafetyUrgency: number
  conversionStrictness: number
  conversionPersona: 'technical' | 'tactical' | 'universal'
  weights: AIWeights
  motifBias: AIMotifBias
}

export interface MatchHistoryEntry {
  id: string
  timestamp: number
  mode: 'match' | 'duel'
  sourceId: string
  opponentId: string
  opponentLabel: string
  variantId?: string
  outcome: 'win' | 'loss' | 'draw'
  moves: number
  styleGrade: 'S' | 'A' | 'B' | 'C' | 'D'
  turningPointSan: string
  replaySans?: string[]
  replayStartFen?: string
}

export type SavedMoveQuality =
  | 'brilliant'
  | 'good'
  | 'ok'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | null

export interface InProgressDuelSnapshot {
  opponentId: string
  variantId: string
  difficulty: 'novice' | 'balanced' | 'relentless'
  playerColor: 'w' | 'b'
  /** Opening / reset FEN for this duel (`duelSession.fen`). Board position lives on `InProgressSnapshot.fen`. */
  startFen: string
}

export interface InProgressSnapshot {
  mode: 'puzzle' | 'match' | 'calibration' | 'freeplay' | 'duel'
  chapterIndex: number
  sceneIndex: number
  fen: string
  history: string[]
  sanLog: string[]
  sanQuality: SavedMoveQuality[]
  playerColor: 'w' | 'b'
  calibrationMoves: number
  scriptedMoveIndex: number
  sceneTendencies: PlayerTendencyProfile
  duel?: InProgressDuelSnapshot
}

export interface DuelVariant {
  id: string
  label: string
  bio: string
  minChapterUnlock: number
  profileId: string
  fen?: string
  scriptedSans?: string[]
}

export interface DuelRosterEntry {
  opponentId: string
  opponentName: string
  era: string
  styleTags: string[]
  strengths: string
  weaknesses: string
  quote: string
  unlockedBySceneId?: string
  variants: DuelVariant[]
}
