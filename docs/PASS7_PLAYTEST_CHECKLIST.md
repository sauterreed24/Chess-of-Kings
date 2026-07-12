# Pass 7 playtest checklist

Use after a production build (`npm run build && npm run preview`) or Pages deploy.

## Plateau (post–Chapter III)

- [ ] With a save that includes `c3-reflection`, open **Chapters** and confirm the **Mastery plateau** hub appears.
- [ ] **Duel Archive** CTA from the hub opens the Archive of Rivals.
- [ ] When a Daily Calculus chamber is unlocked for today, its CTA opens the lab on that puzzle.
- [ ] Locked Chapters IV–IX show longer teasers (not just “— locked.”).

## Dossier

- [ ] On a phone-width viewport, scrolling a long dossier keeps **Start Duel** / launch controls sticky near the top of the panel.
- [ ] Dossier sections collapse/expand via keyboard (Enter/Space on summaries).
- [ ] Counter-Prep opens by default; Analytics / Echoes / Traits start collapsed.
- [ ] After a loss or draw vs a rival, **Chronicle Echoes** lists that game (not only victories).

## Coaching & calibration

- [ ] Duel vs Kallistos (or Alexion) surfaces doctrine-aware tips early when moves are quiet.
- [ ] Coach tip text is readable on dark brass panels (ivory, not washed gray).
- [ ] Calibration Lens level label and Archive rating band names still match dossier copy.

## Gate

- [ ] `npm run quality:gate` green.
- [ ] `npm run test:e2e` green (includes plateau hub smoke).
