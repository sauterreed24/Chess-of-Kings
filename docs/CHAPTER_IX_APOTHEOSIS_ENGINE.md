# Chapter IX — The Apotheosis Engine

## Summary

Playable census-hall chapter after Chapter VIII. Sealing the Alexandrine Board opens the Apotheosis Engine. The mastery plateau moves to Chapter IX freeplay completion. Existing chronicles that already sealed Chapter VIII receive the new age through a successor-unlock backfill.

There is no successor teaser after this age. Daily Calculus and the Duel Archive remain open on the mastery plateau.

## Lore

The last rooms are a civic archive, not a temple. Clerks compile Reed's habits into a public line: the captures he delays, the checks he prefers, the last rank he sometimes narrates instead of filing. Wren and Bram are not villains and not gods. Drought taught the hall that worship is how a file becomes a famine.

- **Wren** reads the census. A pinned knight is already circled.
- **Bram** answers with a compiled school. Every doctrine Reed survived is in the same drawer.

Sealing the chapter amends the committee file again: Reed can still choose after the archive has watched him choose.

## Player-facing content

- **Codex:** habit census, compiled school, last rank, fused prediction stack, Apotheosis Engine
- **Drills:** take the pinned knight (`Rxe6+`), compiled fork (`Nd6+`), last-rank mate (`Ra8#`)
- **Matches:** Wren (Petroff/census script) and Bram (King's Indian/compiled script)
- **Seal:** Apotheosis title + chronicle echo; Daily Calculus pool grows automatically

## Systems

- Successor unlock: `backfillSuccessorUnlocks` also opens Chapter IX after `c8-reflection` / `c8-freeplay`
- Doctrine atlas mark: `Apex`
- Apotheosis-opened hub CTA for Chapter VIII survivors
- `wren_census` / `bram_fused` profiles, books, SAN bias, and `apotheosis` style
- Theme: `theme-classical` (no new CSS — gzip budget locked)
- `LOCKED_ROADMAP` is empty; no locked teaser row remains

## Testing notes

- Chapter FEN/goal validation covers pin-census advantage, knight `pieceOn d6`, and last-rank mate
- Orchestrator: Ch VIII seal opens Ch IX; pre-Ch-IX saves that sealed the Alexandrine age unlock Ch IX on load; sealing IX finishes the compiled campaign
- Duel roster / reward unlock ids for Wren and Bram
- Plateau hub fixtures cover sealed Ch VIII (Apotheosis invite), pending Ch IX, and sealed Ch IX mastery plateau
- Playwright: Chapter IX drills (`e2-e6`, `e4-d6`, `a1-a8`) and first Wren match on desktop and 390×844; Bram from a mid-age resume (`d2–d4`, scripted `Nf6`); post-VIII / post-IX hub copy
