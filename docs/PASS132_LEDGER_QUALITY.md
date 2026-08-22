---
overview: "v0.5.124 wave: enlarge ledger quality marks so !! / ! / ? still read."
---

# Pass 132 — Ledger quality (v0.5.124)

Playtest after Pass 130: the heading and SAN rows read. The quality marks next to those moves still used 0.48rem — about 8px on the 17px root — so brilliant / mistake annotations were the first unreadable ledger chrome.

## Shipped

1. **Graphics** — `formatMoveLedger` plants `font-size:0.7rem` on each `.q-icon`. No new CSS.
2. **Playwright** — 390×844 Amara asserts the first quality mark after e4.

## Out of scope

- CSS budget
- Native shells
