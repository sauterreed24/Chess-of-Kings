---
name: Pass 8 — Playtest Continuity
overview: "v0.4.3 wave: lab-exit confirms, live recovery pending sync, mvpFlag honesty, sticky-launch scroll margin, and tighter recovery tests."
---

# Pass 8 — Playtest Continuity (v0.4.3)

## Shipped

1. **Pending sync on live persist** — board progress promotes into `pendingInProgressSnapshot` so Resume appears without a full reload after vestibule.
2. **Lab exit confirms** — vestibule, top-nav, Escape exit, and skip-ahead gate mid-board / duel / recoverable sessions.
3. **mvpFlag honesty** — reflection-complete but freeplay-pending shows rehearsal copy, not “Chapters I–II only”.
4. **Mobile dossier** — sticky launch gets `scroll-margin-top` on folds below.
5. **Tests** — duel-start confirm, pending promotion, Daily Calculus OK replaces prior recovery with the daily puzzle session, fixed live-pages fixtures (`sceneIndex: 4` calibration).

Lab-exit handlers stay **synchronous** when no confirm is required (dialogue-only / idle chrome), so top-nav and vestibule do not yield a frame before switching screens.

## Out of scope

- Chapters IV–IX authorship
- GameFlow LOC shrink
- Native store
