---
overview: "v0.5.66 wave: prove Chapter IX Apotheosis Engine drills on a 390×844 phone lab so the last campaign age is playable without desktop chrome."
---

# Pass 74 — Chapter IX phone lab (v0.5.66)

Playtest after Pass 73: Chapter IX solves on desktop Chrome, but phone labs (max-width 700px) for the Apotheosis Engine were unproven. Teaching puzzles hide the manuscript and dock Prove; waiting on `#turn-pulse` fails because board scenes keep the turn chip off-screen.

## Shipped

1. **Playwright 390×844** — seeded Chapter IX save opens the age, advances lore, then solves `e2→e6`, `e4→d6`, and `a1→a8`.
2. **Phone puzzle chrome** — census drill hides `#manuscript-panel`, docks `#btn-next` in `.board-tools`, keeps `#turn-pulse` and `.instrument-header` hidden, and leaves Prove in the viewport beside Hint.
3. **Caption** — overlay short form is `Chapter IX` (no fused-stack clip). After last-rank Prove, Wren’s briefing restores the manuscript.
4. **Horse on the compiled fork** — `e4` still shows `.knight-silhouette` on the phone square.

## Out of scope

- CSS budget changes
- Phone e2e for Chapters VI–VIII
- Rewriting pawn / bishop / rook / queen / king Wikipedia paths
