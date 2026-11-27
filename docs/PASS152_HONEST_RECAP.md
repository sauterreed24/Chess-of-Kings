---
overview: "v0.5.144: the recap's lesson names a move that really cost you, the verdict sheet opens on it, and a failed puzzle no longer strands phone players."
---

# Pass 152 — An honest recap, a recap you can see, no stuck puzzles (v0.5.144)

Session 3 of the improvement loop (`IMPROVE.md`). One round: a new readability check, two fixes a
player meets in the first minutes, and one balance idea shipped as an off-by-default trial.

## 1. "Study this" names a move that really cost you

**Found by a new evaluator check (C10).** After the bots' games, `eval/recapTruth.eval.ts` replays a
fixed sample of 48 novice/club losses with a deeper engine (30k nodes per position) and asks whether
the recap's lesson names a move that truly lost at least a pawn. Only **44%** did. Some blamed the
engine's own best move ("38. Kh2 cost about 9.3 pawns."). The judge is stable (44% at 90k nodes
too) and a random-move "lesson" scores 3%.

**Root cause.** The lesson was the largest dip in the game's eval trace — a 12 ms, depth-3 probe that
swings 40–100 cp with search parity and misses anything deeper than a few plies.

**Shipped.** The trace now only nominates candidates (largest dip right after the move, or after the
rival's actual reply). The four largest are re-checked from their own positions with a fixed
6k-node search: every legal move scored to the same depth, plus the position after the rival's reply.
A move is taught only if the archive preferred a different move and it truly cost ≥ 1 pawn;
otherwise the recap stays silent. Mates read "allowed a forced mate — the archive preferred X" /
"missed a forced mate — X was the finish". The eval arc's red marker is the same move. The check runs
once, when the recap is first read (~30k nodes, no wall clock, the same on every device).

Six pickers were compared offline on 60 recorded losses before choosing (accurate / costliest /
big mistakes left unnamed): current 0.48 / 0.33 / 0; parity-matched trace 0.58 / 0.43 / 0;
verify top-3 at 8k nodes 0.81 / 0.60 / 13; parity + verify 0.85 / 0.66 / 14; **verify + rival's
reply (shipped) 0.89 / 0.65 / 5**.

| C10 (tune, same 48 games) | Before | After |
| --- | --- | --- |
| Lesson names a move that cost ≥ 1 pawn | 0.44 | 0.88 |
| …the game's costliest move (within 1 pawn) | 0.35 | 0.70 |
| Losses with a ≥ 3-pawn mistake and no lesson | 0 | 3 (all 3 previously got a wrong lesson) |

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

The evaluator shows a club-strength player losing the first try to 18 of 22 rivals; rematch relief
then gets them through. With the trial on, relief arrives one loss earlier: the first meeting with a
campaign rival is already at step I, the second at II, the third at III. The dossier labels it
"early relief (trial)". Turn it on with `?try=early-relief`, off with `?try=off`; the choice is kept
under its own storage key (`calculus-of-kings-trials-v1`), never in the save.

## Also measured: the difficulty-ramp check was not the problem

Last session guessed the ramp check (C3, 0.37) was too coarse. Three graded versions (eval at move
30, survival length) all read 0.29–0.37 with split-half reliability ≈ 0.85, so the flat ramp is real:
from the third rival on, the club bot loses most first tries. The check was left unchanged.

## Tests

`costliestMoment.test.ts` (verifier with a fake engine: best move never blamed, reply-aware drop,
silence, mate wording), `gameFlow.depth.test.ts` (real engine: 3. Qxf7+?? taught; a sound move with
a fake trace dip is not), `evalArc.test.ts`, `gameFlow.ai.test.ts` and `applyChessUi.test.ts` (spent
puzzle), `rewardOverlayController.test.ts` (no-scroll focus), `trials.test.ts`,
`rematchRelief.flow.test.ts` (trial). Each new test was checked to fail with its fix removed.
