# Pass 6 playtest checklist

Manual verification for **v0.4.0** (Continuity, Intuition, Chapter III).
Check each item before tagging the release. Prefer desktop Chrome plus one mobile viewport.

## Fresh install / prologue

- [ ] Hard-refresh clears old service-worker quirks; title screen loads.
- [ ] Enter Archive → Prologue opens; keyboard Tab reaches Advance and board controls.
- [ ] Skip-ahead (if offered) lands on the first playable board, not past it.
- [ ] Sound unlocks after first pointer/key gesture when Sound is On.

## Duel continuity

- [ ] After defeating Lukas in Chapter I (or via seeded save), **Lukas** appears in the Duel Archive.
- [ ] After defeating Marius, **Marius** appears with Patience Archive / Court Squeeze variants.
- [ ] Dossier always shows **Archive rating** (default 1500 / Measured Foe) before any logged games.
- [ ] **Lens suggests … — selected.** appears; changing Pressure Band updates the mismatch note.
- [ ] Auto-Calibrate restores the recommended band and refreshes the status line.

## Loss / draw feedback

- [ ] Lose or draw a duel: **Result Inscribed** overlay opens (not only the board "Run it back" chip).
- [ ] Overlay shows rating delta, training focus, and **Quick Rematch** for duels.
- [ ] Closing Advance returns focus sanely; rematch restarts the pairing.

## Settings

- [ ] **AI Thread** cycles Auto → Worker → Main and survives reload.
- [ ] **Visual** cycles Auto → Full → Lean; Lean strips ambient polish; Full restores it on capable devices.
- [ ] Motion: Reduced still playable with readable board and no stuck animations.

## Chapter III

- [ ] Chapter III appears playable after Chapter II unlock.
- [ ] Compact arc runs: intro → codex → prophylaxis puzzle (mate) → Demetrios return → Kallistos → reflection → freeplay.
- [ ] Winning Kallistos unlocks her Duel Archive entry.
- [ ] Campaign finished copy mentions Daily Calculus + Duel Archive plateau (not a hard cliff).
- [ ] Mobile viewport: board fits; dossier launch controls remain reachable.

## Automated gate

- [ ] `npm run quality:gate` green.
- [ ] `npm run test:e2e` green (Playwright smoke: title flow, duel dossier, settings persist, seeded Lukas + Ch III).

## Notes

Tester: _______________  Date: _______________  Build / commit: _______________
