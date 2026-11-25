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

## Not covered (needs a human or device)
Feel, look, sound, touch controls, real phone engine speed, and whether a rival *feels* fair.
