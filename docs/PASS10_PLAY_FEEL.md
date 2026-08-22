---
name: Pass 10 — First-session play feel
overview: "v0.5.2 wave: live top nav from the lab, destination-named leave confirms, quieter title/chronicle lore, and a remaining-move Prove hint."
---

# Pass 10 — First-session play feel (v0.5.2)

Playtest after the board-presence pass showed Title / Chapters / Duel still painted over the live board while `inert` swallowed every click. That felt like broken navigation. First-session chrome was also stacked: two lore grids before the primary CTA, and the blocked Advance button said "Prove 3 White moves" after the first calibration ply.

## Shipped

1. **Top nav works in the lab** — Title / Chapters / Duel stay in the accessibility tree and receive clicks. Background screens remain inert.
2. **Destination-named leave confirms** — a mid-board Duel click asks "Open the Duel Archive?" rather than a generic leave prompt.
3. **Quieter first session** — Long Reign world markers and the Chronicle thread start collapsed behind dossier folds.
4. **Prove hint** — remaining calibration plies read "3 remaining" instead of "3 White moves".
5. **Confirm plaque** — sits above the lab (`z-index: 80`) with 44px actions.
6. **Tests** — unit coverage for exit copy; play-smoke and Playwright lock the live-board → Duel confirm path.

## Playtest notes

- Vestibule "← Chapters" still exits; Escape still routes to Chapters.
- Short landscape viewports still hide the top bar; vestibule remains the thumb exit there.

## Out of scope

- New chapter authorship
- Native store
- New piece art files
