---
overview: "v0.5.141: screen readers announce the opponent's reply, not just whose turn it is."
---

# Pass 149 — Hear the rival's move (v0.5.141)

A keyboard-only playthrough of a Duel (Tab to the board, arrows, Enter to select and to move) watched every live region with a MutationObserver.

## Findings

Keyboard play itself is sound: roving focus lands on the board, squares read "e2, White Pawn, selected; 2 legal targets" and "Square e4, empty, legal move target", and focus stays on the moved piece after the reply.

But the reply was silent. During 1. e4 d5 the live regions said only "White to move.", "Thinking…", "Rival pondering", and a coach tip. Nothing said that Black played d5. A screen-reader player had to walk the board after every move to find out what changed — the core loop of a chess game.

## Shipped

1. **`describeMove`** (`src/app/a11y/moveSpeech.ts`, pure) — side, piece, squares, and what happened: capture with the captured piece, en passant, castling side, promotion, check, checkmate.
2. **Announce the opponent's move** — `applyChessUi` speaks the last move when the ledger grew and the mover is not the player. It does not repeat on re-render, and the player's own move stays silent (they just made it).
3. **One message at the end** — the announcer replaces its text, so a mating reply is prefixed to the outcome line ("Black queen d8 to h4, checkmate. … Amara.") instead of being overwritten by it. The same applies to a teaching seal.

Index chunk +~0.3 KB gzip; no CSS.

## Playtest notes

- Duel vs Alexion, keyboard only: after 1. e4 the announcer says "Black pawn d7 to d5."
- Calibration and puzzle replies use the same path (the Archive / puzzle opponent is not the player's colour).

## Out of scope

- A full move-history reader (the move ledger is already a labelled region).
- Announcing the player's own move as confirmation.
