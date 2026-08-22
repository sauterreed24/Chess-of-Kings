---
overview: "v0.5.122 wave: enlarge the match move ledger so SAN still reads."
---

# Pass 130 — Move ledger (v0.5.122)

Playtest after Pass 127: echo chips read. The live match ledger still used a 0.52rem heading and 0.67rem SAN — about 9–11px on the 17px phone root.

## Shipped

1. **Graphics** — ledger heading renders at 0.7rem; each SAN row reuses the 0.78rem eval-score floor. No new CSS.
2. **Playwright** — 390×844 Amara asserts the heading and first row.

## Out of scope

- CSS budget
- Native shells
