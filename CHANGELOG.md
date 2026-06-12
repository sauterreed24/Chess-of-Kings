# Changelog

All notable changes to The Calculus of Kings.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project follows pragmatic semantic versioning at the package
level (the save format has its own version field — see
`src/app/storage.ts`).

---

## [Unreleased]

- **Retention wave: a rival worth playing again** — (1) *Reply cadence*: rivals now ponder like players, not vending machines — recaptures snap back, book moves come briskly, quiet committal decisions earn a real pause scaled to each rival's temperament (pure presentation in `app/ai/replyCadence.ts`; the engine's own search time counts toward the pause; disabled under vitest). (2) *Rivals speak after games*: the dormant talk-line system is finally wired — win and they concede the punishment (or sound rattled on your streak), lose and they get audacious, draw and they nod; the line lands on the board ticker and the verdict recap. (3) *Run it back*: a one-tap rematch button appears on any lost or drawn board — duels restart the pairing, campaign scenes reload — so a loss invites the next attempt instead of a menu crawl. (4) *Difficulty staircase, measured*: a gated calibration harness (`CROWN_MATCH=1`, greedy-beginner proxy) exposed a cliff at the second rival (8/8 vs beginners); the apprentice tier was re-tuned (depth 2, more oversights) giving a climbable novice 5.5 → apprentice 6.5 → veteran 8 ramp. (5) *Story hooks*: the Edred aftermath now shows the court reacting instead of memo-ing it, and both chapter seals end on forward pulls (the ledger-keepers reading Reed's file; a committee deciding what he is) instead of "the archive waits". JS gzip budget 96 → 98 KiB (documented).
- **Engine-truthful move grading + real turning points** — move quality (ledger glyphs, coach tips, style grade) is now judged by engine probes that bracket the player's move, so the score already accounts for the opponent's best reply: a capture that loses the queen to the recapture finally grades as a blunder, and a sound sacrifice (material offered while the engine approves) earns `brilliant` instead of `blunder` — the coach no longer scolds engine-approved offers. A mercy rule keeps sloppy-but-still-winning conversion at `inaccuracy`. Pure grading lives in `src/app/moveGrading.ts`. The style grade is now an average over graded moves (no more length inflation), and the recap's "Turning point" names the ply with the largest eval swing toward the player (from a new session-only per-ply eval trace) instead of defaulting to the first decent move.
- **Engine speedup: evaluation cache + zero-allocation search tree** — static evaluations are memoized by Zobrist hash (~2× nodes/sec) and the search tree now uses preallocated per-ply move stacks (no per-node allocation, no GC pauses inside the time budget). Net effect at unchanged time budgets: +1–2 plies of depth (e.g., rook endgames now reach depth 10 vs 8 in 300 ms); search results remain bit-identical at fixed depth. Strength harnesses re-verified (crown 8–0 legacy, veteran 6–0 novice).
- **Tactically truthful eval readout** — the eval bar now uses a bounded engine probe (depth 3, ≤12 ms, memoized per position) instead of bare material counting, so it reacts to hanging pieces and mate threats instead of reading "+0.0" while a queen is en prise.
- **Crown Engine v2** (`src/chess/engine/`) — in-house 0x88 search core replacing the chess.js-walking alpha-beta: incremental Zobrist hashing, typed-array transposition table, PVS + iterative deepening + quiescence, null-move/LMR/futility pruning, killer/history ordering, aspiration windows, soft/hard time management with instability extension. **40–110× node throughput** at equal budget; won an 8–0 match vs the legacy engine at 200 ms/move. Legality is proven against chess.js by perft reference fixtures and randomized cross-validation; every AI move is still validated through chess.js before touching game state. Legacy engine retained at `src/chess/legacyAi.ts` as a tree-shaken benchmark baseline.
- **Human-like difficulty model** (`src/chess/ai.ts`) — personas now Boltzmann-sample from exact root-move scores inside a bounded centipawn band, with "missed-depth" and bounded "oversight" episodes replacing uniform-random blunders; a conversion mode tightens play in won endgames (KQ-vs-K now converts at every tier); style/risk flavor is capped at ±40 cp so personality can never out-vote tactics. Apex tiers play the engine's best move.
- **AI off the main thread by default** — duel and match searches now run in the Web Worker when available (previously puzzle-only and opt-in); worker replies carry a FEN echo and are re-validated against the live board, a watchdog falls back to main-thread search if a worker is killed mid-think, and `GameFlow` holds `aiThinking` through the whole async turn with an epoch guard (enforced again with rollback at `commitEngineMove`) so scene changes can never receive a stale AI move. Note: the `cok-ai-worker` localStorage preference changed semantics — unset now means "auto (worker when available)"; an explicit `'0'` forces main-thread search.
- **Puzzle defenders stay calibrated** — puzzle opponents now play through tier-matched personas (`opponentAiDepth` 1/2/3 → novice/apprentice/scholar courts) instead of the full-strength engine, preserving the bait-accepting behavior puzzle solutions rely on; `opponentAiStyle` now meaningfully flavors them. Engine caches are reset between games so path-dependent repetition scores never leak across rematches.
- **Engine test firewall** — perft suite (6 reference positions), chess.js cross-validation playouts, mate-in-1/2 and tactics fixtures, determinism and time-budget gates, persona-behavior tests, and gated strength harnesses (`CROWN_MATCH=1`: crown-vs-legacy match, novice-vs-veteran ladder). JS gzip budget ratcheted 90 → 96 KiB (engine nets +4.8 KiB); engine design docs in `docs/fable/`.
- Per-rival **archive calibration rating** on `RivalMemoryEntry` (persisted, dossier-visible), updated after each logged duel/ladder result.
- **Rival opening SAN bias** in `chooseOpeningBookMove` (wired through `aiTurnController` for duel + campaign).
- **Alexandrine Imperial** UI polish (`style-alexandrine-imperial.css`): budget-conscious layer on the Hellenistic palette — stratarchic chrome, lapis/gold ambient bloom, forged buttons, archive lab scrim, duel/reward accents (no neon cyber accents). CSS gzip gate raised to **17600** B (base sheet was already at ~16.8 KiB).
- **mountApp** advance ticker stops rescheduling when `document` is unavailable (fixes vitest teardown races in `quality:gate`).

---

## [0.3.1] — 2026-05-30

Pass 5 — GameFlow shrink + real AI Worker:

- **RewardGrantService** — `grantMatchVictory`, `grantDuelVictory`, chapter bundles; `GameFlow` delegates victory rewards.
- **aiTurnController** — `runAiTurn`, `shouldScheduleAi`, pace delay; extracted ~250 lines from `playAiMove`.
- **aiSearch.worker** — FEN-in / SAN-out search off the main thread; `findBestMoveAsync` + `localStorage['cok-ai-worker']`.
- **495** tests in `quality:gate`; Playwright play-smoke green.

---

## [0.3.0] — 2026-05-30

Pass 4 complete — GameFlow decomposition wave:

- **PR1** — Pure `validateAndReplaySnapshot` + plan artifact.
- **PR2** — `SnapshotManager` (debounced persist, in-progress build).
- **PR3** — `DuelManager` (unlock, session lifecycle, roster/archive).
- **PR4** — AI surface: eval exports, phase PST skeleton, `searchBench`, `aiAsync`, opening bias helpers.
- **PR5** — `CampaignOrchestrator` (navigation, advance, jumps, completion bookkeeping).
- **489** tests in `quality:gate`; four persistence/duel/campaign/AI seams documented in `ARCHITECTURE.md`.

---

## [0.2.25] — 2026-05-30

Pass 4 PR4 — AI surface hardening (Pass 2 deep kickoff):

- **Evaluator** — exported mobility/king-safety/coordination terms; standalone `evaluateConnectedPawnBonus`; per-phase PST skeleton (`pieceSquareValue`, `resolveEvalPhase`); space + tempo terms.
- **Benchmark** — `src/chess/bench/searchBench.ts` with nodes/ms reporting via `getLastSearchNodes()`.
- **Openings** — `rankOpeningCandidates` for measurable rival repertoire bias.
- **Async adapter** — `findBestMoveAsync` (main-thread default; worker surface reserved).

---

## [0.2.24] — 2026-05-30

Pass 4 PR3 — DuelManager seam (unlock + session lifecycle):

- **`DuelManager` class** — `tryBeginDuel`, session restore, rematch params, active brief, unlock/archive roster.
- **`GameFlow`** — delegates duel validation/session; board/chess orchestration unchanged.
- **Tests** — 12 `DuelManager.test.ts` cases (**467** total in gate).

---

## [0.2.23] — 2026-05-30

Pass 4 PR2 — SnapshotManager extraction:

- **`SnapshotManager`** — debounced persist, synchronous test mode, pending snapshot ownership, `onPersistFailure` hook.
- **`buildInProgressSnapshot()`** — pure in-progress assembly moved out of `gameFlow.ts`.
- **`GameFlow`** — delegates save I/O to the manager; recovery orchestration unchanged.
- **Tests** — expanded `SnapshotManager.test.ts` (debounce coalescing, flush, failure hook, build paths).

---

## [0.2.14] — 2026-04-30

Product and reliability pass: live rival talk lines in AI flavor, Daily
Calculus confirmation when abandoning recoverable play, streak
`persistOk` + UI warning, Calibration Lens **Equilibrium** rename +
clearer dossier difficulty copy, lab overlay ARIA + `accessibility.html`,
ledger memo optimization, contrast tweaks, `contenteditable` shortcut
suppression, expanded tests (**231**), README refresh.

---

## [0.2.22] — 2026-05-29

Pass 3 PR5 — deploy guards, e2e smoke, recruiter visual:

- **`scripts/assert-pages-build.mjs`** — fails builds with absolute `/favicon` or `start_url: "/"`; requires OG/Twitter tags and `./` manifest `start_url` (wired into `quality:gate`).
- **Playwright** — `npm run test:e2e` against `vite preview` (`/Chess-of-Kings/`); optional `e2e-smoke` CI job (not in fast gate).
- **README** — hero screenshot at `docs/at-a-glance-hero.png`; quality row updated (**436** tests).

---

## [0.2.21] — 2026-05-29

Pass 3 PR4 — mountApp Pass 1.5 extraction:

- **`mountContext.ts`** — `MountDomRefs`, `MountPlayState`, `MountRuntime` for testable wiring.
- **`src/app/ui/`** — `applyChessUi`, `renderScene`, `renderDuelUi`, `showRewardBundles` extracted from `mountApp.ts`.
- **Tests** — focused jsdom coverage for prologue story-beat, Alexion dossier doctrine, rated reward HTML.
- **`ARCHITECTURE.md`** — updated module map and TypeScript scale note.

---

## [0.2.20] — 2026-05-29

Pass 3 PR3 — play-surface visual polish:

- **Lab board** — stronger brass corners on turn/check; richer eval-bar fill gradient.
- **Manuscript** — story-beat and interlude line rhythm.
- **Duel** — launch block separator; sealed rival row glass depth.
- **Mobile lab** — 44px vestibule/keyboard targets; safe-area play-inner padding.

CSS gzip remains under the **16800** byte gate.

---

## [0.2.19] — 2026-05-29

Pass 3 PR2 — screen controller and lab accessibility:

- **`screenController.ts`** — centralizes `hidden` / `aria-hidden` / `inert` for top-level screens; inerts `#shell` siblings while the lab is open (lab overlay and live modals exempt).
- **Lab chrome** — top bar reflects `inert` as an HTML attribute; play-smoke asserts shell inert contract.
- **Tests** — `screenController.test.ts` + expanded lab play-smoke (**433** gate tests).

---

## [0.2.18] — 2026-05-29

Pass 3 PR1 — fonts and CSS budget:

- **Self-hosted fonts** — Cinzel, Cormorant Garamond, and JetBrains Mono woff2 in `src/assets/fonts/`; removed blocking `fonts.googleapis.com` `@import`.
- **CSS dedupe** — merged duplicate `:root`, body background, `.display-title`, and premium-pass blocks; consolidated v0.2.17 polish rules.
- **PWA** — service worker cache bumped to `cok-static-v5` for hashed asset refreshes.

---

## [0.2.17] — 2026-05-29

README and visual polish:

- **README** — specific skills table and At-a-glance skills row; removed location line; expanded reviewer YAML `creator_skills`.
- **UI** — title gradient type, brass primary buttons, framed board, chronicle card panel, glass title plate, richer ambient blooms, daily-ribbon and reward depth, chapter arrow hover, instrument frame shadow.

Gate unchanged at **428** tests.

---

## [0.2.16] — 2026-05-29

README and UI polish (no employer names in public docs):

- **README** — refreshed Creator / At-a-glance sections with GitHub and LinkedIn links only; removed third-party employer references.
- **Keyboard atlas** — reward overlay help sheet now uses the shared `reward-hero` header block.
- **Chapters screen a11y** — play smoke asserts title and duel stay `inert` while the chronicle index is active.

Gate: **428** tests across 53 files.

---

## [0.2.15] — 2026-05-29

Play-test hardening and title-rating sync after **New chronicle**:

- **New chronicle UX** — `syncTitleRating()` runs after a confirmed reset so the Stratarch Rating line clears immediately instead of showing a stale value when returning to the title screen.
- **Play smoke** — duel screen `inert`/`aria-hidden` contract for title and chapters; Daily Calculus confirm gate when a recoverable session exists; ladder reset assertion on new chronicle.
- **SFX** — capture-promotion and check/mate promotion SAN precedence locked (`exd8=N`, `exd8=Q+`, `axb8=R#`).
- **GameFlow** — `newGame()` resets the Stratarch Rating ladder (unit test).

Gate: **427** tests across 53 files.

---

## [Unreleased] — Continuation Passes (2 / 3 / 4)

Deterministic, additive improvements layered on the Maximum Effort Pass.
Full `quality:gate` green at **422 tests** across 53 files; JS gzip
**~82.9 KB** (budget < 90 KB), CSS gzip **~16.2 KB**.

### Added

- **Stratarch Rating (Pass 4)** — a persistent, Elo-style ladder number in
  `src/game/rating.ts` (pure math: logistic expected score, provisional
  K-factor, clamped 100–3000 band). After every rated match / duel,
  `GameFlow` updates the rating against the rival's *stable* base-profile
  strength plus a per-mode difficulty offset (so the published rival
  strength is not perturbed by the dynamic anti-tilt / momentum ramps).
  The current rating + peak appear on the title screen; the signed delta
  appears in the reward overlay. Persisted in `SaveData.ladder` with a
  forward migration (legacy saves default to 800; malformed values are
  clamped). 20 new tests (rating math, migration round-trip, win/loss
  integration, title surfacing).
- **Exported evaluation feature terms (Pass 2)** — the pawn-structure and
  coordination scorers in `src/chess/evaluate.ts` are now individually
  exported and unit-tested in isolation.
- **Opening-book bias in search (Pass 3)** — `openingSanBias()` nudges the
  engine toward on-book replies during the opening; a guard re-selects a
  booked candidate when the raw engine choice would wander off-book within
  a discipline-scaled slack window.

### Changed

- Match-outcome labels on the board status pill now use the centralized
  `STATUS_LABELS` (Victory / Defeat / Drawn).
- The `?` keyboard-help shortcut is suppressed while a confirmation dialog
  is open.
- Higher-contrast thinking-pill colour and square coordinate labels.

---

## [Unreleased] — Maximum Effort Pass

A multi-pass polish, refactor, and test push. Current gate status in
this branch: lint, typecheck, full tests (293 cases), build, and UI
smoke are all passing.

### Added

- **Piece-movement physics (`src/chess/boardAnimation.ts`)** — a DOM-free,
  fully unit-tested geometry layer behind the board's visual state engine.
  Carries now follow a *lift → eased arc → settle* trajectory (the easing is
  baked into the spatial sampling so the carry can run on a `linear` GPU
  timeline with translate+scale only — no per-frame layout or paint). The
  module also derives the captured square (handling en-passant) and the
  castling rook's travel. `BoardView` consumes it to: dissolve a captured
  piece (fade + shrink + topple on the correct square, including en-passant),
  carry the **castling rook in tandem with the king** (previously castling
  did not animate at all), and squash-settle each piece as it lands. A single
  `flyGen` token cancels stale carries so a fast follow-up move can never
  leave a destination piece hidden. Pure helpers covered by
  `boardAnimation.test.ts` (22 cases); DOM orchestration covered by
  `boardView.animation.test.ts` (7 cases) under stubbed layout/WAAPI.
- **Hanging-piece coach (`src/app/hangingInsight.ts`)** — the highest-value
  real-world lesson. After every match / duel / freeplay move it runs a
  one-exchange static check over the opponent's *legal* captures (so pinned
  attackers never false-alarm) and, if the move left a piece to be won
  (≈ an exchange or more), overrides the coach tip with a specific warning
  (“your bishop on c4 can be won…”). Suppressed while the opponent is in
  check and in puzzles (curated sacrifices). Unit + `GameFlow` integration
  tested.
- **Chapter II — The Age of Fire** in `data/chapters.ts`: Romantic codex,
  king-hunt mate puzzle, two ladder matches (Rowan / Vega) with tuned
  `aiDepth`, chapter rewards, and freeplay rehearsal. Unlocks after
  Chapter I on the chronicle index (`roadmap.ts` no longer lists Ch II
  as future-only).
- **Romantic duel archive**: `rowan` / `vega` roster entries
  (`minChapterUnlock: 2`, tabiya FENs), victory rewards unlock their duel
  variants; `grantVictoryRewards` wires scene IDs to opponent unlocks.
- **`chapter2Complete`** on `SaveData` + `GameFlow` (set when leaving
  `c2-reflection`); title screen copy and campaign-finale message know
  when both chapters are sealed.
- **`theme-romantic`** lab atmosphere in `style.css`.
- `src/ARCHITECTURE.md` — 184-line directory map, Mermaid data-flow
  diagram, persistence model, and a "where do I add X?" recipe table.
- `.github/ISSUE_TEMPLATE/*` and `.github/PULL_REQUEST_TEMPLATE.md` for
  consistent bug reports, feature requests, and PR verification notes.
- `SECURITY.md` and `CODE_OF_CONDUCT.md` for standard repository health
  and disclosure expectations.
- `public/robots.txt`, `public/sitemap.xml`, `public/sw.js`, and PWA
  icon assets (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
  `apple-touch-icon.png`, `og-image.png`) for deploy/discovery and
  installability polish.
- `src/app/recap/styleGrade.ts` and `recap/rankLabels.ts` — pure
  recap helpers extracted from `mountApp`, with full test coverage.
- `src/app/audio/sfx.ts` — `createSfxController` factory; lazy
  AudioContext, iOS unlock-on-gesture, distinct cues for capture /
  check / mate / castle / promotion, plus event cues for undo /
  advance / reward / draw / unlock.
- `src/app/play/chapterRail.ts` — pure HTML builders for the
  manuscript-margin ladder rail and dot-strip ladder track.
- `src/app/keyboard/globalShortcuts.ts` — pure handler + attach helper
  for Escape / Enter / Space / `?` global shortcuts.
- `src/app/session/streak.ts` and `session/dailyCalculus.ts` — local
  session-streak counter and a deterministic daily puzzle picker. Both
  use dedicated localStorage keys, never participate in save migration.
- `src/app/duel/calibrationLens.ts` — 5-level adaptive-difficulty
  dial derivation from history + rival memory; pure, fully tested.
- `src/app/a11y/announcer.ts` — `aria-live="polite"` announcer wrapper.
- `src/data/strings.ts` — UI-chrome strings module scaffold (no i18n
  runtime; structural only).
- `src/data/rivals.ts` — per-rival doctrinal profile data: school
  blend, opening repertoires, talk profile (5 buckets), 3-bullet
  curated counter-prep briefing for Amara / Lukas / Edred / Marius /
  Demetrios.
- **Calibration Lens dial** in every duel dossier (5 brass ticks,
  current band highlighted, hint paragraph below).
- **Mastery Trial button** on every dossier — locks the rival to
  ceiling difficulty for one match.
- **Daily Calculus ribbon** on the title screen — one curated puzzle
  per local day, plus the session-streak badge.
- **Keyboard atlas overlay** triggered by `?` listing every shortcut
  in three column-grouped lists.
- **Promotion picker keyboard nav** — Esc cancel, Arrow / Home / End
  cycle, Tab focus trap.
- **Live-region outcome announcer** — match outcomes and reward
  inscriptions are spoken to assistive tech, gated by an
  outcome-key so we never re-announce.
- **`apple-touch-icon`, `mask-icon`, and `application-name` meta**
  in `index.html` so the iOS home-screen install renders crisply.
- 14 new test files covering recap helpers, audio cues, chapter rail,
  keyboard shortcuts, session streak, daily calculus, calibration
  lens, announcer, persistence robustness, shell-markup integrity,
  reduced-motion CSS, perf smoke, engine property, engine-vs-engine,
  rival profiles.

### Changed

- **Flying-piece skin theming fixed (`src/style.css`)** — the carried sprite
  lives on `<body>`, but its skin colours were keyed off
  `.chess-grid[data-skin] .piece-fly`, an ancestor that is never present
  there, so every carry rendered in the default ivory/ink regardless of skin
  (most visible on **Obsidian Neon**, which carried as plain cream instead of
  glowing). `BoardView` now stamps `data-skin` on the sprite itself and the
  rules are re-scoped to `.piece-fly[data-skin]`; capture sprites inherit the
  same theming. Verified in-browser across all four skins.
- **Interactive vector polish (`src/style.css`)** — a selected piece now lifts
  off the board (`translateY` + scale) to reinforce tap-to-move, and the hover
  lift uses the project's spring-out easing. All piece motion remains
  `transform`-only (compositor-friendly) and is gated by `prefers-reduced-motion`
  (JS guard in `BoardView` plus the universal CSS clamp) and trimmed under the
  `perf-lean` profile (shorter carry, fewer arc samples, no capture dissolve or
  landing squash).
- **Chapter II ladder scripts** tightened for legal black SAN sequences
  under typical white replies; Rowan/Vega after-match copy aligned with
  those lines.
- **Counterpart (Chapter I finale)** engine depth **5 → 4** for a
  slightly fairer ceiling against the composite scholar.
- **Board region hint (`#board-guide`)** is driven by `GameFlow` each
  chess update (wait for opponent / AI thinking / freeplay / terminal)
  so it cannot contradict “0 legal targets” when it is not your turn.
- **Universal bounded-narrative play area** (`src/style.css`,
  `src/app/mountApp.ts`) — fixes the iPhone-blocking bug where the
  **Advance** button after dialogue fell below the fold (and behind the
  iOS toolbar) and could not be pressed. No-board scenes now scroll the
  prose *inside* the manuscript while the Advance footer stays pinned and
  on-screen at every size; board scenes auto-scroll the button into view
  the moment the objective is met. Verified across iPhone (portrait +
  landscape), iPad, Android phones, small/landscape phones, Surface,
  laptop and desktop on both WebKit and Chromium. Adds a short-viewport
  layout (landscape phones hide the redundant in-lab nav and compress the
  crawl), a scroll-fade affordance, `prefers-reduced-motion`-aware
  auto-scroll, and reward/overlay docking with safe-area padding.
- **Promotion picker** (`src/chess/boardView.ts`) is now clamped to the
  viewport — White's top-rank promotion menu flips below the square
  instead of clipping off the top of a phone, so every choice stays
  tappable.
- Prologue **calibration `goalPlain`** copy now states explicitly that
  White moves only on White’s turn and to wait between trainer replies.
- `src/app/mountApp.ts` now enforces top-level screen isolation via
  `aria-hidden` + `inert` toggling so inactive title/chapter/duel
  screens are not left in the accessibility tree while the lab is open.
- `createRewardOverlayController` accepts optional `onOpenChange`; the
  app uses it to mark other `#shell` children `inert` while the reward
  dialog is open (the dialog node lives inside the shell, so a single
  parent `inert` would silence it).
- `src/app/gameFlow.ts` now persists after scene/chapter refresh in
  `jumpToScene` / `jumpToChapter` to avoid stale duel snapshots being
  written under destination chapter indices.
- `vitest.config.ts` now runs test files sequentially
  (`fileParallelism: false`, `maxConcurrency: 1`) to avoid the
  non-deterministic worker timeout exit seen in CI-like runs.
- Title hero, dossier, chapter index, reward overlays all received
  refined CSS and ARIA-label improvements.
- Board square `aria-label` now composes piece + flags (selected,
  last move, in check, legal target, legal capture, confirm-move
  target). `aria-pressed` mirrors selection state.
- Chess root references both `narrative-kbd-hint` and `board-guide`
  via `aria-describedby`.
- Typography uses ratios rather than absolute `line-height`s
  (1.18 for headings, 1.35 for ledger rows, 1.45–1.6 for prose).
- The reduced-motion CSS guarantee is now regression-locked by tests
  that read the CSS file and assert the universal selector + duration
  / iteration-count clamps.

### Engineering

- 86 → 224 tests pass. 34 test files (was 18).
- Lint clean: zero warnings, zero `as any` in production code.
- Bundle (measured 2026-04-29, `npm run build` + `npm run report:bundle-gzip`): JS gzip **63,661 B** (budget: < 90 KB), CSS gzip **12,496 B** (budget: < 13 KB).
- Lighthouse mobile CLI JSON: `docs/lighthouse-mobile-max-pass-2.json`
  (Perf 86 / A11y 100 / Best Practices 96 / SEO 100). Older snapshot remains at `docs/lighthouse-mobile.json`.

### Deferred (honest notes)

The following items from the original maximum-effort brief were
deliberately scoped out of this pass to keep voice consistency and
gates green; each is called out by name in the commit body of the
pass that touched the surrounding area.

- Full closure-extraction of `applyChessUi` / `renderScene` /
  `renderDuelUi` / `showRewardBundles` (Pass 1.5).
- Feature-decomposed `evaluate.ts` (Pass 2-deep).
- `selectTalkLine` integration into the live in-match flavor
  pipeline; opening-repertoire enforcement during play (Pass 3-deep).
  *(Partially addressed: opening-book bias now nudges engine search —
  see the Continuation Passes entry above.)*
- ~~Per-rival Elo-ish tracker on save with migration (Pass 4-deep).~~
  **Shipped** as the Stratarch Rating — see the Continuation Passes entry
  above.
- Web Worker for AI search (Pass 7-deep).
- Color contrast audit beyond the existing token system (Pass 8-deep).
- Mobile-viewport visual overflow check (jsdom limitation; needs a
  headless-browser pass).

### Save format

No change. `SaveData.version === 3`. The session streak and daily
puzzle picker live in dedicated localStorage keys (`cok-streak`),
not in `SaveData`. Older saves load unchanged.

---

## Earlier history

For releases before the Maximum Effort Pass, see the GitHub release
notes at <https://github.com/sauterreed24/Chess-of-Kings/releases>.
