---
overview: "v0.5.101 wave: make the title Settings toggles 44px phone controls."
---

# Pass 109 — Phone title settings (v0.5.101)

Playtest after Pass 108: the Piece skin select is a 44px phone control. The neighboring Sound / Move Guard / Motion / AI Thread / Visual buttons still used `ghost--sound` padding (`0.28rem`) — too short to tap reliably on 390×844.

## Shipped

1. **Hit targets** — `syncPreferenceButtons` reuses `syncPhoneHitTarget` so those five title Settings buttons are 44px on `max-width: 700px`. No new CSS.
2. **Playwright** — the title skin-picker seed also asserts the five toggles are 44px before the live set switch.

## Out of scope

- CSS budget / fill-hex contrast retune
- Native shells
