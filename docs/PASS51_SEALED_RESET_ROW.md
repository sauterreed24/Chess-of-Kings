---
name: Pass 51 — Sealed puzzle tool row
overview: "v0.5.43 wave: phone puzzles hide Reset after Prove docks so Advance and Take back stay on one row instead of a full-width Reset wrap."
---

# Pass 51 — Sealed puzzle tool row (v0.5.43)

After hanging-knight Bxd4 on a 390×844 phone, Hint hid and Advance|Take back sat on one row, then Reset stretched the full instrument width underneath. The marble already said the proof was sealed.

## Shipped

1. **Phone puzzles** hide `#btn-reset` while Prove is docked in `.board-tools`. Take back still undoes the one-move proof.
2. **Phone calibration keeps Reset** — four White moves are worth a restart control.
3. **Wide labs unchanged** — Prove stays in the manuscript, so Reset still files under the marble.
4. **Playwright** — hanging-knight phone after Bxd4 hides Reset and keeps Advance|Take back on one row (tool row shorter than 52px).
5. **Phone Duel after calibration** clears leftover `data-calibration-lesson` / `data-puzzle-lesson` markers so the dossier, ledger, and sound row stay visible.
6. **Resize** recomputes Reset when Prove docks or returns, so rotating wide → phone does not resurrect the wrapped Reset row.

## Out of scope

- CSS budget changes
- Calibration in-progress wrap (Hint|Prove|Take back|Reset after e4)
- Replacing Wikipedia Staunton paths
