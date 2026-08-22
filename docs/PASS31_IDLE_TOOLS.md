---
name: Pass 31 — Idle board tools
overview: "v0.5.23 wave: Take back and Reset stay off teaching boards until a ply exists, so hanging-knight phones keep Hint on one row instead of wrapping a dead Take back above Reset."
---

# Pass 31 — Idle board tools (v0.5.23)

Phone playtest after puzzle-chrome still stacked **Hint | Take back** over a full-width **Reset**. Take back was disabled and Reset had nothing to rewind. That second row sat between the marble and the teaching cards.

## Shipped

1. **Idle Take back hides** — `#btn-undo` uses `hidden` when `!canUndo`, same pattern as Hint / Run it back.
2. **Idle Reset hides** — `#btn-reset` hides while the SAN log is empty. After the first ply both return.
3. **Empty tool row collapses** — if Hint, Take back, Run it back, and Reset are all hidden, `.board-tools` hides too.
4. **Playwright** — hanging knight hides Take back and Reset on the opening frame and shows them after bishop takes d4.

## Out of scope

- Hiding Hint
- CSS budget changes
- Native store
