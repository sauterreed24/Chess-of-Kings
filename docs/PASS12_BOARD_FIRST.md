---
name: Pass 12 — Board-first compact
overview: "v0.5.4 wave: compact live boards drop the duplicate chapter label, shrink the crawl to a single title row, and count Sound/Move Guard when fitting the grid."
---

# Pass 12 — Board-first compact (v0.5.4)

Playtest of the quieter instrument still left **THE WHITE SCREEN** plus a repeated chapter label above the marble on a phone. The vestibule bar already names the passage. Sound and Move Guard, now under the tools, were also missing from the mobile board-fit math.

## Shipped

1. **Compact crawl is one row** — title + passage chip. Chapter label, subtitle, and philosophy hide under 960px on board scenes.
2. **Board-fit counts toggles** — `--mobile-board-max` includes `.instrument-toggles` so the grid does not overflow the sound row.
3. **Duel smoke** — Playwright starts the first rival, plays e2→e4, and waits for an Archive reply.

## Playtest notes

- Desktop crawl is unchanged (still the full title block above the atelier).
- Vestibule `← Chapters` remains the labeled exit on compact.

## Out of scope

- New chapter authorship
- Native store
- New piece art files
