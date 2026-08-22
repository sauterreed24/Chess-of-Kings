---
name: Pass 17 — Short-lab board fit
overview: "v0.5.9 wave: short landscape labs stack the instrument and fit the marble so the starting ranks stay reachable."
---

# Pass 17 — Short-lab board fit (v0.5.9)

Playtest of the title-honor lab at 1280×500 kept Title / Chapters / Duel, but the two-column desktop grid clipped the board to Black’s back ranks. White’s e2 pawn was off-screen.

## Shipped

1. **Compact query** — `COMPACT_MEDIA_QUERY` includes `(max-height: 620px)` at any width so board-fit runs on short laptops and landscape phones.
2. **Stacked instrument** — the 960px board-first stack also applies below 620px tall, and the instrument column stops sticking over the marble.
3. **Playwright lock** — the 1280×500 skip-ahead lab asserts e2 and e4 stay in the viewport.

## Out of scope

- New chapter authorship
- Native store
- Hand-drawn replacement piece files
