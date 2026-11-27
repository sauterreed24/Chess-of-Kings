/* Readability check (C10): does the post-game "Study this" lesson name a
   move that really cost the player, judged by a deeper engine than the
   game's 12 ms eval probe?

   Reads the campaign records written by campaign.eval.ts, replays a fixed,
   deterministic sample of novice/club losses, deep-evaluates every
   position (fixed node budget, fresh table — no clock involved), and
   writes one JSON file per shard. eval/run.mjs aggregates.

   Env: EVAL_RECORDS (records json), EVAL_SHARD (i/n), EVAL_OUT (dir),
        EVAL_RECAP_SAMPLE (games, default 48), EVAL_RECAP_NODES (default 30000). */
import { describe, it } from 'vitest'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { Chess } from 'chess.js'
import { searchFen } from '../src/chess/engine'

const RECORDS = process.env.EVAL_RECORDS ?? ''
const [SHARD_I, SHARD_N] = (process.env.EVAL_SHARD ?? '0/1').split('/').map(Number) as [number, number]
const OUT = process.env.EVAL_OUT ?? 'eval/out'
const SAMPLE = Number(process.env.EVAL_RECAP_SAMPLE ?? 48)
const NODES = Number(process.env.EVAL_RECAP_NODES ?? 30_000)
const CLIP = 1200

type Game = { outcome: string; costliest: string | null; startFen: string; sans: string[]; marks?: (string | null)[] }
type Series = { kind: string; id: string; bot: string; series: number; games: Game[] }

/** "37." -> ply 72, "5..." -> ply 9 (inverse of plyMoveLabel). */
export function plyFromLabel(line: string): number | null {
  const m = /^(\d+)(\.\.\.|\.)\s/.exec(line)
  if (!m) return null
  const moveNo = Number(m[1])
  return (moveNo - 1) * 2 + (m[2] === '...' ? 1 : 0)
}

/** Side-to-move eval, clipped; mate and stalemate read from the board. */
function deepEval(fen: string): number {
  const probe = new Chess(fen)
  if (probe.isCheckmate()) return -CLIP
  if (probe.isStalemate() || probe.isInsufficientMaterial()) return 0
  const r = searchFen(fen, { maxDepth: 64, targetNodes: NODES, freshTable: true })
  return Math.max(-CLIP, Math.min(CLIP, r.score))
}

function sample(records: Series[]): Array<{ key: string; game: Game }> {
  const pool: Array<{ key: string; game: Game }> = []
  for (const s of records) {
    if (s.kind !== 'match' || (s.bot !== 'novice' && s.bot !== 'club')) continue
    s.games.forEach((game, attempt) => {
      if (game.outcome === 'loss' && game.startFen && game.sans?.length) {
        pool.push({ key: `${s.id}:${s.bot}#${s.series}.${attempt}`, game })
      }
    })
  }
  pool.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
  if (pool.length <= SAMPLE) return pool
  const step = pool.length / SAMPLE
  return Array.from({ length: SAMPLE }, (_, i) => pool[Math.floor(i * step)]!)
}

describe('recap truth', () => {
  it(`shard ${SHARD_I}/${SHARD_N}`, () => {
    const { records } = JSON.parse(readFileSync(RECORDS, 'utf8')) as { records: Series[] }
    const picked = sample(records).filter((_, i) => i % SHARD_N === SHARD_I)
    const out: unknown[] = []
    for (const { key, game } of picked) {
      const chess = new Chess(game.startFen)
      const fens = [chess.fen()]
      for (const san of game.sans) {
        chess.move(san)
        fens.push(chess.fen())
      }
      /* The player moves at ply i when the side to move in fens[i] is theirs.
         A loss means the last mover won, so the player is the other side. */
      const playerColor = chess.turn()
      const evals = fens.map((f) => deepEval(f))
      const drops: Array<{ ply: number; drop: number }> = []
      for (let i = 0; i < game.sans.length; i++) {
        if (new Chess(fens[i]!).turn() !== playerColor) continue
        /* before: player to move (their POV); after: rival to move (negate). */
        drops.push({ ply: i, drop: evals[i]! - -evals[i + 1]! })
      }
      /* C11: the ledger marks on the same plies (positions not already decided). */
      const ledger = { blunder: 0, blunderTrue: 0, mistake: 0, mistakeTrue: 0, big: 0, bigMarked: 0, quiet: 0, quietMarked: 0 }
      if (game.marks && game.marks.length === game.sans.length) {
        for (const d of drops) {
          if (Math.abs(evals[d.ply]!) >= 900) continue
          const mark = game.marks[d.ply]
          const flagged = mark === 'blunder' || mark === 'mistake'
          if (mark === 'blunder') { ledger.blunder++; if (d.drop >= 150) ledger.blunderTrue++ }
          if (mark === 'mistake') { ledger.mistake++; if (d.drop >= 60) ledger.mistakeTrue++ }
          if (d.drop >= 300) { ledger.big++; if (flagged) ledger.bigMarked++ }
          if (d.drop <= 20) { ledger.quiet++; if (flagged) ledger.quietMarked++ }
        }
      }
      const worst = drops.reduce((a, b) => (b.drop > a.drop ? b : a), { ply: -1, drop: -Infinity })
      const namedPly = game.costliest ? plyFromLabel(game.costliest) : null
      const named = namedPly === null ? null : (drops.find((d) => d.ply === namedPly) ?? null)
      out.push({
        key,
        lesson: game.costliest,
        namedPly,
        namedDrop: named ? Math.round(named.drop) : null,
        worstPly: worst.ply,
        worstDrop: Math.round(worst.drop),
        ledger,
      })
      process.stdout.write(`[recap ${SHARD_I}] ${key}: named ${named?.drop.toFixed(0) ?? '-'} worst ${worst.drop.toFixed(0)}\n`)
    }
    mkdirSync(OUT, { recursive: true })
    writeFileSync(`${OUT}/recap-${SHARD_I}.json`, JSON.stringify(out))
  })
})
