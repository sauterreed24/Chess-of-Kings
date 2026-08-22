---
name: Pass 20 — Puzzle instrument focus
overview: "v0.5.12 wave: teaching puzzles drop the fake court dossier, and carved glyphs fill the square they sit on."
---

# Pass 20 — Puzzle instrument focus (v0.5.12)

Phone playtest of the hanging knight still put a "Court dossier — Puzzle Counterplay Engine" line above the short d4 command. That is match/duel language, not a teaching order. Glyphs also sat 2px above the marble at 93% scale, which kept them reading as floating icons.

## Shipped

1. **No puzzle dossier** — `currentAiPersona` stays null on teaching puzzles. Match and duel still file a court dossier.
2. **Sit on the marble** — piece SVGs fill 98% of the square and lose the default `-2px` lift. Hover and selection still raise the chosen glyph.
3. **Playwright lock** — the hanging-knight phone spec asserts `#ai-persona` is hidden.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
