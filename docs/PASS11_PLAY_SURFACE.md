---
name: Pass 11 — Play-surface clarity
overview: "v0.5.3 wave: the live board is the hero. Redundant turn chips hide, calibration progress lives on the rail, and carved pieces plus the brass rim read a little richer."
---

# Pass 11 — Play-surface clarity (v0.5.3)

Playtest after the first-session nav pass showed the instrument repeating the same facts: **White to move**, **White turn**, **1/4 White moves**, four rail dots, and **Archive proof: 3 White move(s)**. On a phone that stack sat on top of the marble.

## Shipped

1. **One status banner** — the turn chips stay in the DOM for tests and live regions, but they no longer paint beside the status pill.
2. **Calibration rail is the count** — the label reads `1 / 4 inscribed` and the board guide keeps the coaching line only.
3. **Sound / Move Guard sit under the tools** so they no longer steal height above the grid.
4. **Carved presence** — slightly larger glyphs, stronger ivory/lapis highlights, a brighter last-move landing, and a tighter brass rim.
5. **Playtest lock** — Playwright asserts the chips are hidden, the rail shows `1 / 4`, and the guide still coaches after e4.

## Playtest notes

- Status pill still says "White to move" / "Rival pondering" / outcomes.
- Prove still counts remaining moves. Compact view still stacks the board above the manuscript.

## Out of scope

- New chapter authorship
- Native store
- New piece art files
