# Engine memory — durable facts, decisions, lessons

Confirmed facts and decisions for future engine work. Keep entries short,
dated, and only when durable.

## Architecture facts (confirmed 2026-06-10)

- App is a Vite/TS PWA, plain DOM, chess.js as the sole runtime dep.
  Repo invariant: chess.js stays the legality oracle; Crown v2 satisfies
  it via boundary validation + perft/cross-validation equivalence tests.
- Per-file gzip JS budget enforced in CI; ratcheted 90 → 96 KiB for Crown
  v2 (engine nets +4.8 KiB after legacy search left the app bundle).
- `vitest.setup.ts` seeds `Math.random` per test — persona sampling is
  deterministic in tests; the engine core itself uses no RNG.
- `this.chess` in GameFlow is one long-lived mutated instance; any async
  AI work MUST be epoch-guarded (`aiTurnEpoch`, host `isTurnCurrent`).
- jsdom defines no `Worker`; auto surface resolves to main thread in
  tests, Worker in browsers.

## Benchmarks (cloud CI container, jsdom)

- Legacy engine: 256–1,151 nodes per 300 ms. Crown v2: 20k–123k nodes per
  300 ms (depth 6–8). Match: Crown 8–0 legacy @200 ms/move. Ladder:
  veteran 6–0 novice @120 ms.

## Decisions

- 0x88 mailbox over BigInt bitboards: BigInt ops allocate and are slow in
  V8; typed-array 0x88 with incremental tapered accumulators is the right
  substrate for hand-written JS engines.
- Difficulty = Boltzmann sampling over exact root spectra with a hard
  centipawn-drop cap + bounded "miss" (shallower re-search) and
  "oversight" (band-tail) episodes. Never uniform-random moves.
- Conversion mode (win ≥ 500 cp in endgame → deeper, tighter, no
  oversights) is required: without it, high-temperature personas shuffle
  won endgames into the fifty-move rule (caught by KQ-vs-K test).
- Personality biases are bounded (±40 cp) and applied only inside the
  safe band, so style can never out-vote tactics.
- Legacy engine kept at `src/chess/legacyAi.ts` strictly as a benchmark
  baseline (tree-shaken; only tests import it).

## Deferred (reviewed, consciously not done)

- Per-node `moves[]`/`scores[]` allocations in search: preallocated
  per-ply stacks would cut GC pressure and raise NPS further; deferred
  because current throughput already meets budgets and the refactor
  touches the hottest proven-correct loops.
- Conversion mode is a boolean cliff at ≥500cp/endgame; a continuous
  drop-cap/temperature curve over advantage would be smoother. Cross-root
  repetition awareness already covers the worst symptom (shuffle draws).
- Persona-internal opening-book override duplicates the controller-level
  book gate; kept because the deterministic inner pick is a documented
  test contract (ai.opening-bias.test.ts) and the outer gate normally
  resolves first.
- Within-game TT path-dependence (repetition-tainted parent scores) is
  standard engine practice; cross-GAME pollution is prevented by
  `resetAiGameContext()` on scene/duel start (both surfaces).

## Lessons

- chess.js `moves({ verbose: true })` computes SAN per move (internal
  make/unmake each) — never call it per search node.
- Root "spectrum" search (full-window per root move) is affordable at
  persona depths and makes the difficulty math clean; don't try to reuse
  fail-low bounds for sampling — bounds are not values and will pick
  hidden blunders.
- Aspiration windows must re-search on fail with widening, and root
  partial iterations must be discarded whole.
- TT mate scores must be ply-corrected on store AND probe.
