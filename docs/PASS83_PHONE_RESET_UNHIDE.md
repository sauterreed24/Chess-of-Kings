---
overview: "v0.5.75 wave: restyle phone Reset to 44px when it unhides after the first ply, and prove the first Amara match on a 390×844 instrument."
---

# Pass 83 — Phone Reset unhide (v0.5.75)

Playtest after Pass 82: every piece is a civic silhouette. Phone calibration still hid Reset until e2–e4. `applyChessUi` then unhid Reset without calling the phone hit-target restyle, so the control relied on leftover `.ghost--tool` padding.

## Shipped

1. **`syncPhoneHitTarget`** — `applyChessUi` restyles Hint and Reset after it sets `hidden`, so the first ply on a phone instrument keeps a 44px hit target without a resize.
2. **Playwright** — compact calibration asserts Reset `min-height: 44px` after e2–e4. First Chapter I match against Amara on 390×844: civic pawn/king silhouettes, board width, opening ply, Archive reply, Reset floor.

## Out of scope

- CSS budget changes
- Later-chapter matches on phone
