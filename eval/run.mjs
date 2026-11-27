#!/usr/bin/env node
/* Evaluator entry point: `npm run eval [-- --seedset holdout] [--quick]`.
   Runs campaign.eval.ts in parallel shards, aggregates, prints the
   scorecard, and writes eval/results/<seedset>.json.
   `--compare a.json b.json` prints a side-by-side of two result files.
   `--label x --recap-only` re-runs only the C10 recap replay on saved records. */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { cpus } from 'node:os'
import { scoreRun, scoreRecap, scoreLedger, formatScorecard, compareRuns } from './score.mjs'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}

if (args[0] === '--compare') {
  const a = JSON.parse(readFileSync(args[1], 'utf8'))
  const b = JSON.parse(readFileSync(args[2], 'utf8'))
  console.log(compareRuns(a.scorecard, b.scorecard))
  process.exit(0)
}

const seedset = flag('seedset', 'tune')
const quick = args.includes('--quick')
const shards = Number(flag('shards', Math.max(1, Math.min(4, cpus().length))))
const outDir = `eval/out/${seedset}`
const label = flag('label', seedset)
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const env = {
  ...process.env,
  EVAL_SEEDSET: seedset,
  EVAL_OUT: outDir,
  EVAL_SERIES: quick ? '1' : (process.env.EVAL_SERIES ?? '2'),
  EVAL_ATTEMPTS: process.env.EVAL_ATTEMPTS ?? '3',
}

const t0 = Date.now()
const runShard = (i, file = 'eval/campaign.eval.ts', extraEnv = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['vitest', 'run', '--config', 'eval/vitest.config.ts', '--reporter=dot', file],
      { env: { ...env, ...extraEnv, EVAL_SHARD: `${i}/${shards}` }, stdio: ['ignore', 'pipe', 'inherit'] },
    )
    child.stdout.on('data', (d) => {
      if (process.env.EVAL_VERBOSE) process.stdout.write(d)
    })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`shard ${i} exited ${code}`))))
  })

/* `--recap-only`: reuse eval/out/<label>-records.json and only (re)run the C10 replay. */
const recapOnly = args.includes('--recap-only')
const recordsFile = `eval/out/${label}-records.json`
let records
let meta = { seedset, series: env.EVAL_SERIES, attempts: env.EVAL_ATTEMPTS, trials: process.env.EVAL_TRY ?? '' }
if (recapOnly) {
  ;({ records, ...meta } = JSON.parse(readFileSync(recordsFile, 'utf8')))
} else {
  await Promise.all(Array.from({ length: shards }, (_, i) => runShard(i)))
  records = []
  for (let i = 0; i < shards; i++) {
    const file = `${outDir}/shard-${i}.json`
    if (!existsSync(file)) throw new Error(`missing ${file}`)
    records.push(...JSON.parse(readFileSync(file, 'utf8')))
  }
  /* Full game records stay in eval/out (gitignored); the compact scorecard is committed. */
  writeFileSync(recordsFile, JSON.stringify({ ...meta, records }))
}

/* C10 recap truth: replay a fixed sample of novice/club losses with a deeper engine. */
const recapSample = process.env.EVAL_RECAP_SAMPLE ?? (quick ? '16' : '48')
await Promise.all(
  Array.from({ length: shards }, (_, i) =>
    runShard(i, 'eval/recapTruth.eval.ts', { EVAL_RECORDS: recordsFile, EVAL_RECAP_SAMPLE: recapSample }),
  ),
)
const recap = []
for (let i = 0; i < shards; i++) recap.push(...JSON.parse(readFileSync(`${outDir}/recap-${i}.json`, 'utf8')))
writeFileSync(`eval/out/${label}-recap.json`, JSON.stringify(recap))

const scorecard = scoreRun(records)
scorecard.checks.recapTruth = scoreRecap(recap)
scorecard.checks.ledger = scoreLedger(recap)
mkdirSync('eval/results', { recursive: true })
const resultFile = `eval/results/${label}.json`
writeFileSync(resultFile, JSON.stringify({ ...meta, scorecard }, null, 1))
console.log(formatScorecard(scorecard))
console.log(`\nwrote ${resultFile} in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
