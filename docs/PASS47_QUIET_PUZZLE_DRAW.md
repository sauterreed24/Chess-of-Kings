---
name: Pass 47 — Quiet puzzle draw
overview: "v0.5.39 wave: hanging-knight capture no longer unhides a Draw. pill and king-hunt pulse over the marble seal."
---

# Pass 47 — Quiet puzzle draw (v0.5.39)

After Bxd4 the hanging-knight proof is sealed, but chess.js also calls the leftover K+B vs K a draw. The instrument then showed **Draw.** and a king-hunt pulse, crowding the marble that already says the proof is sealed.

## Shipped

1. **Puzzle/calibration status** stays empty on stalemate or dead draws. Checkmate still files **Checkmate.**
2. **Teaching puzzles omit tactical pulse** so a motif line cannot reopen the idle header.
3. **Playwright** — hanging-knight phone keeps `#board-status`, `.instrument-header`, and `#tactical-pulse` hidden after Bxd4; the marble reads proof sealed. Mate-in-one still shows Checkmate.

## Out of scope

- CSS budget changes
- Match/duel draw copy
- New chapter authorship
