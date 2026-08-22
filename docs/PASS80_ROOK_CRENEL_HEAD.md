---
overview: "v0.5.72 wave: replace the Wikipedia Staunton rook roof notches with a civic battlement silhouette that reads on a phone square."
---

# Pass 80 — Rook crenel head (v0.5.72)

Playtest after Pass 79: knight, bishop, and queen are civic silhouettes. Calibration a1 was still Wikimedia's three-block roof with 2-unit notches. Carve merlon wells sat on that flat top. High-contrast lost the crenels once overlays were stripped.

## Shipped

1. **Shared silhouette** — three merlons, two deep crenels, stem, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Crenels in the glyph** — well rects use `--piece-stroke`, so high-contrast tournament rooks still have a battlement without carve overlays.
3. **Carved merlons, sheen, neck, flute, and cup** follow the new roof (cup sits in the body under the crenels).
4. **Lapis facet glint** — black rooks keep a stroke-colored highlight on the lamp-side merlon.
5. **Playwright** — calibration `a1`, castle `h1`, and title honor assert `.rook-silhouette`. Merlon depth floor is unchanged (3.5 CSS px).

## Out of scope

- CSS budget changes
- Rewriting pawn / king Wikipedia paths
