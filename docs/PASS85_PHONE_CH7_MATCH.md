---
overview: "v0.5.77 wave: prove the first Chapter VII Mira match on a 390×844 instrument."
---

# Pass 85 — Chapter VII Mira match (v0.5.77)

Playtest after Pass 84: Chapter VI Prax is proven on a phone instrument. Chapter VII drills already hide the manuscript and dock Prove, but the first examiner match (`c7-match-mira`) was never walked on 390×844.

## Shipped

1. **Playwright** — seeded Chapter VII walks hanging capture, queenside castle, and smothered mate, then two briefings into Mira. Desktop and 390×844 assert civic pawn/king silhouettes, board-first layout, “Take what hangs”, `e2–e4`, scripted `e5` reply, board-guide fit, and Hint/Reset floors after resize.
2. **Helpers** — `walkChapterVIIDrillsToMate`, `playNf7Mate`, and `advanceToMiraMatch` keep the desktop drill walk and the new match tests on one path.

## Out of scope

- CSS budget changes
- Chapters VIII–IX examiner matches on phone
