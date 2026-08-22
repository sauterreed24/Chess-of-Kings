---
overview: "v0.5.114 wave: carve chronicle echo boards and floor echo replay buttons."
---

# Pass 122 — Echo board facets (v0.5.114)

Playtest after Pass 121: match tools are 44px. Archive echo boards still painted flat beige/lapis cells with raw SVGs, so carved cups vanished next to the live marble.

## Shipped

1. **Graphics** — `renderEchoBoardFen` plants the same lamp/shade facet as the live board and wraps glyphs in `.piece` so `.piece svg` can fill the cell. Ornate ivory keeps the bronze stroke. No new CSS.
2. **Playability** — dossier `.duel-echo-btn` rows keep a 44px hit target on phone.
3. **Playwright** — 390×844 opens an Alexion echo and asserts 64 facets plus a 2.4 outline.

## Out of scope

- CSS budget
- Native shells
