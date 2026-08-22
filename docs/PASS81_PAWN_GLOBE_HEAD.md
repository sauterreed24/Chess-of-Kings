---
overview: "v0.5.73 wave: replace the Wikipedia Staunton pawn teardrop with a civic globe silhouette that reads on a phone square."
---

# Pass 81 — Pawn globe head (v0.5.73)

Playtest after Pass 80: knight, bishop, queen, and rook are civic silhouettes. Calibration e2 was still Wikimedia's tiny head circle on a teardrop stem. Carve orb and spark sat on that blob. High-contrast lost the globe once overlays were stripped.

## Shipped

1. **Shared silhouette** — round globe, collar, stem, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Globe and collar in the glyph** — catch-light circle and collar ellipse use `--piece-stroke`, so high-contrast tournament pawns still have a head without carve overlays.
3. **Carved orb, spark, sheen, neck, flute, and cup** follow the new globe (cup sits in the head, neck under the collar).
4. **Lapis facet glint** — black pawns keep a stroke-colored highlight on the lamp-side of the globe.
5. **Playwright** — calibration `e2` (desktop and 390×844) asserts `.pawn-silhouette`. Orb/spark size floors are unchanged (4 / 2.4 CSS px).

## Out of scope

- CSS budget changes
- Rewriting king Wikipedia paths
