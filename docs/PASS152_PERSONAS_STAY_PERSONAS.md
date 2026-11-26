---
overview: "v0.5.144: veteran rivals keep their personalities instead of turning into best-move engines, and a lost campaign game tells you what the rematch will ease."
---

# Pass 152 — Personas stay personas (v0.5.144)

## Finding

Rivals below the apex tier pick moves by sampling near-best moves with their own style bias and
occasional bounded misses. Rivals at conversion strictness ≥ 0.95 skip all that and play the
engine's best move. The campaign's chapter and difficulty ramps add to strictness, and from
Chapter II on they pushed **14 of 16 rivals** past 0.95, including veterans authored at 0.62–0.90.
Most of the campaign was depth-capped engines, and several veterans (Gage, Prax, Nysa) were harder
than their chapter's boss (graded first-try difficulty 0.72–0.76 vs the finale's 0.55).

## Shipped

1. **Apex is for bosses.** Ramps may raise strictness only to just below apex unless the rival
   is a chapter boss/counterpart or was authored at apex strictness (Helia, Iota, Wren, Bram).
   The Chapter I finale stays capped to Marius (a veteran), so it stays below apex too.
   Duels are unchanged.
2. **The rematch is announced.** After a campaign loss the mentor line ends with what the next
   attempt eases, compared with the game just played: "Rematch: rematch relief I: calculates
   shallower." or "… plays looser." when depth doesn't fall. Nothing is added at the top step.
3. **Evaluator:** the difficulty-ramp check is graded (a lost first game earns credit for plies
   survived), proven on deliberately broken orders.

## Results (`npm run eval`, tune / holdout)

| Check | Before | After |
| --- | --- | --- |
| Skill gap (skilled − novice, first try) | 0.78 / 0.76 | 0.86 / 0.89 |
| Walls (club can't clear in 3 tries) | 2 / 2 | 1 / 2 |
| Ramp (graded; pooled) | 0.30 / 0.51 (0.41) | 0.26 / 0.48 (0.33), within noise |
| Comebacks | 0.32 / 0.27 | 0.31 / 0.22 |
| Unfinished | 1 / 0 | 1 / 0 |

A stricter version (only authored-apex rivals may play best-move) reached skill gap 0.91 but
lowered the ramp to 0.28 pooled; it is recorded in IMPROVE.md as an alternative.

## Tests

`apexGate.test.ts` (no non-boss rival reaches apex in any phase, with a real endgame on the board;
spot checks for veterans, apex bosses and the capped finale) and `reliefPreview.test.ts` (real lost
games at streaks 0–3, including the step-II and depth-floor wording). Both fail with their feature
removed. An independent review found no bugs; its wording and test-coverage notes are fixed.
