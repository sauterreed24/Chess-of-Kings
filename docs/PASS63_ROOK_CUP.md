---
name: Pass 63 — Rook battlement cup
overview: "v0.5.55 wave: ivory/lapis rook battlement cups deepen from a 2.4px phone dish to a readable lathe bowl under the crenel wells."
---

# Pass 63 — Rook battlement cup (v0.5.55)

Playtest on 390×844 after Pass 62: calibration/castle a1 `.piece-cup` boxed at **12.3×2.4 CSS pixels**. Merlon wells were 4.0×4.2. The battlement still read as a flat roof with cuts, not a turned bowl.

## Shipped

1. **Ivory/lapis rooks** deepen the battlement cup (ry 1.42 → 2.38) so the lathe bowl fills the crenel zone on a ~40px phone square.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration a1 and castle-puzzle h1 cups are at least 3.5 CSS pixels tall.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
