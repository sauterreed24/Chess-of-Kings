# Chapter IV — The Paradox Masters

## Summary

Playable hypermodern chapter added after Chapter III. The campaign no longer ends at the Professor's Law; sealing Chapter III opens Chapter IV, and the mastery plateau moves to Chapter IV freeplay completion.

## Player-facing content

- **Codex:** fianchetto, provocation, overextension, delayed ownership
- **Drills:** kingside fianchetto (`Bg2`), queenside fianchetto (`Bb2`), queen+bishop battery mate
- **Matches:** Nysa (Bactrian Frontier), Cassian (Paradox Master)
- **Seal:** paradox title + chronicle echo; Daily Calculus pool grows by the new puzzles automatically

## Systems touched

- `src/data/chapters.ts`, `roadmap.ts`, `rewards.ts`, `duelRoster.ts`, `rivals.ts`
- AI: `nysa_frontier` / `cassian_paradox` profiles (`aiStyle: 'hypermodern'`), opening books, rival SAN bias
- Plateau / mvpFlag copy now keys off Chapter IV completion
- Theme: `theme-hypermodern`

## Testing notes

- Chapter FEN/goal validation covers new puzzles
- Orchestrator: Ch III seal opens Ch IV; Ch IV seal finishes campaign
- Duel roster / reward unlock ids for Nysa and Cassian
- Unit + e2e plateau hub fixtures updated for post–Ch IV sealed saves
