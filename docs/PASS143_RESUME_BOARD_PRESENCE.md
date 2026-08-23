---
name: Pass 143 — Board continuity and phone presence
overview: "v0.5.135: recovered positions survive the lab handoff, stale move routes clear, and the first compact render gives the board its intended visual weight."
---

# Pass 143 — Board continuity and phone presence (v0.5.135)

A current-build play audit covered the title, chapter index, Prologue dialogue, calibration board, Duel Archive, navigation recovery, desktop, and a 390×844 phone viewport. The visual system was already cohesive, but two failures undercut the play surface: Resume reopened the right passage at the starting position with an old move halo, and the phone board could stay trapped at the 160px safety floor until the viewport changed.

## Shipped

1. **Recovered sessions open once** — the recovery action prepares the saved state, and the lab mounts that state without a second scene refresh.
2. **Reset means reset** — `BoardView.draw(chess, null, …)` now clears last-move classes, accessible route labels, and destination z-index.
3. **Settled compact measurement** — mobile board fit waits through the opening layout and measures on the following frame, after the board-first stack has reflowed.
4. **Regression locks** — focused tests cover the restored FEN and calibration count, route-highlight cleanup, and the 160px-to-350px settled phone measurement.
5. **Production dependency hygiene** — the synchronized lockfile resolves the audited `tar` and `brace-expansion` advisories without forcing a major package upgrade.

## Playtest notes

- The calibration path completed four legal White moves with Archive replies and sealed the proof normally.
- Duel navigation continued to preserve the recoverable campaign entry point.
- At 390×844, the board grows to the width-limited compact target without requiring rotation or a manual resize; the proof action remains visible beneath it.
- No stylesheet rules or dependencies were added, preserving the existing CSS gzip ceiling and offline-first footprint.
- `npm audit --omit=dev` reports zero production advisories; five asset-generation-only advisories remain upstream without fixes and are not shipped in the browser bundle.

## Out of scope

- New chapters, rivals, skins, or art assets.
- Native shell changes.
- Publishing or merging the stacked Pass 140–142 pull requests.
