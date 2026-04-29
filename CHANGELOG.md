# Changelog

All notable changes to The Calculus of Kings.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project follows pragmatic semantic versioning at the package
level (the save format has its own version field — see
`src/app/storage.ts`).

---

## [Unreleased] — Maximum Effort Pass

A multi-pass polish, refactor, and test push. Current gate status in
this branch: lint, typecheck, full tests (218 cases), build, and UI
smoke are all passing.

### Added

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

- 86 → 218 tests pass (+132 new cases). 34 test files (was 18).
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
