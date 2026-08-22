---
overview: "v0.5.100 wave: make the title piece-skin picker a 44px phone control that actually paints the board."
---

# Pass 108 — Phone title skin picker (v0.5.100)

Playtest after Pass 107: all three reward sets now thick-stroke on 390×844. The title Settings select that switches them still used `padding: 0.35rem` — under a 44px hit target — and no e2e proved a live change.

## Shipped

1. **Hit target** — `syncTitleSkinSelect` reuses `syncPhoneHitTarget` so the select is 44px on `max-width: 700px`. No new CSS.
2. **Playwright** — a post-Amara seed with every set unlocked starts classic-royal, picks High Contrast Tournament on the title screen, then resumes Lukas with `data-skin="high-contrast"`, ivory/ink, stroke 2.4, `e2–e4` / authored `e5`, and 44px Hint.

## Out of scope

- CSS budget / fill-hex contrast retune
- Native shells
