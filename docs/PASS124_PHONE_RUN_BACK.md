---
overview: "v0.5.116 wave: floor phone Run it back and recovery actions at 44px."
---

# Pass 124 — Phone run-back (v0.5.116)

Playtest after Pass 123: legal aim pearls read. After a loss or a restored session, Run it back and Restore / Dismiss still used ghost padding (~13px on the 17px phone root). Playwright is fine-pointer, so `.coarse-pointer button` never fires.

## Shipped

1. **Playability** — `applyChessUi` floors `#btn-run-back` when a match or duel can retry, and floors `#btn-recovery-restore` / `#btn-recovery-dismiss` while the recovered-session row is shown. Resize keeps the floor. No new CSS.
2. **Playwright** — 390×844 restores a checkmated Amara board and asserts the three buttons are 44px.

## Out of scope

- CSS budget
- Native shells
