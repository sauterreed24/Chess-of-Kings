---
overview: "v0.5.107 wave: make lore and dossier fold summaries 44px on the phone instrument."
---

# Pass 115 — Phone dossier folds (v0.5.107)

Playtest after Pass 114: the honor guard reads. Lore / dossier summaries still used `min-height: 2.4rem` (~41px at the 17px phone root).

## Shipped

1. **Hit targets** — `syncPhoneDossierFolds` floors every `.dossier-fold__summary` at 44px on `max-width: 700px` (title lore, Chronicle Index, duel dossiers, teaching “Why it works”). No new CSS.
2. **Playwright** — 390×844 asserts the title and Chronicle Index lore folds.

## Out of scope

- CSS budget
- Native shells
