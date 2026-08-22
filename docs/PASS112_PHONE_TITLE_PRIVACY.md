---
overview: "v0.5.104 wave: make title privacy and keyboard-atlas links 44px on the phone instrument."
---

# Pass 112 — Phone title privacy links (v0.5.104)

Playtest after Pass 111: Archive setup is 44px. Title Privacy policy, Accessibility, and Keyboard atlas were still `padding: 0` inline text.

## Shipped

1. **Hit targets** — `syncPhoneInlineHitTarget` sets `display: inline-block` and floors the three title-privacy controls at 44px on `max-width: 700px`. No new CSS.
2. **Playwright** — 390×844 asserts those controls are visible, `inline-block`, and at least 44px tall.

## Out of scope

- CSS budget / restyling the title plate
- Native shells
