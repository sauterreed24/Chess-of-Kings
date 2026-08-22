---
name: Pass 57 — Bishop mitre cleft
overview: "v0.5.49 wave: ivory/lapis bishop clefts thicken from a 0.9px phone hairline to a readable mitre cut on the first-board and hanging-knight bishops."
---

# Pass 57 — Bishop mitre cleft (v0.5.49)

Playtest on 390×844 after Pass 56: calibration c1 `.piece-cleft` stem boxed at **0.9×10.9 CSS pixels**. King cross stems were 2.3×5.1. The bishop still read as a smooth mitre.

## Shipped

1. **Ivory/lapis bishops** thicken the mitre cleft (stem w 1.0 → 2.4, bar h 0.95 → 1.95) so the cut reads on a ~40px phone square.
2. **Forced Visual: Lean** keeps the geometry. High-contrast stays uncarved.
3. **Playwright** — calibration c1 and hanging-knight c3 stems are at least 2 CSS pixels wide.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- High-contrast tournament skin
