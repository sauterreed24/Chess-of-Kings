---
overview: "v0.5.70 wave: replace the Wikipedia Staunton bishop teardrop-plus-ball with a civic mitre silhouette that reads on a phone square."
---

# Pass 78 — Bishop mitre head (v0.5.70)

Playtest after Pass 77: phone labs for Chapters VI–IX are proven, and the knight is a civic horse. Calibration and hanging-knight bishops were still Wikimedia's teardrop with a 2.5-radius finial. Carve overlays (cleft plus, cup, ferrule) sat on that blob. Black bishops still wrapped fill paths in a `fill="var(--piece-stroke)"` group — the same class of bug the knight had.

## Shipped

1. **Shared silhouette** — pointed mitre, stem, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Plus-cut in the glyph** — stem and crossbar use `--piece-stroke`, so high-contrast tournament bishops still have a mitre cut without carve overlays.
3. **Carved cleft, sheen, neck, flute, and cup** follow the new hat (neck ring under the brim, not across the mitre).
4. **Lapis facet glint** — black bishops keep a stroke-colored highlight on the lamp-side of the mitre, replacing Wikipedia's extra back-fill group.
5. **Playwright** — calibration `c1`, hanging-knight `c3`, and title honor assert `.bishop-silhouette`. Cleft size floors are unchanged (stem w ≥ 2, bar h ≥ 2.6).

## Out of scope

- CSS budget changes
- Rewriting pawn / rook / queen / king Wikipedia paths
- Phone Chapter VI–IX lab e2e (already on main)
