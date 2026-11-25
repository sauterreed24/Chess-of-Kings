---
overview: "v0.5.142: persistence gets you through — each straight loss to a campaign rival eases that rival, visibly, until you win."
---

# Pass 150 — Rematch relief (v0.5.142)

## Findings (measured with the new `npm run eval`)

The campaign only advances on a **win**. A new evaluator (`eval/`) plays every campaign match with
three seeded bots through the real `GameFlow` — novice (greedy 1-ply), club (3-ply, soft sampling),
skilled (40k-node engine) — including retries that feed the game's own loss memory.

- **14 of 21 pre-finale rivals beat the club bot three times running** (held-out seeds: 12). The first
  wall is Edred, the third rival of Chapter I. Several late rivals beat even the skilled bot.
- The existing anti-tilt softening was too small to matter: it starts at two losses, is outweighed
  by the chapter/difficulty ramps, never takes apex rivals out of "engine best move" mode, and the
  "punished tendencies" memory makes a rival *stronger* after it beats you. The scene's `aiDepth`
  was also re-applied as a floor at search time, cancelling any depth relief.

## Shipped

1. **Rematch relief** (`src/app/ai/rematchRelief.ts`, pure). Consecutive losses to the same
   campaign rival step it down (I → II → III): shallower search, a few more bounded misses on top of
   its own rate, apex rivals leave best-move mode, shorter think time. A win clears the streak; a draw
   neither adds nor clears (draws never advance a match). Moves are still persona moves — never random.
2. **First attempts are untouched.** The authored depth floor moved from `runAiTurn` into
   `tuneProfileForMatch` with an identical value, so a fresh rival plays exactly as before;
   ratings, duel modes and the published difficulty are unchanged.
3. **Fixed per game.** The step is read when the board is set up (scene start, Reset, Run it back),
   so undoing a loss does not ease the game in progress.
4. **Visible.** The court dossier line names the step and what changed, e.g.
   "… (rematch relief II: calculates shallower)" or "plays looser" for rivals already on the depth
   floor. The spoken outcome strips the parenthetical.
5. Copy: the Counterpart's note no longer suggests a dead draw seals the era.

## Results (`npm run eval`, tune seeds; held-out in IMPROVE.md)

| Check | Before | After |
| --- | --- | --- |
| Walls (club can't clear in 3 tries) | 14 | 1 |
| Skill gap (first try) | 0.77 | 0.77 |
| Difficulty ramp (first try) | 0.33 | 0.33 |
| Comeback rate | 0.28 | 0.35 |
| Unfinished games | 7/310 | 7/298 |
| Rival wait p95 (virtual ms) | 1768 | 1632 |

## Tests

`rematchRelief.test.ts` (monotone, bounded, every rival affected, streak rules) and
`rematchRelief.flow.test.ts` (dossier label, draw/win rules, undo-after-loss does not ease the
current game, and the rival's actual search profile drops below the scene floor — both fail if the
old floor or a live streak is restored).

## Out of scope / for later

- The first-try ramp is still uneven: Chapter I ends on its two hardest rivals (see IMPROVE.md).
- Matches have no repetition/50-move result, so a won-but-unconverted game needs Reset.
