# Proteus 218 First Vertical Slice Brief

## Goal

Create a playable Proteus 218 duel that proves the central promise: land-only total conquest, low-chore city economy, civilization asymmetry, formation tactics, drought pressure, and replayable maps.

## Player-facing flow

1. Open hidden Proteus prototype.
2. Choose Duel.
3. Choose Aurelian Concord, Veyr Steppe Clans, or Kharu Basin League.
4. Enter or randomize seed.
5. See generated map summary and fairness notes.
6. Start with one capital, one scout, one small army, and one governor policy.
7. Scout river crossing and nearby expansion.
8. Set city policy.
9. Build or recruit.
10. Move army to secure/contest crossing.
11. Fight enemy formation battle.
12. Capture enemy command post/capital.
13. See total-victory result and explanation.

## Map

Map profile: **Drought Crossing Basin**

Required regions:

- Two starting capitals.
- Central river crossing.
- One alternate longer crossing or dry-bed route.
- Food site near each start.
- Timber site near each start.
- Iron site that creates contest pressure.
- One ridge, one dry plain, one marsh or scrub zone.
- Road segments that matter for supply.

## Civilizations

### Aurelian Concord

Starting advantage: road reinforcement and balanced shield/spear core.  
Early decision: build roads for safety or recruit for crossing tempo.  
Weakness in slice: predictable and slower than Veyr if roads are ignored.

### Veyr Steppe Clans

Starting advantage: scout/cavalry tempo and mobile camp.  
Early decision: raid, flank, or race for crossing.  
Weakness in slice: struggles to capture fortified capital without engineers or timing.

### Kharu Basin League

Starting advantage: drought resilience and spear defense.  
Early decision: fortify water and outlast or push before being boxed in.  
Weakness in slice: slow expansion and low early pressure.

## Units

- Shield Infantry
- Spear Infantry
- Skirmishers
- Cavalry
- Engineers
- Siege Cart
- Command Guard

## Economy policies

- Bread First
- War Foundries
- Riverworks
- Emergency Levy

## Formation commands

- Hold
- Advance
- Flank
- Screen
- Raid
- Secure Crossing
- Retreat

## Win condition

Total victory occurs when the opponent can no longer command the map:

- Capital captured, or
- Command guard routed and final army broken, or
- Supply/city collapse after encirclement.

No score victory. No diplomacy victory. No timed objective victory.

## Minimum AI

The first AI only needs to be understandable, deterministic, and legal:

- Picks a governor policy from current shortage and strategy.
- Recruits a sensible army based on civ identity.
- Moves toward crossing or raid target.
- Avoids charging cavalry into braced spears unless desperate.
- Protects siege cart if using one.
- Attempts capital capture after winning field control.

## Prototype UI

Must include:

- Civ picker.
- Seed/map summary.
- Resource panel.
- City policy panel.
- Army panel.
- Region inspector.
- Battle log.
- Victory/defeat explanation.

## Acceptance criteria

- New player can start a duel quickly.
- No villager micromanagement exists.
- Every combat result has a readable reason.
- The three civs feel different in the first ten minutes.
- At least 50 generated seeds pass fairness validation in tests.
- Targeted tests, lint, typecheck, and build pass.
