---
overview: "v0.5.129 wave: enlarge Duel Archive file-count and Pressure band stamps."
---

# Pass 137 — Duel stamps (v0.5.129)

Playtest after Pass 135: the dossier field kickers read. Roster and dossier stamps still used 0.5rem — about 8.5px on the 17px root — so `N/M files` and Pressure band were the first unreadable archive chrome on phone.

## Shipped

1. **Graphics** — `renderDuelUi` plants `font-size:0.7rem` on list stamps, sealed-file chips, and the open-dossier Pressure band stamp. No new CSS.
2. **Playwright** — 390×844 Duel Archive asserts the first `.duel-row__stamp` and the panel stamp.

## Out of scope

- CSS budget
- Native shells
- Duel row era chips (`.ch-idx`)
