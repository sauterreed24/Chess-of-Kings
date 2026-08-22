---
name: Pass 58 — Rook merlon wells
overview: "v0.5.50 wave: ivory/lapis rook crenel wells deepen from a 1.8px phone roof scratch to readable battlement cuts on the first-board and castle-puzzle rooks."
---

# Pass 58 — Rook merlon wells (v0.5.50)

Playtest on 390×844 after Pass 57: calibration a1 `.piece-merlon` boxed at **3.8×1.8 CSS pixels**. Bishop cleft stems were 2.1×10.9. The rook still read as a flat roof.

## Shipped

1. **Ivory/lapis rooks** deepen the crenel wells (h 2.15 → 4.85, slightly wider) so the battlement cut reads on a ~40px phone square. Wells stop above the Staunton collar at y=14.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration a1 and castle-puzzle h1 wells are at least 3.5 CSS pixels tall.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
