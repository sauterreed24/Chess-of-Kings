---
overview: "v0.5.115 wave: plant readable legal-aim pearls on quiet targets."
---

# Pass 123 — Legal aim pearls (v0.5.115)

Playtest after Pass 122: echo boards are carved. Quiet legal dots still used a 36% / 22px CSS `::after`. On a ~40px phone square that is ~14px — easy to miss next to the carved pieces.

## Shipped

1. **Graphics** — `updateHighlights` plants an inline `.sq-aim` pearl (58% wide, 20px min, 28px max) on quiet legal squares and hides it when the target is gone. The CSS `::after` stays for fallback; the child sits at z-index 4. Captures and castle destinations keep their existing rings. No new CSS.
2. **Playwright** — 390×844 skip-ahead calibration selects e2 and asserts the e4 pearl is at least 20px.

## Out of scope

- CSS budget
- Native shells
