/* Campaign evaluator shard. Plays the real GameFlow (rules, rival
   personas, retries with loss memory, puzzles) with seeded bots and writes
   one JSON file per shard. eval/run.mjs orchestrates shards and scores.

   Env: EVAL_SEEDSET (tune|holdout), EVAL_SHARD (i/n), EVAL_OUT (dir),
        EVAL_SERIES (series per rival×bot), EVAL_ATTEMPTS (retries/series). */
import { describe, it, vi } from 'vitest'
import { writeFileSync, mkdirSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Square, PieceSymbol } from 'chess.js'

vi.mock('../src/app/storage', () => ({
  loadSave: () => null,
  writeSave: vi.fn(() => true),
  clearSave: vi.fn(),
  hasSave: () => false,
}))

import { GameFlow } from '../src/app/gameFlow'
import type { ChessUiPayload } from '../src/app/gameFlow'
import { PLAYABLE_CHAPTERS } from '../src/data/chapters'
import type { MatchScene, PuzzleScene } from '../src/types'
import { BOTS, botMove, goalMove } from './bots'
import type { BotId } from './bots'
import { installVirtualClock, seedRandom, wallClockMs } from './determinism'

const SEEDSET = process.env.EVAL_SEEDSET ?? 'tune'
const [SHARD_I, SHARD_N] = (process.env.EVAL_SHARD ?? '0/1').split('/').map(Number) as [number, number]
const OUT = process.env.EVAL_OUT ?? 'eval/out'
const SERIES = Number(process.env.EVAL_SERIES ?? 2)
const ATTEMPTS = Number(process.env.EVAL_ATTEMPTS ?? 3)
const PLY_CAP = Number(process.env.EVAL_PLY_CAP ?? 300)
const ONLY = process.env.EVAL_ONLY ?? ''
const ONLY_BOTS = (process.env.EVAL_BOTS ?? '').split(',').filter(Boolean) as BotId[]

type Job =
  | { kind: 'match'; ch: number; sc: number; id: string; bot: BotId; series: number }
  | { kind: 'puzzle'; ch: number; sc: number; id: string; bot: BotId; series: number }
  | { kind: 'pacing' }

function buildJobs(): Job[] {
  const jobs: Job[] = [{ kind: 'pacing' }]
  const bots = ONLY_BOTS.length ? ONLY_BOTS : BOTS
  PLAYABLE_CHAPTERS.forEach((chapter, ch) => {
    chapter.scenes.forEach((scene, sc) => {
      if (ONLY && !scene.id.includes(ONLY)) return
      for (const bot of bots) {
        for (let series = 0; series < SERIES; series++) {
          if (scene.type === 'match') jobs.push({ kind: 'match', ch, sc, id: scene.id, bot, series })
          if (scene.type === 'puzzle') jobs.push({ kind: 'puzzle', ch, sc, id: scene.id, bot, series })
        }
      }
    })
  })
  return jobs
}

function mockBoard() {
  const noop = () => {}
  return {
    draw: noop,
    setInteraction: noop,
    setOrientation: noop,
    setCheckSquare: noop,
    setSkin: noop,
    showLegalFrom: noop,
    clearSelection: noop,
    setSelection: noop,
  }
}

type Internals = {
  aiThinking: boolean
  evalTrace: number[]
  sanLog: string[]
  sanQuality: (string | null)[]
}

function makeFlow(): { flow: GameFlow; last: () => ChessUiPayload | null } {
  let latest: ChessUiPayload | null = null
  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: () => {},
    onChessUpdate: (p) => {
      latest = p
    },
    onChapterComplete: () => {},
    onCampaignFinished: () => {},
  })
  ;(flow as unknown as { board: unknown }).board = mockBoard()
  return { flow, last: () => latest }
}

async function settleAi(flow: GameFlow, playerColor: 'w' | 'b'): Promise<number> {
  const internals = flow as unknown as Internals
  const v0 = performance.now()
  for (let guard = 0; guard < 40; guard++) {
    if (flow.chess.turn() === playerColor && !internals.aiThinking) break
    if (!internals.aiThinking && (flow as unknown as { computeMatchOutcome(): unknown }).computeMatchOutcome()) break
    if (flow.chess.moves().length === 0 && !internals.aiThinking) break
    await vi.advanceTimersByTimeAsync(700)
  }
  return performance.now() - v0
}

export type GameRecord = {
  outcome: 'win' | 'loss' | 'draw' | 'unfinished'
  plies: number
  /** Player-POV UI evals after each ply (centipawns, clipped ±1200). */
  minEval: number
  maxEval: number
  blunders: number
  mistakes: number
  aiWaitVirtualMs: number[]
  inputLatencyRealMs: number[]
  costliest: string | null
}

async function playGame(
  flow: GameFlow,
  last: () => ChessUiPayload | null,
  bot: BotId,
  playerColor: 'w' | 'b',
  goal: 'match' | 'puzzle',
  maxPlayerMoves: number,
  puzzleGoal: ((after: Chess) => boolean) | null = null,
): Promise<GameRecord> {
  const internals = flow as unknown as Internals
  const aiWait: number[] = []
  const latency: number[] = []
  let playerMoves = 0
  if (flow.chess.turn() !== playerColor) aiWait.push(await settleAi(flow, playerColor))
  for (let guard = 0; guard < PLY_CAP; guard++) {
    const payload = last()
    if (goal === 'match' && payload?.matchOutcome) break
    if (goal === 'puzzle' && flow.canAdvance()) break
    if (flow.chess.moves().length === 0) break /* mate/stalemate: GameFlow decides the result */
    if (playerMoves >= maxPlayerMoves) break
    if (flow.chess.turn() !== playerColor) {
      aiWait.push(await settleAi(flow, playerColor))
      if (flow.chess.turn() !== playerColor) break
      continue
    }
    const probe = new Chess(flow.chess.fen())
    const historyFens = flow.chess.history({ verbose: true }).slice(-17).map((m) => m.before)
    const move = (goal === 'puzzle' && puzzleGoal ? goalMove(probe, puzzleGoal) : null) ?? botMove(bot, probe, historyFens)
    if (!move) break
    const t0 = wallClockMs()
    const before = internals.sanLog.length
    flow.tryPlayerMove(move.from as Square, move.to as Square, move.promotion as PieceSymbol | undefined)
    latency.push(wallClockMs() - t0)
    if (internals.sanLog.length === before) break /* rejected: should never happen */
    playerMoves++
    if (internals.sanLog.length >= PLY_CAP) break
  }
  const payload = last()
  const sign = playerColor === 'w' ? 1 : -1
  const trace = internals.evalTrace.map((v) => v * sign)
  const outcome: GameRecord['outcome'] =
    goal === 'puzzle'
      ? flow.canAdvance()
        ? 'win'
        : 'unfinished'
      : (payload?.matchOutcome ?? 'unfinished')
  const quality = internals.sanQuality
  return {
    outcome,
    plies: internals.sanLog.length,
    minEval: trace.length ? Math.min(...trace) : 0,
    maxEval: trace.length ? Math.max(...trace) : 0,
    blunders: quality.filter((q) => q === 'blunder').length,
    mistakes: quality.filter((q) => q === 'mistake').length,
    aiWaitVirtualMs: aiWait,
    inputLatencyRealMs: latency,
    costliest: (flow as unknown as { lastCostliestLine: string | null }).lastCostliestLine ?? null,
  }
}

async function runSeries(job: Extract<Job, { kind: 'match' | 'puzzle' }>) {
  seedRandom(`${SEEDSET}:${job.id}:${job.bot}:${job.series}`)
  installVirtualClock()
  const { flow, last } = makeFlow()
  flow.highestUnlockedChapter = job.ch
  flow.jumpToScene(job.ch, job.sc)
  const scene = flow.currentScene() as MatchScene | PuzzleScene
  const games: GameRecord[] = []
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const rec = await playGame(
      flow,
      last,
      job.bot,
      scene.playerColor,
      job.kind,
      job.kind === 'puzzle' ? 12 : 999,
      scene.type === 'puzzle' ? readableGoal(scene) : null,
    )
    games.push(rec)
    if (rec.outcome === 'win') break
    if (!flow.retryCurrentBattle()) flow.resetChessScene()
    await settleAi(flow, scene.playerColor)
  }
  return { ...job, games }
}

/** The part of a puzzle goal a player can act on from the instructions
    alone: "castle", "put the bishop on g2", "mate in one". Material-gain
    goals need calculation, so the bots get no shortcut there. */
function readableGoal(scene: PuzzleScene): ((after: Chess) => boolean) | null {
  const g = scene.goal
  if (g.kind === 'mate') return (after) => after.isCheckmate()
  if (g.kind === 'pieceOn') {
    return (after) => {
      const piece = after.get(g.square)
      return Boolean(piece && piece.color === g.color && piece.type === g.pieceType)
    }
  }
  return null
}

/** Scripted first-session walkthrough: presses Next from a fresh save. */
function runPacing() {
  seedRandom(`${SEEDSET}:pacing`)
  installVirtualClock()
  const { flow } = makeFlow()
  let presses = 0
  let words = 0
  const boardKinds = new Set(['puzzle', 'match', 'calibration', 'freeplay'])
  let firstBoard: string | null = null
  let firstRival: string | null = null
  let pressesToRival = 0
  for (let guard = 0; guard < 200; guard++) {
    const scene = flow.currentScene()
    if (!firstBoard && boardKinds.has(scene.type)) firstBoard = `${scene.type}:${scene.id}@${presses}`
    if (scene.type === 'match') {
      firstRival = scene.id
      pressesToRival = presses
      break
    }
    if (scene.type === 'dialogue') words += scene.lines.reduce((n, l) => n + l.text.split(/\s+/).length, 0)
    if (scene.type === 'interlude') words += scene.lines.reduce((n, l) => n + l.split(/\s+/).length, 0)
    if (scene.type === 'codex') words += scene.entries.reduce((n, e) => n + e.body.split(/\s+/).length, 0)
    if (scene.storyBeat) words += scene.storyBeat.body.split(/\s+/).length
    /* Board scenes: the walkthrough is about reading load, so skip them as
       if solved (the puzzle bots measure solving separately). */
    flow.advanceScene()
    presses++
  }
  return { kind: 'pacing', firstBoard, firstRival, pressesToRival, wordsBeforeFirstRival: words }
}

describe('campaign evaluator', () => {
  it(`shard ${SHARD_I}/${SHARD_N} (${SEEDSET})`, async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'requestAnimationFrame', 'cancelAnimationFrame'],
    })
    const jobs = buildJobs().filter((_, i) => i % SHARD_N === SHARD_I)
    const results: unknown[] = []
    for (const job of jobs) {
      const t0 = wallClockMs()
      const res = job.kind === 'pacing' ? runPacing() : await runSeries(job)
      results.push(res)
      if (job.kind !== 'pacing') {
        const r = res as Awaited<ReturnType<typeof runSeries>>
        process.stdout.write(
          `[eval ${SHARD_I}] ${job.id} ${job.bot}#${job.series}: ${r.games.map((g) => `${g.outcome[0]}${g.plies}`).join(' ')} (${((wallClockMs() - t0) / 1000).toFixed(1)}s)\n`,
        )
      }
    }
    mkdirSync(OUT, { recursive: true })
    writeFileSync(`${OUT}/shard-${SHARD_I}.json`, JSON.stringify(results))
    vi.useRealTimers()
  })
})
