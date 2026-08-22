---
name: Pass 29 — Quiet puzzle chrome
overview: "v0.5.21 wave: teaching puzzles drop the chapter crawl, empty ledger, sound row, and duplicate lesson line so the hanging-knight command sits on the marble."
---

# Pass 29 — Quiet puzzle chrome (v0.5.21)

Phone playtest of the hanging knight still stacked **The Ancient Board**, an empty **Move ledger**, **Sound / Move Guard**, and a lesson line that repeats the teaching cards between the marble and the proof.

## Shipped

1. **Puzzle chrome collapses** — `renderScene` hides `.play-crawl`, `.move-ledger-wrap`, `.instrument-toggles`, and `#lesson-note` on `scene.type === 'puzzle'`. Hint, Take back, and Reset stay. No CSS (budget is full).
2. **Living boards restore it** — calibration, match, freeplay, and duel keep the ledger, toggles, and crawl. Sound remains on the title plate.
3. **Playwright** — hanging knight hides that chrome; Amara shows crawl, ledger, and toggles again.

## Out of scope

- Hiding Hint / Take back / Reset
- New chapter authorship
- Native store
