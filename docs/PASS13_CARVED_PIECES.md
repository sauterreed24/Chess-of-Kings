---
name: Pass 13 — Carved piece presence
overview: "v0.5.5 wave: classic ivory/lapis glyphs get a foot shadow and crown sheen, and a four-move calibration prove is locked in Playwright."
---

# Pass 13 — Carved piece presence (v0.5.5)

Playtest of the board-first compact lab still showed Wikipedia Staunton silhouettes sitting flat on the marble. The glyphs are the thing you stare at. This pass carves them without new art files or CSS budget, and proves the first-session calibration can actually be finished.

## Shipped

1. **Carved glyphs** — `glyphForSkin` plants a contact shadow and a crown sheen on classic / Alexandrine / neon sets. High-contrast stays flat for tournament readability.
2. **Idempotent carve** — `carveGlyph` will not stack overlays if a glyph is already carved.
3. **Four-move prove** — Playwright develops e4, Nf3, d4, Nc3 (with fallbacks) and asserts Advance unlocks at `4 / 4 inscribed`.

## Playtest notes

- Captured HUD and flying pieces reuse `glyphForSkin`, so they pick up the same carve.
- Calibration still answers at random; the smoke plays developing moves that stay legal against almost any reply.

## Out of scope

- New chapter authorship
- Native store
- Hand-drawn replacement piece files
