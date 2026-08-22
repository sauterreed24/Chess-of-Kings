---
name: Pass 26 — Turned lathe rings
overview: "v0.5.18 wave: ivory/lapis glyphs get a lathe-turned plinth and neck, plus lamp-side diffuse shade on the real Staunton silhouette."
---

# Pass 26 — Turned lathe rings (v0.5.18)

Lamp lighting still left Wikipedia Staunton cuts looking like flat icons with a highlight blob. A turned chessman has rings where the lathe paused — plinth, waist collar, neck — and a body that is bright on the lamp side.

## Shipped

1. **Lathe rings** — every carved glyph gets a molded plinth above the foot. Pawns, bishops, rooks, queens, and kings also get a neck ring under the head. Knights skip the neck; the horse is not a turned column.
2. **Lamp-side shade** — `feDiffuseLighting` models the body before the existing specular highlight, so ivory and lapis read as volume instead of a sticker. Forced **Visual: Lean** keeps the rings and gradient without the filters.
3. **Playwright** — calibration e2 pawn, hanging-knight bishop, and the title honor guard assert plinth, neck, and both lighting primitives.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
