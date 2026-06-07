# AGENTS.md

## Repository expectations

- Treat this repository as a production-quality TypeScript/Vite/PWA game. Keep changes small, testable, accessible, and friendly to low-power devices.
- Before proposing a PR that changes TypeScript, run `npm run lint`, `npm run typecheck`, and the smallest relevant Vitest target. Run `npm run quality:gate` for release-sized changes.
- Keep the bundle lean. Prefer deterministic simulation code, plain TypeScript, DOM/CSS, and data-driven content before adding new dependencies.
- Do not add a backend, analytics, accounts, ads, gore, or real-world political propaganda. The game should remain offline-first and family-appropriate in presentation.
- Preserve keyboard, screen-reader, reduced-motion, and touch usability. Every new interactive surface needs labels, focus handling, and mobile hit targets.
- Document major gameplay/system changes in `docs/` and include testing notes in PR summaries.

## Current product baseline

- Current shipped game: `The Calculus of Kings`, a static PWA chess RPG in TypeScript/Vite with Capacitor mobile build hooks.
- New design incubator: `Proteus 218`, a land-only Roman-era-inspired grand strategy/tactical war game centered on drought, total victory, multiple civilizations, and low-chore economy automation.
- Build toward a playable vertical slice first: procedural balanced duel map, three civilizations, automated economy, unit command system, simple AI, total-conquest win condition, and a story prologue.

## Design pillars for Proteus 218 work

1. Easy to start, hard to master: default automation handles chores, but expert players can override priorities and doctrine.
2. Chess-like strategic clarity: every unit class must have readable counters, positioning value, tempo costs, and tactical tradeoffs.
3. Land-only warfare: no naval or airborne units. Rivers matter through crossings, irrigation, logistics, city placement, and drought pressure.
4. Total victory: campaign and duel modes should resolve through conquest, surrender-collapse, or complete command failure, not abstract score victories.
5. No clear villain: each civilization needs defensible survival logic, strengths, flaws, and tragedy-of-the-commons pressure.
6. Minimal gore: show formation breaks, banners falling, routs, dust, armor damage, and battlefield aftermath without graphic violence.
7. Replayability through systems: civilization doctrines, progression trees, map seeds, resource pressure, terrain, commander traits, and unit specialization should change decisions every run.

## Implementation style

- Prefer data files/types for civilizations, units, tech trees, story beats, and maps. Keep simulation pure where possible so tests can validate balance and determinism.
- Start with deterministic seedable map generation. Mirror-start fairness is allowed for duel mode; asymmetric campaign maps are allowed when story-driven.
- Economy should use player-set priorities, governor automation, supply routes, and visible bottlenecks rather than manual villager micromanagement.
- AI should be layered: economic planner, army composer, tactical evaluator, and difficulty modifiers. Avoid cheating until explicit high difficulty tiers, and surface any handicap transparently.
- Avoid giant rewrites. Add a prototype route/screen behind a feature flag or clearly named module before integrating into the main chronicle flow.

## Review guidelines

- Flag regressions in determinism, accessibility, mobile performance, save compatibility, or test coverage as high priority.
- For game-balance changes, ask whether the rule creates meaningful counters or merely adds stats.
- For UI changes, verify touch, keyboard, and reduced-motion behavior.
- For new content, check that lore avoids one-dimensional villain framing and keeps the Proteus drought conflict morally complex.
