# Chapter VI — The Silicon Threshold

## Summary

Playable ledger chapter after Chapter V. Sealing the Machine of Discipline opens the Silicon Threshold. Sealing Chapter VI opens the Human Synthesis; the mastery plateau moves to Chapter VII freeplay completion. Existing chronicles that already sealed Chapter V receive the new age through a successor-unlock backfill.

## Lore

The upstairs committee files Reed as disciplined. That is a warrant, not a medal: can he follow a public line he did not invent, occupy the hole the ledger already named, and finish a plus instead of narrating it?

Prax and Iota are not villains. Drought taught the counting rooms that inspiration is a leak. Gage's pause still holds; the threshold punishes the pause that ignores a hanging piece. Helia hands Reed forward: conversion is not complete until the file is finished.

Ledger-engines are brass-and-lapis civic calculators in archive counting rooms. They enumerate. They do not dream.

- **Prax** examines the public line. An empty outpost is a leak in the hull.
- **Iota** examines the finish. A plus that is not cashed is weather you failed to collect.

Sealing the chapter amends the committee file again: Reed can follow a public line without vanishing into it.

## Player-facing content

- **Codex:** outpost, precision capture, forced finish, ledger engine, Silicon Threshold
- **Drills:** knight outpost (`Nd5`), hanging-queen capture (`Nxd5`), back-rank mate (`Re8#`)
- **Matches:** Prax (Sicilian-sharp script) and Iota (Caro/Slav-quiet script)
- **Seal:** ledger title + chronicle echo; Daily Calculus pool grows automatically

## Systems

- Successor unlock: `backfillSuccessorUnlocks` also opens Chapter VI after `c5-reflection` / `c5-freeplay`
- Doctrine atlas mark: `Silicon`
- Silicon-opened hub CTA for Chapter V survivors
- `prax_precision` / `iota_threshold` profiles, books, SAN bias, and `engine` style
- Theme: `theme-classical` (no new CSS — gzip budget locked)

## Testing notes

- Chapter FEN/goal validation covers outpost (`pieceOn d5`), hanging-queen advantage, and back-rank mate
- Orchestrator: Ch V seal opens Ch VI; pre-Ch-VI saves that sealed the discipline age unlock Ch VI on load
- Duel roster / reward unlock ids for Prax and Iota
- Plateau hub fixtures cover sealed Ch V (silicon invite), pending Ch VI, and sealed Ch VI synthesis invite
- Playwright: Chapter VI drills (`c3-d5`, `e3-d5`, `e1-e8`) and first Prax match on desktop and 390×844; Iota from a mid-age resume (`e2–e4`, scripted `c6`); post-V / post-VI hub copy
