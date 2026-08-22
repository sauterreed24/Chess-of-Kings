---
overview: "v0.5.111 wave: scale captured HUD glyphs so carved material still reads on phone."
---

# Pass 119 — Captured HUD scale (v0.5.111)

Playtest after Pass 118: live-board outlines are 2.4. The match material tray still painted those glyphs at 1.1rem (~19px on the 17px phone root), so carved cups and crowns collapsed into a dash.

## Shipped

1. **Graphics** — `capturedRow` sets inline `2rem` width/height (and `flex-shrink:0`) on every `.cap-piece`. Alexandrine ivory still carries `--piece-stroke:#6b4e14`. No new CSS.
2. **Playwright** — the 390×844 Amara match plays `e4`, waits for scripted `d5`, takes `exd5`, and asserts the captured pawn is 2rem with a 2.4 outline.

## Out of scope

- CSS budget
- Native shells
