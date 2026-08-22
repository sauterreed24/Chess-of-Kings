# Chapter VII — The Human Synthesis

## Summary

Playable synthesis chapter after Chapter VI. Sealing the Silicon Threshold opens the Human Synthesis. The mastery plateau moves to Chapter VII freeplay completion. Existing chronicles that already sealed Chapter VI receive the new age through a successor-unlock backfill.

## Lore

The upstairs committee files Reed as precise. That is a warrant, not a medal: can he drop a beloved school the moment the board stops paying it, castle the wing that still has walls, and finish the tactic the last tool made legal?

Mira and Soren are not villains. Drought taught the practice halls that loyalty to one school is how cities drown on a Tuesday. Prax's public line still holds; synthesis punishes the line you keep wearing after the wing has changed. Iota hands Reed forward: a plus that is narrated while the other wing burns is still a rumor.

- **Mira** examines the practical tool. Last week's school is a costume.
- **Soren** examines the answering school. Play a doctrine; he replies with another.

Sealing the chapter amends the committee file again: Reed can switch schools without becoming a costume trunk.

## Player-facing content

- **Codex:** school switch, safer wing, answered doctrine, smothered finish, Human Synthesis
- **Drills:** take the hanging knight instead of checking (`Bxd5`), castle queenside (`O-O-O`), smothered mate (`Nf7#`)
- **Matches:** Mira (open-game practical script) and Soren (Modern/reply script)
- **Seal:** synthesis title + chronicle echo; Daily Calculus pool grows automatically

## Systems

- Successor unlock: `backfillSuccessorUnlocks` also opens Chapter VII after `c6-reflection` / `c6-freeplay`
- Doctrine atlas mark: `Synthesis`
- Synthesis-opened hub CTA for Chapter VI survivors
- `mira_practical` / `soren_answer` profiles, books, SAN bias, and `universal` style
- Theme: `theme-classical` (no new CSS — gzip budget locked)

## Testing notes

- Chapter FEN/goal validation covers hanging-knight advantage, queenside castle `pieceOn c1`, and smothered mate
- Orchestrator: Ch VI seal opens Ch VII; pre-Ch-VII saves that sealed the ledger age unlock Ch VII on load
- Duel roster / reward unlock ids for Mira and Soren
- Plateau hub fixtures cover sealed Ch VI (synthesis invite), pending Ch VII, and sealed Ch VII mastery plateau
- Playwright: Chapter VII drills (`e4-d5`, `e1-c1`, `e5-f7`) and post-VI / post-VII hub copy
