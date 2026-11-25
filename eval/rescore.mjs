#!/usr/bin/env node
/* Re-score saved game records after a check is corrected, without
   replaying games: node eval/rescore.mjs <label> [newLabel] */
import { readFileSync, writeFileSync } from 'node:fs'
import { scoreRun, formatScorecard } from './score.mjs'

const [label, out = label] = process.argv.slice(2)
if (!label) throw new Error('usage: node eval/rescore.mjs <label> [newLabel]')
const { records, ...meta } = JSON.parse(readFileSync(`eval/out/${label}-records.json`, 'utf8'))
const scorecard = scoreRun(records)
writeFileSync(`eval/results/${out}.json`, JSON.stringify({ ...meta, scorecard }, null, 1))
console.log(formatScorecard(scorecard))
