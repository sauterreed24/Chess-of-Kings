---
name: Pass 46 — Phone puzzle Prove dock
overview: "v0.5.38 wave: hanging-knight phones hide the leftover tutorial card and dock Prove next to Hint under the marble."
---

# Pass 46 — Phone puzzle Prove dock (v0.5.38)

After collapsing the manuscript body, hanging-knight phones still showed a 174px empty card: title, a hollow frame, and Prove. The marble already names the capture.

## Shipped

1. **Phone puzzles hide `#manuscript-panel`** and move `#btn-next` to `.board-tools` after Hint. Inline flex overrides sit Prove beside Hint (CSS gzip stays put). The tool row stays open while Prove is docked.
2. **Wide labs keep the manuscript** — 1280 castle still has Prove in the panel.
3. **Resize restores** — rotating off phone width puts Prove back in `.narrative-actions`.
4. **Leaving a phone puzzle restores Advance** — `renderScene` syncs on every scene so dialogue after hanging-knight unhides the manuscript.
5. **Playwright** — hanging-knight phone hides the manuscript and shows Hint|Prove on one row; after Prove, `#manuscript-panel #btn-next` is visible again. Castle 1280 keeps `#manuscript-panel #btn-next`.

## Out of scope

- CSS budget changes
- New chapter authorship
- Native store
