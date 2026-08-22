---
name: Pass 33 — Lamp fill and stem flute
overview: "v0.5.25 wave: ivory/lapis glyphs get a fill lamp from the opposite side and a turned-stem flute so the body reads as a cylinder, not a sticker."
---

# Pass 33 — Lamp fill and stem flute (v0.5.25)

Hanging-knight playtest after the chrome passes still left Wikipedia Staunton cuts lit from one side only. The lathe rings sat on a flat silhouette; the stem did not read as turned wood.

## Shipped

1. **Fill lamp** — a second `feSpecularLighting` point light from the right so the cylinder has a dim opposite catch, not a cardboard edge. Forced **Visual: Lean** still skips both lighting primitives.
2. **Stem flute** — a lamp-side ellipse on every type (knight uses a cheek catch-light) so the belly has a turned highlight, not just rings.
3. **Playwright** — calibration pawn and hanging-knight bishop assert `.piece-flute`, two specular lights, and three point lights.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
