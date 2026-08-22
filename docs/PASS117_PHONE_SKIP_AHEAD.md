---
overview: "v0.5.109 wave: make the prologue skip-ahead control 44px on the phone instrument."
---

# Pass 117 — Phone skip-ahead (v0.5.109)

Playtest after Pass 116: Enter the Archive is 44px. The prologue skip control still used default ghost padding (~35px at the 17px phone root).

## Shipped

1. **Hit targets** — `syncPhoneHitTarget` floors `#btn-skip-ahead` when shown, and Chronicle Index hub CTAs after they paint. No new CSS.
2. **Playwright** — 390×844 enters the prologue and asserts skip-ahead is 44px.

## Out of scope

- CSS budget
- Native shells
