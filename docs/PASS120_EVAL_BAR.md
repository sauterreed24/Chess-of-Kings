---
overview: "v0.5.112 wave: widen the match eval tray so the rotated score still reads on phone."
---

# Pass 120 — Eval bar readability (v0.5.112)

Playtest after Pass 119: captured glyphs are 2rem. The evaluation tray was still 8–10px with a 0.38rem rotated score (~6px on the 17px phone root), so the number vanished beside the marble.

## Shipped

1. **Graphics** — `syncEvalBarScale` sets inline 18px width and 0.78rem ivory on the score when the HUD is shown (campaign matches, freeplay, and Duel Archive). Hidden scenes clear the inline styles. No new CSS.
2. **Playwright** — 390×844 starts a duel and asserts the tray is 18px.

## Out of scope

- CSS budget
- Native shells
