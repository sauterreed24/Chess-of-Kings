---
overview: "v0.5.74 wave: replace the Wikipedia Staunton king stroke-plus and bow-tie flares with a civic crown silhouette that reads on a phone square."
---

# Pass 82 — King crown head (v0.5.74)

Playtest after Pass 81: every other type is a civic silhouette. Calibration e1 was still Wikimedia's stroke-only plus on bow-tie flares. Carve inlay sat on that scribble. High-contrast lost the plus once overlays were stripped.

## Shipped

1. **Shared silhouette** — crown bowl, stem, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Cross in the glyph** — stem and bar rects use `--piece-stroke`, so high-contrast tournament kings still have a plus without carve overlays.
3. **Carved inlay, sheen, neck, flute, and cup** follow the new brim (cup sits in the crown bowl).
4. **Lapis facet glint** — black kings keep a stroke-colored highlight on the lamp-side of the crown.
5. **Playwright** — calibration `e1`, castle `e1`, mate-in-one `e8`, Amara `e8`, and title honor assert `.king-silhouette`. Cross size floors are unchanged (2 / 2.6 CSS px).

## Out of scope

- CSS budget changes
