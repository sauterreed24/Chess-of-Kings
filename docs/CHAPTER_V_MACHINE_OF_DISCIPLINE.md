# Chapter V — The Machine of Discipline

## Summary

Playable discipline chapter after Chapter IV. Sealing the Paradox Masters opens the Machine of Discipline. The mastery plateau moves to Chapter V freeplay completion. Existing chronicles that already sealed Chapter IV receive the new age through a successor-unlock backfill.

## Lore

The upstairs committee files Reed as paradox-capable. That is a warrant, not a medal: can he stop an idea one square before it earns a name, and can he cash a won file instead of leaving it as a rumor?

Gage and Helia are not villains. Drought taught their river-city and steppe colleges that drama spends water. Kallistos's Professor's Law still holds; the machine is the habit of applying it early. Cassian hands Reed forward: frontier geometry does not cancel the pause.

- **Gage** examines the pause. A donated square is how plans earn names.
- **Helia** examines conversion. Advantage that is not taken is a leak in the hull.

Sealing the chapter amends the committee file again: Reed can wait without becoming furniture.

## Player-facing content

- **Codex:** prophylaxis, luft, conversion, long squeeze, Discipline colleges
- **Drills:** quiet luft (`h3`), hanging-queen conversion (`Qxd5`), opposition mate (`Ra8#`)
- **Matches:** Gage (Philidor-quiet script) and Helia (French/QGD-quiet script)
- **Seal:** discipline title + chronicle echo; Daily Calculus pool grows automatically

## Systems

- Successor unlock: `backfillSuccessorUnlocks` also opens Chapter V after `c4-reflection` / `c4-freeplay`
- Doctrine atlas mark: `Machine`
- Machine-opened hub CTA for Chapter IV survivors
- `gage_discipline` / `helia_machine` profiles, books, SAN bias, and `soviet` style
- Theme: `theme-classical` (no new CSS — gzip budget locked)

## Testing notes

- Chapter FEN/goal validation covers luft (`pieceOn h3`), conversion capture, and opposition mate
- Orchestrator: Ch IV seal opens Ch V; pre-Ch-V saves that sealed the paradox age unlock Ch V on load
- Duel roster / reward unlock ids for Gage and Helia
- Plateau hub fixtures cover sealed Ch IV (machine invite), pending Ch V, and sealed Ch V mastery plateau
- Playwright: Chapter V drills (`h2-h3`, `d1-d5`, `a1-a8`) and post-IV / post-V hub copy
