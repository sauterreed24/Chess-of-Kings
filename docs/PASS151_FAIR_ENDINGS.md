---
overview: "v0.5.143: rivals are the same opponent on every device, hopeless rivals resign in the endgame, and Chapter I's finale stays inside its band."
---

# Pass 151 — Same rival everywhere, honest endings, a fair Chapter I finale (v0.5.143)

All three were open decisions in `IMPROVE.md`; the owner approved the recommendations.
Measured with `npm run eval` (tune seeds; held-out seeds in IMPROVE.md).

## 1. Rival strength is a node budget (device-independent)

Persona think time was wall-clock, so a desktop (~350 engine nodes/ms) gave every rival ~2.3× the
search of a mid-range phone. With rematch relief the club bot hit 1 wall at phone speed but 4 at
desktop speed. `findBestMoveWithProfile` now spends `thinkTimeMs × PERSONA_NODES_PER_MS` (150)
nodes through a new soft/hard `targetNodes` search limit (same "don't start an iteration you can't
finish" rule as the time limit). Wall-clock time (1.5× think time) is only a safety net on very
slow devices. Hints, the UI eval probe and the bots keep their own limits.

- `ai.deviceIndependence.test.ts`: same move and node count at 150 and 350 nodes/ms for four
  tiers (fails 4/4 on the old code).
- Eval: phone-speed walls 1 → 3 (inside the ±2 noise band; budgets are now exact rather than
  shaved by clock overhead); desktop-speed walls 4 → 2.

## 2. A hopeless rival resigns — in the endgame

Matches have no move cap, so a player who was winning but couldn't yet mate had to press Reset.
On its turn, a rival resigns when **all** hold: endgame (≤ 8 pieces besides kings), at least a
queen's worth of material down on each of its last three turns (read from the recorded positions),
and a fixed 4,000-node confirming search scores it ≥ 9 pawns lost (so counterplay fights on). No
wall clock is involved, so the decision is the same on every device. It is a win (rewards, rating,
recap, scene advance); the status pill reads "Rival resigned" and the announcement says so. A
resignation is final (undo is blocked; Reset / Run it back start a new game) and is saved in the
in-progress snapshot, so a reload before Advance restores the finished board without recording the
result twice.

- First version without the endgame condition: rivals resigned middlegames after dropping a queen to
  a beginner (skill gap 0.78 → 0.58; the novice bot beat Iota and Wren first try). Rejected.
- Eval: unfinished games 2 → 1 (7 at the round-1 baseline); all other checks unchanged.

## 3. Chapter I finale inside the chapter's band

Chapter I ended on its two hardest first-try rivals (Demetrios = Advisor Boss; the Counterpart =
apex best-move) while Chapter II restarts at an initiate rival. New data field
`MatchScene.strengthCapSceneId`: Demetrios and the Counterpart play no stronger than Marius
(veteran) as authored — ignoring the player's record against Marius — depth, think time, alertness, conversion, misses — while keeping their own
style, book and scripted lines. Their displayed difficulty, trait bars, rank points and rating follow the cap
(3/5). Story tiers and rematch relief are unchanged.

- Eval: walls 3 → 2 (Demetrios no longer a wall); club first-game survival vs Demetrios ~59 → 93
  plies, vs the Counterpart ~59 → 79 (two games each; estimate). The ramp check did not move — its
  first-try outcomes are win/loss for most rivals, too coarse to see this; refining it is next.

## Independent review

A fresh agent reviewed the three commits from code alone. It found two bugs (a resignation lost on
reload, which would have recorded the win twice; undo after a resignation froze the board) and
several risks (device-dependent resign decision, 2× slow-device wait, cap drifting with the player's
record vs Marius). All fixed in `fix(play): pass 151 review fixes`; the scorecard is unchanged.

## Tests

`ai.deviceIndependence.test.ts`, `ai/resignation.test.ts`, `resignation.flow.test.ts`,
`strengthCap.test.ts` (each verified to fail when its feature is removed).
