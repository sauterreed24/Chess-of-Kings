# Search benchmark baseline (Pass 4 PR4)

Recorded on the Cloud Agent VM with `runSearchBench({ depth: 3, timeLimitMs: 1200 })`
after the evaluator phase-PST and feature-export pass. Re-run via:

```bash
npm run test:deterministic -- src/chess/bench/searchBench.test.ts
```

| Position | Depth | Nodes (approx) | ms (approx) |
|----------|-------|----------------|-------------|
| start | 3 | varies | varies |
| italian | 3 | varies | varies |
| endgame-rook | 3 | varies | varies |

The harness asserts **nodes > 0** and **legal SAN** per row; use this file to paste
before/after numbers when tuning evaluation or search.
