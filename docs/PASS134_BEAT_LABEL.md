---
overview: "v0.5.126 wave: enlarge story-beat and Court Dossier kicker labels."
---

# Pass 134 — Beat labels (v0.5.126)

Playtest after Pass 132: quality marks read. Story-beat kickers and Court Dossier still used 0.5rem — about 8.5px on the 17px root — so Pressure / Court Dossier were the first unreadable manuscript chrome under the phone board.

## Shipped

1. **Graphics** — `storyBeatBlock`, `teachingBlock`, and `aiTraitBars` plant `font-size:0.7rem` on the kicker labels. No new CSS.
2. **Playwright** — 390×844 Amara asserts `.story-beat__label` and `.ai-traits .teach-label`.

## Out of scope

- CSS budget
- Native shells
- Duel Archive `teach-label` fields
