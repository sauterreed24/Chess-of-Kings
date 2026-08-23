---
overview: "v0.5.131 wave: enlarge the crawl chapter label."
---

# Pass 139 — Chapter label (v0.5.131)

Playtest after Pass 138: the Passage chip reads. The crawl still used a 0.55rem `#play-chapter-label` — about 9.4px on the 17px root — so Prologue · era was the first unreadable header line on the opening phone scene.

## Shipped

1. **Graphics** — `renderScene` and the duel launcher set `#play-chapter-label` to 0.7rem. No new CSS.
2. **Playwright** — 390×844 skip-ahead prose asserts the label is 0.7rem.

## Out of scope

- CSS budget
- Native shells
- `#scene-tag` (0.55rem manuscript kicker)
