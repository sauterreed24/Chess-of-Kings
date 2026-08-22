---
overview: "v0.5.105 wave: make Title / Chapters / Duel and Return to title 44px on the phone instrument."
---

# Pass 113 — Phone top nav (v0.5.105)

Playtest after Pass 112: privacy links are 44px. Phone CSS still set `.top-nav .ghost--nav` to `min-height: 2.35rem` (~40px at the 17px phone root) inside a 50px bar. Playwright’s fine-pointer viewport never hits the coarse-pointer 2.75rem rule.

## Shipped

1. **Hit targets** — `syncPhoneTopNav` floors Title / Chapters / Duel and Return to title at 44px on `max-width: 700px`, and restores the bar to 56px so the pills do not clip. No new CSS.
2. **Playwright** — 390×844 asserts those four controls are 44px.

## Out of scope

- CSS budget / restyling the brand mark
- Native shells
