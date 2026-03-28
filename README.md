# Chess of Kings

Story-driven chess RPG built with Vite + TypeScript.  
Features campaign progression, Duel Archive mode, adaptive AI personalities, reward unlocks, and robust recovery UX.

## Quick Start

- Install dependencies:
  - `npm install`
- Run locally:
  - `npm run dev`
- Build production:
  - `npm run build`
- Run tests:
  - `npm test`
- Lint TypeScript:
  - `npm run lint`
- Run focused UI smoke checks:
  - `npm run test:ui-smoke`

## Current Quality Gates

- TypeScript + Vite production build.
- Full Vitest suite (engine, progression/storage, legality, UI smoke modules).
- GitHub Actions workflow on push/PR:
  - production build, full test suite, and UI smoke tests (`test:ui-smoke`).

Performance notes: transposition table keys avoid extra string allocation; heuristic move scoring shares a single piece-count pass; the board view skips DOM writes on unchanged squares and avoids document-wide queries for fly animations.

Runtime UX: game flow **debounces saves** to `localStorage` and **batches HUD updates** on `requestAnimationFrame`; `pagehide` / `beforeunload` call `flushDeferredIO()` so the latest position is persisted when leaving the tab.

Tests: Vitest runs with `MODE=test`, so deferred save/HUD emission is **synchronous** for deterministic assertions.

## Packaging Toward Stores

**Capacitor** is configured (`capacitor.config.ts`, `android/`, `ios/`). Run **`npm run cap:sync`**, then **`npm run cap:open:android`** or **`npm run cap:open:ios`**. See `docs/STORE_MOBILE.md` for signing, Play Console, and App Store Connect.

**Store icons / splashes:** after updating `public/favicon.svg`, run **`npm run assets:generate`** (writes `assets/icon.png`, then `@capacitor/assets` for **iOS + Android only** so `public/manifest.webmanifest` and the SVG favicon stay as-is), then **`npm run cap:sync`**. **Privacy:** `public/privacy.html` is the bundled policy page at **`/privacy.html`** for listings and the in-app link.

## Ship checklist (local)

After changes: `npm run lint`, `npm run build`, `npm test`, and `npm run test:ui-smoke`, then commit and push to `main`.

App shell markup and narrative/ledger HTML helpers live under `src/app/shellMarkup.ts` and `src/app/mainUiFormatters.ts`; `src/main.ts` wires behavior and DOM events.

## License

MIT (see `LICENSE`).
