---
overview: "v0.5.110 wave: thicken classic-royal outlines so default ivory and lapis read on phone."
---

# Pass 118 — Classic-royal outline (v0.5.110)

Playtest after Pass 117: skip-ahead is 44px. Default civic pieces still used the shared 1.5 stroke. Neon, ornate, and high-contrast already thicken to 2.4; ivory/lapis vanished into the marble on ~40px squares.

## Shipped

1. **Graphics** — `glyphForSkin` thickens every carved set, including classic-royal. Cup/lathe widths stay 0.45 / 0.55. No new CSS.
2. **Playwright** — calibration and a 390×844 skip-ahead assert `stroke-width="2.4"` on e2.

## Out of scope

- CSS budget
- Native shells
