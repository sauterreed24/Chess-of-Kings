---
overview: "v0.5.138: four teaching puzzles now match their lessons, puzzle invariants are locked, the recap tells the truth after a resume, and landscape phones get a full-height board."
---

# Pass 146 — Honest puzzles, truthful recap, landscape board (v0.5.138)

A play audit continued past the Prologue: every campaign puzzle was solved mechanically and checked against its own teaching text, a Chapter I match was won to the victory recap on desktop and phone, and the calibration and Duel boards were played on iPhone 13, iPhone 14 Pro Max, and Pixel 7 in landscape.

## Findings

1. **Four puzzles taught something the board contradicted.** The game seals a puzzle as soon as the player's move meets the goal, before the reply, so these all "passed":
   - `c1-tutorial-hanging` — the first chess puzzle of Chapter I. The black king on e5 stood next to d4, so after Bxd4+ it simply took back (material −75, king vs king). The lesson said "the check forces the king away before it can recapture."
   - `c4-puzzle-battery` — described a queen-and-fianchetto-bishop battery on the long diagonal; the queen was on h3, and Qc8# was a plain back-rank mate with the bishop idle.
   - `c8-puzzle-file` — the lesson is "take g7 with the queen", but Qc8# also mated.
   - `c9-puzzle-compile` — "fork king and queen with Nd6+", but the c7 pawn captured the knight.
2. **The recap said "Next seal" twice**, as "in 110 RP" and "at 140 RP", and the bar had no accessible value.
3. **After a resume, the turning point was usually "1. e4".** The eval trace is session-only; the fallback named the first move graded "good".
4. **Landscape phones (≈750×342) had a 146px board** under the coach text, with the duel board clipped behind the lab bar. The fit read the board's on-screen top, which was wrong both mid-way through the lab's slide-in and after the duel lab scrolled the board into view. The reveal then aligned the bottom of the taller stage and hid the top ranks.

## Shipped

1. **Rebuilt positions** (data only; ids and goals unchanged):
   - Hanging knight: `8/8/5k2/8/3n4/2B5/8/3K4 w`. Bxd4+ keeps +307 after the best reply. Lesson, why-it-works, and Reed's follow-up line now explain that nothing can take back.
   - Battery: `k2r4/pp6/8/8/8/5QP1/5PBP/6K1 w`. Qxb7# is the only mate, and it works because the g2-bishop guards b7 from behind the queen.
   - Notarized finish: a black rook on d8 guards c8; Qxg7# is the only mate.
   - Compiled fork: the black pawn starts on c6, so Nd6+ cannot be captured.
2. **Puzzle invariants** in `chapters.validation.test.ts`: every advantage-goal move the game accepts keeps the threshold after the opponent's best one-move reply, and no piece-placement goal (other than castling) leaves the placed piece capturable. Both fail on the old data.
3. **Recap** — one "Next seal: X · N RP to go (T RP)" line, labelling a `role="progressbar"` with min/max/now. Turning-point fallback order: brilliant → blunder → mistake → good → last move.
4. **Landscape layout** — inside the existing short-viewport block, `(max-width: 960px) and (orientation: landscape)` lays the instrument out as two columns: the board stage on the left, everything else beside it.
5. **Board fit** — `applyMobileBoardFit` caps the board at the visible band of its nearest scroll container, measured at rest (pending ancestor `translateY` is subtracted). The compact reveal now sizes first, then scrolls the board frame (not the whole stage) into view with `nearest`.
6. **Bundle** — `duelRoster.ts` and `rewards.ts` are type-only data modules and join the modulepreloaded `game-data` chunk, as `chapters`/`rivals` already do: index JS gzip 101,374 → 94,606 (budget 101,376). Fourteen palette custom properties with no references anywhere were removed; the documented semantic tokens stay. CSS gzip 18,327 (budget 18,400).

## Playtest notes

| Surface | Before | After |
| --- | --- | --- |
| iPhone 13 landscape calibration | 146px board below the coach | 203px board, left column, fully visible |
| iPhone 13 landscape duel | 312px board, top ranks behind lab bar | 202px, fully visible |
| iPhone 14 Pro Max landscape | 146px | 241px |
| iPhone 13 portrait | 317px calibration | unchanged |
| iPad Mini, desktop | — | unchanged |

- Hanging knight played in the browser: Bxd4+ seals the proof and the knight stays won.
- Chapter IV playthrough reaches Nysa via the new Qxb7#.
- Victory recap after a resumed Scholar's Mate names 3... Nf6 as the turning point.

## Out of scope

- Hiding the global top bar in the landscape lab (the portrait phone nav logic also drives hit targets and sheet sizing).
- Persisting the eval trace across resumes (save-format change).
- Merging duplicated top-level CSS selectors (cascade-order risk for a few bytes).
