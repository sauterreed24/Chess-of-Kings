# Repo Map — The Calculus of Kings (Chess of Kings)

> Discovery snapshot taken 2026-06-10, before and during the Crown Engine v2
> work. For the living architecture document see `src/ARCHITECTURE.md`.

## Platform and runtime

- **Static PWA**: Vite + TypeScript (strict), plain DOM + one CSS file. No
  framework, no router, no state library, no backend.
- **Mobile**: Capacitor shells for Android/iOS (`android/`, `ios/`),
  deployed web build on GitHub Pages.
- **Runtime dependency**: `chess.js` only (legality oracle). Everything else
  is dev tooling.
- **Hard constraints**: per-file gzip JS budget enforced in CI
  (`scripts/report-bundle-gzip.mjs`), offline-first, deterministic tests
  (seeded `Math.random` in `vitest.setup.ts`), accessibility invariants.

## Game-core layout (after Crown Engine v2)

| Area | Files |
| --- | --- |
| Rules oracle | `chess.js` (npm). All user/AI moves validated through it. |
| Engine core | `src/chess/engine/position.ts` (0x88 board, make/unmake, Zobrist), `engine/evaluate.ts` (tapered eval), `engine/search.ts` (ID + PVS + TT + quiescence), `engine/perft.ts`, `engine/index.ts` (FEN-in / coordinates-out facade). |
| Persona layer | `src/chess/ai.ts` — difficulty model over engine spectra. |
| Legacy engine | `src/chess/legacyAi.ts` — benchmark baseline only, not bundled. |
| Async host | `src/chess/aiAsync.ts` + `src/chess/workers/aiSearch.worker.ts` — Worker-by-default search with stale guards. |
| Profiles/books | `src/chess/aiProfiles.ts`, `src/chess/openings.ts`, `src/chess/rivalOpeningBias.ts`. |
| Eval bar / insights | `src/chess/evaluate.ts` + `src/chess/bitboard.ts` (per-user-move UI evaluation), `src/chess/motifs.ts`, `src/app/moveInsight.ts`, `src/app/hangingInsight.ts`. |
| Orchestration | `src/app/gameFlow.ts` (2k-line coordinator), `src/app/ai/aiTurnController.ts` (AI turn dispatch per mode). |
| Board UI | `src/chess/boardView.ts` (keyboard nav, ARIA, promotion picker, animations). |
| Persistence | `src/app/storage.ts` (versioned saves), `src/app/persistence/` (debounced snapshots). |

## AI turn call chain

```
tryPlayerMove → scheduleAiMove (pacing timer, aiThinking=true)
  → executeAiTurn (keeps aiThinking until async turn settles; epoch-guarded)
    → runAiTurn(host)                       [aiTurnController.ts]
       duel/match: opening book → findBestMoveWithProfileAsync (Worker)
       puzzle:     findBestMoveAsync (Worker)
       fallback:   findRandomMove (last resort only)
    → host.commitEngineMove → chess.js validates → UI/persist/emit
```

Difficulty flows from data (`chapters.ts` / `duelRoster.ts` / difficulty
band) → `AI_PROFILES` → phase adaptation + per-rival tuning (gameFlow) →
persona layer parameters (depth, temperature, drop cap, oversight rate).

## Test and gate commands

- `npm test` — full deterministic suite.
- `npm run quality:gate` — lint, typecheck, tests, UI smoke, build, pages
  assertions, bundle budgets (CI merge gate).
- `npx vitest run src/chess/engine` — engine correctness (perft,
  cross-validation, search behavior, throughput vs legacy).
- `CROWN_MATCH=1 npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts`
  — full old-vs-new match (slow; evidence runs).
- `CROWN_MATCH=1 npx vitest run src/chess/ai.persona.test.ts` — difficulty
  ladder match.

## Constraints that shaped the engine design

1. `chess.js` must remain the legality oracle (ARCHITECTURE invariant 5) —
   hence boundary validation + perft/cross-validation equivalence proofs
   rather than replacing the oracle.
2. Zero new runtime dependencies — engine is hand-written TypeScript.
3. Per-file gzip budget — engine had to fit in a few KiB (it nets +4.8 KiB
   after the legacy search left the bundle; budget ratcheted 90→96 KiB).
4. Deterministic tests — engine core has zero randomness; persona sampling
   uses the seeded `Math.random`.
5. Low-power devices — typed arrays, no BigInt in hot paths, Worker default.

## Improvement opportunities found during discovery (status)

- Search walked chess.js with SAN generation per node (~1–4k nodes/s) — **fixed** (0x88 core, ~70–400k nodes/s in jsdom).
- 1-ply heuristic could veto the search result — **removed**.
- Weak levels blundered via uniform random moves — **replaced** (bounded Boltzmann model).
- Worker opt-in only; duel/match search blocked the main thread — **fixed** (Worker by default everywhere, stale-guarded).
- `executeAiTurn` cleared `aiThinking` before the async turn ran (player could move mid-AI-turn) — **fixed** (flag held through turn, epoch guard).
- Worker responses lacked a position-match guard — **fixed** (FEN echo + live-board re-validation).
- No perft, no mate-in-N tests, no strength measurement — **added**.
- `jumpToScene` stale-snapshot ordering (AUDIT-2026-04 #1) — **already fixed
  upstream**; covered by the "jumpToScene persists the destination scene
  state" regression test in `gameFlow.ai.test.ts` (the audit doc predates
  the fix).
- Known remaining (documented, not in scope): no player Elo persistence,
  GameFlow size.
