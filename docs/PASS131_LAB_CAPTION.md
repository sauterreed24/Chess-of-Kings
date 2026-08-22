---
overview: "v0.5.123 wave: enlarge the lab overlay era caption so Prologue still reads."
---

# Pass 131 — Lab caption (v0.5.123)

Playtest after Pass 128: the rail reads. The overlay bar still used a 0.46rem phone caption — about 8px on the 17px root — so "Prologue" and "Chapter I" were the first unreadable chrome in a live lab.

## Shipped

1. **Graphics** — `syncLabOverlayCaption` sets the era label to 0.7rem. No new CSS.
2. **Playwright** — 390×844 skip-ahead calibration asserts `#lab-era-label` is 0.7rem.

## Out of scope

- CSS budget
- Native shells
