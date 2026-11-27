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
`npm run eval` (2 series × 3 attempts per match×bot). Noise between seed sets: walls ±2,
ramp ±0.15, comebacks ±0.05, skill gap ±0.04, unfinished ±1 game, C10 accurate ±0.08.
Files: `eval/results/s3-*.json` (this session), `r2-final-*.json`, `round1-*.json`.

| # | Check (kind) | Target | Session start tune / holdout | Now tune / holdout |
|---|---|---|---|---|
| C1 | Walls: pre-finale matches the club bot fails to clear in 3 tries (fairness) | 0 | 2 / 2 | 2 / 2 ✗ (Gage, Helia / Helia, Soren) |
| C2 | Skill gap: skilled − novice first-try score (skill matters) | ≥ 0.50 | 0.78 / 0.76 | 0.78 / 0.76 |
| C3 | Ramp: Spearman(order, first-try difficulty) (pacing) | ≥ 0.50 | 0.37 / 0.42 | 0.37 / 0.42 ✗ (real, see Log) |
| C4 | Comebacks: decisive club/skilled games won from ≥1.5 pawns down (tension) | 0.20–0.50 | 0.32 / 0.27 | 0.32 / 0.27 |
| C5 | Unfinished: no result in 300 plies | 0 | 1 / 0 | 1 / 0 |
| C6 | Puzzles: clear rate skilled / club / novice | 1.00 / ≥0.80 | 1/1/1 | 1/1/1 (guard) |
| C7 | Pacing: words to first rival; club match plies p50 | p50 40–140 | 1419 w; 80 | 1419 w; 80 |
| C8 | Rival wait p95, virtual ms (150 nodes/ms) | ≤ 2000 | 1632 | 1632 |
| C9 | Device gap: club walls at 350 nodes/ms minus at 150 | ≤ noise | −1 (session 2) | not re-run |
| C10 | Recap lesson (readability): names a move that truly cost ≥1 pawn / names the costliest / big mistakes unnamed (48 losses, 30k-node judge) | ≥0.90 / ≥0.70 / 0 | 0.44/0.35/0 · 0.38/0.26/1 | **0.88/0.70/3 · 0.80/0.71/5** |

All measured by bots. C10's judge is stable (0.44 at 30k and 90k nodes); a random-move lesson
scores 0.03, so it discriminates.

## Backlog (top first)
1. **Walls**: Gage, Helia (tune) / Helia, Soren (holdout) survive relief III. Trial
   `early-relief` is the current attempt (see Trials); if it is dropped, diagnose per rival
   (persona depth after relief, book/script) before touching relief numbers.
2. **Ramp is genuinely flat** (C3 0.37/0.42): the club bot loses the first try to 18/22 rivals
   from Edred (3rd) on; skilled-bot losses cluster in Chapters IV–VII, VIII–IX are easier. A
   content/tuning job: re-order or re-tier rivals; needs a trial (balance).
3. C10 to target: remaining wrong lessons come from 6k-node verification missing deep tactics; the
   recap could say "lost the thread around move N" when nothing verifies but the eval fell ≥ 3.
4. "Turning point" (largest swing toward the player) often names a rival move next to "Study this"
   on a loss — two different moves highlighted. Readability; check with a human first.
5. "Punished tendency" memory makes a rival stronger after it beats you; anti-tilt still reads the
   live streak. Fold both into one rule.
6. Main-thread work per player move (two 12 ms eval searches + scans): measure on a phone.
7. Raise the bar once C1 = 0: club clears in ≤ 2 tries; novice clears Chapter I rivals 1–2.

## Alternatives (strong versions that lost)
- Recap lesson, depth-matched after-reply search (cap two plies below the root depth): more accurate
  but silent more often — held-out 0.82 / 6 missed (10k nodes), 0.95 / 11 (14k) vs kept 0.74 / 2 on
  the lab sample. Revisit if players prefer fewer but surer lessons.
- Recap lesson, verify-only (no rival-reply term): 0.81–0.88 accurate but 13–14 of 60 losses with a
  big mistake got no lesson. Parity-matched trace with no search: 0.58 (free, but too noisy).
- Relief v1 (blunder floor only): weaker relief for some rivals and an untrue label; v2 kept.
- Resignation without the endgame condition: skill gap 0.78 → 0.58. Endgame-only kept.

## Strategy (kinds of change → hit rate)
- Evaluator correctness / new checks: 5/5 changed conclusions (C10 exposed a 44%-accurate lesson
  nobody had questioned). New checks on *text the game tells the player* are high-yield here.
- Difficulty/fairness in the persona layer: 3/3 kept (sessions 1–2); now built as trials.
- Playing the first minutes as a careless novice on a phone viewport: 2/2 found real bugs this
  session (stuck puzzle, recap scrolled away) — bots never see UI state. Do it every session.
- Copy/consistency fixes: 2/2. Rule changes at match edges: 1/1 (needed a skill-gap guard).
- Prediction accuracy: 5/7 (session 3: recap met; C3 "check too coarse" was a misdiagnosis).

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
- Assert on side effects (history, rewards, snapshot fields), not just the end state.
- Anything a trial changes must be applied at read time, never written into the snapshot/save.
- Phone UI: every visibility rule in `applyChessUi` has a twin in `labModal.syncPhonePuzzleLesson`
  (runs on resize). Change both.
- Playwright: `require('playwright')` with the pre-installed Chromium; drive the board by reading
  square aria-labels into chess.js (build castling rights from piece placement, not "KQkq").

## Trials (built behind a switch, waiting for the owner's verdict)
| Trial | Switch | What changes | Measured on / off |
|---|---|---|---|
| early-relief | `?try=early-relief` (off: `?try=off`) | Rematch relief one loss earlier: first meeting with a campaign rival at step I, 3rd try at III. Dossier says "early relief (trial)". Wins count normally (no marker). | see Log, session 3 |

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

### Session 3 (2026-11-27) — one round (gain: recap lesson accuracy 0.44→0.88 tune, 0.38→0.80 holdout; 2 UI dead ends removed)
- New check **C10 recap truth** (own commit). Baseline 0.44/0.35/0 (tune), 0.38/0.26/1 (holdout).
- KEPT: verified recap lesson. Prediction "accurate ≥0.85, top ≥0.6, missed ≤8, games unchanged":
  met (0.88/0.70/3; holdout 0.80/0.71/5; all game checks identical). The 3 newly silent tune games
  all had wrong lessons before. Chosen from 9 lab variants (see Alternatives).
- KEPT: spent puzzle → "Proof spent … Reset to try again" + Reset on phones (found by playing
  Chapter I's first puzzle wrong; two moves lose the bishop to a dead draw).
- KEPT: verdict sheet opens at its top with Advance pinned (found by playing: the lesson was
  scrolled off-screen after every loss on phones).
- TRIAL: early-relief (results below).
- REJECTED: graded C3 variants (eval at move 30, survival): 0.29–0.37, split-half r ≈ 0.85 — last
  session's "C3 is too coarse" was a misdiagnosis; check left unchanged.
- Independent review (fresh agent, code only): 4 confirmed issues — trial leaked into the snapshot,
  resize re-hid Reset, lesson searched in the final move's frame, 1.5× wall-clock cap bound on slow
  phones — all fixed in one commit with tests (each sabotage-checked).
- Process failures: (1) a sabotage test passed → guard was untested (Playbook); (2) misdiagnosed C3
  last session → graded-variant line (Playbook); (3) one CSS edit silently didn't apply (Python
  replace on a non-matching anchor) — caught only by a screenshot; assert anchors exist; (4) an
  interactive `git checkout -p` hung and left a sabotage unrestored for a minute — caught by
  re-reading the diff; (5) the phone-resize twin of a UI rule was missed until review (Playbook).
- Prediction for next round: an offline lab + a screenshot pass per UI change should make UI and
  heuristic changes land in one try instead of two.

## Playtest notes (from the owner, dated)
- None yet.
