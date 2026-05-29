# Changelog

All notable changes to The Calculus of Kings.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project follows pragmatic semantic versioning at the package
level (the save format has its own version field — see
`src/app/storage.ts`).

---

## [0.2.14] — 2026-04-30

Product and reliability pass: live rival talk lines in AI flavor, Daily
Calculus confirmation when abandoning recoverable play, streak
`persistOk` + UI warning, Calibration Lens **Equilibrium** rename +
clearer dossier difficulty copy, lab overlay ARIA + `accessibility.html`,
ledger memo optimization, contrast tweaks, `contenteditable` shortcut
suppression, expanded tests (**231**), README refresh.

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
