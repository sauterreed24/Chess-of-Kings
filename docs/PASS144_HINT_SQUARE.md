---
overview: "v0.5.136: Hint marks the archive's one square, uses its own cue, and the first unreadable kickers and phone nav labels move to 0.7rem."
---

# Pass 144 — Archive hint square (v0.5.136)

A current-build play of the title, Prologue, opening calibration, and Duel Archive on desktop and a 390×844 phone found three failures on the first board a new player sees.

1. **Hint lit every legal square of the chosen piece.** On the opening calibration the archive selected the d-pawn and painted both d3 and d4, while the coach only said a pawn move stakes a claim in the centre. Either square was playable, so the hint could teach the move the archive did not choose.
2. **Hint reused the Take back cue.** The same 220 Hz tone meant "show me a plan" and "take that back."
3. **The Target kicker, phone Title / Chapters / Duel labels, and Sound / Move Guard toggles were still under 11px** (0.48–0.54rem). Pass 140 had left the Hint / Target kickers for a later pass.

## Shipped

1. **One recommended square** — `requestHint` asks the board to mark only the archive destination. Clicking that square plays it. Clicking the piece again restores the full legal set. The selected piece is announced with one legal target.
2. **A distinct hint cue** — Hint plays the existing advance tone (320 Hz). Take back stays at 220 Hz. The button is already disabled when a hint would do nothing, so no new oscillator entry was added.
3. **Readable chrome** — `.hint-label`, the phone nav rule, and the sound-toggle rule change `font-size` in place to 0.7rem. No new CSS rules.
4. **Regression locks** — board, hint-flow, sound, scene, and a Playwright path that checks the phone nav, then a single calibration recommendation.

## Playtest notes

- Desktop calibration: Hint produced one pearl. Playing that square recorded a White move and the Archive replied.
- 390×844 title: Title / Chapters / Duel stay inside the viewport at 0.7rem with a 44px hit target. Sound labels compute above 11px.
- Phone calibration still hides Hint so Prove and Reset share one row. The precise mark is on the desktop and match surfaces where Hint is shown.
- No stylesheet rules were added.

## Out of scope

- Native shells
- Spelling the coordinate inside the coach sentence
- Showing Hint on the phone calibration row
