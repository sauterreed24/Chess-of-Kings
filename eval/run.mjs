#!/usr/bin/env node
/* Evaluator entry point: `npm run eval [-- --seedset holdout] [--quick]`.
   Runs campaign.eval.ts in parallel shards, aggregates, prints the
   scorecard, and writes eval/results/<seedset>.json.
   `--compare a.json b.json` prints a side-by-side of two result files. */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { cpus } from 'node:os'
import { scoreRun, formatScorecard, compareRuns } from './score.mjs'

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
const runShard = (i) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['vitest', 'run', '--config', 'eval/vitest.config.ts', '--reporter=dot'],
      { env: { ...env, EVAL_SHARD: `${i}/${shards}` }, stdio: ['ignore', 'pipe', 'inherit'] },
    )
    child.stdout.on('data', (d) => {
      if (process.env.EVAL_VERBOSE) process.stdout.write(d)
    })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`shard ${i} exited ${code}`))))
  })

await Promise.all(Array.from({ length: shards }, (_, i) => runShard(i)))

const records = []
for (let i = 0; i < shards; i++) {
  const file = `${outDir}/shard-${i}.json`
  if (!existsSync(file)) throw new Error(`missing ${file}`)
  records.push(...JSON.parse(readFileSync(file, 'utf8')))
}
const scorecard = scoreRun(records)
mkdirSync('eval/results', { recursive: true })
const resultFile = `eval/results/${label}.json`
writeFileSync(
  resultFile,
  JSON.stringify({ seedset, series: env.EVAL_SERIES, attempts: env.EVAL_ATTEMPTS, scorecard, records }, null, 1),
)
console.log(formatScorecard(scorecard))
console.log(`\nwrote ${resultFile} in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
