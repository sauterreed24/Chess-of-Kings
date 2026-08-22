---
overview: "v0.5.121 wave: thicken last-move, check, and capture rings."
---

# Pass 129 — Last-move rings (v0.5.121)

Playtest after Pass 127: echo chips read. Last-move origin/destination, check, capture, selection, and Move Guard rings still used a 3px inset — a thin edge on a ~40px phone square.

## Shipped

1. **Graphics** — existing board-ring `box-shadow` insets move from 3px to 5px (same character count). No new CSS rules, no JS.
2. **Playwright** — 390×844 skip-ahead calibration plays e2–e4 and asserts both route squares carry a 5px computed ring.

## Out of scope

- CSS budget growth
- Native shells
