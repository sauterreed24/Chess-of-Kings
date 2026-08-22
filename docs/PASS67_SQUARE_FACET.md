---
name: Pass 67 — Square lamp facets
overview: "v0.5.59 wave: every marble/lapis square gets a carved lamp and shade so the board reads as turned stone, not a pillow balloon."
---

# Pass 67 — Square lamp facets (v0.5.59)

Playtest on 390×844 after Pass 66: unique piece cups were all 4.1px or taller. The board itself still used a CSS radial pillow on `.sq::before`, so empty squares read as balloons rather than carved marble and lapis.

## Shipped

1. **Every square** plants an inline SVG lamp + shade facet (no new CSS class). Occupied and empty squares keep the facet across redraws.
2. **`.sq::before`** drops the corner radial blob so the CSS wash is a single bevel, not a second pillow. Last-move cues keep their own `::before` treatments.
3. **Playwright** — calibration shows 64 `.sq-facet` nodes; occupied e2 and empty e4 both show the lamp/shade.

## Out of scope

- Replacing Wikipedia Staunton paths
- Chapters V–IX
- High-contrast tournament skin
