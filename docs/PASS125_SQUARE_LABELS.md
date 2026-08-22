---
overview: "v0.5.117 wave: enlarge file and rank corner marks on the marble."
---

# Pass 125 — Square labels (v0.5.117)

Playtest after Pass 124: run-back is tappable. File and rank marks still used `clamp(0.4rem, 1vw, 0.54rem)` — about 7px on the 17px phone root, easy to lose next to carved pieces.

## Shipped

1. **Graphics** — `renderLabels` sets inline `font-size: 0.7rem` on `.sq-label` so the CSS floor no longer wins. No new CSS.
2. **Playwright** — 390×844 skip-ahead calibration asserts a1's file and rank marks are 0.7rem and at least 10px tall.

## Out of scope

- CSS budget
- Native shells
