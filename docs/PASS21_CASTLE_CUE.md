---
name: Pass 21 — Castle destination cue
overview: "v0.5.13 wave: castling destinations read as castle squares, and Chapter I plays hanging knight then O-O on the live board."
---

# Pass 21 — Castle destination cue (v0.5.13)

The second Chapter I lesson asks you to castle kingside, but g1 looked like any empty legal-move dot. Players had to already know that the king moves two squares.

## Shipped

1. **Castle targets** — `BoardView` marks O-O / O-O-O destinations with `sq-legal-castle` and `legal castle destination` for the screen reader, instead of a quiet-move dot.
2. **Instrument line** — with the king selected, `#board-guide` says `castle kingside to g1` (or queenside to c1/c8).
3. **Playwright lock** — Chapter I solves the hanging knight, then selects e1, asserts the castle cue on g1, and completes O-O.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
