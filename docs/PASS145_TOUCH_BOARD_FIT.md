---
overview: "v0.5.137: touch phones get a square board with all eight ranks, and the calibration rail label becomes readable."
---

# Pass 145 — Full board on touch phones (v0.5.137)

A current-build play of the title, Prologue, opening calibration, and Duel Archive on desktop, iPhone 13 (390×664 Safari viewport), Pixel 7, iPhone SE, iPad Mini, and landscape iPhone found one serious failure and one readability failure.

1. **The phone board lost ranks.** Board squares are `<button>`s, so the touch-target rule `.coarse-pointer button { min-height: 2.6rem }` gave each square a 44px height. On a 390×664 viewport the grid is 265px tall, and 8 × 44 = 352px overflowed the `overflow: hidden` grid. Ranks 7–8 were cut off. After a tap the browser scrolled the focused square into view, so ranks 1–2 disappeared instead. Black's army could be completely invisible.
2. **The phone board was not square.** The compact rule capped width at the measured `--mobile-board-max` but height at a fixed `42vh`, giving 317×265.
3. **The "n / 4 inscribed" rail label was invisible.** `--gold-dim` on the brass glow measured 1.0–1.6:1 contrast on desktop and phone.

Existing Playwright coverage used Desktop Chrome with a fine pointer at 390×844, where `.coarse-pointer` is never set and 42vh is larger than the board's width, so neither failure reproduced.

## Shipped

1. **Squares exempt from the button floor** — `.coarse-pointer button:not(.sq)`. Squares are sized by the grid; the promotion picker and every other button keep the 2.6rem floor.
2. **Measured height cap** — compact `max-height` uses `var(--mobile-board-max, 42vh)`, the same value as `max-width`.
3. **Ink-chip rail label** — bright gold on `var(--ink)` in a 1em-radius pill. The text measures ~12.5:1.
4. **Regression locks** — `src/app/boardFitCss.test.ts` reads the stylesheet (as `reducedMotion.test.ts` does). The Playwright test `touch phone at Safari height` emulates touch at 390×664 and asserts a square grid with a8 and h1 inside it, before and after a tapped move. Against the old CSS it fails (51.75px out of square).

All three changes edit existing rules in place. The rail is hidden on every scene without a board, so its `.screen-play--board-scene` overrides were folded into the base `.calibration-rail` and `.calibration-rail__label` rules. Computed font size, letter spacing, and grid layout are unchanged. That removes two selectors and pays for the chip: CSS gzip goes from 18,395 to 18,383 bytes (budget 18,400). No dependencies or assets were added.

## Playtest notes

| Device | Board before | Board after |
| --- | --- | --- |
| iPhone 13 (390×664) | 317×265 grid, 39×44 squares, 2 ranks clipped | 317×317, 39×39 |
| Pixel 7 (412×839) | 339×338, 42×44 squares, top rank partly clipped | 339×339, 42×42 |
| iPhone SE (320×568) | clipped | 247×247, 31×31 |
| iPad Mini (768×1024) | 655×655 | unchanged |
| Desktop 1366×860 | unchanged | unchanged |

- iPhone 13: e4 then the Archive reply play normally; both armies stay on the marble.
- Duel boards share these rules and measure square on every device above.

## Out of scope

- **Landscape phones (e.g. 750×342).** The calibration board falls to the 160px emergency floor beneath the coach text and the duel board runs past the fold. That behaviour predates this pass and needs a side-by-side landscape layout, not a cap tweak.
- Rank-label overlap with pieces on the a-file at phone sizes.
- Native shells.
