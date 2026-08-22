---
overview: "v0.5.99 wave: make the Alexandrine Ornate set readable on a 390×844 instrument."
---

# Pass 107 — Alexandrine Ornate on phone (v0.5.99)

Playtest after Pass 106: neon sides now thick-stroke on the shared obsidian fill. Demetrios’s reward set is carved cream/gold vs sapphire/gold, but the shared 1.5 outline vanished on phone squares. Changing those hexes would blow the CSS gzip lock.

## Shipped

1. **Ornate stroke** — `glyphForSkin('alexandrine-ornate')` carves first, then rewrites the shared 1.5 outline to 2.4. Cup and lathe strokes stay 0.45 / 0.55. Classic royal stays at 1.5. No new CSS.
2. **Playwright** — a post-Amara seed with ornate selected resumes Lukas on 390×844: `data-skin="alexandrine-ornate"`, carve overlays, cream/sapphire fills, gold strokes, civic silhouettes, `e2–e4` / authored `e5`, and 44px Hint/Reset.

## Out of scope

- CSS budget / fill-hex contrast retune
- Native shells
