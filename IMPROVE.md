# IMPROVE.md — improvement loop memory

Read this first each session. Keep sections short; condense old rounds.

## The game
**The Calculus of Kings** — narrative chess RPG (TypeScript/Vite PWA, offline, no backend).
For: story-curious chess players from beginner to club strength, mostly on phones.
Core loop: read a short story scene → solve a teaching puzzle or beat a rival in a full game
(only a *win* advances a match scene) → reward overlay explains the result → next rival.
10 chapters (Prologue + I–IX), 22 campaign matches, 22 puzzles, plus a Duel archive.

Run: `npm run dev` (play) · `npm test` (unit) · `npm run quality:gate` (release gate).

**Evaluate: `npm run eval`** (≈20 min on 4 cores; `--seedset holdout` for held-out seeds;
`--quick` = 1 series; `node eval/run.mjs --compare a.json b.json`).
It drives the real `GameFlow` (rules, rival personas, retries with loss memory, puzzles) with
three seeded bots — **novice** (greedy 1-ply), **club** (3-ply, soft sampling), **skilled**
(40k-node engine) — and writes `eval/results/<label>.json`. Randomness is seeded per job and
search time runs on a virtual clock (`eval/determinism.ts`: 150 nodes per budget-ms, a mid-phone
assumption), so two runs give identical game records (only the real-time input-latency
sample differs). See `eval/README.md`.

## Constraints (never break)
- Save key `calculus-of-kings-progress-v3` and its migrations; never reset or reinterpret saved
  progress, rank points, rival memory or match history.
- Board controls: tap/click-to-move, drag, keyboard roving focus, promotion picker, undo/reset,
  Run it back, hint. Screen-reader announcements, reduced motion, 44px phone targets.
- Offline-first PWA, no backend/analytics/ads; gzip JS budget enforced by `quality:gate`.
- Identity: alt-history chess RPG, manuscript/marble art, rivals with persona AI (never random
  moves; Boltzmann sampling inside a bounded band). Matches end only by mate / dead draw
  ("no move cap"); only wins advance a match scene.
- AGENTS.md: lint + typecheck + relevant tests before any PR; docs for gameplay changes in `docs/`.

## Scorecard
Measured by `npm run eval` (2 series × 3 attempts per match×bot). Noise between seed sets:
walls ±2, ramp ±0.15, comebacks ±0.05, skill gap ±0.03, unfinished ±1 game. Result files:
`eval/results/round1-*.json`, `r2*-tune.json`, `r2-final-holdout.json`.

| # | Check (kind) | Target | Baseline tune / holdout | Round 1 | Round 2 (now) |
|---|---|---|---|---|---|
| C1 | Walls: pre-finale matches the club bot fails to clear in 3 tries (fairness) | 0 | 14 / 12 | 1 / 4 | **2 / 2** ✗ |
| C2 | Skill gap: skilled − novice first-try score (skill matters) | ≥ 0.50 | 0.77 / 0.80 | 0.77 / 0.80 | 0.78 / 0.76 |
| C3 | Ramp: Spearman(order, first-try difficulty) (challenge pacing) | ≥ 0.50 | 0.33 / 0.48 | 0.33 / 0.48 | 0.37 / 0.42 ✗ (check too coarse, see Backlog 1) |
| C4 | Comebacks: decisive club/skilled games won from ≥1.5 pawns down (tension) | 0.20–0.50 | 0.28 / 0.23 | 0.35 / 0.28 | 0.32 / 0.27 |
| C5 | Unfinished: no result in 300 plies | 0 | 7 / 8 | 7 / 8 | **1 / 0** |
| C6 | Puzzles: clear rate skilled / club / novice | 1.00 / ≥0.80 | 1/1/1 | 1/1/1 | 1/1/1 (guard) |
| C7 | Pacing: words to first rival; club match plies p50 | p50 40–140 | 1419 w; 66 | 76 / 93 | 80 / 83 |
| C8 | Rival wait p95, virtual ms (150 nodes/ms) | ≤ 2000 | 1768 | 1632 | 1638 |
| C9 | Device gap: club walls at 350 nodes/ms minus at 150 (fairness across devices) | ≤ noise | — | +3 (4 vs 1) | −1 (2 vs 3) |

All measured by bots. Rival budgets are now node budgets at `PERSONA_NODES_PER_MS` = 150 in the game
itself; the evaluator's clock rate only affects the UI eval probe and the slow-device time cap.

## Backlog (top first)
1. **Refine C3 (ramp).** First-try outcomes are win/loss for most rivals (15/22 read
   novice 0 / club 0 / skilled 1), so capping Chapter I's finale did not register. Use a graded
   first-try measure — club-bot plies survived and eval at move 30 — prove it on a broken version
   (e.g. swap two rivals), then re-measure old and new. Evidence the cap works: club first-game
   survival vs Demetrios ~59 → 93 plies, Counterpart ~59 → 79.
2. Remaining walls: Gage and Helia (tune), Helia and Soren (holdout) survive relief III. Diagnose
   per rival (persona depth after relief, book/script, chapter ramp) before touching relief numbers.
3. "Punished tendency" memory (`memoryRamp`) makes a rival stronger after it beats you; the old
   anti-tilt softening still reads the live streak. Fold both into one rule.
4. Readability check: does the recap's "costliest move" match a ≥1.5-pawn drop a deeper search confirms?
5. Main-thread work per player move (two 12 ms eval searches + scans): measure on a phone.
6. Raise the bar once C1 = 0: club clears in ≤ 2 tries; novice clears Chapter I rivals 1–2.

## Alternatives (strong versions that lost)
- Relief v1 (blunder *floor* only, no add): walls 14→1 tune / 12→6 holdout, but rivals whose own
  rate beat the floor (Amara, Lukas) got no relief at all and the label was untrue; v2 kept.
- Resignation without the endgame condition: rivals resigned middlegames after dropping a queen to
  a beginner (skill gap 0.78 → 0.58; novice beat Iota and Wren first try). Endgame-only kept.
- Not tried: simply enlarging the old anti-tilt constants. It cannot leave apex
  best-move mode and was cancelled by the `aiDepth` floor, so it was dominated by design.

## Strategy (kinds of change → hit rate)
- Evaluator correctness (repetition, history, goal-reading, bot technique): 4/4 needed; each changed
  conclusions. Always smoke-test the evaluator on hard cases first.
- Difficulty/fairness in the persona layer (relief, device-independent budgets, finale cap): 3/3
  kept. Highest-value area here because "win to advance" makes progression the main risk.
- Rule changes at the edges of a match (resignation): 1/1 kept, but the first version regressed a
  check — rules that end games early need a skill-gap guard.
- Copy/consistency fixes: 2/2 (cheap; do them alongside rule changes).
- Prediction accuracy: 4/5 (the cap's ramp prediction missed because the check was too coarse).

## Playbook (provisional unless marked)
- Before a full 12-min run, smoke one hard rival per bot: `EVAL_ONLY=c5-match-helia EVAL_SERIES=1
  EVAL_VERBOSE=1 npm run eval -- --quick --label smoke` and read outcomes/plies. Next round this
  should catch harness bugs in minutes instead of a full run.
- A/B the game code with `git worktree`, not `git stash` (a stash-pop conflict once let an eval
  start on an unknown tree).
- Sabotage every new test (restore the old bug, watch it fail); one test here passed vacuously.
- First attempts must stay byte-identical when changing retry-only behaviour: C2/C3 identical is a
  free sanity check that the refactor didn't leak.
- C1 depends on attempts 2+, C2/C3 on attempt 1 only; C4/C5 on all games.
- Any rule that ends a game early (resignation, adjudication) must be checked against the
  skill gap: novice bots exploit generosity first. (confirmed once)
- Before predicting a move in a check, look at its resolution on the scenes you're changing
  (C3 ties at 0/0/1 for most rivals). (provisional)
- Playwright here needs the pre-installed Chromium: a throwaway config with
  `launchOptions.executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'`.

## Log
### Session 1 (2026-11-25) — evaluator + round 1 (total gain: walls 14→1 tune, 12→4 holdout)
- Built `eval/` (seeded bots on the real GameFlow, virtual clock). Evaluator bugs found and fixed
  before trusting numbers: (1) harness stopped games on threefold repetition, which this game does
  not end on; (2) engine bots had no game history, so they walked into repetition loops a human
  avoids; (3) puzzle bots ignored the written goal ("castle", "play h3") → 2 puzzles falsely
  "broken"; (4) club bot could not run a basic K+Q/K+R mate, inflating C5 once rivals got weaker
  → gave it endgame technique (own commit); baseline re-measured: unchanged.
- Finding: only wins advance a match, and 14/21 pre-finale rivals beat the club bot 3 times running
  (first wall: Edred, 3rd rival of Chapter I). Anti-tilt relief was tiny, outweighed by the
  chapter/difficulty ramps, losses *raised* rival strength via tendency memory, and the scene
  `aiDepth` floor cancelled any depth relief.
- KEPT: rematch relief v2 (pass 150). Prediction "walls 14 → ≤4, C2/C3 unchanged" — met on tune
  (1) and holdout (4); comebacks up; unfinished equal. Independent review (separate agent, saw only
  code) found an undo exploit, draw-wipes-streak, an untrue label for floor-depth rivals, label on
  the loss screen, weak tests → all fixed and re-measured.
- KEPT: Counterpart note no longer promises a draw seals the era (a draw never advances).
- REJECTED: relief v1 (see Alternatives).
- Process failures: harness bugs found only after a full run (no smoke step) → Playbook line;
  stash/background race → worktree line; vacuous test → sabotage line.

### Session 2 (2026-11-26) — round 2: the three approved decisions (gain: unfinished 7→1/8→0, device gap +3→−1, walls 4→2 holdout)
- KEPT: node-budget rival strength (`PERSONA_NODES_PER_MS` = 150, `targetNodes` soft/hard limit,
  2× wall-clock safety). Prediction "desktop walls ≈ phone walls": met (2 vs 3; was 4 vs 1). Phone
  walls 1 → 3 inside noise (budgets now exact). Unit test proves identical moves/nodes at 150 vs 350.
- KEPT: endgame-only rival resignation. Prediction "unfinished → ~0": met (1 tune, 0 holdout).
  REJECTED first version (no endgame condition): skill gap 0.78 → 0.58.
- KEPT: Chapter I finale capped to Marius (`strengthCapSceneId`), difficulty shown 3/5. Prediction
  "ramp ≥ 0.50": MISSED (0.37) — check too coarse; walls 3 → 2 and club survival longer.
- Verification: 1,062 unit tests, quality gate, 107 Playwright smoke tests pass. Independent review
  this round: none (self-review only — say so).
- Process failure: a backgrounded `a && b && (eval) &` chain put the whole chain in the background;
  harmless here, but check the commit landed before relying on it.

## Decisions for me
- (Resolved 2026-11-26) Resignation, Chapter I finale cap, and device reference rate (150
  nodes/ms) — owner approved the recommendations; shipped in pass 151.
- None open.

## Checks for me (need a human or a real device)
- Real phone engine speed (nodes/ms in the worker) — the eval assumes 150.
- Does a relieved rematch *feel* easier but still earned? Does the dossier line fit on a phone?
- Feel/look/sound of the board, touch controls — not measured by bots.
