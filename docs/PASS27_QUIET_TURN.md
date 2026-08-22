---
name: Pass 27 — Quiet turn pill
overview: "v0.5.19 wave: ordinary White/Black-to-move pills leave the instrument, so the live command sits next to the marble without a redundant status chip."
---

# Pass 27 — Quiet turn pill (v0.5.19)

The hanging-knight phone playtest still stacked a `White to move.` pill above the short command. The command already says what to do. The dots already show destinations. The pill was taking a 2rem strip that the marble could use.

## Shipped

1. **Routine turn is silent** — `White to move.` / `Black to move.` hide the status pill and its wrap. Check, thinking, proof seals, mate, and match outcomes still take the chip.
2. **No CSS** — uses the existing `.hidden { display: none !important }` so it beats the board-scene inline-flex min-height.
3. **Playwright** — hanging knight and Amara assert the pill is hidden; mate-in-one still shows Checkmate.

## Out of scope

- Hiding chapter title / tools row (separate chrome)
- New chapter authorship
- Native store
