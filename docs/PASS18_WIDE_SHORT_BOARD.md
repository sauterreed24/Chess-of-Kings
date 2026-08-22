---
name: Pass 18 — Wide short-lab board
overview: "v0.5.10 wave: wide short labs keep two columns and height-fit the marble so it is playable, not a 174px postage stamp."
---

# Pass 18 — Wide short-lab board (v0.5.10)

Pass 17 kept e2 on screen at 1280×500 by stacking the instrument and capping the marble at 42vh. That made the starting ranks reachable, but the stacked board sat in a tiny centered square (~174px) with empty space beside it.

## Shipped

1. **Stack only when narrow** — the board-first stack stays at `max-width: 960px`. Short height alone no longer collapses a wide atelier (1280×500 stays two columns).
2. **Wide short fit** — below 620px tall and at least 961px wide, the marble uses `--mobile-board-max` (72vh fallback, not 42vh).
3. **Phone stack unchanged** — 390×844 and other narrow shorts still put the board above the manuscript.
4. **Playwright lock** — the 1280×500 skip-ahead lab asserts two columns, e2/e4 in view, and a marble at least 240px wide.

## Out of scope

- New chapter authorship
- Native store
- Hand-drawn replacement piece files
