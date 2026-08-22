---
name: Pass 64 — Knight eye
overview: "v0.5.56 wave: ivory/lapis knights get a carved eye so the first-board and hanging-knight horses read as a head, not only a mane."
---

# Pass 64 — Knight eye (v0.5.56)

Playtest on 390×844 after Pass 63: unique heads (pearls, merlons, cleft plus, king plus, pawn spark, ferrule, rook cup) were all 2.6px or larger. The Staunton knight still used a 0.5-unit path eye (~0.9px). The horse read as a mane without a face.

## Shipped

1. **Ivory/lapis knights** add a carved eye (r 1.72) on the Staunton eye so the head reads on a ~40px phone square.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration b1 and hanging-knight d4 eyes are at least 2.4 CSS pixels across. Title honor shows two eyes.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
