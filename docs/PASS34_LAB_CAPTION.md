---
name: Pass 34 — Phone lab caption
overview: "v0.5.26 wave: phone lab overlay bars show the chapter title in full instead of clipping Early chess — scholarly court."
---

# Pass 34 — Phone lab caption (v0.5.26)

Hanging-knight phones after the duplicate-nav hide still showed **CHAPTER I · EARLY CHESS — SCHOLARL…** between ← Chapters and ?. The era belongs on a wide bar; on 390px it was a cut word.

## Shipped

1. **Phone caption is the chapter title** — `Chapter I` / `Prologue` / `Duel Archive`. The full `title · era` string stays in `title` and `aria-label`.
2. **Wide and short-landscape labs keep the era** — 1280×500 still reads `Prologue · Present — …`.
3. **Resize re-applies** — the mobile board-fit pass syncs the caption when a phone lab rotates.
4. **Playwright** — hanging-knight phone caption is `Chapter I` and does not overflow. Calibration phone is `Prologue`. Short-lab keeps the prologue era.

## Out of scope

- CSS budget changes
- New chapter authorship
- Native store
