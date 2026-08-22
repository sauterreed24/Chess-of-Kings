---
name: Pass 9 — Board Presence
overview: "v0.5.1 wave: readable legal moves, marble-preserving last-move cues, SVG captured material, larger phone/tablet board, and a live click-to-move smoke."
---

# Pass 9 — Board Presence (v0.5.1)

Playtest of the v0.5.0 Paradox Masters build (desktop 1280×800 and iPhone-width 390×844) showed the story chrome is already strong and the board is the surface players stare at. This pass makes that surface readable and larger without adding runtime dependencies.

## Shipped

1. **Legal-move dots** — one shared marble/lapis treatment, 36% / 22px, gold core plus dark ring so targets stay visible on both square colors.
2. **Last-move route cue** — origin and destination keep the marble/lapis materials. Inset rings and a `::before` wash replace the old `!important` background overwrite.
3. **Carved pieces** — slightly larger SVG glyphs, ivory/lapis fills, and a highlight drop-shadow so the set reads as carved rather than flat.
4. **Captured material** — the HUD now uses the active piece skin SVGs instead of unicode figurines. Eval + captures also appear on freeplay rehearsal boards (still hidden on calibration and puzzles).
5. **Board-first compact layout** — under 960px the live board stacks above the manuscript, the crawl subtitle/philosophy hide, and the instrument column can grow past the old 420px cap.
6. **Readable flight** — piece carry is 280ms with a slightly higher arc so a reply can be followed.
7. **Play smoke** — Playwright clicks e2→e4 on the prologue calibration after skip-ahead and asserts the ledger and 1/4 counter.

## Playtest notes

- First-session skip-ahead still lands on the calibration board.
- Hint / Take back / keyboard atlas were already present and were left in place.
- Rival replies still lock the grid while the archive ponders; clicks during that window are ignored by design.

## Out of scope

- New chapter authorship
- Native store
- New piece art files (skins stay CSS-tinted Wikipedia-derived SVGs)
