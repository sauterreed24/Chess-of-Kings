---
overview: "v0.5.76 wave: prove the first Chapter VI Prax match on a 390×844 instrument, and keep 44px Hint/Reset when a phone match undocks or resizes."
---

# Pass 84 — Chapter VI Prax match (v0.5.76)

Playtest after Pass 83: Chapter I Amara is proven on a phone instrument. Chapter VI drills already hide the manuscript and dock Prove, but the first examiner match (`c6-match-prax`) was never walked on 390×844. Leaving a phone puzzle also cleared Hint/Reset inline floors, so a later match or a resize could drop below 44px until the next ply.

## Shipped

1. **`syncPhonePuzzleLesson` undock** — on a phone match (no puzzle/calibration marker), visible Hint and Reset keep `min-height`/`min-width: 44px`. Idle Reset stays hidden before the first ply. A second layout pass (resize) does not strip the floor.
2. **Playwright** — seeded Chapter VI walks outpost, hanging capture, and back-rank mate, then two briefings into Prax. Desktop and 390×844 assert civic pawn/king silhouettes, board-first layout, “Occupy the hole”, `e2–e4`, scripted `c5` reply, and Hint/Reset floors after resize. Amara’s phone match also asserts Hint at 44px before the opening ply.
3. **Vitest** — phone match undock/resize keeps the floor; idle match does not unhide Reset.

## Out of scope

- CSS budget changes
- Chapters VII–IX examiner matches on phone
