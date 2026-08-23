---
overview: "v0.5.134 wave: unclip the last-move destination halo."
---

# Pass 142 — Last-to glow (v0.5.134)

Playtest after Pass 129: the 5px inset rings read. The 22px last-to halo was still clipped by `.sq { overflow: hidden }`, so the destination never bloomed on the marble.

## Shipped

1. **Graphics** — `.sq` overflow is visible (same-length CSS token) and last-to lifts to z-index 2 so the existing 22px halo paints over neighbors. No new CSS rules.
2. **Playwright** — 390×844 last-move test asserts destination overflow and z-index.

## Out of scope

- CSS budget (at the 18400 gzip ceiling)
- Native shells
- Origin-square outer glow (last-from is inset-only)
