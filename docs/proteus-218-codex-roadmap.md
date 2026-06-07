# Proteus 218 Codex Implementation Roadmap

This roadmap turns the Proteus 218 design into small, testable Codex tasks. It assumes the current repository remains a lean TypeScript/Vite/PWA/Capacitor game and that Proteus work starts behind a prototype route or feature flag before replacing any shipped Calculus of Kings flow.

## Build strategy

- **Do not rewrite the app first.** Add a contained prototype surface such as `src/proteus/` and a hidden launcher entry.
- **Prefer pure simulation modules.** Map generation, economy ticks, combat resolution, unit rules, and AI choices should be deterministic functions with Vitest coverage.
- **Ship a vertical slice before content scale.** Three civilizations, one generated map family, one prologue, one duel mode, and one AI opponent are enough to validate the fun.
- **Keep mobile constraints central.** Every screen must be playable by touch, keyboard, and reduced-motion users.
- **Protect quality gates.** Each PR should pass lint, typecheck, targeted tests, and build. Release-sized PRs should pass `npm run quality:gate`.

## Milestone 0: design substrate

Goal: create data contracts and prototype shell without disturbing existing gameplay.

Deliverables:

- `src/proteus/types.ts` for civilizations, resources, units, cities, armies, terrain, maps, commands, and match state.
- `src/proteus/data/civilizations.ts` with the first three civs: Aurelian Concord, Veyr Steppe Clans, Kharu Basin League.
- `src/proteus/data/units.ts` with seven initial classes: shield infantry, spears, skirmishers, cavalry, engineers, siege cart, command guard.
- `src/proteus/prototypeScreen.ts` with a basic accessible screen showing map seed, civ picker, and match summary.
- Tests for data integrity: every civ has strengths, weaknesses, unique mechanic, starting package, and counterplay notes.

Codex prompt:

> Add the Proteus 218 prototype data substrate behind `src/proteus/`. Do not replace the current game. Create typed data for civilizations, units, resources, terrain, and match state; add integrity tests; wire a hidden prototype screen only if there is already a safe app-shell pattern. Keep bundle impact minimal and pass lint/typecheck/targeted tests.

## Milestone 1: deterministic balanced duel map

Goal: generate replayable land-only maps that feel fair but not identical.

Deliverables:

- Seeded PRNG utility.
- Region-based map generator with river spine, crossings, city sites, food, iron, timber, roads, and terrain tags.
- Fairness validator: both starts get core resources, expansion options, crossing access, and vulnerabilities.
- Map summary UI with overlays for water, roads, threat, and city suitability.
- Tests that sample many seeds and reject impossible starts.

Codex prompt:

> Implement a deterministic Proteus duel map generator. Use seeded randomness, region tiles, a river spine, crossings, resource clusters, start locations, and fairness validation. Add property-style tests across many seeds. The UI can be minimal but must expose seed, starts, resources, crossings, and warnings accessibly.

## Milestone 2: low-chore city economy

Goal: prove the governor policy system is fun and readable.

Deliverables:

- City state: population, water, grain, timber, iron, order, command, build slots.
- Governor policies: Bread First, War Foundries, Riverworks, Road Mandate, Quiet Hand, Emergency Levy.
- Tick simulation with visible bottlenecks and delayed consequences.
- Player controls: change policy, queue a city project, issue emergency order.
- Tests for conservation, no negative resources unless explicitly modeled as crisis debt, and meaningful tradeoffs.

Codex prompt:

> Add the Proteus city economy simulation with governor policies and tests. The player should set priorities rather than micromanage workers. Show clear bottlenecks and consequences in the prototype UI. Keep the simulation pure and deterministic.

## Milestone 3: formation combat prototype

Goal: make armies behave like readable tactical pieces, not blobs.

Deliverables:

- Army composition model: units, cohesion, morale, supplies, commander, formation stance.
- Commands: hold, advance, flank, screen, raid, siege, retreat, secure crossing.
- Terrain modifiers: crossing, ridge, open steppe, marsh, dry bed, city approach.
- Combat resolver: simultaneous rounds or pausable ticks with morale/cohesion results.
- Non-gory battle log: banners break, formations scatter, units rout/capture.
- Tests for counter relationships and terrain effects.

Codex prompt:

> Implement a deterministic formation combat resolver for Proteus. Include unit counters, morale, cohesion, terrain, command stances, and non-gory outcome logs. Add tests proving shields/spears/cavalry/skirmishers/engineers/siege each have useful counters and vulnerabilities.

## Milestone 4: conquest victory and basic AI

Goal: make the first duel actually winnable and replayable.

Deliverables:

- Total-victory rules: capital capture, command collapse, supply collapse, final army rout.
- AI layers: governor policy choice, army composition, target selection, tactical command selection.
- Difficulty bands: learner, balanced, veteran, ruthless; avoid hidden cheating at lower tiers.
- Match-end screen: why you won/lost, turning point, next training focus.
- Tests for AI determinism and legal decisions.

Codex prompt:

> Add total-victory duel resolution and a basic Proteus AI. The AI should choose city policies, build armies, select targets, and issue tactical commands without cheating on normal difficulty. Add deterministic tests and an end-of-match explanation panel.

## Milestone 5: story prologue

Goal: establish the world and ramp-up without lore dumping.

Deliverables:

- Prologue: the first treaty breach at a river crossing.
- Three perspectives: Aurelian magistrate, Veyr outrider, Kharu water officer.
- Tutorialized objectives: scout, set policy, secure crossing, survive counterattack, take command post.
- Branching commentary based on how the player wins, but total victory remains the win condition.
- Codex entries for Aurel River, Long Withering, River Law, and each starting civilization.

Codex prompt:

> Add a Proteus story prologue that teaches scouting, governor policy, formation command, crossings, and total victory. Keep the conflict morally complex and non-gory. Use compact story panels, accessible navigation, and deterministic mission setup.

## Milestone 6: progression trees

Goal: make replay decisions interesting without content bloat.

Deliverables:

- Four trees: civic, military doctrine, engineering, civilization legacy.
- First 18 upgrades total, mostly playstyle-changing rather than stat-only.
- Unlock presentation with pros/cons.
- Duel-mode draft option: start with one early doctrine.
- Tests for upgrade prerequisites and no impossible builds.

Codex prompt:

> Add the first Proteus progression tree system. Implement typed upgrades with prerequisites, pros/cons, and effects on economy/combat/map actions. Avoid generic stat-only upgrades where possible. Add tests for unlock validity and deterministic effects.

## Milestone 7: UX polish and performance pass

Goal: make the prototype feel premium without exceeding device budgets.

Deliverables:

- Touch-first command radial or command cards.
- Strategic overlays: water, roads, threat, city sites, supply.
- Reduced-motion-safe battle animations.
- Save/load for duel seeds and campaign progress.
- Bundle report and performance smoke tests.

Codex prompt:

> Polish the Proteus prototype UI for touch, keyboard, accessibility, reduced motion, and low-power devices. Add overlays, command cards, save/load, and performance tests. Do not add heavy dependencies without justification.

## Balance principles for every PR

- A new unit or upgrade must answer: what beats it, what does it beat, where is it best, when is it bad, and what does it cost in tempo?
- A new civilization mechanic must create a unique path to total victory and a unique failure mode.
- A new economy rule must reduce chores or create a meaningful strategic tradeoff; otherwise cut it.
- A new story beat must show why at least two sides believe they are acting rationally.
- A new UI element must work on phone, keyboard, and screen reader paths.

## First playable acceptance criteria

- Start a duel in under 30 seconds.
- Choose one of three civilizations.
- Generate a fair map from a seed.
- Run a city economy without worker micromanagement.
- Build a small army.
- Fight with formation commands and terrain.
- Win only through total conquest/collapse.
- Receive a clear victory/defeat explanation.
- Replay with a different seed and feel a different strategic problem.
