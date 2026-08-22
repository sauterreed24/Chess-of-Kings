---
overview: "v0.5.80 wave: prove the first Chapter II Rowan match on a 390×844 instrument."
---

# Pass 88 — Chapter II Rowan match (v0.5.80)

Playtest after Pass 87: first matches of Chapters I and VI–IX are proven on a phone instrument. Chapter II is the next session after Amara, but it never walked on 390×844. Rowan does not start from `e2–e4` — the Age of Fire opens on a King’s Gambit tabiya (`1. e4 e5 2. f4`), so a copied opening ply would miss the board.

## Shipped

1. **Phone-short king hunt** — `c2-puzzle-king-hunt` now has `goalBrief: 'Checkmate in one on the eighth rank.'` Teaching puzzles without a brief must keep `goalPlain` under 80 characters so the instrument command fits.
2. **Playwright** — seeded Chapter II walks Romantic doctrine, mates with `Qg8`, then two briefings into Rowan. Desktop and 390×844 assert civic pawn/king silhouettes on `f4`/`e1`/`e8`, board-first layout, “poisoned pawn”, `g1–f3`, scripted `exf4` reply (Pass 85 first-ply honor), board-guide fit, and Hint/Reset floors after resize.
3. **Helpers** — `walkChapterIIDrillToMate`, `playQg8Mate`, and `advanceToRowanMatch` keep the desktop drill walk and the new match tests on one path.

## Out of scope

- CSS budget changes
- Vega, and later-age second examiners, on phone
