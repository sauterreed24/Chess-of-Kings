---
name: Pass 48 — Quiet puzzle coach
overview: "v0.5.40 wave: hanging-knight capture no longer prints Material won under the marble seal; explicit Hint lines still file."
---

# Pass 48 — Quiet puzzle coach (v0.5.40)

After Bxd4 the Draw. pill is gone, but the instrument still printed **Material won. Ask what the rival can take next.** Teaching puzzles have no rival recapture window; the marble already says the proof is sealed.

## Shipped

1. **Puzzle move insights stay off** — `coachTip` and `mentorInsight` are omitted on teaching puzzles unless the line starts with `Hint — `.
2. **Explicit Hint still files** so the Hint control can name the archive suggestion.
3. **Playwright** — hanging-knight phone keeps `#coach-tip` hidden after Bxd4.

## Out of scope

- CSS budget changes
- Calibration crowding
- Match/duel coaching
