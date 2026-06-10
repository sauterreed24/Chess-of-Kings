# Search benchmark baseline

## Crown Engine v2 (2026-06-10, cloud CI container, jsdom)

Throughput comparison at a fixed **300 ms** budget per position
(`npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts`):

| Position | Crown v2 nodes (depth) | Legacy nodes |
|----------|------------------------|--------------|
| start | 21,705 (d6) | 512 |
| italian | 34,573 (d6) | 384 |
| kiwipete | 19,756 (d4) | 256 |
| rook endgame | 123,078 (d8) | 1,151 |

Head-to-head match at 200 ms/move
(`CROWN_MATCH=1 npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts`):
**Crown 8 — Legacy 0** (no draws).

Persona ladder at 120 ms/move
(`CROWN_MATCH=1 npx vitest run src/chess/ai.persona.test.ts`):
**veteran_scholar 6 — novice_court 0**.

Paste fresh before/after rows here whenever tuning evaluation or search;
the always-on throughput gate asserts Crown ≥ 10× legacy nodes.

## Historic (legacy engine, Pass 4 PR4)

Recorded with `runSearchBench({ depth: 3, timeLimitMs: 1200 })`; the
harness asserts **nodes > 0** and **legal SAN** per row. Re-run via:

```bash
npm run test:deterministic -- src/chess/bench/searchBench.test.ts
```
