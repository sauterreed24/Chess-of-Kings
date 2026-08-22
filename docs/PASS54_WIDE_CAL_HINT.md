---
name: Pass 54 — Wide calibration Hint
overview: "v0.5.46 wave: a spent calibration Hint stays hidden when a phone lab widens after an Archive reply; applyChessUi mirrors canHint onto disabled so resize can keep the same availability."
---

# Pass 54 — Wide calibration Hint (v0.5.46)

Codex on already-merged Pass 52: phone calibration hides Hint, then a resize unhides it solely because `phone` became false. After e4 the Archive is on move, `requestHint()` rejects, and a wide Hint looks live on a disabled board.

## Shipped

1. **`canHint`** drops when calibration is sealed, and `requestHint()` no-ops on that board.
2. **`applyChessUi`** sets `#btn-hint.disabled` from `canHint`.
3. **`syncPhonePuzzleLesson`** keeps calibration Hint hidden when `phone || disabled`, so a spent Hint survives a widen.
4. **Playwright** — compact calibration after e4 restores Hint when the lab widens on White’s turn. After 4/4, a 1280×800 resize keeps Hint hidden and disabled.

## Out of scope

- CSS budget changes
- Changing when `canHint` is true
- Puzzle Hint (resize does not force it visible)
