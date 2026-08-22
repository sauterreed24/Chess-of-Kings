---
name: Pass 22 — Lamp-lit ivory and the first mate
overview: "v0.5.14 wave: Staunton glyphs take brass-lamp lighting on their real silhouettes, and Chapter I's mate-in-one is locked in Playwright."
---

# Pass 22 — Lamp-lit ivory and the first mate (v0.5.14)

Playtest after the castle cue still showed Wikipedia cutouts with sticker shade blobs. The eye reads the silhouette, so lighting has to follow the silhouette. Chapter I's third puzzle — mate in one — was still unlocked in e2e.

## Shipped

1. **Lamp-lit glyphs** — `carveGlyph` fills the body with an ivory/lapis gradient and wraps the Staunton paths in `feSpecularLighting`, so the brass lamp catches the real outline instead of overlay blobs.
2. **Forced lean** — Visual: Lean keeps the gradient and foot shadow but drops the specular filter. Auto-detected low-power still gets the lamp.
3. **Mate-in-one** — Playwright walks hanging knight → castle → queen to h8 and asserts Checkmate.
4. **Duel continuity** — the live duel smoke now plays e4, Nf3, and d4, each waiting for an archive reply.

## Playtest notes

- High-contrast tournament skin stays uncarved.
- Captured HUD, flying pieces, and the title honor guard reuse `glyphForSkin`, so they pick up the lamp.

## Out of scope

- Hand-drawn replacement piece files
- New chapter authorship
- Native store
