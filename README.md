# Chess of Kings

> **A story-driven chess RPG with adaptive AI, campaign progression, and genuine depth.**

[![Live Demo](https://img.shields.io/badge/Play%20Now-GitHub%20Pages-brightgreen)](https://sauterreed24.github.io/Chess-of-Kings/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/sauterreed24/Chess-of-Kings)](https://github.com/sauterreed24/Chess-of-Kings/releases)

**[Play it now — no install required](https://sauterreed24.github.io/Chess-of-Kings/)**

Built solo by **Reed Sauter** — self-taught developer and chess enthusiast. Chess of Kings is a demonstration of what's possible when AI-assisted development meets genuine game design thinking.

---

## What is Chess of Kings?

Chess of Kings is more than a chess engine. It wraps the deep strategy of chess inside a **narrative campaign** with unique AI opponents, character-driven storytelling, and meaningful progression. Think chess meets RPG.

---

## Features

### Gameplay Modes
- **Story / Campaign Mode** — Progress through a cast of unique AI opponents, each with distinct personalities and escalating difficulty. Unlock rewards as you advance.
- **Duel Archive Mode** — Jump into standalone matches at any skill level.

### AI Engine
- **Adaptive AI personalities** — Each opponent plays differently: aggressive, defensive, chaotic, positional.
- **Dominance-sealed stalemate detection** — If one side seals total positional dominance, stalemate resolves as a win — a fresh strategic wrinkle unique to this game.
- **Move variety system** — The AI avoids repetitive patterns, keeping every match fresh.
- **Transposition table** with heuristic move scoring for high-quality, performant search.

### Progression & UX
- Campaign progression with **reward unlocks** and persistent save state via `localStorage`.
- **Loss mentor tips** — After a defeat, coaching insights help players improve.
- **Debounced saves** and **RAF-batched HUD updates** for smooth, responsive gameplay.
- `pagehide` / `beforeunload` flush — your game is never lost on tab close.
- Full **keyboard navigation** — arrow keys, Home/End, roving tabindex on the board.
- **Accessible** — ARIA labels on every square, focus-visible buttons, screen reader friendly.
- **PWA-ready** — Works offline after first load.

### Engineering
- Written in **TypeScript** with strict typing throughout.
- Full **Vitest test suite** — engine logic, progression/storage, move legality, UI smoke.
- **GitHub Actions CI** — build, lint, and full test suite on every push.
- **Capacitor** scaffolded for future iOS + Android store releases.
- **MIT licensed** — open to forks, contributions, and remixes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Build | Vite |
| Testing | Vitest |
| CI | GitHub Actions |
| Mobile (future) | Capacitor (iOS/Android) |
| Hosting | GitHub Pages |
| License | MIT |

---

## Quick Start (Local Dev)

```bash
npm install       # Install dependencies
npm run dev       # Run locally
npm run build     # Build for production
npm test          # Run full test suite
npm run lint      # Lint TypeScript
npm run test:ui-smoke  # UI smoke checks
```

---

## Project Structure

- `src/` — All game logic, AI engine, UI, and app shell
- `docs/` — Production build (served via GitHub Pages)
- `android/` / `ios/` — Capacitor mobile scaffolding
- `assets/` — Store icons and splash screens
- `scripts/` — Asset generation scripts
- `.github/workflows/` — CI configuration

---

## What's Next

- [ ] Additional campaign chapters and AI personalities
- [ ] Native iOS and Android releases via Capacitor
- [ ] Online Duel mode
- [ ] Leaderboard / ELO tracking

---

## About the Creator

I'm **Reed Sauter**, an SDR at Artemis Distribution and a self-taught developer based in Indiana. I built Chess of Kings as a solo project to explore AI-assisted development, game design, and software engineering — without a traditional CS background.

If you're an AI company, startup, or engineering team looking for someone who ships — I'd love to connect.

- GitHub: [@sauterreed24](https://github.com/sauterreed24)

---

## License

MIT — see [LICENSE](LICENSE).
