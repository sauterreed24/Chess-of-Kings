---
overview: "v0.5.103 wave: make Duel Archive setup controls 44px on the phone instrument."
---

# Pass 111 — Phone Duel Archive setup (v0.5.103)

Playtest after Pass 110: ornate ivory contrast is inline. The Duel Archive dossier still used `padding: 0.55rem` selects. Playwright’s phone viewport is fine-pointer, so `.coarse-pointer .duel-select { min-height: 2.65rem }` never fires.

## Shipped

1. **Hit targets** — after the dossier paints, `syncPhoneHitTarget` floors Variant / Color / Pressure / Skin and the four launch actions at 44px on `max-width: 700px`. No new CSS.
2. **Playwright** — 390×844 enters the archive, opens the first dossier, and asserts those controls are 44px.

## Out of scope

- CSS budget / coarse-pointer retune
- Native shells
