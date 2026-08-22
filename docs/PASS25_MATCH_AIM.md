---
name: Pass 25 — Match aim stays
overview: "v0.5.17 wave: live matches and duels keep a short opening command on the instrument after a piece is selected, instead of swapping it for a legal-move census."
---

# Pass 25 — Match aim stays (v0.5.17)

Playtest of the first Amara match showed the instrument still saying `Select piece. Targets glow; captures bronze, check crimson` and then `e2 pawn selected: 2 legal targets` the moment a pawn was touched. Teaching puzzles already keep the command. The first real game has to as well. The dots already show destinations.

## Shipped

1. **Live-game aim** — campaign matches and duels put a short rival-specific command on `#board-guide` for the first ten plies (`Open the center; castle before Amara's symmetry hardens.`).
2. **Aim stays while selected** — choosing a piece keeps that command. Castle destination naming and move-guard confirmations still override, because those *are* the instruction. Check still takes the instrument.
3. **Playwright** — Amara's aim is on the instrument before and after selecting e2; the Alexion duel keeps `accountable` / `no loose pieces` the same way.

## Out of scope

- Winning the Amara match in Playwright
- New chapter authorship
- Native store
