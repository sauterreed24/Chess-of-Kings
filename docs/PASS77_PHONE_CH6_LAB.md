---
overview: "v0.5.69 wave: prove Chapter VI Silicon Threshold drills on a 390×844 phone lab and floor docked Hint/Prove at 44px."
---

# Pass 77 — Chapter VI phone lab (v0.5.69)

Playtest after Pass 76: Chapters VII–IX phone labs are proven. Chapter VI still solved only on desktop Chrome. A Codex review on the Chapter VIII phone pass noted Hint|Prove only had a max height, so a 390px lab could still ship sub-44px touch targets.

## Shipped

1. **Playwright 390×844** — seeded Chapter VI save opens the age, advances lore, then solves `c3→d5`, `e3→d5`, and `e1→e8`.
2. **Phone puzzle chrome** — outpost drill hides `#manuscript-panel`, docks `#btn-next` in `.board-tools`, keeps `#turn-pulse` hidden, and leaves Prove in the viewport beside Hint.
3. **44px hit targets** — docked Prove, Hint, and calibration Reset get inline `box-sizing: border-box` plus `min-height`/`min-width: 44px` (no stylesheet bump). Hanging-knight and Chapters VI–IX phone labs assert the floor.
4. **Caption** — overlay short form is `Chapter VI`. After back-rank Prove, Prax’s briefing restores the manuscript.

## Out of scope

- CSS budget changes
- Rewriting pawn / bishop / rook / queen / king Wikipedia paths
