# Chapter VIII — The Alexandrine Board

## Summary

Playable stratarchic chapter after Chapter VII. Sealing the Human Synthesis opens the Alexandrine Board. Sealing Chapter VIII opens the Apotheosis Engine; the mastery plateau moves to Chapter IX freeplay completion. Existing chronicles that already sealed Chapter VII receive the Alexandrine age through a successor-unlock backfill.

## Lore

The upstairs committee files Reed as flexible. That is a warrant, not a medal: can he take a hanging crown instead of keeping both courts in session, land a knight that files two futures on one square, and finish the mate the archive already notarized?

Voss and Elara are not villains. Drought taught the stratarchy that civil war is how cities miss the harvest. Mira's tool still holds; the Board punishes the court you leave open. Soren hands Reed forward: an answered school that never files succession is still a costume.

Temporal forks are clerk's stamps, not time travel: one square that names two offices at once.

- **Voss** examines the vacant office. A hanging queen is a court already closed.
- **Elara** examines the fork. File both futures, or the rook walks.

Sealing the chapter amends the committee file again: Reed can exchange an office without a siege.

## Player-facing content

- **Codex:** sovereign exchange, temporal fork, notarized finish, Stratarchia, Alexandrine Board
- **Drills:** take the hanging queen (`Qxa5`), knight fork (`Nc7+`), notarized mate (`Qxg7#`)
- **Matches:** Voss (queen-pawn exchange script) and Elara (Sicilian/fork script)
- **Seal:** Alexandrine title + chronicle echo; Daily Calculus pool grows automatically; `stratarchiaUnlocked` is set on reflection

## Systems

- Successor unlock: `backfillSuccessorUnlocks` also opens Chapter VIII after `c7-reflection` / `c7-freeplay`
- Doctrine atlas mark: `Board`
- Alexandrine-opened hub CTA for Chapter VII survivors
- `voss_exchange` / `elara_fork` profiles, books, SAN bias, and `alexandrine` style
- Theme: `theme-classical` (no new CSS — gzip budget locked)

## Testing notes

- Chapter FEN/goal validation covers hanging-queen advantage, knight `pieceOn c7`, and queen-file mate
- Orchestrator: Ch VII seal opens Ch VIII; pre-Ch-VIII saves that sealed the synthesis age unlock Ch VIII on load
- Duel roster / reward unlock ids for Voss and Elara
- Plateau hub fixtures cover sealed Ch VII (Alexandrine invite) and pending Ch VIII
- Playwright: Chapter VIII drills (`d2-a5`, `d5-c7`, `c3-g7`) and first Voss match on desktop and 390×844; Elara from a mid-age resume (`e2–e4`, scripted `c5`); post-VII hub copy
