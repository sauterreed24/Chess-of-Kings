---
overview: "v0.5.133 wave: enlarge Duel Archive era chips and history labels."
---

# Pass 141 — Duel era and history (v0.5.133)

Playtest after Pass 137: file-count stamps read. Roster era chips still used 0.6rem and history labels 0.48rem — about 8–10px on the 17px root — so the era line and Wins / Losses were the remaining unreadable dossier chrome on phone.

## Shipped

1. **Graphics** — `renderDuelUi` plants `font-size:0.7rem` on roster `.ch-idx` and dossier-stat `<small>` labels. No new CSS.
2. **Playwright** — 390×844 Duel Archive asserts the first era chip and history label.

## Out of scope

- CSS budget
- Native shells
- Last-move outer glow (still clipped by `.sq { overflow: hidden }`)
