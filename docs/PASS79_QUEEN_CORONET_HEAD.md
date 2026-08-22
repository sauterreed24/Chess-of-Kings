---
overview: "v0.5.71 wave: replace the Wikipedia Staunton queen spike scribble with a civic coronet silhouette that reads on a phone square."
---

# Pass 79 — Queen coronet head (v0.5.71)

Playtest after Pass 78: knight and bishop are civic silhouettes. Calibration d1 was still Wikimedia's five-spike scribble with overlay pearls. The zigzag between the orbs vanished at ~40px; high-contrast had no jewels once carve overlays were stripped.

## Shipped

1. **Shared silhouette** — flared circlet, diadem, stem, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Five orbs in the glyph** — `--piece-stroke` jewels so high-contrast tournament queens still have a coronet without carve overlays.
3. **Carved pearls, sheen, neck, flute, and cup** follow the new circlet (neck ring under the brim).
4. **Lapis facet glint** — black queens keep a stroke-colored highlight on the lamp-side of the circlet.
5. **Playwright** — calibration `d1`, mate-in-one `e5`, and title honor assert `.queen-silhouette`. Pearl size floor is unchanged (3.5 CSS px).

## Out of scope

- CSS budget changes
- Rewriting pawn / rook / king Wikipedia paths
- Phone Reset restyle-on-unhide (Codex note on merged #106; e2e already floors Reset at 44px after the first ply)
