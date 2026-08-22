---
overview: "v0.5.102 wave: darken Alexandrine ivory outlines so gold-on-cream reads on phone."
---

# Pass 110 — Alexandrine ivory contrast (v0.5.102)

Playtest after Pass 109: title Settings are 44px. Ornate ivory still used CSS gold `#b38f36` on cream `#fdf5e2` — about 2.5:1. Changing that hex would blow the CSS gzip lock.

## Shipped

1. **Ivory stroke** — `pieceStrokeTone` sets `--piece-stroke: #6b4e14` inline on ornate white board pieces, captured HUD, promo choices, and fly/capture ghosts. Sapphire ornate stays `#dcae43`. No new CSS.
2. **Playwright** — the ornate Lukas seed on 390×844 asserts the darker ivory stroke, cream/sapphire fills, stroke 2.4, civic silhouettes, `e2–e4` / authored `e5`.

## Out of scope

- CSS budget / sapphire retune
- Native shells
