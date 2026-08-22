---
overview: "v0.5.120 wave: enlarge the opening calibration rail so 0/4 still reads."
---

# Pass 128 — Calibration rail (v0.5.120)

Playtest after Pass 127: echo chips read. The first-session calibration rail still used a 0.5rem board-scene label and 11px dots — about 8px type on the 17px phone root.

## Shipped

1. **Graphics** — `applyChessUi` sets the rail label to 0.7rem and plants 16px inscribed dots. No new CSS.
2. **Playwright** — 390×844 skip-ahead calibration asserts the label and first dot.

## Out of scope

- CSS budget
- Native shells
