# Changelog

All notable changes to The Calculus of Kings.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project follows pragmatic semantic versioning at the package
level (the save format has its own version field — see
`src/app/storage.ts`).

---

## [Unreleased] — Maximum Effort Pass

A multi-pass polish, refactor, and test push. Every commit boundary in
this pass passes lint, the full test suite (214 cases), the production
build, and the UI smoke gate.

### Added

- `src/ARCHITECTURE.md` — 164-line directory map, Mermaid data-flow
  diagram, persistence model, and a "where do I add X?" recipe table.
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

- `src/app/mountApp.ts` shrank from **1,232 → 1,104 LOC** (−10.4%)
  via the extractions above. Behavior preserved exactly; no public
  exports changed.
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

- 86 → 214 tests pass (+128 new cases). 33 test files (was 18).
- Lint clean: zero warnings, zero `as any` in production code.
- Bundle: JS gzipped **~60 KB** (budget: < 90 KB), CSS gzipped
  **~12 KB** (budget: < 12 KB).
- Build time: ~0.3 s warm, ~5 s cold.

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
- Per-rival Elo-ish tracker on save with migration (Pass 4-deep).
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
