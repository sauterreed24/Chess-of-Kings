---
overview: "v0.5.125 wave: enlarge match briefing tier, encounter, and ladder dots."
---

# Pass 133 — Match briefing (v0.5.125)

Playtest after Pass 131: the lab bar reads. The first living match card still used a 0.46rem tier badge and 0.46rem ladder dots — about 8px on the 17px root — so Initiate / Encounter 1 of 6 were the first unreadable briefing chrome under the phone board.

## Shipped

1. **Graphics** — `renderScene` and `buildLadderTrack` plant `font-size:0.7rem` on the tier badge, encounter line, and ladder dots. No new CSS.
2. **Playwright** — 390×844 Amara asserts `.tier-badge`, `.match-num`, and the first `.ltrack-dot`.

## Out of scope

- CSS budget
- Native shells
