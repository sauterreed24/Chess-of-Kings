---
overview: "v0.5.127 wave: enlarge Duel Archive field and unlock-path kickers."
---

# Pass 135 — Duel labels (v0.5.127)

Playtest after Pass 133: the Amara briefing reads. Duel Archive setup still used 0.5rem field kickers — about 8.5px on the 17px root — so Variant / Color / Pressure Band were the first unreadable dossier chrome on phone.

## Shipped

1. **Graphics** — `renderDuelUi` plants `font-size:0.7rem` on setup labels and sealed Unlock path. No new CSS.
2. **Playwright** — 390×844 Duel Archive setup asserts the first `label.teach-label`.

## Out of scope

- CSS budget
- Native shells
