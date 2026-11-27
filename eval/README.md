# eval/ — automated playtest evaluator

`npm run eval` plays the real campaign (`GameFlow`, rival personas, opening scripts and books,
retries that feed the game's loss memory, puzzles) with three seeded bot players and prints the
scorecard from `IMPROVE.md`.

| bot | model | rough meaning |
| --- | --- | --- |
| novice | greedy 1-ply, avoids obvious hangs, takes mate-in-1 | just learned the rules |
| club | 3-ply spectrum search, samples within ~0.9 pawn (T=35cp) | casual player who sees simple tactics |
| skilled | 40k-node engine, best move | strong club player |

All bots see the game history (repetition-aware) and, in puzzles, read the goal: if one move
achieves a "castle / piece on square / mate" goal they play it, as a player reading the card would.

## C10 recap truth (readability)
After the games, `recapTruth.eval.ts` replays a fixed, evenly spaced sample of novice/club losses
(48; 16 with `--quick`) with a deeper engine (30k nodes per position, fresh table, no clock) and
asks whether the recap's "Study this" lesson names a move that truly cost >= 1 pawn (*accurate*),
the game's truly costliest move within 1 pawn (*top*), and how many losses with a >= 3-pawn mistake
got no lesson (*missed*). The judge is stable: 0.44 accurate at both 30k and 90k nodes on the
same games; a random-move "lesson" scores 0.03. Records now carry each game's start FEN, moves and
player-POV trace so any check can replay games without re-playing them.

## C11 ledger marks (readability)
The same replay scores the move ledger's live marks (`marks` in each record = what the player saw)
on positions not already decided (|deep eval| < 9 pawns): blunder marks that truly cost ≥ 1.5 pawns,
mistake marks that cost ≥ 0.6, recall of ≥ 3-pawn moves, and quiet moves (≤ 0.2) marked
mistake/blunder (false alarms).

## Determinism
- `Math.random` is reseeded per job from `<seedset>:<scene>:<bot>:<series>`.
- `performance.now` is a virtual clock that advances 1024/150 ms per call; the engine checks
  time every 1024 nodes, so every think-time budget becomes "nodes on a 150 nodes/ms device".
  Override with `EVAL_NODES_PER_MS` (this container: ~350 real nodes/ms).
- Two runs with the same seed set produce identical records except `inputLatencyRealMs`.

## Options
- `--seedset tune|holdout|<any>` — `tune` for iteration, `holdout` only to confirm a kept change.
- `--label name` — result file name (`eval/results/<label>.json`).
- `--quick` — 1 series per scene×bot instead of 2.
- Env: `EVAL_ONLY=<scene id substring>`, `EVAL_BOTS=club,skilled`, `EVAL_ATTEMPTS` (default 3),
  `EVAL_SERIES`, `EVAL_VERBOSE=1` (per-series lines).
- `node eval/run.mjs --compare eval/results/a.json eval/results/b.json`.
- `node eval/rescore.mjs <label> [newLabel]` — re-score saved records after fixing a check.
- `node eval/run.mjs --label <label> --recap-only` — re-run only the C10 replay on saved records
  (`EVAL_RECAP_SAMPLE`, `EVAL_RECAP_NODES` to vary sample size and judge depth).

## Not covered (needs a human or device)
Feel, look, sound, touch controls, real phone engine speed, and whether a rival *feels* fair.
