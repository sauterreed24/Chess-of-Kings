---
overview: "v0.5.106 wave: scale the title honor guard so carved ivory and lapis read on phone."
---

# Pass 114 — Phone title honor scale (v0.5.106)

Playtest after Pass 113: top nav is 44px. The honor guard was still 1.7rem (~29px) in a single cramped row, so eyes, merlons, and pearls vanished.

## Shipped

1. **Graphics** — `syncTitleHonorScale` wraps the ten pieces into two ranks of five at 2.4rem on `max-width: 700px`. Honor glyphs reuse the 2.4 civic outline. No new CSS.
2. **Playwright** — 390×844 asserts each honor piece is at least 38px tall.

## Out of scope

- CSS budget / restyling the gold rules
- Native shells
