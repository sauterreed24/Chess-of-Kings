---
name: Pass 50 — Phone calibration Prove dock
overview: "v0.5.42 wave: calibration phones hide the duplicate teaching card, empty ledger, and sound row, then dock Prove next to Hint so Advance is on screen."
---

# Pass 50 — Phone calibration Prove dock (v0.5.42)

Calibration is the first board. On a 390×844 phone the marble already named the four-move goal, then an empty ledger, Sound/Move Guard, a duplicate lesson line, and an 864px manuscript buried Prove at y=1511 — below the fold.

## Shipped

1. **Phone calibration** sets `data-calibration-lesson` and reuses the puzzle dock: hide `#manuscript-panel`, park `#btn-next` after Hint, hide `.move-ledger-wrap`, `.instrument-toggles`, and `#lesson-note`.
2. **Wide labs keep the teaching card** — 1280 calibration still shows Your goal in the manuscript.
3. **Leaving calibration restores Advance** — `renderScene` syncs on every scene so the glitch dialogue unhides the manuscript.
4. **Playwright** — 390×844 calibration hides the manuscript and ledger, shows Hint|Prove on one row, and keeps Prove in view after e4.

## Out of scope

- CSS budget changes
- Replacing Wikipedia Staunton paths
- After-prove tool wrap on hanging-knight
