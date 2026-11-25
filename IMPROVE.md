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
Measured by `npm run eval` (2 series × 3 attempts per match×bot). Noise between seed sets
(baseline tune vs holdout): walls ±2, ramp ±0.15, comebacks ±0.05, skill gap ±0.03, unfinished ±1
game. Smaller moves are noise. Result files: `eval/results/round1-*.json`.

| # | Check (kind) | Target | Baseline tune / holdout | After round 1 tune / holdout |
|---|---|---|---|---|
| C1 | Walls: pre-finale matches the club bot fails to clear in 3 tries (fairness, progression) | 0 | 14 / 12 | **1 / 4** (measured) |
| C2 | Skill gap: skilled − novice first-try score (skill matters) | ≥ 0.50 | 0.77 / 0.80 | 0.77 / 0.80 |
| C3 | Ramp: Spearman(campaign order, first-try difficulty) (challenge pacing) | ≥ 0.50 | 0.33 / 0.48 | 0.33 / 0.48 ✗ |
| C4 | Comebacks: decisive club/skilled games won from ≥1.5 pawns down (tension) | 0.20–0.50 | 0.28 / 0.23 | 0.35 / 0.28 |
| C5 | Unfinished: no result in 300 plies (no draw rule → player must Reset) | 0 | 7/310 / 8/307 | 7/298 / 8/299 ✗ |
| C6 | Puzzles: clear rate skilled / club / novice (solvable as written) | 1.00 / ≥0.80 | 1/1/1 | 1/1/1 (regression guard) |
| C7 | Pacing: presses & words to first rival; club match plies p50 | p50 40–140 | 16 / 1419 w; 66 | 16 / 1419 w; 76 / 93 |
| C8 | Rival wait p95, virtual ms on a 150 nodes/ms device (responsiveness) | ≤ 2000 | 1768 | 1632 |

Holdout baseline was measured before the club-bot technique fix; on tune that fix changed no check.

## Backlog (top first)
1. **Device-independent rival strength.** Rival think budgets are wall-clock, so a desktop
   (~350 nodes/ms here) gets ~2.3× the search of the eval's reference phone: same rival, different
   difficulty per device. Try node budgets derived from `thinkTimeMs` (worker keeps a time cap as a
   safety). Measured: with relief, club-bot walls are 1 at 150 nodes/ms but **4 at 350**
   (tune; `round1-relief-desktop350-club-tune.json`). Choosing the node rate is choosing difficulty,
   so propose the reference rate with numbers. Measure C1 at 150 vs 350 before/after.
2. `c7-match-soren` stays a wall even at relief III on tune seeds; holdout adds Demetrios, Nysa,
   Voss. Diagnose per-rival (persona depth, book, opening script) before touching relief numbers.
3. "Punished tendency" memory (`memoryRamp`) makes a rival stronger after it beats you; the old
   anti-tilt softening still reads the live streak. Fold both into one rule.
4. Add a readability check: in losses, does the recap's "costliest move" match a ≥1.5-pawn drop a
   deeper search confirms?
5. Main-thread work per player move (two 12 ms eval searches + motif/hanging scans): measure on a
   phone; container p95 is ~8 ms.
6. Raise the bar once C1 = 0: club clears in ≤ 2 tries; add a "novice clears Chapter I rivals
   1–2" check.

## Alternatives (strong versions that lost)
- Relief v1 (blunder *floor* only, no add): walls 14→1 tune / 12→6 holdout, but rivals whose own
  rate beat the floor (Amara, Lukas) got no relief at all and the label was untrue; v2 kept.
- Not tried this round: simply enlarging the old anti-tilt constants. It cannot leave apex
  best-move mode and was cancelled by the `aiDepth` floor, so it was dominated by design.

## Strategy (kinds of change → hit rate)
- Evaluator correctness (repetition, history, goal-reading, bot technique): 4/4 needed; each one
  changed conclusions. Always smoke-test the evaluator on hard cases first.
- Difficulty/DDA tuning of the persona layer: 1/1 kept (big gain on C1). Pays off here because
  "win to advance" makes progression the dominant player-experience risk.
- Copy/consistency fixes found by reading rules vs text: 1/1 (cheap).

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

## Decisions for me
1. **Stuck won games (C5).** Matches have no repetition/50-move result and rivals never resign, so a
   player who is winning but can't mate must press Reset (2–3% of bot games). Recommendation: let a
   hopeless rival *resign* (e.g. ≥ a queen down in an endgame for 3 of its moves) — counts as a win,
   fits the story ("Thirty years. I concede."). Alternative: claimable draw on threefold/50-move that
   enables Run it back. This changes how matches end, so it's your call.
2. **First-try ramp (C3 0.33/0.48).** Chapter I ends on its two hardest first-try rivals
   (Demetrios = Advisor Boss, Counterpart = apex best-move) and Chapter II restarts at an
   "initiate" Rowan who is still a club-bot wall on try 1. Recommendation: leave the authored order
   but cap Chapter I's finale at veteran strength for the first try (relief already handles
   retries). This changes the authored difficulty curve, so it's your call.

## Checks for me (need a human or a real device)
- Real phone engine speed (nodes/ms in the worker) — the eval assumes 150.
- Does a relieved rematch *feel* easier but still earned? Does the dossier line fit on a phone?
- Feel/look/sound of the board, touch controls — not measured by bots.
