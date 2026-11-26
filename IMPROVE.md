# IMPROVE.md — improvement loop memory

Read this first each session. Keep sections short; condense old rounds.

## The game
**The Calculus of Kings** — narrative chess RPG (TypeScript/Vite PWA, offline, no backend).
For: story-curious chess players from beginner to club strength, mostly on phones.
Core loop: read a short story scene → solve a teaching puzzle or beat a rival in a full game
(only a *win* advances a match scene) → reward overlay explains the result → next rival.
10 chapters (Prologue + I–IX), 22 campaign matches, 22 puzzles, plus a Duel archive.

Run: `npm run dev` (play) · `npm test` (unit) · `npm run quality:gate` (release gate).

**Evaluate: `npm run eval`** (≈12 min on 4 cores; `--seedset holdout` for held-out seeds;
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
  moves; Boltzmann sampling inside a bounded band; only bosses / authored-apex rivals play
  best-move). Matches end by mate, a sealed king, endgame resignation, or dead draw ("no move
  cap"); only wins advance a match scene.
- AGENTS.md: lint + typecheck + relevant tests before any PR; docs for gameplay changes in `docs/`.

## Scorecard
Measured by `npm run eval` (2 series × 3 attempts per match×bot). Noise between seed sets:
walls ±2, ramp ±0.2, comebacks ±0.05, skill gap ±0.03, unfinished ±1 game. Judge C3 on tune +
holdout pooled. Result files: `eval/results/round1-*`, `r2*`, `r3-base-*`, `r3a2-*` (current).

| # | Check (kind) | Target | Original baseline (tune / holdout) | Round 3 start | Round 3 end (now) |
|---|---|---|---|---|---|
| C1 | Walls: pre-finale matches the club bot fails to clear in 3 tries (fairness) | 0 | 14 / 12 | 2 / 2 | **1 / 2** ✗ (Helia, Soren) |
| C2 | Skill gap: skilled − novice first-try score (skill matters) | ≥ 0.50 | 0.77 / 0.80 | 0.78 / 0.76 | **0.86 / 0.89** |
| C3 | Ramp, graded: Spearman(order, first-try difficulty) (challenge pacing) | ≥ 0.50 | 0.22 / — (legacy 0.33 / 0.48) | 0.30 / 0.51 (pooled 0.41) | 0.26 / 0.48 (pooled 0.33) ✗ |
| C4 | Comebacks: decisive club/skilled games won from ≥1.5 pawns down (tension) | 0.20–0.50 | 0.28 / 0.23 | 0.32 / 0.27 | 0.31 / 0.22 |
| C5 | Unfinished: no result in 300 plies | 0 | 7 / 8 | 1 / 0 | 1 / 0 |
| C6 | Puzzles: clear rate skilled / club / novice | 1.00 / ≥0.80 | 1/1/1 | 1/1/1 | 1/1/1 (guard) |
| C7 | Pacing: words to first rival; club match plies p50 | p50 40–140 | 1419 w; 66 | 80 / 83 | 82 / 84 |
| C8 | Rival wait p95, virtual ms (150 nodes/ms) | ≤ 2000 | 1768 | 1632 / 1597 | 1659 / 1659 |
| C9 | Device gap: club walls at 350 nodes/ms minus at 150 | ≤ noise | +3 (round 1) | −1 | not re-run (budgets unchanged) |

All measured by bots. C3 caveat: the bots can't tell rivals apart above club strength (the club bot
loses nearly every first try from Edred on; the novice always loses), so C3 mostly reflects where
the *skilled* bot stumbles. A stronger probe bot is the next fix (Backlog 1).

## Backlog (top first)
1. **Resolve C3 above club strength.** Add a probe bot between club and skilled (or measure the
   skilled bot's plies survived / eval at move 40) so the ramp sees rival differences the current
   bots saturate on. Prove it on a broken order first (Playbook). Only then retune the late ladder.
2. Remaining walls: Helia (both sets) and Soren (holdout) survive relief III. Both are *bosses*
   allowed best-move; diagnose depth after relief vs think budget before touching relief numbers.
3. The Lukas → Edred cliff (graded difficulty 0.25 → 0.52 at match 3); Edred clears in ~2.5 tries
   with relief. Decide whether the step is intended (it's labelled mini-boss).
4. "Punished tendency" memory (`memoryRamp`) makes a rival stronger after it beats you; the old
   anti-tilt softening still reads the live streak. Fold both into one rule (expect small effect).
5. Readability check: does the recap's "costliest move" match a ≥1.5-pawn drop a deeper search confirms?
6. Main-thread work per player move (two 12 ms eval searches + scans): measure on a phone.

## Alternatives (strong versions that lost)
- Relief v1 (blunder *floor* only, no add): walls 14→1 tune / 12→6 holdout, but rivals whose own
  rate beat the floor (Amara, Lukas) got no relief at all and the label was untrue; v2 kept.
- Resignation without the endgame condition: rivals resigned middlegames after dropping a queen to
  a beginner (skill gap 0.78 → 0.58; novice beat Iota and Wren first try). Endgame-only kept.
- Apex gate v1 (only rivals *authored* at apex strictness may play best-move; bosses included in
  the ceiling): skill gap 0.77 → 0.91 pooled, walls 3 → 2, but ramp 0.41 → 0.28 pooled (removed
  late spikes) — a genuine trade-off; v2 (bosses may play best-move) kept: skill 0.88, ramp 0.33.
- Not tried: simply enlarging the old anti-tilt constants. It cannot leave apex
  best-move mode and was cancelled by the `aiDepth` floor, so it was dominated by design.

## Strategy (kinds of change → hit rate)
- Evaluator correctness (repetition, history, goal-reading, bot technique, graded ramp): 5/5 needed;
  each changed conclusions. Always smoke-test the evaluator on hard cases first.
- Difficulty/fairness in the persona layer (relief, node budgets, finale cap, apex gate): 4/5 kept
  (apex v1 lost to v2 on ramp). Still the highest-value area: progression is the main risk.
- Rule changes at the edges of a match (resignation): 1/1 kept; needs a skill-gap guard.
- Feedback/readability (relief preview): 1/1 shipped, unmeasurable by bots → playtest question.
- Copy/consistency fixes: 2/2 (cheap; do them alongside rule changes).
- Prediction accuracy: 5/7. Both misses were C3 predictions — the check saturates above club
  strength. Until Backlog 1 lands, don't predict C3 moves from changes to late rivals.
- Gains per round: R1 large (walls 14→1), R2 large (unfinished 7→1, device gap), R3 moderate
  (skill gap +0.11, persona identity for 9 rivals). Next round: fix the measurement (Backlog 1)
  before tuning the late ladder further.

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
- Assert on side effects (match history, rewards), not just the end state, when testing
  persistence: a restore bug can reproduce the right board by re-running the logic. (provisional)
- Before predicting a move in a check, look at its resolution on the scenes you're changing
  (C3 ties at 0/0/1 for most rivals). (provisional)
- Put `&` only on a subshell: `(a && b) > log 2>&1 &`. `a && b && c &` backgrounds the whole
  chain (happened twice). (confirmed)
- After a squash-merged PR, `git merge origin/main` into the branch (no file changes); force-push
  is refused here. (confirmed)
- C3 rewards late spikes: smoothing late rivals lowers it even when the curve gets saner. Read the
  per-match curve (`/tmp`-style pooled probe over saved records), not just the coefficient.
  (provisional)
- Playwright here needs the pre-installed Chromium: a throwaway config with
  `launchOptions.executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'`.

## Log
### Sessions 1–2 (2026-11-25/26), condensed — walls 14→2, unfinished 7→1, device gap +3→−1
- Built `eval/`; four evaluator bugs fixed before trusting numbers (repetition stop, bots without
  history, puzzle goals unread, club bot without mating technique).
- Kept: rematch relief v2 (pass 150); node-budget rival strength; endgame-only resignation
  (saved, final, device-independent); Chapter I finale capped to Marius (pass 151). Rejected: relief
  v1, resignation without the endgame condition (see Alternatives).
- Two independent reviews found real bugs each time (undo exploit, reload double-count, device-
  dependent resign); Codex review on PR #175 found two more (truncated-snapshot flag, relief
  recomputed on reload). All fixed with tests; PR #175 merged.

### Session 3 (2026-11-26) — round 3 (gain: skill gap 0.77→0.88 pooled, walls 3→2 pooled; ramp held)
- Re-ran baseline: 271/271 series identical to the previous session (determinism confirmed).
- EVAL FIX (own commit): graded C3 — a lost first game earns 0.5·min(1, plies/150). Proven on
  broken orders (reversed −0.30; Chapter I last −0.49 vs legacy −0.24); registers the round-2
  finale cap (0.24 → 0.30) that legacy missed.
- Finding: ramps pushed 14/16 rivals from Chapter II on into apex best-move mode (persona layer
  off; veterans Gage/Prax/Nysa harder than their bosses).
- REJECTED (trade-off): apex gate v1 (authored apex only) — ramp 0.41 → 0.28 pooled.
- KEPT: apex gate v2 (bosses / authored apex may play best-move). Prediction met: ramp no worse
  (0.30→0.26 / 0.51→0.48, noise), skill 0.86 / 0.89, walls 1 / 2.
- KEPT: loss mentor line previews the next relief step ("Rematch: rematch relief I: calculates
  shallower."). Text only; predicted no check movement (none measured).
- Independent review (fresh agent): no bugs; fixed a misleading step-II preview, an endgame cap
  path the test never exercised, and documented that the Chapter I cap holds the finale below apex.
- Verification: 1,073 unit tests, quality gate, 107 Playwright smoke tests.
- Process failures: C3 prediction missed again (check saturates → Strategy line); backgrounded
  chain again (→ confirmed Playbook line); force-push refused (→ merge line).

## Decisions for me
- (Resolved 2026-11-26) Resignation, Chapter I finale cap, and device reference rate (150
  nodes/ms) — owner approved the recommendations; shipped in pass 151.
- None open.

## Checks for me (need a human or a real device)
- Real phone engine speed (nodes/ms in the worker) — the eval assumes 150.
- Does a relieved rematch *feel* easier but still earned? Does the dossier line fit on a phone?
- Feel/look/sound of the board, touch controls — not measured by bots.
