---
overview: "v0.5.144: the recap's lesson names a move that really cost you, the verdict sheet opens on it, and a failed puzzle no longer strands phone players."
---

# Pass 152 — An honest recap, a recap you can see, no stuck puzzles (v0.5.144)

Session 3 of the improvement loop (`IMPROVE.md`). One round: a new readability check, two fixes a
player meets in the first minutes, and one balance idea shipped as an off-by-default trial.

## 1. "Study this" names a move that really cost you

**Found by a new evaluator check (C10).** After the bots' games, `eval/recapTruth.eval.ts` replays a
fixed sample of 48 novice/club losses with a deeper engine (30k nodes per position) and asks whether
the recap's lesson names a move that truly lost at least a pawn. About **one in five did not**
(0.81 tune / 0.83 held-out on the corrected evaluator clock — see "Evaluator clock" below; the
first, broken-clock measurement said 0.44). Some blamed the engine's own best move ("38. Kh2 cost
about 9.3 pawns."). The judge is stable across depths and a random-move "lesson" scores 0.03.

**Root cause.** The lesson was the largest dip in the game's eval trace — a 12 ms, depth-3 probe that
swings 40–100 cp with search parity and misses anything deeper than a few plies.

**Shipped.** The trace now only nominates candidates (largest dip right after the move, or after the
rival's actual reply). The four largest are re-checked from their own positions with a fixed
6k-node search: every legal move scored to the same depth, plus the position after the rival's reply.
A move is taught only if the archive preferred a different move and it truly cost ≥ 1 pawn;
otherwise the recap stays silent. Mates read "allowed a forced mate — the archive preferred X" /
"missed a forced mate — X was the finish". The eval arc's red marker is the same move. The check runs
once, just after the verdict sheet opens (~30k nodes in all, ≈0.2 s on the reference phone; the
wall-clock cap is 4× that budget so the verdict is the same on every ordinary device). Engine glue:
`src/app/recap/lessonEngine.ts`; pure logic: `src/app/recap/costliestMoment.ts`.

Six pickers were compared offline on 60 recorded losses (broken-clock traces, so the absolute
numbers are pessimistic; the ranking held on the corrected clock) before choosing (accurate / costliest /
big mistakes left unnamed): current 0.48 / 0.33 / 0; parity-matched trace 0.58 / 0.43 / 0;
verify top-3 at 8k nodes 0.81 / 0.60 / 13; parity + verify 0.85 / 0.66 / 14; **verify + rival's
reply (shipped) 0.89 / 0.65 / 5**.

| C10 (48 sampled losses; same games before/after; corrected clock) | Tune before | Tune after | Held-out before | Held-out after |
| --- | --- | --- | --- | --- |
| Lesson names a move that cost ≥ 1 pawn | 0.81 | 0.98 | 0.83 | 1.00 |
| …the game's costliest move (within 1 pawn) | 0.70 | 0.77 | 0.72 | 0.81 |
| Losses with a ≥ 3-pawn mistake and no lesson | 1 | 3 | 1 | 4 |

(Broken clock, same code: 0.44 → 0.88 and 0.38 → 0.80.) Silence was chosen
over a guess: a version that caps the after-reply search to the root depth (suggested by the review)
is more accurate but silent more often (held-out 0.82 / 6 missed at 10k nodes, 0.95 / 11 at 14k).

Every game check (walls, skill gap, ramp, comebacks, unfinished, puzzles, pacing, rival wait) is
identical before and after.

## 2. The verdict sheet opens on the recap

On phones the verdict overlay focused its first control — Advance, at the foot of a tall sheet — so
the browser scrolled the sheet to the bottom: after a loss the player landed on rank and rating
lines, with the arc and the lesson out of view. The action row is now sticky at the sheet's bottom
edge (safe-area aware, faded background) and focusing it does not scroll, so the sheet opens at the
top with Advance still visible and focused for keyboard users.

## 3. A spent puzzle points to Reset

Playing Chapter I's first puzzle ("take the loose knight") wrong — two bishop moves — lets the knight
take the bishop: a dead draw. The board said "Proof sealed. Continue when Advance appears." but Advance
could never appear, and phones hide Reset in puzzles, so the only way out was Take back. A puzzle
board that ends without the proof now says "Proof spent — no proof from this position. Reset to try
again." and shows Reset on the docked phone row. Found by playing the first minutes as a careless
novice on a phone viewport.

## 4. Trial (off by default): `?try=early-relief`

The evaluator shows a club-strength player losing the first try to most rivals from the third on
(mean first-try score 0.14); rematch relief then gets them through. With the trial on, relief arrives one loss earlier: the first meeting with a
campaign rival is already at step I, the second at II, the third at III. The dossier labels it
"early relief (trial)". Turn it on with `?try=early-relief`, off with `?try=off`; the choice is kept
under its own storage key (`calculus-of-kings-trials-v1`), never in the save.

| Check (off → on), corrected clock, tune seeds | |
| --- | --- |
| Walls (club can't clear in 3 tries) | 2 → 1 |
| Club first-try score (mean over 22 rivals) | 0.14 → 0.23 |
| Club tries per rival | 2.6 → 2.3 |
| Skill gap (first try) | 0.85 → 0.95 |
| Difficulty ramp | 0.22 → 0.68 |
| Comeback rate | 0.27 → 0.24 |
| Unfinished games | 0 → 0 |

On the broken clock it also cleared held-out walls (2 → 0) but showed more unfinished games
(1 → 5); that cost did not reproduce on the corrected clock. Held-out has not been re-run on it.
Left for the owner to try.

## Independent review

A fresh agent reviewed the commits from code alone and found: the trial leaked its eased step into
the in-progress snapshot (fixed: the snapshot keeps the real loss streak, the trial applies at read
time); a phone resize re-hid Reset on a spent puzzle (fixed); the lesson's searches ran in the frame
that paints the final move (fixed: filled in after the sheet opens); a 1.5× wall-clock cap that bound
on slow phones (now 4×); grading a position where the player was not on move (guarded); a mate after
the reply reading as "12.0 pawns" (now "allowed a forced mate"). Open: results won with the trial on
are recorded like any other (no marker in history or rating).

## Evaluator clock (found by the second review)

The evaluator's virtual clock advanced 1024/150 ms per `performance.now()` *read*. Searches also read
the clock at each iteration, so the game's 12 ms eval probe never got past depth 1 in any evaluation
since the evaluator was built, and per-read overhead roughly tripled rivals' measured time. The clock
now reads a new engine node counter (`engineNodesSearched`): virtual ms = nodes / 150. The session's
old and new code were re-measured on it (old: the session's start commit with only the harness and
counter grafted on). Game checks are identical old vs new; the numbers above are from that run.

A second trial, `true-marks` (parity-matched ledger marks), was built from a lab that compared against
depth-1 traces; on the corrected clock the existing ledger marks already meet the new C11 check
(blunder marks right 0.89 / 0.96, mistake marks 0.84 / 0.79, recall 0.87 / 0.84, false alarms 0.02),
so its code was removed.

## Also measured: the difficulty-ramp check was not the problem

Last session guessed the ramp check (C3, then 0.37 on the old clock) was too coarse. Three graded versions (eval at move
30, survival length) all read 0.29–0.37 with split-half reliability ≈ 0.85, so the flat ramp is real:
from the third rival on, the club bot loses most first tries. The check was left unchanged.

## Tests

`costliestMoment.test.ts` (verifier with a fake engine: best move never blamed, reply-aware drop,
silence, mate wording), `gameFlow.depth.test.ts` (real engine: 3. Qxf7+?? taught; a sound move with
a fake trace dip is not), `evalArc.test.ts`, `gameFlow.ai.test.ts` and `applyChessUi.test.ts` (spent
puzzle), `rewardOverlayController.test.ts` (no-scroll focus), `trials.test.ts`,
`rematchRelief.flow.test.ts` (trial, trial never reaches the snapshot), `labModal.test.ts` (Reset
survives a resize), `showRewardBundles.test.ts` (sheet opens before the lesson, then fills it). Each
new test was checked to fail with its fix removed.
