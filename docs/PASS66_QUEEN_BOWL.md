---
name: Pass 66 — Queen coronet cup
overview: "v0.5.58 wave: ivory/lapis queen cups deepen from a 3.6px phone dish to a readable lathe bowl under the coronet pearls."
---

# Pass 66 — Queen coronet cup (v0.5.58)

Playtest on 390×844 after Pass 65: king, rook, pawn, and bishop cups were 4.1px or taller. Calibration d1 `.piece-cup` boxed at **9.1×3.6 CSS pixels** — a dish under 3.7px pearls, not a turned bowl.

## Shipped

1. **Ivory/lapis queens** deepen the coronet cup (ry 1.85 → 2.38, cy 15.1 → 15.8) so the lathe bowl sits under the pearls on a ~40px phone square.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration d1 and mate-puzzle e5 cups are at least 3.5 CSS pixels tall.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
