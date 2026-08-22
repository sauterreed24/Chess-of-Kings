---
overview: "v0.5.108 wave: make Enter the Archive and title save CTAs 44px on the phone instrument."
---

# Pass 116 — Phone title enter (v0.5.108)

Playtest after Pass 115: lore folds are 44px. The main title CTA still used default button padding (~35px at the 17px phone root).

## Shipped

1. **Hit targets** — `syncPhoneTitleCtas` floors Enter the Archive, Resume expedition, and New chronicle at 44px on `max-width: 700px` when that group is visible. No new CSS.
2. **Playwright** — 390×844 asserts Enter the Archive is 44px.

## Out of scope

- CSS budget
- Native shells
