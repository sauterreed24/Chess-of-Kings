# Baseline — pre-Crown-Engine-v2 (recorded 2026-06-10)

All numbers measured on the cloud CI container (Node 22, jsdom vitest
environment) at commit `15c44c4`, before any engine changes.

## Health gates

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm test` | 69 files, 562 tests, all pass, 104.6s |
| `npm run build` + bundle report | `index.js` 92,152 gzip / 92,160 budget (8 bytes headroom), worker 16,765, CSS 17,600/17,600 |

## Legacy engine throughput (the core problem)

Measured with `src/chess/engine/crownVsLegacy.bench.test.ts` at a fixed
300 ms budget per position (legacy = `findBestMove` in what is now
`src/chess/legacyAi.ts`):

| Position | Legacy nodes in 300 ms |
| --- | --- |
| start | 512 |
| italian | 384 |
| kiwipete | 256 |
| rook endgame | 1,151 |

Root cause: every node re-ran chess.js `moves({ verbose: true })` (which
computes SAN strings, each needing internal make/unmake) and every leaf
rebuilt a BigInt bitboard analysis from scratch (`analyzePosition`). The
nominal "depth 5" profiles could rarely complete depth 3 inside their
1.4–1.8 s budgets.

## Legacy quality traits

- **Strength**: lost 0–8 vs Crown v2 at equal 200 ms/move (see EVIDENCE in
  CROWN_ENGINE_V2_SPEC.md); never illegal, but profile layer could veto the
  search result using a 1-ply heuristic ("blunder guard"), and weak levels
  blundered by playing a uniformly random legal move (`blunderRate` up to
  20% at novice — including instant queen-hangs unrelated to the position).
- **Latency**: duel/match search ran synchronously on the main thread
  (up to ~1.8 s UI freeze per AI move). Worker existed but was opt-in via
  localStorage and only used for puzzles.
- **Test coverage**: legality/property tests existed; no perft, no
  mate-in-N fixtures beyond one mate-in-1, no strength or latency gates,
  benchmark harness recorded nodes only.
- **Race conditions**: `executeAiTurn` cleared `aiThinking` before the
  async turn ran; worker responses had no position-match guard.

## Reproduce

```bash
git checkout 15c44c4
npm ci && npm test && npm run build && node scripts/report-bundle-gzip.mjs
# throughput comparison (from the engine branch):
npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts
```
