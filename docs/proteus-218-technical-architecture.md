# Proteus 218 Technical Architecture Notes

These notes define how to add Proteus 218 without destabilizing the existing TypeScript/Vite/PWA game.

## Recommended architecture

```text
src/
  proteus/
    data/
      civilizations.ts
      units.ts
      terrain.ts
      upgrades.ts
      story.ts
    sim/
      prng.ts
      mapGenerator.ts
      economy.ts
      combat.ts
      victory.ts
      ai.ts
    ui/
      prototypeScreen.ts
      mapView.ts
      cityPanel.ts
      armyPanel.ts
      battleLog.ts
      overlays.ts
    tests/
      *.test.ts
    types.ts
```

## Determinism

All core simulation functions should accept plain data and return plain data. Avoid `Date.now()`, `Math.random()`, DOM reads, localStorage, and global state inside simulation modules. Use a seedable PRNG so duel maps, AI decisions, and test cases can be reproduced.

## Rendering approach

Start with SVG or DOM/CSS for map regions and formation cards before considering Canvas. The current repo values accessibility and small bundles; SVG/DOM keeps labels, keyboard focus, and tests simpler. Canvas can be introduced later for large animated battlefields if profiling proves it necessary.

## State model

Use a top-level `ProteusMatchState` object:

- `seed`
- `turnOrTick`
- `phase`
- `map`
- `players`
- `cities`
- `armies`
- `fogOfWar`
- `eventLog`
- `victoryState`

Keep saved state versioned from the start, even during prototype work.

## Simulation modules

### `mapGenerator.ts`

Inputs: seed, player count, map profile, drought severity.  
Outputs: map regions, starts, resources, crossings, city sites, fairness report.

### `economy.ts`

Inputs: city state, governor policy, projects, drought pressure, supply links.  
Outputs: next city state, bottlenecks, warnings, event log entries.

### `combat.ts`

Inputs: armies, terrain, command stances, commander traits, supply state.  
Outputs: next army states, rout/capture events, cohesion/morale changes, battle log.

### `victory.ts`

Inputs: match state.  
Outputs: active/contested/collapsed/won state with reasons.

### `ai.ts`

Inputs: visible match state, personality, difficulty.  
Outputs: governor decisions, build preferences, army commands, target priorities.

## Testing standards

- Data integrity tests for every civilization, unit, upgrade, terrain tag, and story mission.
- Property-style map tests across many seeds.
- Economy tests for resource conservation and policy tradeoffs.
- Combat tests for core counters and terrain modifiers.
- AI tests for deterministic legal decisions.
- UI smoke tests for prototype launch, civ picker, map summary, and command panel.

## Performance budgets

Initial prototype targets:

- No new runtime dependencies unless the PR proves the benefit.
- Keep JS gzip growth visible in bundle reports.
- Avoid per-frame allocation-heavy loops.
- Prefer small animation counts and reduced-motion fallbacks.
- Simulate large battles in summarized ticks, not thousands of independent soldiers.

## Accessibility standards

- Every command must have text, not icon-only meaning.
- Every overlay needs a keyboard path and screen-reader summary.
- Map regions need names, terrain, owner, resource summary, and threat summary.
- Battle logs should explain outcomes without relying on animation.
- Touch targets should remain large enough for phone use.

## Integration plan

1. Add hidden prototype route or dev-only launcher.
2. Keep existing game mode untouched.
3. Add Proteus save key separate from current save data.
4. Add visual polish only after deterministic systems pass tests.
5. Promote the prototype to a visible mode when the first duel loop is playable.
