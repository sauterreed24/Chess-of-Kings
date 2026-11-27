/* Scorecard math. Pure functions over the shard records so result files
   can be re-scored when a check is corrected (node eval/rescore.mjs). */

const FINALE = 'c9-match-bram'

const pts = (o) => (o === 'win' ? 1 : o === 'draw' ? 0.5 : 0)
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)
const pct = (xs, p) => {
  if (!xs.length) return NaN
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]
}
const round = (x, d = 2) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : x)

function spearman(xs, ys) {
  const rank = (v) => {
    const idx = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0])
    const r = new Array(v.length)
    for (let i = 0; i < idx.length; ) {
      let j = i
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++
      for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2
      i = j + 1
    }
    return r
  }
  const rx = rank(xs)
  const ry = rank(ys)
  const mx = mean(rx)
  const my = mean(ry)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return num / Math.sqrt(dx * dy)
}

export function scoreRun(records) {
  const matches = new Map()
  const puzzles = new Map()
  let pacing = null
  for (const r of records) {
    if (r.kind === 'pacing') {
      pacing = r
      continue
    }
    const bucket = r.kind === 'match' ? matches : puzzles
    if (!bucket.has(r.id)) bucket.set(r.id, { id: r.id, order: r.ch * 100 + r.sc, bots: {} })
    const entry = bucket.get(r.id)
    ;(entry.bots[r.bot] ??= []).push(r.games)
  }

  const perMatch = [...matches.values()]
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const out = { id: m.id, order: m.order }
      for (const [bot, seriesList] of Object.entries(m.bots)) {
        out[bot] = {
          first: round(mean(seriesList.map((g) => pts(g[0].outcome)))),
          clear: round(mean(seriesList.map((g) => (g.some((x) => x.outcome === 'win') ? 1 : 0)))),
          tries: round(mean(seriesList.map((g) => g.findIndex((x) => x.outcome === 'win') + 1 || g.length + 1)), 1),
        }
      }
      return out
    })

  const allGames = [...matches.values()].flatMap((m) =>
    Object.entries(m.bots).flatMap(([bot, s]) => s.flat().map((g) => ({ ...g, bot, id: m.id }))),
  )

  /* C1 walls: matches before the finale the club bot clears in < half its series. */
  const walls = perMatch.filter((m) => m.id !== FINALE && m.club && m.club.clear < 0.5).map((m) => m.id)

  /* C2 skill gap on first attempts. */
  const gaps = perMatch.filter((m) => m.skilled && m.novice).map((m) => m.skilled.first - m.novice.first)

  /* C3 ramp: campaign order vs difficulty (1 - mean first-attempt score of all bots). */
  const diff = perMatch.map((m) => 1 - mean(['novice', 'club', 'skilled'].filter((b) => m[b]).map((b) => m[b].first)))
  const ramp = perMatch.length > 2 ? spearman(perMatch.map((m) => m.order), diff) : NaN

  /* C4 tension: decisive club/skilled games where the eventual winner trailed by >= 1.5 pawns. */
  const decisive = allGames.filter((g) => g.bot !== 'novice' && (g.outcome === 'win' || g.outcome === 'loss'))
  const comebacks = decisive.filter((g) => (g.outcome === 'win' ? g.minEval <= -150 : g.maxEval >= 150))

  /* C5 stuck games: no result inside the ply cap. */
  const unfinished = allGames.filter((g) => g.outcome === 'unfinished')

  /* C6 puzzles. */
  const perPuzzle = [...puzzles.values()]
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const out = { id: p.id }
      for (const [bot, seriesList] of Object.entries(p.bots)) {
        out[bot] = {
          first: round(mean(seriesList.map((g) => pts(g[0].outcome)))),
          clear: round(mean(seriesList.map((g) => (g.some((x) => x.outcome === 'win') ? 1 : 0)))),
        }
      }
      return out
    })
  const brokenPuzzles = perPuzzle.filter((p) => p.skilled && p.skilled.clear < 1).map((p) => p.id)

  /* C7 pacing. */
  const clubPlies = allGames.filter((g) => g.bot === 'club' && g.outcome !== 'unfinished').map((g) => g.plies)

  /* C8 responsiveness (virtual ms on the reference device). */
  const waits = allGames.flatMap((g) => g.aiWaitVirtualMs)
  const latency = allGames.flatMap((g) => g.inputLatencyRealMs)

  return {
    checks: {
      walls: { value: walls.length, target: '0', list: walls },
      skillGap: { value: round(mean(gaps)), min: round(Math.min(...gaps)), target: '>= 0.50' },
      ramp: { value: round(ramp), target: '>= 0.50' },
      comebackRate: { value: round(comebacks.length / Math.max(1, decisive.length)), n: decisive.length, target: '0.20-0.50' },
      unfinishedRate: { value: round(unfinished.length / Math.max(1, allGames.length), 3), n: unfinished.length, of: allGames.length, target: '0' },
      puzzles: {
        skilledClear: round(mean(perPuzzle.map((p) => p.skilled?.clear ?? NaN))),
        clubClear: round(mean(perPuzzle.map((p) => p.club?.clear ?? NaN))),
        noviceClear: round(mean(perPuzzle.map((p) => p.novice?.clear ?? NaN))),
        broken: brokenPuzzles,
        target: 'skilled 1.00, club >= 0.80',
      },
      pacing: {
        pressesToFirstRival: pacing?.pressesToRival,
        wordsBeforeFirstRival: pacing?.wordsBeforeFirstRival,
        clubMedianPlies: pct(clubPlies, 50),
        clubP90Plies: pct(clubPlies, 90),
        target: 'median club match 40-140 plies',
      },
      responsiveness: {
        aiWaitP50: round(pct(waits, 50), 0),
        aiWaitP95: round(pct(waits, 95), 0),
        aiWaitMax: round(Math.max(...waits), 0),
        inputLatencyRealP95: round(pct(latency, 95), 1),
        target: 'aiWait p95 <= 2000 virtual ms',
      },
    },
    perMatch,
    perPuzzle,
  }
}

/* C10 recap truth over rows from recapTruth.eval.ts (deep-engine drops, player POV cp).
   accurate: the lesson names a move that truly cost >= 1 pawn.
   top: it names the game's truly costliest move (within 1 pawn of it).
   missed: no lesson although some move truly cost >= 3 pawns. */
export function scoreRecap(rows) {
  const shown = rows.filter((r) => r.lesson)
  const accurate = shown.filter((r) => r.namedDrop !== null && r.namedDrop >= 100)
  const top = shown.filter((r) => r.namedDrop !== null && r.namedDrop >= r.worstDrop - 100)
  const missed = rows.filter((r) => !r.lesson && r.worstDrop >= 300)
  return {
    accurate: round(accurate.length / Math.max(1, shown.length)),
    top: round(top.length / Math.max(1, shown.length)),
    shown: shown.length,
    missed: missed.length,
    n: rows.length,
    wrong: shown.filter((r) => !(r.namedDrop >= 100)).map((r) => `${r.key} ${r.lesson} (true ${r.namedDrop}cp)`),
    target: 'accurate >= 0.90, top >= 0.70, missed 0',
  }
}

/* C11 ledger marks over the same replayed losses (positions not already decided):
   blunder marks that truly cost >= 1.5 pawns, mistake marks that cost >= 0.6,
   >= 3-pawn moves marked mistake/blunder (recall), and quiet moves (<= 0.2) so marked. */
export function scoreLedger(rows) {
  const t = { blunder: 0, blunderTrue: 0, mistake: 0, mistakeTrue: 0, big: 0, bigMarked: 0, quiet: 0, quietMarked: 0 }
  for (const r of rows) for (const k of Object.keys(t)) t[k] += r.ledger?.[k] ?? 0
  const ratio = (a, b) => round(a / Math.max(1, b))
  return {
    blunderPrecision: ratio(t.blunderTrue, t.blunder),
    mistakePrecision: ratio(t.mistakeTrue, t.mistake),
    recall: ratio(t.bigMarked, t.big),
    falseAlarm: ratio(t.quietMarked, t.quiet),
    counts: t,
    target: 'precision >= 0.80, recall >= 0.55, false alarms <= 0.03',
  }
}

export function formatScorecard(sc) {
  const c = sc.checks
  const lines = []
  lines.push('SCORECARD')
  lines.push(`  C1 walls (club can't clear in 3 tries) : ${c.walls.value}  [${c.walls.target}] ${c.walls.list.join(', ')}`)
  lines.push(`  C2 skill gap (skilled-novice, 1st try)  : ${c.skillGap.value} (min ${c.skillGap.min})  [${c.skillGap.target}]`)
  lines.push(`  C3 difficulty ramp (Spearman)           : ${c.ramp.value}  [${c.ramp.target}]`)
  lines.push(`  C4 comeback rate (decisive club/skilled): ${c.comebackRate.value} of ${c.comebackRate.n}  [${c.comebackRate.target}]`)
  lines.push(`  C5 unfinished games                      : ${c.unfinishedRate.value} (${c.unfinishedRate.n}/${c.unfinishedRate.of})  [${c.unfinishedRate.target}]`)
  lines.push(`  C6 puzzles skilled/club/novice clear     : ${c.puzzles.skilledClear}/${c.puzzles.clubClear}/${c.puzzles.noviceClear}  [${c.puzzles.target}] broken: ${c.puzzles.broken.join(', ') || 'none'}`)
  lines.push(`  C7 pacing                                : ${c.pacing.pressesToFirstRival} presses / ${c.pacing.wordsBeforeFirstRival} words to first rival; club plies p50 ${c.pacing.clubMedianPlies} p90 ${c.pacing.clubP90Plies}`)
  lines.push(`  C8 rival wait p50/p95/max (virtual ms)   : ${c.responsiveness.aiWaitP50}/${c.responsiveness.aiWaitP95}/${c.responsiveness.aiWaitMax}; input latency p95 ${c.responsiveness.inputLatencyRealP95} ms real (container)`)
  if (c.recapTruth) {
    const r = c.recapTruth
    lines.push(`  C10 recap lesson accurate / top / missed : ${r.accurate} / ${r.top} / ${r.missed}  (${r.shown} lessons in ${r.n} sampled losses)  [${r.target}]`)
  }
  if (c.ledger && c.ledger.counts.blunder + c.ledger.counts.mistake > 0) {
    const l = c.ledger
    lines.push(`  C11 ledger marks blunder/mistake precision, recall, false alarms: ${l.blunderPrecision} / ${l.mistakePrecision}, ${l.recall}, ${l.falseAlarm}  (${l.counts.blunder} blunder, ${l.counts.mistake} mistake marks)  [${l.target}]`)
  }
  lines.push('')
  lines.push('PER MATCH (first-try score / clear rate within attempts / mean tries)')
  for (const m of sc.perMatch) {
    const cell = (b) => (m[b] ? `${m[b].first.toFixed(2)}/${m[b].clear.toFixed(2)}/${m[b].tries}` : '  -  ')
    lines.push(`  ${m.id.padEnd(28)} novice ${cell('novice')}  club ${cell('club')}  skilled ${cell('skilled')}`)
  }
  lines.push('PER PUZZLE (first-try / clear)')
  for (const p of sc.perPuzzle) {
    const cell = (b) => (p[b] ? `${p[b].first.toFixed(2)}/${p[b].clear.toFixed(2)}` : ' - ')
    lines.push(`  ${p.id.padEnd(28)} novice ${cell('novice')}  club ${cell('club')}  skilled ${cell('skilled')}`)
  }
  return lines.join('\n')
}

export function compareRuns(a, b) {
  const rows = [
    ['walls', a.checks.walls.value, b.checks.walls.value],
    ['skillGap', a.checks.skillGap.value, b.checks.skillGap.value],
    ['ramp', a.checks.ramp.value, b.checks.ramp.value],
    ['comebackRate', a.checks.comebackRate.value, b.checks.comebackRate.value],
    ['unfinishedRate', a.checks.unfinishedRate.value, b.checks.unfinishedRate.value],
    ['puzzles.club', a.checks.puzzles.clubClear, b.checks.puzzles.clubClear],
    ['puzzles.skilled', a.checks.puzzles.skilledClear, b.checks.puzzles.skilledClear],
    ['clubMedianPlies', a.checks.pacing.clubMedianPlies, b.checks.pacing.clubMedianPlies],
    ['aiWaitP95', a.checks.responsiveness.aiWaitP95, b.checks.responsiveness.aiWaitP95],
    ['recap.accurate', a.checks.recapTruth?.accurate, b.checks.recapTruth?.accurate],
    ['recap.top', a.checks.recapTruth?.top, b.checks.recapTruth?.top],
    ['recap.missed', a.checks.recapTruth?.missed, b.checks.recapTruth?.missed],
    ['ledger.blunderPrec', a.checks.ledger?.blunderPrecision, b.checks.ledger?.blunderPrecision],
    ['ledger.mistakePrec', a.checks.ledger?.mistakePrecision, b.checks.ledger?.mistakePrecision],
    ['ledger.recall', a.checks.ledger?.recall, b.checks.ledger?.recall],
    ['ledger.falseAlarm', a.checks.ledger?.falseAlarm, b.checks.ledger?.falseAlarm],
  ]
  return rows.map(([k, x, y]) => `${k.padEnd(18)} ${String(x).padStart(8)} -> ${String(y).padStart(8)}`).join('\n')
}
