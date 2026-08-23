---
overview: "v0.5.132 wave: enlarge the manuscript scene tag."
---

# Pass 140 — Scene tag (v0.5.132)

Playtest after Pass 138: the crawl Passage chip and chapter label read. The manuscript still used a 0.55rem `#scene-tag` — about 9.4px on the 17px root — so Dialogue / Calibration was the first unreadable scene kicker on phone.

## Shipped

1. **Graphics** — `renderScene` and the duel / chapter-complete paths set `#scene-tag` to 0.7rem. No new CSS.
2. **Playwright** — 390×844 skip-ahead prose asserts the tag is 0.7rem.

## Out of scope

- CSS budget
- Native shells
- Hint / Target kickers (`.hint-label`)
