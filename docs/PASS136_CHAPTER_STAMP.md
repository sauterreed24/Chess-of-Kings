---
overview: "v0.5.128 wave: enlarge chapter hub Open/Resume stamps and indexes."
---

# Pass 136 — Chapter stamps (v0.5.128)

Playtest after Pass 134: the match manuscript kickers read. The chronicle hub still used 0.5rem Open/Resume stamps and 0.6rem chapter indexes — about 8.5–10px on the 17px root — so the first chapter pick was the first unreadable index chrome on phone.

## Shipped

1. **Graphics** — chapter buttons plant `font-size:0.7rem` on the state stamp, index, and sealed badge. No new CSS.
2. **Playwright** — 390×844 title top-nav asserts the first `.chapter-btn__state` and `.ch-idx`.

## Out of scope

- CSS budget
- Native shells
- Duel row stamps (live next to #164)
