# Proteus 218 Risk Register

## Product risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Scope becomes too large | AAA ambition can bury the playable core | Build the first vertical slice before adding more civilizations or story acts |
| Economy becomes chores | User explicitly dislikes population micromanagement | Use governor policies, bottleneck summaries, and priority queues |
| Civilization asymmetry becomes unfair | Strong faction identities can break balance | Maintain counterplay notes and balance tests for every civ/unit |
| Total victory becomes tedious | Conquest-only games can drag after the winner is clear | Add command collapse, surrender-collapse, and supply collapse as total-victory endpoints |
| Story becomes one-sided | Premise requires no clear villain | Require every campaign beat to show rational motives for at least two sides |
| Land-only design feels limited | No naval/air means terrain variety must carry replayability | Make rivers, crossings, roads, drought beds, marshes, passes, and logistics highly meaningful |
| Prototype damages existing game | Repo already ships a polished chess RPG | Keep Proteus behind separate `src/proteus/` modules and hidden launcher until stable |

## Technical risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Simulation and UI get tangled | Hard to test and refactor | Keep sim modules pure and deterministic |
| Mobile performance suffers | Target includes Surface Pro 5 and iPhone-class devices | Avoid huge sprites, simulate formations abstractly, profile before Canvas/WebGL |
| Bundle grows too much | Existing repo values small PWA delivery | Add dependencies only with clear benefit and update bundle reports |
| Procedural maps feel unfair | Duel mode depends on trust | Use fairness validators and seed tests |
| AI cheats feel frustrating | Strategy mastery requires trust | Avoid hidden cheating on normal difficulty and explain difficulty modifiers |
| Save migration becomes fragile | Persistent progress matters | Version Proteus saves separately from existing save data |

## Design tripwires

Stop and redesign when:

- A player must click individual workers to stay competitive.
- A unit lacks an intuitive counter.
- A civilization's optimal strategy is the same every match.
- A map seed is decided by resource luck rather than decisions.
- The player wins by waiting through cleanup after the enemy is already beaten.
- A story mission implies one faction is evil by default.
- A rule cannot be explained in a short tooltip.

## Success signals

- A new player can complete a duel without reading a manual.
- An expert can replay the same civ with different trees and map seeds and make different choices.
- Losing feels instructive rather than random.
- The best play involves scouting, timing, terrain, economy, and logistics together.
- The prototype remains testable and performant.
