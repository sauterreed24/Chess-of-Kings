# Chapter IV — The Paradox Masters

## Summary

Playable hypermodern chapter after Chapter III. Sealing the Professor's Law opens the Paradox Masters. The mastery plateau moves to Chapter IV freeplay completion. Existing chronicles that already sealed Chapter III receive the new age through a successor-unlock backfill.

## Lore

The upstairs committee that has been "deciding what Reed is" since the Romantic seal files him as school-flexible. Kallistos returns to warn that frontier doctrine does not cancel the Professor's Law. The Bactrian commentaries — the same eastern archive tradition that traveled west with chaturanga — treat the center as a caravan road: occupy nothing you cannot tax, and tax anyone who occupies too much.

- **Nysa** examines from Bactrian roads, not marble courts. She invites the center, then measures the invoice.
- **Cassian** is delayed ownership as law. He does not need the center to own it.

Sealing the chapter amends the committee file: Reed is no longer only a control specimen.

## Player-facing content

- **Codex:** fianchetto, provocation, overextension, delayed ownership, Bactrian Frontier
- **Drills:** kingside fianchetto (`Bg2`), overreach tax (`Bxd5` on the long diagonal), queen+bishop battery mate
- **Matches:** Nysa (Modern/Pirc script) and Cassian (Grünfeld-flavored script)
- **Seal:** paradox title + chronicle echo; Daily Calculus pool grows automatically

## Systems

- Successor unlock: `backfillSuccessorUnlocks` in `CampaignOrchestrator`
- Doctrine atlas on the Chapters screen
- Paradox-opened hub CTA for Chapter III survivors
- `nysa_frontier` / `cassian_paradox` profiles, books, SAN bias, and `hypermodern` style that prefers fianchetto geometry
- Theme: `theme-hypermodern`

## Testing notes

- Chapter FEN/goal validation covers the new overreach capture
- Orchestrator: Ch III seal opens Ch IV; pre-Ch-IV saves that sealed the classical age unlock Ch IV on load
- Duel roster / reward unlock ids for Nysa and Cassian
- Plateau hub fixtures cover sealed Ch IV, pending Ch III, and paradox-opened Ch III survivors
