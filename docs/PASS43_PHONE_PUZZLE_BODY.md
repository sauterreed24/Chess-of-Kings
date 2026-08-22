---
name: Pass 43 — Phone puzzle manuscript body
overview: "v0.5.35 wave: hanging-knight phones hide the empty manuscript body and the desktop keyboard hint so Prove sits under the puzzle title."
---

# Pass 43 — Phone puzzle manuscript body (v0.5.35)

After hiding lesson-lead, hanging-knight phones still showed a dark empty card: `#narrative-body` keeps a 3rem min-height even when every child is `display:none`. Playwright at 390×844 also kept the desktop keyboard paragraph because Chromium reports a fine pointer.

## Shipped

1. **Phone puzzles hide `#narrative-body`** — scene tag and Prove stay. Wide labs keep the body, beat, lead, and Your goal.
2. **Phone labs hide `#narrative-kbd-hint`** — the board still names the command on `#board-guide`.
3. **Playwright** — hanging-knight phone hides the body and keyboard hint; castle 1280 still shows the body.

## Out of scope

- CSS budget changes
- New chapter authorship
- Native store
