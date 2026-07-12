# Pass 7.1 playtest hardening (v0.4.2)

Findings from live Pages playtest (`https://sauterreed24.github.io/Chess-of-Kings/`) plus adversarial review after Pass 7.

## Confirmed P0 / P1

1. **P0 — idle persist wiped recovery** — `setLastScreen('chapters'|'title'|'duel')` called `persist()` while mode was idle, writing `inProgress: null` and destroying recoverable board sessions on disk (Resume could still appear from in-memory pending until reload).
2. **P0 — chapter jump had no confirm** — unlocked chapter rows called `jumpToChapter` without the Daily Calculus confirm gate.
3. **P1 — duel start had no confirm** — Start Duel / Mastery Trial could replace recoverable campaign sessions silently.
4. **P1 — premature “sealed” plateau** — `chapter3Complete` keyed off `c3-reflection` before freeplay / clear rewards; hub now requires `c3-freeplay`, with soft “Almost sealed” copy after reflection only.
5. **P1 — duel coach tip order** — graded `ok`/`good` tips now beat generic duel doctrine nudges.
6. **P2 — echoes discoverability** — Chronicle Echoes fold opens by default when echoes exist.

## Live Browser MCP note

Cloud agent Browser MCP failed discovery because session config expanded `${CURSOR_PLUGIN_ROOT}` to empty (`/dist/...`) and the plugin’s `browse` bin shim was missing. Restored via `/dist` symlink + `LoadMcpServers` re-register; live playtest then drove title → chapters → skip-ahead → calibration e4 → vestibule → chapter re-entry wipe.
