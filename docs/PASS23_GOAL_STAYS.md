---
name: Pass 23 — Goal stays while you choose
overview: "v0.5.15 wave: teaching puzzles keep the live command after a piece is selected, and ivory/lapis get a carved waist collar."
---

# Pass 23 — Goal stays while you choose (v0.5.15)

Playtest of the mate-in-one showed the instrument swapping `Checkmate in one with the queen` for `e5 queen selected: 24 legal targets` the moment the queen was touched. The dots already show destinations. The command has to stay.

## Shipped

1. **Teaching goal stays** — calibration and puzzles keep `goalBrief` / `goalPlain` while a piece is selected. Move-guard confirmations and castle naming still override, because those *are* the instruction.
2. **Carved collar** — each lamp-lit glyph gets a waist ellipse so the silhouette reads as a turned piece on a plinth, not a sticker.
3. **Playwright** — hanging knight and mate-in-one assert the command is still on the instrument after the piece is selected.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
