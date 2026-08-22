---
overview: "v0.5.68 wave: prove Chapter VII Human Synthesis drills on a 390×844 phone lab so the synthesis age is playable without desktop chrome."
---

# Pass 76 — Chapter VII phone lab (v0.5.68)

Playtest after Pass 75: Chapters VIII–IX phone labs are proven. Chapter VII still solved only on desktop Chrome. Teaching puzzles hide the manuscript and dock Prove; waiting on `#turn-pulse` fails because board scenes keep the turn chip off-screen.

## Shipped

1. **Playwright 390×844** — seeded Chapter VII save opens the age, advances lore, then solves `e4→d5`, `e1→c1` (queenside castle), and `e5→f7`.
2. **Phone puzzle chrome** — switch drill hides `#manuscript-panel`, docks `#btn-next` in `.board-tools`, keeps `#turn-pulse` and `.instrument-header` hidden, and leaves Prove in the viewport beside Hint.
3. **Caption** — overlay short form is `Chapter VII` (no universal-play clip). After smothered-mate Prove, Mira’s briefing restores the manuscript.
4. **Horse on the smother** — `e5` still shows `.knight-silhouette` on the phone square.

## Out of scope

- CSS budget changes
- Phone e2e for Chapter VI
- Rewriting pawn / bishop / rook / queen / king Wikipedia paths
