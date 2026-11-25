---
overview: "v0.5.139: carved pieces stand on the marble instead of rectangular plates, dim labels meet AA, and the Duel Archive reads cleanly."
---

# Pass 147 — Pieces on the marble, readable labels (v0.5.139)

A 2× visual audit of the title, chapter index, a story scene, the calibration board, and the Duel Archive on desktop (1366×860) and iPhone 13, plus all four piece skins, found one rendering defect that affected every board and a systemic legibility problem in the label tokens.

## Findings

1. **Every carved piece sat on a rectangular plate.** Grey behind Black, cream behind White, covering the a-file rank marks. Isolating layers showed the SVG lamp filter as the source: in `feComposite operator="arithmetic"`, `k2` scales the *first* input, so `k2=".7"` added 70% of the diffuse lighting map, which is opaque across the whole filter region, not just the piece. The specular glint had the same property.
2. **Label tokens were below AA.** A pixel-sampled scan (text hidden, background measured behind each element) flagged 121 elements on two devices. Almost all used `--gold-dim` (#7d6a38, ~3.5:1 on panels) or `--muted` (#8a8275).
3. **Dialogue speaker names were drawn in their voice colour over a tint of the same colour** (Reed blue on blue, ~2:1).
4. **The title kicker sat on the hero glow** at 1.1–1.8:1.
5. **Duel Archive rows put the stamp in a second column**, wrapping "Alexion Demaratos-Serapis" over three lines and its era kicker over four. Selects had no font size, so they used the 13.3px default, which is tiny in Cormorant and triggers iOS focus zoom.

## Shipped

1. **Clip the lit piece** — `carveGlyph`'s filter ends with `<feComposite in="o" in2="SourceAlpha" operator="in"/>`. Pixels inside the piece are unchanged; everything outside it is transparent. Applies to every skin that carves (all but High Contrast) and the title piece row.
2. **Tokens** — `--gold-dim` #a38b56 (5.7:1 on `--panel`, still 0.6× the luminance of `--gold`) and `--muted` #9d9686 (6.4:1).
3. **Dialogue** — `.line .who` and `.speaker-seal` use `color-mix(in srgb, rgb(var(--v)) 55%, #fff)`; names add a 2px dark text-shadow. The Archive voice moves to the new muted tone.
4. **Title kicker** — `--gold-bright` with `text-shadow: 0 1px 3px #000`.
5. **Duel Archive** — `.duel-row` is one column with the stamp left-aligned under the text; `.duel-select` sets `font-size: 1rem`.

All edits change existing rules or tokens; no new rules beyond the one filter primitive. CSS gzip 18,359 (budget 18,400); index JS 94,619.

## Playtest notes

- Calibration board, desktop and phone: pieces stand on the marble; rank marks 8/7/2/1 are visible beside the a-file pieces.
- Classic Royal, Alexandrine Ornate, and Obsidian Neon (neon CSS glow intact) all render without plates; High Contrast is uncarved and unchanged.
- Contrast scan (title, chapters, scene, board, duel × desktop/phone): 121 → 30 elements below AA. The remainder are mainly locked atlas marks and sealed duel rows (intentionally dimmed states), the 10px brand subline at 4.2:1, and text inside the collapsed "World of the Long Reign" fold that the scan cannot see correctly.
- Duel Archive after the entrance animation: rows show kicker (2 lines), name, traits, stamp.

## Out of scope

- The cream last-move ring on dark squares, which can read as a smaller tile (an intentional Pass 129 marker).
- The brown facet shade on light squares.
- Locked and sealed state colours.
