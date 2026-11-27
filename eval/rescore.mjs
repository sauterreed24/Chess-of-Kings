#!/usr/bin/env node
/* Re-score saved game records after a check is corrected, without
   replaying games: node eval/rescore.mjs <label> [newLabel] */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { scoreRun, scoreRecap, scoreLedger, formatScorecard } from './score.mjs'

const [label, out = label] = process.argv.slice(2)
if (!label) throw new Error('usage: node eval/rescore.mjs <label> [newLabel]')
const { records, ...meta } = JSON.parse(readFileSync(`eval/out/${label}-records.json`, 'utf8'))
const scorecard = scoreRun(records)
const recapFile = `eval/out/${label}-recap.json`
if (existsSync(recapFile)) {
  const rows = JSON.parse(readFileSync(recapFile, 'utf8'))
  scorecard.checks.recapTruth = scoreRecap(rows)
  scorecard.checks.ledger = scoreLedger(rows)
}
writeFileSync(`eval/results/${out}.json`, JSON.stringify({ ...meta, scorecard }, null, 1))
console.log(formatScorecard(scorecard))
