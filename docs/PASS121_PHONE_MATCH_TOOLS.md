---
overview: "v0.5.113 wave: floor phone Take back and match sound toggles at 44px."
---

# Pass 121 — Phone match tools (v0.5.113)

Playtest after Pass 120: the eval tray is readable. Take back and the Sound / Move Guard row still used ghost padding (~13px on the 17px phone root). Playwright is fine-pointer, so `.coarse-pointer button` never fires.

## Shipped

1. **Playability** — `syncPhoneHitTarget` floors `#btn-undo` when it unhides, and `#btn-sfx` / `#btn-move-guard` when the instrument toggles are shown. Resize/undock keeps the floor. No new CSS.
2. **Playwright** — 390×844 hanging knight asserts Take back is 44px; Amara asserts Sound and Move Guard.

## Out of scope

- CSS budget
- Native shells
