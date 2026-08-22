---
name: Pass 65 — King crown cup
overview: "v0.5.57 wave: ivory/lapis king cups deepen from a 3.2px phone dish to a readable lathe bowl under the plus."
---

# Pass 65 — King crown cup (v0.5.57)

Playtest on 390×844 after Pass 64: the knight eye boxed at **2.9×2.9**. Rook, pawn, and bishop cups were 4.1px or taller. Calibration e1 `.piece-cup` boxed at **5.8×3.2 CSS pixels** — a dish under a readable plus, not a turned bowl.

## Shipped

1. **Ivory/lapis kings** deepen the crown cup (ry 1.65 → 2.38, cy 16.4 → 15.2) so the lathe bowl sits under the plus on a ~40px phone square.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration e1 and hanging-knight d1 cups are at least 3.5 CSS pixels tall.

## Out of scope

- CSS budget changes
- Queen cup (still 3.6px)
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
