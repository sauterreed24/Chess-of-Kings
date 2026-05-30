---
name: Maximum effort Pass 4 — GameFlow Decomposition + AI Surface Hardening
overview: "A phased maximum-effort wave on `main` that completes the GameFlow decomposition (building directly on the PR1 snapshot replay foundation) while simultaneously hardening the AI surface with feature-complete evaluation, measurable benchmarks, opening bias, and a first-cut Worker path — each slice as a gated PR merging to `main`."
todos:
  - id: pr1-foundation
    content: "PR1: Polish + merge snapshot replay foundation (DRY constants/types, plan artifact, docs pointers)"
    status: completed
  - id: pr2-snapshot-manager
    content: "PR2: Full SnapshotManager (debounced persist, provider contract, failure hook, heavy tests); GameFlow shrink"
    status: completed
  - id: pr3-duel-manager
    content: "PR3: DuelManager extraction (roster, session, tuning, archive) + focused tests; more GameFlow reduction"
    status: completed
  - id: pr4-ai-surface
    content: "PR4: AI surface deep — export + one-tiny-test-per-feature for remaining eval terms, per-phase PST skeleton, benchmark harness (nodes/sec + tactical suite) with before/after numbers, opening bias hooks, first non-breaking Worker adapter + perf delta"
    status: completed
  - id: pr5-campaign-seam-release
    content: "PR5: CampaignOrchestrator seam + final GameFlow LOC target (<1,350), full docs/ARCHITECTURE/CHANGELOG, v0.3.0 release hygiene"
    status: completed
isProject: false
---

# Maximum-effort improvement wave (Pass 4)

## Current baseline (post v0.2.22 + PR1 foundation)

| Signal                        | State |
|-------------------------------|-------|
| Tests                         | **489** passing (quality:gate) after v0.3.0 wave |
| GameFlow.ts                   | **~2,226 lines** — coordinator with four seams (`persistence/`, `duel/`, `campaign/`, AI bench); further shrink is incremental |
| AI / evaluate surface         | Partial Pass 2: pawn structure, bishop pair, rook open file exported+tested. Missing per-phase PSTs, standalone connected pawns, exported mobility/king-safety with dedicated tests, space/tempo, benchmark harness, Worker path (explicitly deferred to this wave) |
| Openings bias                 | Books exist and are used for first ~20 plies; no measurable preference/repertoire tuning yet |
| Persistence seam              | `validateAndReplaySnapshot` pure + 12 tests; full `SnapshotManager` (debounce, SaveData assembly, recovery orchestration) still inside GameFlow |
| Native / Capacitor            | Scaffolding present; no production TestFlight/Play pipeline or native-specific save flush |
| CSS / deploy                  | Stable under budget (16,794 / 16,800 gzip); pages assertions + optional e2e in gate |

```mermaid
flowchart TB
  subgraph pr1 [PR1 Foundation + Polish]
    replay[Pure snapshot replay + tests]
    dry[Centralize IN_PROGRESS_PLY_LIMIT + SnapshotRecoveryState]
    plan[Create official Pass 4 plan artifact]
    docs[README/CONTRIBUTING/ARCHITECTURE pointers]
  end
  subgraph pr2 [PR2 SnapshotManager]
    manager[Full SnapshotManager class + provider contract]
    shrink1[GameFlow persistence removal + tests]
  end
  subgraph pr3 [PR3 DuelManager]
    duel[Duel session/roster/tuning/archive ownership]
    shrink2[Further GameFlow reduction]
  end
  subgraph pr4 [PR4 AI Surface]
    eval[Feature-complete evaluate (per-phase PSTs, connected, mobility, king safety, space/tempo) + one tiny test per feature]
    bench[Benchmark harness + before/after numbers]
    worker[First-cut non-breaking Worker adapter + perf delta]
    openings[Opening repertoire bias hooks + tests]
  end
  subgraph pr5 [PR5 Campaign + Release]
    campaign[CampaignOrchestrator seam]
    final[GameFlow ≤ 1,350 LOC]
    release[v0.3.0 docs + release]
  end
  pr1 --> pr2
  pr2 --> pr3
  pr1 --> pr4
  pr3 --> pr5
  pr4 --> pr5
```

## PR 1 — Foundation polish & wave plan (current in-flight PR)

**Why first:** The pure replay seam is already landed on `cursor/pass4-pr1-snapshot-manager-9ff3` (PR #27). Maximum-effort polish + authoritative plan artifact before merge sets the quality bar and gives future PRs a clear north star.

**Work (polish on top of existing extraction):**
1. DRY: Remove duplicate `IN_PROGRESS_PLY_LIMIT` (gameFlow, storage) and local `SnapshotRecoveryState` type; import from `src/app/persistence/snapshotReplay`.
2. Create `docs/PASS4_GAMEFLOW_AI_MAX_EFFORT_PLAN.md` (modeled exactly on the Pass 3 plan structure, mermaid, per-PR detail, guardrails, success criteria).
3. Update README roadmap + CONTRIBUTING "help wanted" to reference the new plan.
4. Light ARCHITECTURE.md clarification if needed.
5. Full `npm run quality:gate` green.

**Outcome:** Clean, single-source persistence constants/types; authoritative plan document; PR1 ready to merge as the official start of the wave.

---

## PR 2 — SnapshotManager (debounce + provider contract)

**Why:** The replay is pure; the stateful debounce, SaveData assembly, pending snapshot ownership, and `onPersistFailure` hook are still inside the 2,300-line orchestrator. This is the highest-ROI seam per the existing PR1 direction.

**Work:**
1. New `src/app/persistence/SnapshotManager.ts` (class) owning:
   - `pendingInProgressSnapshot`
   - `persist(provider: () => BuildSavePayload)`
   - `flushPersist` (with SYNC_IO test mode)
   - `buildInProgressSnapshot(stateProvider)`
   - Failure callback wiring
2. Strong types: `BuildSavePayload`, `SnapshotStateProvider`.
3. Heavy tests (including quota-exceeded trim path, concurrent calls, duel vs campaign snapshots).
4. Wire GameFlow to delegate; remove the old inline logic.
5. Gate green; `GameFlow.ts` measurably smaller.

**Guardrails:** No behavior change for callers; same `onPersistFailure` UX; all existing recovery tests pass.

**Outcome:** First major GameFlow seam extracted with production-grade tests.

---

## PR 3 — DuelManager

**Why:** Duel state (`duelSession`, `lastDuelSetup`, unlocked sets, roster/archive logic, difficulty recommendation, tuning) is almost completely independent of campaign chapter/scene navigation.

**Work:**
1. `src/app/duel/DuelManager.ts` (or `game/duel/`) owning the above.
2. Public surface compatible with `renderDuelUi.ts` and `showRewardBundles.ts`.
3. Focused tests (roster gating, difficulty recommendation, rematch, archive stamp calculation).
4. GameFlow shrinks further; mountApp calls become thinner.

**Outcome:** Second clean seam; easier future rival-Elo work (Pass 4 deep in CONTRIBUTING).

---

## PR 4 — AI Surface Hardening (the "Pass 2 deep" delivery)

**Why:** This is the #1 "Next (prioritized)" item in both README and CONTRIBUTING. The evaluator is the heart of the AI experience and the clearest path to a measurable strength/story improvement.

**Work (creative + rigorous):**
1. **Evaluation feature completeness**
   - Export `evaluateMobilityBonus`, `evaluateKingSafetyPenalty` + dedicated tiny tests.
   - Promote internal helpers (`knightOutpostBonus`, `rookSeventhBonus`, `kingPressureBonus`, `loosePiecePressureBonus`, `centerControlBonus`) with tiny tests.
   - Add standalone `evaluateConnectedPawnBonus` (currently folded into passed-pawn).
   - Per-phase PST skeleton (opening / middlegame / endgame tables for at least knight/bishop/pawn) + tests.
   - Starter space and tempo terms (even if small) + tests.
2. **Benchmark harness** (new `src/chess/bench/`)
   - Nodes/sec + depth-sweep harness (configurable positions).
   - Tactical suite (mate-in-N, win-material, avoid-blunder) with pass/fail + timing.
   - Publish "before" numbers in the PR; "after" numbers after the eval work.
3. **Opening bias / repertoire hooks**
   - Extend `chooseOpeningBookMove` / profile system so rival-specific books can express preference biases (not just legal moves).
   - 4–6 new tests demonstrating measurable bias in opening choice under different rival profiles.
4. **First-cut Worker adapter (non-breaking)**
   - `src/chess/ai.worker.ts` (or Comlink-style) exposing `findBestMove` async.
   - Feature flag or opt-in in `AiOrchestrator` stub.
   - Benchmark comparison (main-thread vs Worker) on the new harness; numbers in release notes.
5. All changes respect `perf-lean` / reduced-motion where relevant (no new long-running work on main in lean mode).

**Guardrails:** No new runtime dependencies for the core path (Worker is optional). All new tests are deterministic and fast. Existing engine-vs-engine and property tests remain green.

**Outcome:** "Pass 2 deep" delivered with evidence; first real benchmark numbers in the project; foundation for future strength work.

---

## PR 5 — Campaign seam + final reduction + release

**Why:** The last major monolith seam (chapter/scene navigation, advance, rewards, completion tracking) plus the final LOC target and wave closure.

**Work:**
1. `src/app/campaign/CampaignOrchestrator.ts` (or similar) owning `refreshScene`, `advanceScene`, `canAdvance`, jump helpers, reward granting, `newGame`.
2. Final pass to hit GameFlow.ts ≤ 1,350 lines.
3. Full ARCHITECTURE.md update (new directory map + data-flow for the four seams).
4. README/CONTRIBUTING/CHANGELOG updates for v0.3.0 (or v0.2.23 train).
5. Optional: small native note or store-asset checklist if quick wins appear.

**Outcome:** GameFlow is now a thin coordinator. The wave is complete, documented, and releasable.

---

## Success criteria (end of wave)

- `npm run quality:gate` green with **≥ 460** tests.
- `src/app/gameFlow.ts` ≤ **1,350 lines** (from 2,336) with four narrow, heavily tested seams behind facades.
- AI surface: every item in the README/CONTRIBUTING "Pass 2 deep" list has an exported function + at least one dedicated tiny test; benchmark harness exists with published before/after numbers; first Worker adapter with perf delta in release notes.
- All existing behavior (recovery, duel, campaign, AI personalities, ratings, rewards) 100% preserved (no regressions in any test file).
- Full docs (README roadmap, CONTRIBUTING, ARCHITECTURE, CHANGELOG, new plan artifact) updated and consistent.
- One clean release (v0.3.0 or equivalent) with clear "what changed" and benchmark evidence.

## Execution rules (identical to Pass 3)

- Every PR: `cursor/<name>-9ff3`, `npm run quality:gate` (or relevant fast subset + full gate before merge), commit, push, draft PR (use `.github/PULL_REQUEST_TEMPLATE.md`), merge to `main` only after green.
- Bump patch (or minor for v0.3.0) + CHANGELOG slice on each merge.
- No new runtime dependencies on hot paths.
- Respect `html.perf-lean` and reduced-motion.
- At the end of every agent turn with changes: commit + push + create/update the active PR(s) via the management tool before any summary text to the user.

This plan is deliberately ambitious (GameFlow split + real AI measurement + Worker foundation in one wave) yet scoped to be completable in 5 gated PRs while maintaining the project's legendary determinism and quality bar.

**North-star outcome I chose (as delegated):** A dramatically smaller, better-architected GameFlow + the first credible, benchmarked AI surface improvements in the project's history — delivered with the same obsessive attention to tests, docs, and release hygiene that defined Pass 3.