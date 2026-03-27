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
- Run focused UI smoke checks:
  - `npm run test:ui-smoke`

## Current Quality Gates

- TypeScript + Vite production build.
- Full Vitest suite (engine, progression/storage, legality, UI smoke modules).
- GitHub Actions workflow on push/PR:
  - build + tests.

## Packaging Toward Stores

See `docs/STORE_MOBILE.md` for the shortest path to Google Play / App Store packaging (TWA or Capacitor), plus required store checklist items.

## Ship checklist (local)

After changes: `npm run build` and `npm test`, then commit and push to `main`.

## License

MIT (see `LICENSE`).
