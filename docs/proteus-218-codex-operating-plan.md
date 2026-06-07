# Proteus 218 Codex Operating Plan

## Recommended loop

1. Pick exactly one issue or prompt.
2. Run Codex in Goal Mode with the issue body plus the relevant docs.
3. Ask for a small PR, not a broad rewrite.
4. Require a summary, tests run, and any deferred work.
5. Review the diff for accessibility, determinism, mobile performance, and bundle growth.
6. Merge only after CI passes.
7. Repeat with the next issue.

## First five Codex goals

### Goal 1: Data substrate

Use docs:

- `docs/proteus-218-gdd.md`
- `docs/proteus-218-civilization-roster.md`
- `docs/proteus-218-technical-architecture.md`

Prompt:

> Implement the Proteus 218 data substrate in `src/proteus/` behind a prototype boundary. Add typed resources, terrain, units, civilizations, city state, army state, and match state. Populate the first three civs and seven units. Add integrity tests. Do not replace the existing game flow.

### Goal 2: Seeded map generator

Use docs:

- `docs/proteus-218-first-vertical-slice.md`
- `docs/proteus-218-technical-architecture.md`

Prompt:

> Implement a deterministic balanced duel map generator for the Drought Crossing Basin profile. Include river spine, two starts, crossings, city sites, food, timber, iron, roads, terrain tags, and fairness validation across at least 50 seeds.

### Goal 3: Governor economy

Use docs:

- `docs/proteus-218-gdd.md`
- `docs/proteus-218-first-vertical-slice.md`

Prompt:

> Implement the Proteus governor economy simulation. Add Bread First, War Foundries, Riverworks, and Emergency Levy. The player should set policy priorities, not assign workers. Add deterministic tests showing tradeoffs and bottleneck explanations.

### Goal 4: Formation combat

Use docs:

- `docs/proteus-218-balance-matrix.md`
- `docs/proteus-218-first-vertical-slice.md`

Prompt:

> Implement deterministic formation combat for the first seven unit classes. Include terrain, commands, morale, cohesion, non-gory battle logs, and tests for counter relationships.

### Goal 5: Playable duel loop

Use docs:

- `docs/proteus-218-first-vertical-slice.md`
- `docs/proteus-218-codex-roadmap.md`

Prompt:

> Combine the Proteus map, economy, combat, and total-victory rules into a playable prototype duel. Add a basic deterministic AI and a victory/defeat explanation. Keep UI accessible and mobile-friendly.

## Review checklist

- Does the PR keep existing Calculus of Kings behavior intact?
- Are Proteus systems deterministic and tested?
- Are map seeds reproducible?
- Can a player understand why they won or lost?
- Does the UI work without mouse-only controls?
- Are new files scoped under `src/proteus/` unless integration is necessary?
- Did the PR avoid unnecessary dependencies?
- Did the PR avoid gore and one-dimensional villain framing?

## When to pause and refactor

Pause feature work when any of these happen:

- Proteus files exceed easy review size without tests.
- UI logic and simulation logic become tangled.
- A rule cannot be explained in one tooltip or battle log sentence.
- A civilization advantage lacks counterplay.
- Bundle growth becomes unclear.
- Existing game CI or accessibility smoke tests become fragile.
