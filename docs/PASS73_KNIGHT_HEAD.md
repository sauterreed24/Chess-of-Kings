---
overview: "v0.5.65 wave: replace the Wikipedia Staunton knight scribble with a civic horse-head silhouette that reads on a phone square."
---

# Pass 73 — Knight horse head (v0.5.65)

Playtest after Pass 72: the campaign now ends on a mastery plateau, but the first-board knight was still Wikimedia's Staunton path. Carve overlays (mane, ferrule, a 1.72 eye) sat on that scribble. The carved eye was planted on the Wikipedia nostril (~9, 25), so the horse never read as a head.

## Shipped

1. **Shared silhouette** — pointed ear, muzzle, jaw, neck, and the same 45×45 base so plinth and ferrule still seat. White and black share one body path.
2. **Face marks in the glyph** — nostril and iris use `--piece-stroke`, so high-contrast tournament knights still have a face without carve overlays.
3. **Carved eye moved onto the head** (cx 13.2, cy 17.4). Mane, cheek flute, and crown sheen follow the new crest.
4. **Lapis crest glint** — black knights keep a stroke-colored highlight along the neck, replacing Wikipedia's extra back-fill path.
5. **Playwright** — calibration `b1`, hanging-knight `d4`, and title honor assert `.knight-silhouette`. Eye size floor is unchanged (2.4 CSS px).

## Out of scope

- CSS budget changes
- Rewriting pawn / bishop / rook / queen / king Wikipedia paths
- Phone Chapter VI–IX lab e2e
