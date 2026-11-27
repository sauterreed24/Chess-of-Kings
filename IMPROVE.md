# IMPROVE.md — improvement loop memory

Read this first each session. Keep sections short; condense old rounds.

## The game
**The Calculus of Kings** — narrative chess RPG (TypeScript/Vite PWA, offline, no backend).
For: story-curious chess players from beginner to club strength, mostly on phones.
Core loop: read a short story scene → solve a teaching puzzle or beat a rival in a full game
(only a *win* advances a match scene) → verdict sheet explains the result → next rival.
10 chapters (Prologue + I–IX), 22 campaign matches, 22 puzzles, plus a Duel archive.

Run: `npm run dev` (play) · `npm test` (unit) · `npm run quality:gate` (release gate).

**Evaluate: `npm run eval`** (≈15 min on 4 free cores; `--seedset holdout` for held-out seeds;
`--quick` = 1 series; `--compare a.json b.json`; `--label x --recap-only` re-runs only C10;
`EVAL_TRY=<trial>` measures a trial switched on). It drives the real `GameFlow` with three seeded
bots — **novice** (greedy 1-ply), **club** (3-ply, soft sampling), **skilled** (40k-node engine) —
on a virtual clock (150 nodes per budget-ms), so two runs give identical game records. Records
(start FEN, moves, trace) go to `eval/out/` (gitignored); scorecards to `eval/results/`.
See `eval/README.md`.

## Constraints (never break)
- Save key `calculus-of-kings-progress-v3` and its migrations; never reset or reinterpret saved
  progress, rank points, rival memory or match history. Trials live under
  `calculus-of-kings-trials-v1`, never in the save (a test enforces the snapshot side).
- Board controls: tap/click-to-move, drag, keyboard roving focus, promotion picker, undo/reset,
  Run it back, hint. Screen-reader announcements, reduced motion, 44px phone targets.
- Offline-first PWA, no backend/analytics/ads; gzip JS budget enforced by `quality:gate`.
- Identity: alt-history chess RPG, manuscript/marble art, rivals with persona AI (never random
  moves; Boltzmann sampling inside a bounded band). Matches end only by mate / dead draw /
  endgame resignation; only wins advance a match scene.
- AGENTS.md: lint + typecheck + relevant tests before any PR; docs for gameplay changes in `docs/`.

## Scorecard
`npm run eval` (2 series × 3 attempts per match×bot), **virtual clock = engine nodes / 150**
(corrected in session 3; every number below uses it — older files used a clock that stopped the
UI probe at depth 1). Noise between seed sets: walls ±2, ramp ±0.3, comebacks ±0.06, skill gap
±0.13, unfinished ±1 game, C10 accurate ±0.1. Files: `eval/results/s3c-*.json`.

| # | Check (kind) | Target | Session start tune / holdout | Now tune / holdout |
|---|---|---|---|---|
| C1 | Walls: pre-finale matches the club bot fails to clear in 3 tries (fairness) | 0 | 2 / 3 | 2 / 3 ✗ (Prax, Elara / Vega, Prax, Voss) |
| C2 | Skill gap: skilled − novice first-try score (skill matters) | ≥ 0.50 | 0.85 / 0.72 | 0.85 / 0.72 |
| C3 | Ramp: Spearman(order, first-try difficulty) (pacing) | ≥ 0.50 | 0.22 / 0.50 | 0.22 / 0.50 ✗ |
| C4 | Comebacks: decisive club/skilled games won from ≥1.5 pawns down (tension) | 0.20–0.50 | 0.27 / 0.21 | 0.27 / 0.21 |
| C5 | Unfinished: no result in 300 plies | 0 | 0 / 2 | 0 / 2 |
| C6 | Puzzles: clear rate skilled / club / novice | 1.00 / ≥0.80 | 1/1/1 | 1/1/1 (guard) |
| C7 | Pacing: words to first rival; club match plies p50 | p50 40–140 | 1419 w; 78 | 1419 w; 78 |
| C8 | Rival wait p95, virtual ms | ≤ 2000 | 1506 / 1514 | 1506 / 1514 |
| C9 | Device gap: club walls at 350 nodes/ms minus at 150 | ≤ noise | not re-run on the new clock | — |
| C10 | Recap lesson: names a move that truly cost ≥1 pawn / names the costliest / ≥3-pawn mistakes unnamed (48 losses, 30k-node judge) | ≥0.90 / ≥0.70 / 0 | 0.81/0.70/1 · 0.83/0.72/1 | **0.98/0.77/3 · 1.00/0.81/4** |
| C11 | Ledger marks: blunder / mistake precision, recall (≥3-pawn moves), false alarms (quiet moves) | ≥0.80 / ≥0.80, ≥0.55, ≤0.03 | 0.89/0.84, 0.87, 0.02 · 0.96/0.79, 0.84, 0.02 | same (unchanged code) |

All measured by bots. C10/C11 judges discriminate: a random-move lesson scores 0.03.

## Backlog (top first)
1. **Walls**: Prax, Elara (tune) / Vega, Prax, Voss (holdout) survive relief III. Trial
   `early-relief` takes tune walls 2 → 1 (Gage) with no unfinished-game cost on the corrected
   clock; run it on holdout next. If dropped, diagnose per rival.
2. **Ramp is flat** (C3 0.22 / 0.50; ±0.3 noise): the club bot loses the first try to most
   rivals from Edred (3rd) on. early-relief lifts it to 0.68 (tune). Otherwise re-order/re-tier
   rivals as a trial.
3. C10 "missed" (3 / 4 of 48 losses get no lesson despite a ≥3-pawn mistake): the recap could
   say "lost the thread around move N" when nothing verifies but the eval fell ≥ 3.
3b. Re-run C9 (device gap) on the corrected clock.
4. "Turning point" (largest swing toward the player) often names a rival move next to "Study this"
   on a loss — two different moves highlighted. Readability; check with a human first.
5. "Punished tendency" memory makes a rival stronger after it beats you; anti-tilt still reads the
   live streak. Fold both into one rule.
6. Main-thread work per player move (two 12 ms eval searches + scans): measure on a phone.
7. Raise the bar once C1 = 0: club clears in ≤ 2 tries; novice clears Chapter I rivals 1–2.

## Alternatives (strong versions that lost)
- Trial `true-marks` (session 3, removed): parity-matched ledger grading. Looked like 0.63 → 0.87
  blunder precision in a lab, but the lab's baseline was the old clock's depth-1 trace; on the
  corrected clock the existing marks already meet C11. Revisit only if C11 regresses.
- Recap lesson, depth-matched after-reply search (cap two plies below the root depth): more accurate
  but silent more often — held-out 0.82 / 6 missed (10k nodes), 0.95 / 11 (14k) vs kept 0.74 / 2 on
  the lab sample. Revisit if players prefer fewer but surer lessons.
- Recap lesson, verify-only (no rival-reply term): 0.81–0.88 accurate but 13–14 of 60 losses with a
  big mistake got no lesson. Parity-matched trace with no search: 0.58 (free, but too noisy).
- Relief v1 (blunder floor only): weaker relief for some rivals and an untrue label; v2 kept.
- Resignation without the endgame condition: skill gap 0.78 → 0.58. Endgame-only kept.

## Strategy (kinds of change → hit rate)
- Evaluator correctness / new checks: 6/6 changed conclusions. C10 found real wrong lessons; the
  virtual-clock bug (found by an independent reviewer) had distorted every UI-probe number since
  session 1 and inflated rival time ~3×. Review the *harness* as hard as the game.
- New checks on text the game tells the player: 2 built (C10, C11); C10 led to a kept fix, C11
  showed the marks were fine once measured correctly.
- Difficulty/fairness in the persona layer: 3/3 kept (sessions 1–2); now built as trials.
- Playing the first minutes as a careless novice on a phone viewport: 2/2 found real bugs this
  session (stuck puzzle, recap scrolled away) — bots never see UI state. Do it every session.
- Copy/consistency fixes: 2/2. Rule changes at match edges: 1/1 (needed a skill-gap guard).
- Prediction accuracy: 5/9 (session 3: recap met on both clocks but its size was 4× overstated on
  the broken one; C3 "too coarse" and the true-marks diagnosis were evaluator artifacts).

## Playbook (provisional unless marked)
- Before a full run, smoke one hard rival per bot: `EVAL_ONLY=c5-match-helia EVAL_SERIES=1
  EVAL_VERBOSE=1 npm run eval -- --quick --label smoke`. (confirmed)
- A/B game code with `git worktree` (old commit in one tree, new in the other; run both with
  `--shards 2`). Never `git stash`, and never `git checkout -p` (interactive; it hung here). (confirmed)
- Sabotage every new test (restore the old bug, watch it fail). Session 3: one sabotage passed —
  the "never blame the best move" guard was untested until a test for that case was added. (confirmed)
- For a heuristic with a ground truth (recap lesson, hints), build an offline lab over saved
  records with a cached deep judge first: six variants cost minutes, not six full evals. Let the
  lab call the game's own module (`recap/lessonEngine.ts`) so it measures what ships.
- Before trusting "the check is too coarse", compute 2–3 graded variants on saved records and
  their split-half reliability; if they agree, the problem is the game, not the check.
- Before trusting a lab baseline, check it was produced the way the game produces it: the
  true-marks lab compared a fresh 1800-node search against depth-1 harness traces. (confirmed)
- When a number changes a lot after a harness fix, re-measure old and new code on the fixed harness
  (graft only the harness + engine counter onto the old commit in a worktree).
- Assert on side effects (history, rewards, snapshot fields), not just the end state.
- Anything a trial changes must be applied at read time, never written into the snapshot/save.
- Phone UI: every visibility rule in `applyChessUi` has a twin in `labModal.syncPhonePuzzleLesson`
  (runs on resize). Change both.
- Playwright: `require('playwright')` with the pre-installed Chromium; drive the board by reading
  square aria-labels into chess.js (build castling rights from piece placement, not "KQkq").

## Trials (built behind a switch, waiting for the owner's verdict)
| Trial | Switch | What changes | Measured off → on (corrected clock, tune) |
|---|---|---|---|
| early-relief | `?try=early-relief` (off: `?try=off`) | Rematch relief one loss earlier: first meeting with a campaign rival at step I, 3rd try at III. Dossier says "early relief (trial)". Wins count normally (no marker). | walls 2→1; club first-try 0.14→0.23, tries per rival 2.6→2.3; ramp 0.22→0.68; skill gap 0.85→0.95; comebacks 0.27→0.24; unfinished 0→0. Holdout not yet re-run on the new clock (old clock: walls 2→0). Compare: do early rivals feel fair on the first try, or too soft? |

## Decisions for me
- None open.

## Checks for me (need a human or a real device)
- Recap: does the "Study this" line feel right after a loss? Does the lesson appearing a moment
  after the sheet opens look fine on your phone?
- Real phone engine speed (eval assumes 150 nodes/ms); feel, look and sound of the board.

## Log
### Sessions 1–2 (2026-11-25/26) — summary
Built `eval/` (seeded bots on the real GameFlow, virtual clock) after fixing 4 harness bugs.
Kept: rematch relief v2 (walls 14→1 tune / 12→4 holdout), node-budget rival strength (same rival
on every device), endgame-only resignation (unfinished 7→1), Chapter I finale cap (walls 3→2).
Independent reviews found and fixed: undo exploit, draw wiping the streak, resignation lost on
reload, undo after resignation, device-dependent resign check. Owner approved all three
session-2 decisions.

### Session 3 (2026-11-27) — two rounds (gain: recap lesson 0.81→0.98 tune / 0.83→1.00 holdout; 2 UI dead ends removed; evaluator clock fixed)
Round 1
- New check C10 (recap truth). KEPT: verified recap lesson (re-check the 4 largest trace dips with a
  fixed 6k-node search incl. the position after the rival's reply; silent when nothing verifies).
  Old clock: 0.44→0.88 tune / 0.38→0.80 holdout. Corrected clock: 0.81→0.98 / 0.83→1.00, top
  0.70→0.77 / 0.72→0.81, missed 1→3 / 1→4. All game checks identical. Chosen from 9 lab variants.
- KEPT: spent puzzle → "Proof spent … Reset" + Reset on phones (found by playing Chapter I's first
  puzzle wrong). KEPT: verdict sheet opens at its top with Advance pinned (found by playing).
- TRIAL: early-relief (see Trials). REJECTED: graded C3 variants (agreed with C3; misdiagnosis).
- Review 1 (fresh agent): trial leaked into snapshot, resize re-hid Reset, lesson searched in the
  final move's frame, 1.5× wall-clock cap → all fixed. Depth-matched lesson tried → Alternatives.
Round 2
- New check C11 (ledger marks). Trial true-marks built from a lab → review 2 (fresh agent) found
  the evaluator's virtual clock charged per read, so the UI probe never passed depth 1 in any eval
  since session 1. Fixed (clock = engine nodes / 150), old vs new re-measured. On the corrected
  clock the ledger already meets C11 → true-marks code removed. Review 2's trial bugs (stale marks
  on unmarked plies, threefold read as a draw) were fixed before removal.
- Process failures: (1) the harness clock bug survived 3 sessions — nobody reviewed the harness as
  code (Strategy line); (2) a lab baseline not produced the way the game produces it (Playbook);
  (3) a sabotage test passed until a missing case was added; (4) a Python edit silently missed its
  anchor (assert anchors); (5) an interactive `git checkout -p` hung; (6) a phone-resize twin of a
  UI rule was missed until review.
- Prediction for next session: reviewing the harness alongside each new check should stop
  evaluator artifacts from steering a round (two did this session).

## Playtest notes (from the owner, dated)
- None yet.
