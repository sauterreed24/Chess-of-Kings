# Changelog

All notable changes to The Calculus of Kings.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project follows pragmatic semantic versioning at the package
level (the save format has its own version field — see
`src/app/storage.ts`).

---

## [Unreleased]

## [0.5.125] — 2026-08-22

Pass 133 — match briefing readability:

- **Graphics** — the encounter tier badge, "Encounter N of M" line, and ladder dots render at 0.7rem so the briefing still reads on phone (CSS was 0.46–0.56rem). No new CSS.
- **Playwright** — 390×844 Amara asserts the badge, encounter line, and first ladder dot.
- Docs: [`docs/PASS133_MATCH_BRIEF.md`](docs/PASS133_MATCH_BRIEF.md).

## [0.5.124] — 2026-08-22

Pass 132 — ledger quality marks:

- **Graphics** — move-quality `!!` / `!` / `?` marks render at 0.7rem so the grade still reads next to SAN on phone (CSS was 0.48rem). No new CSS.
- **Playwright** — 390×844 Amara asserts the first `.q-icon` after e4.
- Docs: [`docs/PASS132_LEDGER_QUALITY.md`](docs/PASS132_LEDGER_QUALITY.md).

## [0.5.123] — 2026-08-22

Pass 131 — lab overlay caption:

- **Graphics** — the overlay era label renders at 0.7rem so Prologue / Chapter I still read on the phone bar (CSS was 0.46rem). No new CSS.
- **Playwright** — 390×844 skip-ahead calibration asserts `#lab-era-label`.
- Docs: [`docs/PASS131_LAB_CAPTION.md`](docs/PASS131_LAB_CAPTION.md).

## [0.5.122] — 2026-08-22

Pass 130 — move ledger readability:

- **Graphics** — the match ledger heading renders at 0.7rem and SAN rows at 0.78rem so the file still reads on phone. No new CSS.
- **Playwright** — 390×844 Amara asserts the heading and first row.
- Docs: [`docs/PASS130_LEDGER_READ.md`](docs/PASS130_LEDGER_READ.md).

## [0.5.121] — 2026-08-22

Pass 129 — last-move ring readability:

- **Graphics** — last-move origin/destination, castle aim, capture, check, selection, and Move Guard rings use a 5px inset so the route still reads on phone marble. Same-length CSS; no new rules.
- **Playwright** — 390×844 skip-ahead calibration asserts e2–e4 rings compute to 5px.
- No JS budget change. Docs: [`docs/PASS129_LAST_MOVE_RING.md`](docs/PASS129_LAST_MOVE_RING.md).

## [0.5.120] — 2026-08-22

Pass 128 — calibration rail readability:

- **Graphics** — the opening calibration label renders at 0.7rem and the inscribed dots at 16px so the 0/4 track still reads on phone. No new CSS.
- **Playwright** — 390×844 skip-ahead calibration asserts the rail label and first dot.
- No CSS budget change. Docs: [`docs/PASS128_CAL_RAIL.md`](docs/PASS128_CAL_RAIL.md).

## [0.5.119] — 2026-08-22

Pass 127 — echo timeline chips:

- **Graphics** — chronicle echo SAN chips render at 0.7rem with roomier padding so the replay line matches the labeled board. No new CSS.
- **Playwright** — 390×844 Alexion echo asserts the first timeline chip is 0.7rem.
- No CSS budget change. Docs: [`docs/PASS127_ECHO_LINE.md`](docs/PASS127_ECHO_LINE.md).

## [0.5.118] — 2026-08-22

Pass 126 — echo board labels:

- **Graphics** — chronicle echo boards plant the same 0.7rem file/rank corner marks as the live marble. No new CSS.
- **Playwright** — 390×844 Alexion echo asserts eight file and eight rank marks.
- No CSS budget change. Docs: [`docs/PASS126_ECHO_LABELS.md`](docs/PASS126_ECHO_LABELS.md).

## [0.5.117] — 2026-08-22

Pass 125 — square label readability:

- **Graphics** — file and rank corner marks render at 0.7rem inline so they beat the 0.4rem CSS floor on a 17px phone root. No new CSS.
- **Playwright** — 390×844 skip-ahead calibration asserts a1's file/rank marks are 0.7rem and at least 10px tall.
- No CSS budget change. Docs: [`docs/PASS125_SQUARE_LABELS.md`](docs/PASS125_SQUARE_LABELS.md).

## [0.5.116] — 2026-08-22

Pass 124 — phone run-back and recovery:

- **Playability** — Run it back, Restore Stable, and Dismiss keep a 44px hit target on `max-width: 700px`. Resize keeps the floor. No new CSS.
- **Playwright** — 390×844 restores a checkmated Amara board and asserts the three buttons.
- No CSS budget change. Docs: [`docs/PASS124_PHONE_RUN_BACK.md`](docs/PASS124_PHONE_RUN_BACK.md).

## [0.5.115] — 2026-08-22

Pass 123 — legal aim pearls:

- **Graphics** — quiet legal targets plant an inline 58% / 20px-min pearl above the CSS `::after` so phone squares (~40px) still read. Captures and castle destinations stay class-only. No new CSS.
- **Playwright** — 390×844 calibration skip-ahead selects e2 and asserts the e4 pearl is at least 20px.
- No CSS budget change. Docs: [`docs/PASS123_LEGAL_AIM.md`](docs/PASS123_LEGAL_AIM.md).

## [0.5.114] — 2026-08-22

Pass 122 — echo board facets:

- **Graphics** — chronicle echo boards reuse live-board lamp/shade facets and wrap glyphs in carved `.piece` spans so ivory/lapis still read. No new CSS.
- **Playability** — dossier echo replay buttons keep a 44px hit target on `max-width: 700px`.
- **Playwright** — 390×844 opens an Alexion echo and asserts 64 facets plus a 2.4 outline.
- No CSS budget change. Docs: [`docs/PASS122_ECHO_BOARD.md`](docs/PASS122_ECHO_BOARD.md).

## [0.5.113] — 2026-08-22

Pass 121 — phone match tools:

- **Playability** — Take back, Sound, and Move Guard keep a 44px hit target on `max-width: 700px`. The sound row was ~13px on the 17px phone root. No new CSS.
- **Playwright** — 390×844 hanging knight asserts Take back is 44px; Amara asserts Sound and Move Guard.
- No CSS budget change. Docs: [`docs/PASS121_PHONE_MATCH_TOOLS.md`](docs/PASS121_PHONE_MATCH_TOOLS.md).

## [0.5.112] — 2026-08-22

Pass 120 — eval bar readability:

- **Graphics** — match/duel eval trays render at 18px with a 0.78rem ivory score so the rotated number still reads on phone. No new CSS.
- **Playwright** — 390×844 starts a Duel Archive game and asserts the tray is 18px.
- No CSS budget change. Docs: [`docs/PASS120_EVAL_BAR.md`](docs/PASS120_EVAL_BAR.md).

## [0.5.111] — 2026-08-22

Pass 119 — captured HUD scale:

- **Graphics** — match/duel captured glyphs render at 2rem so carved ivory/lapis still reads in the material tray. Ornate ivory keeps the bronze stroke. No new CSS.
- **Playwright** — 390×844 Amara match takes `exd5` and asserts the captured pawn is 2rem with a 2.4 outline.
- No CSS budget change. Docs: [`docs/PASS119_CAPTURED_HUD.md`](docs/PASS119_CAPTURED_HUD.md).

## [0.5.110] — 2026-08-22

Pass 118 — classic-royal outline:

- **Graphics** — default ivory/lapis glyphs use the same 2.4 civic outline as neon and ornate, so carved edges still read on ~40px phone squares. Cups stay 0.45. No new CSS.
- **Playwright** — calibration and a 390×844 skip-ahead assert `stroke-width="2.4"` on e2.
- No CSS budget change. Docs: [`docs/PASS118_CLASSIC_OUTLINE.md`](docs/PASS118_CLASSIC_OUTLINE.md).

## [0.5.109] — 2026-08-22

Pass 117 — phone skip-ahead:

- **Playability** — “I know the rules — straight to the board” and Chronicle Index hub CTAs keep a 44px hit target on `max-width: 700px`. No new CSS.
- **Playwright** — 390×844 enters the prologue and asserts skip-ahead is 44px.
- No CSS budget change. Docs: [`docs/PASS117_PHONE_SKIP_AHEAD.md`](docs/PASS117_PHONE_SKIP_AHEAD.md).

## [0.5.108] — 2026-08-22

Pass 116 — phone title enter:

- **Playability** — Enter the Archive, Resume expedition, and New chronicle keep a 44px hit target on `max-width: 700px`. Default button padding was ~35px on the 17px phone root. No new CSS.
- **Playwright** — 390×844 asserts Enter the Archive is 44px.
- No CSS budget change. Docs: [`docs/PASS116_PHONE_TITLE_ENTER.md`](docs/PASS116_PHONE_TITLE_ENTER.md).

## [0.5.107] — 2026-08-22

Pass 115 — phone dossier folds:

- **Playability** — title / chronicle lore summaries, duel dossier folds, and teaching “Why it works” stay 44px on `max-width: 700px`. CSS still floors them at 2.4rem (~41px). No new CSS.
- **Playwright** — 390×844 asserts the title and Chronicle Index lore folds.
- No CSS budget change. Docs: [`docs/PASS115_PHONE_DOSSIER_FOLD.md`](docs/PASS115_PHONE_DOSSIER_FOLD.md).

## [0.5.106] — 2026-08-22

Pass 114 — phone title honor guard:

- **Graphics** — the carved ivory/lapis honor row wraps into two ranks of five on `max-width: 700px` at 2.4rem, and the civic outline thickens to 2.4 so crowns, mitres, and merlons read. No new CSS.
- **Playwright** — desktop honor still asserts ten carved pieces; 390×844 asserts each glyph is at least 38px tall.
- No CSS budget change. Docs: [`docs/PASS114_PHONE_HONOR_SCALE.md`](docs/PASS114_PHONE_HONOR_SCALE.md).

## [0.5.105] — 2026-08-22

Pass 113 — phone top nav:

- **Playability** — Title / Chapters / Duel and Return to title keep a 44px hit target on `max-width: 700px`. The 50px phone bar is restored to 56px inline so the 44px pills do not clip. No new CSS.
- **Playwright** — 390×844 asserts those four controls are 44px.
- No CSS budget change. Docs: [`docs/PASS113_PHONE_TOP_NAV.md`](docs/PASS113_PHONE_TOP_NAV.md).

## [0.5.104] — 2026-08-22

Pass 112 — phone title privacy links:

- **Playability** — Privacy policy, Accessibility, and Keyboard atlas keep a 44px hit target on `max-width: 700px`. Inline anchors become `inline-block` so min-height actually grows the box. No new CSS.
- **Playwright** — 390×844 asserts those three controls are 44px tall.
- No CSS budget change. Docs: [`docs/PASS112_PHONE_TITLE_PRIVACY.md`](docs/PASS112_PHONE_TITLE_PRIVACY.md).

## [0.5.103] — 2026-08-22

Pass 111 — phone Duel Archive setup:

- **Playability** — dossier Variant / Color / Pressure / Skin selects and the four launch actions keep a 44px hit target on `max-width: 700px`. Desktop Chrome phone viewports are fine-pointer, so the coarse-pointer 2.65rem rule does not apply.
- **Playwright** — 390×844 opens the first dossier and asserts those controls are 44px.
- No CSS budget change. Docs: [`docs/PASS111_PHONE_DUEL_SETUP.md`](docs/PASS111_PHONE_DUEL_SETUP.md).

## [0.5.102] — 2026-08-22

Pass 110 — Alexandrine ivory outline contrast:

- **Graphics** — ivory ornate pieces keep cream fill and set `--piece-stroke` to `#6b4e14` inline so gold-on-cream reads on 390×844. CSS hex stays locked. Sapphire ornate is unchanged.
- **Playwright** — the ornate Lukas seed asserts the darker ivory stroke, cream/sapphire fills, stroke 2.4, `e2–e4` / `e5`.
- No CSS budget change. Docs: [`docs/PASS110_ORNATE_IVORY.md`](docs/PASS110_ORNATE_IVORY.md).

## [0.5.101] — 2026-08-22

Pass 109 — phone title settings hit targets:

- **Playability** — Sound, Move Guard, Motion, AI Thread, and Visual on the title Settings row keep a 44px hit target on `max-width: 700px` via the existing phone-tool inline floor. No new CSS.
- **Playwright** — the title skin-picker seed also asserts those five controls are 44px on 390×844.
- No CSS budget change. Docs: [`docs/PASS109_PHONE_TITLE_SETTINGS.md`](docs/PASS109_PHONE_TITLE_SETTINGS.md).

## [0.5.100] — 2026-08-22

Pass 108 — phone title skin picker:

- **Playability** — the title Piece skin select keeps a 44px hit target on `max-width: 700px` via the existing phone-tool inline floor (no new CSS). Changing the set persists and paints the next match.
- **Playwright** — a post-Amara Chapter I seed with every set unlocked starts on classic-royal, switches to High Contrast Tournament on 390×844, then resumes Lukas with `data-skin="high-contrast"`.
- No CSS budget change. Docs: [`docs/PASS108_PHONE_SKIN_PICK.md`](docs/PASS108_PHONE_SKIN_PICK.md).

## [0.5.99] — 2026-08-22

Pass 107 — Alexandrine Ornate set on the phone instrument:

- **Graphics** — ornate glyphs stay carved, then thicken the shared 1.5 outline to 2.4 so cream/gold and sapphire/gold still read on 390×844. Cup strokes stay 0.45. No new CSS.
- **Playwright** — a post-Amara Chapter I seed with ornate selected resumes Lukas: `data-skin="alexandrine-ornate"`, carve overlays, cream/sapphire fills, gold strokes, civic silhouettes, `e2–e4` / `e5`, and 44px Hint/Reset.
- No CSS budget change. Docs: [`docs/PASS107_PHONE_ORNATE.md`](docs/PASS107_PHONE_ORNATE.md).

## [0.5.98] — 2026-08-22

Pass 106 — Obsidian Neon set on the phone instrument:

- **Graphics** — neon glyphs stay carved, then thicken the shared 1.5 outline to 2.4 so cyan and pink sides read on the same `#09101a` fill at 390×844. Cup strokes stay 0.45. No new CSS.
- **Playwright** — a post-Amara Chapter I seed with neon selected resumes Lukas: `data-skin="obsidian-neon"`, carve overlays, shared dark fill, cyan/pink strokes, civic silhouettes, `e2–e4` / `e5`, and 44px Hint/Reset.
- No CSS budget change. Docs: [`docs/PASS106_PHONE_NEON.md`](docs/PASS106_PHONE_NEON.md).

## [0.5.97] — 2026-08-22

Pass 105 — High Contrast Tournament set on the phone instrument:

- **Graphics** — tournament glyphs keep a 2.4 stroke so uncarved ivory and ink read on 390×844 squares. Civic carve overlays stay off.
- **Playwright** — a post-Amara Chapter I seed with the tournament set selected resumes Lukas: `data-skin="high-contrast"`, ink/ivory fills, civic silhouettes, `e2–e4` / `e5`, and 44px Hint/Reset.
- No CSS budget change. Docs: [`docs/PASS105_PHONE_HC_TOURNEY.md`](docs/PASS105_PHONE_HC_TOURNEY.md).

## [0.5.96] — 2026-08-22

Pass 104 — Chapter I Counterpart match on the phone instrument:

- **Playwright** — a post-Demetrios Chapter I seed resumes `c1-after-demetrios` (Pass 92 current-age resume, scene 21). Desktop and 390×844: civic silhouettes on the e4–e5 tabiya, board-first, `g1–f3`, scripted `Nc6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS104_PHONE_CH1_COUNTERPART.md`](docs/PASS104_PHONE_CH1_COUNTERPART.md).

## [0.5.95] — 2026-08-22

Pass 103 — Chapter I Demetrios match on the phone instrument:

- **Playwright** — a post-Marius Chapter I seed resumes `c1-before-demetrios` (Pass 92 current-age resume, scene 19). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted Giuoco `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS103_PHONE_CH1_DEMETRIOS.md`](docs/PASS103_PHONE_CH1_DEMETRIOS.md).

## [0.5.94] — 2026-08-22

Pass 102 — Chapter I Marius match on the phone instrument:

- **Playwright** — a post-Edred Chapter I seed resumes `c1-before-marius` (Pass 92 current-age resume, scene 16). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted classical `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS102_PHONE_CH1_MARIUS.md`](docs/PASS102_PHONE_CH1_MARIUS.md).

## [0.5.93] — 2026-08-22

Pass 101 — Chapter I Edred match on the phone instrument:

- **Playwright** — a post-Lukas Chapter I seed resumes `c1-before-edred` (Pass 92 current-age resume, scene 13). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted Sicilian `c5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS101_PHONE_CH1_EDRED.md`](docs/PASS101_PHONE_CH1_EDRED.md).

## [0.5.92] — 2026-08-22

Pass 100 — Chapter I Lukas match on the phone instrument:

- **Playwright** — a post-Amara Chapter I seed resumes `c1-before-lukas` (Pass 92 current-age resume, scene 10). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted Italian `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS100_PHONE_CH1_LUKAS.md`](docs/PASS100_PHONE_CH1_LUKAS.md).

## [0.5.91] — 2026-08-22

Pass 99 — Chapter III Kallistos match on the phone instrument:

- **Authored `e5`** — `c3-match-kallistos` now scripts her classical first reply (book ply 1), so opening-discipline dice cannot skip it.
- **Playwright** — a post-Demetrios Chapter III seed resumes `c3-before-kallistos` (Pass 92 current-age resume, scene 7). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS99_PHONE_CH3_KALLISTOS.md`](docs/PASS99_PHONE_CH3_KALLISTOS.md).

## [0.5.90] — 2026-08-22

Pass 98 — Chapter II Vega match on the phone instrument:

- **Playwright** — a post-Rowan Chapter II seed resumes `c2-before-vega` (Pass 92 current-age resume, scene 7). Desktop and 390×844: civic silhouettes on the Italian tabiya, board-first, kingside `O-O`, scripted `Bc5` reply, board-guide fit, Hint/Reset floors after resize.
- **Match aim** — selecting a king that can castle keeps the live match command; castle destinations stay on the squares. Teaching castle puzzles still name `g1`.
- Theme reuses existing Romantic piece CSS (gzip locked). Docs: [`docs/PASS98_PHONE_CH2_VEGA.md`](docs/PASS98_PHONE_CH2_VEGA.md).

## [0.5.89] — 2026-08-22

Pass 97 — Chapter IX Bram match on the phone instrument:

- **Playwright** — a post-Wren Chapter IX seed resumes `c9-before-bram` (Pass 92 current-age resume). Desktop and 390×844: civic silhouettes, board-first, `d2–d4` (Indian, not Wren’s `e4`), scripted `Nf6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS97_PHONE_CH9_BRAM.md`](docs/PASS97_PHONE_CH9_BRAM.md).

## [0.5.88] — 2026-08-22

Pass 96 — Chapter VIII Elara match on the phone instrument:

- **Playwright** — a post-Voss Chapter VIII seed resumes `c8-before-elara` (Pass 92 current-age resume). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted Sicilian `c5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS96_PHONE_CH8_ELARA.md`](docs/PASS96_PHONE_CH8_ELARA.md).

## [0.5.87] — 2026-08-22

Pass 95 — Chapter VII Soren match on the phone instrument:

- **Playwright** — a post-Mira Chapter VII seed resumes `c7-before-soren` (Pass 92 current-age resume). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `g6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS95_PHONE_CH7_SOREN.md`](docs/PASS95_PHONE_CH7_SOREN.md).

## [0.5.86] — 2026-08-22

Pass 94 — Chapter VI Iota match on the phone instrument:

- **Playwright** — a post-Prax Chapter VI seed resumes `c6-before-iota` (Pass 92 current-age resume). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `c6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS94_PHONE_CH6_IOTA.md`](docs/PASS94_PHONE_CH6_IOTA.md).

## [0.5.85] — 2026-08-22

Pass 93 — Chapter IV Cassian match on the phone instrument:

- **Playwright** — a post-Nysa Chapter IV seed resumes `c4-before-cassian` (Pass 92 current-age resume). Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `Nf6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing hypermodern piece CSS (gzip locked). Docs: [`docs/PASS93_PHONE_CH4_CASSIAN.md`](docs/PASS93_PHONE_CH4_CASSIAN.md).

## [0.5.84] — 2026-08-22

Pass 92 — Resume the current age; Chapter V Helia match on the phone instrument:

- **Chapters** — the current-age button resumes the saved scene instead of `jumpToChapter` (which always rewound to scene 0). Mid-age players can reach Helia from the vestibule without replaying Gage.
- **Playwright** — seeded post-Gage Chapter V walks one briefing into Helia. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `e6` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS92_PHONE_CH5_HELIA.md`](docs/PASS92_PHONE_CH5_HELIA.md).

## [0.5.83] — 2026-08-22

Pass 91 — Chapter V Gage match on the phone instrument:

- **Playwright** — Chapter V walks the Machine of Discipline drills into the first Gage match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `d6` reply, board-guide fit, Hint/Reset floors after resize. Phone drills hide the manuscript and dock Prove.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS91_PHONE_CH5_MATCH.md`](docs/PASS91_PHONE_CH5_MATCH.md).

## [0.5.82] — 2026-08-22

Pass 90 — Chapter IV Nysa match on the phone instrument:

- **Playwright** — Chapter IV walks the Paradox Masters drills into the first Nysa match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `g6` reply, board-guide fit, Hint/Reset floors after resize. Phone drills hide the manuscript and dock Prove.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS90_PHONE_CH4_MATCH.md`](docs/PASS90_PHONE_CH4_MATCH.md).

## [0.5.81] — 2026-08-22

Pass 89 — Chapter III Demetrios return on the phone instrument:

- **Authored first reply** — the returning examiner now answers `1. e4` with scripted `e5` (Pass 85 first-ply honor), instead of an unscripted book roll.
- **Playwright** — Chapter III walks the Professor’s Law back-rank drill into the first Demetrios match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `e5`, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS89_PHONE_CH3_MATCH.md`](docs/PASS89_PHONE_CH3_MATCH.md).

## [0.5.80] — 2026-08-22

Pass 88 — Chapter II Rowan match on the phone instrument:

- **King-hunt command** — the Romantic mate drill now has a phone-short `goalBrief` (`Checkmate in one on the eighth rank.`) so the instrument does not overflow the long `goalPlain`.
- **Playwright** — Chapter II walks the Age of Fire king hunt into the first Rowan match. Desktop and 390×844: civic silhouettes on the King’s Gambit tabiya (`f4`, not `e2–e4`), board-first, `Nf3`, scripted `exf4` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS88_PHONE_CH2_MATCH.md`](docs/PASS88_PHONE_CH2_MATCH.md).

## [0.5.79] — 2026-08-22

Pass 87 — Chapter IX Wren match on the phone instrument:

- **Playwright** — Chapter IX walks the Apotheosis Engine drills into the first Wren match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS87_PHONE_CH9_MATCH.md`](docs/PASS87_PHONE_CH9_MATCH.md).

## [0.5.78] — 2026-08-22

Pass 86 — Chapter VIII Voss match on the phone instrument:

- **Playwright** — Chapter VIII walks the Alexandrine Board drills into the first Voss match. Desktop and 390×844: civic silhouettes, board-first, queen-pawn `d2–d4`, scripted `d5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS86_PHONE_CH8_MATCH.md`](docs/PASS86_PHONE_CH8_MATCH.md).

## [0.5.77] — 2026-08-22

Pass 85 — Chapter VII Mira match on the phone instrument:

- **First authored reply** — campaign matches always play the first `scriptedBlackSans` ply (Mira’s `e5` after `e4`). Later book moves may still drift by opening discipline.
- **Playwright** — Chapter VII walks the Human Synthesis drills into the first Mira match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `e5` reply, board-guide fit, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS85_PHONE_CH7_MATCH.md`](docs/PASS85_PHONE_CH7_MATCH.md).

## [0.5.76] — 2026-08-22

Pass 84 — Chapter VI Prax match on the phone instrument:

- **Phone matches** keep a 44px Hint/Reset floor when the lab undocks or the viewport resizes, instead of stripping inline hit-target styles until the next ply.
- **Playwright** — Chapter VI walks the Silicon Threshold drills into the first Prax match. Desktop and 390×844: civic silhouettes, board-first, `e2–e4`, scripted `c5` reply, Hint/Reset floors after resize.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS84_PHONE_CH6_MATCH.md`](docs/PASS84_PHONE_CH6_MATCH.md).

## [0.5.75] — 2026-08-22

Pass 83 — Phone Reset restyle-on-unhide:

- **Phone calibration / matches** restyle Reset to a 44px hit target when `applyChessUi` unhides it after the first ply, without waiting for a resize.
- **Playwright** — compact calibration asserts Reset `min-height: 44px` after e2–e4. First Chapter I match against Amara proves on 390×844: civic silhouettes, board-first, opening ply, Archive reply.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS83_PHONE_RESET_UNHIDE.md`](docs/PASS83_PHONE_RESET_UNHIDE.md).

## [0.5.74] — 2026-08-22

Pass 82 — King crown silhouette:

- **Ivory and lapis kings** replace the Wikipedia Staunton stroke-only plus and bow-tie flares with a civic crown: bowl, stem, and a thick cross in the glyph. Carved inlay, sheen, and neck follow the new brim.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament kings still read as crowns with a plus.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS82_KING_CROWN_HEAD.md`](docs/PASS82_KING_CROWN_HEAD.md).

## [0.5.73] — 2026-08-22

Pass 81 — Pawn globe silhouette:

- **Ivory and lapis pawns** replace the Wikipedia Staunton teardrop with a civic pawn: round globe, collar ring, and stem in the glyph. Carved orb, spark, sheen, and neck follow the new head.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament pawns still read as globes, not cups.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS81_PAWN_GLOBE_HEAD.md`](docs/PASS81_PAWN_GLOBE_HEAD.md).

## [0.5.72] — 2026-08-22

Pass 80 — Rook battlement silhouette:

- **Ivory and lapis rooks** replace the Wikipedia Staunton roof notches with a civic battlement: three merlons and two deep crenels in the glyph. Carved merlons, sheen, and neck follow the new roof.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament rooks still read as towers.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS80_ROOK_CRENEL_HEAD.md`](docs/PASS80_ROOK_CRENEL_HEAD.md).

## [0.5.71] — 2026-08-22

Pass 79 — Queen coronet silhouette:

- **Ivory and lapis queens** replace the Wikipedia Staunton spike scribble with a civic coronet: flared circlet, diadem, and five orbs in the glyph. Carved pearls, sheen, and neck follow the new brim.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament queens still read as coronets.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS79_QUEEN_CORONET_HEAD.md`](docs/PASS79_QUEEN_CORONET_HEAD.md).

## [0.5.70] — 2026-08-22

Pass 78 — Bishop mitre silhouette:

- **Ivory and lapis bishops** replace the Wikipedia Staunton teardrop-plus-ball with a civic mitre: pointed hat, stem, and a plus-cut in the glyph. Carved cleft, sheen, and neck follow the new brim.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament bishops still read as mitres.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS78_BISHOP_MITRE_HEAD.md`](docs/PASS78_BISHOP_MITRE_HEAD.md).

## [0.5.69] — 2026-08-22

Pass 77 — Chapter VI phone lab:

- **390×844 Silicon Threshold drills** prove outpost / hanging-queen / back-rank on the phone instrument: manuscript hidden, Prove docked beside Hint, `#turn-pulse` stays hidden, overlay caption is `Chapter VI`.
- **44px hit targets** — docked Hint, Prove, and calibration Reset use inline `min-height`/`min-width` (CSS gzip locked). After the e8 mate, Prax’s briefing restores the manuscript. Docs: [`docs/PASS77_PHONE_CH6_LAB.md`](docs/PASS77_PHONE_CH6_LAB.md).

## [0.5.68] — 2026-08-22

Pass 76 — Chapter VII phone lab:

- **390×844 Synthesis drills** prove hanging-knight / safer-wing castle / smothered-mate on the phone instrument: manuscript hidden, Prove docked beside Hint, `#turn-pulse` stays hidden, overlay caption is `Chapter VII`.
- After the f7 mate, Mira’s briefing restores the manuscript. Theme untouched (CSS gzip locked). Docs: [`docs/PASS76_PHONE_CH7_LAB.md`](docs/PASS76_PHONE_CH7_LAB.md).

## [0.5.67] — 2026-08-22

Pass 75 — Chapter VIII phone lab:

- **390×844 Alexandrine drills** prove hanging-queen / knight-fork / notarized-mate on the phone instrument: manuscript hidden, Prove docked beside Hint, `#turn-pulse` stays hidden, overlay caption is `Chapter VIII`.
- After the g7 mate, Voss’s briefing restores the manuscript. Theme untouched (CSS gzip locked). Docs: [`docs/PASS75_PHONE_CH8_LAB.md`](docs/PASS75_PHONE_CH8_LAB.md).

## [0.5.66] — 2026-08-22

Pass 74 — Chapter IX phone lab:

- **390×844 Apotheosis drills** prove pin-census / compiled-fork / last-rank on the phone instrument: manuscript hidden, Prove docked beside Hint, `#turn-pulse` stays hidden, overlay caption is `Chapter IX`.
- After the last-rank seal, Wren’s briefing restores the manuscript. Theme untouched (CSS gzip locked). Docs: [`docs/PASS74_PHONE_CH9_LAB.md`](docs/PASS74_PHONE_CH9_LAB.md).

## [0.5.65] — 2026-08-22

Pass 73 — Knight horse-head silhouette:

- **Ivory and lapis knights** replace the Wikipedia Staunton scribble with a civic horse: pointed ear, muzzle, nostril, and an iris on the head. The carved eye sits on that iris, not on the snout.
- **High-contrast** keeps the same silhouette (no carve overlays), so tournament knights still read as horses.
- Theme reuses existing piece CSS (gzip locked). Docs: [`docs/PASS73_KNIGHT_HEAD.md`](docs/PASS73_KNIGHT_HEAD.md).

## [0.5.64] — 2026-08-22

Pass 72 — Chapter IX playable:

- **Chapter IX — The Apotheosis Engine** is playable: civic census-hall lore, Wren + Bram matches with Petroff/Indian scripts, pin-census / compiled-fork / last-rank drills, and a seal that moves the mastery plateau to I–IX.
- **Successor unlock backfill** opens Chapter IX for chronicles that sealed Chapter VIII when it was the last compiled age.
- Hub copy: Chapter VIII survivors are invited into the Apotheosis Engine; the mastery plateau now keys off Chapter IX freeplay. `LOCKED_ROADMAP` is empty — no fake teaser cliff.
- Theme reuses `theme-classical` (CSS gzip locked). Docs: [`docs/PASS72_CHAPTER_IX.md`](docs/PASS72_CHAPTER_IX.md).

## [0.5.63] — 2026-08-22

Pass 71 — Chapter VIII playable:

- **Chapter VIII — The Alexandrine Board** is playable: stratarchic lore, Voss + Elara matches with exchange/fork scripts, hanging-queen / knight-fork / notarized-mate drills, and a seal that moves the mastery plateau to I–VIII.
- **Successor unlock backfill** opens Chapter VIII for chronicles that sealed Chapter VII when it was the last compiled age.
- Hub copy: Chapter VII survivors are invited into the Alexandrine Board; the mastery plateau now keys off Chapter VIII freeplay.
- Theme reuses `theme-classical` (CSS gzip locked). Docs: [`docs/PASS71_CHAPTER_VIII.md`](docs/PASS71_CHAPTER_VIII.md).

## [0.5.62] — 2026-08-22

Pass 70 — Chapter VII playable:

- **Chapter VII — The Human Synthesis** is playable: school-switch lore, Mira + Soren matches with practical/reply scripts, hanging-piece / safer-wing castle / smothered-mate drills, and a seal that moves the mastery plateau to I–VII.
- **Successor unlock backfill** opens Chapter VII for chronicles that sealed Chapter VI when it was the last compiled age.
- Hub copy: Chapter VI survivors are invited into the Human Synthesis; the mastery plateau now keys off Chapter VII freeplay.
- Theme reuses `theme-classical` (CSS gzip locked). Docs: [`docs/PASS70_CHAPTER_VII.md`](docs/PASS70_CHAPTER_VII.md).

## [0.5.61] — 2026-08-22

Pass 69 — Chapter VI playable:

- **Chapter VI — The Silicon Threshold** is playable: ledger-engine lore (brass/lapis counting rooms, not sci-fi robots), Prax + Iota matches with public-line / finish scripts, outpost / hanging-queen / back-rank drills, and a seal that moves the mastery plateau to I–VI.
- **Successor unlock backfill** opens Chapter VI for chronicles that sealed Chapter V when it was the last compiled age.
- Hub copy: Chapter V survivors are invited into the Silicon Threshold; the mastery plateau now keys off Chapter VI freeplay.
- Theme reuses `theme-classical` (CSS gzip locked). Docs: [`docs/PASS69_CHAPTER_VI.md`](docs/PASS69_CHAPTER_VI.md).

## [0.5.60] — 2026-08-22

Pass 68 — Chapter V playable:

- **Chapter V — The Machine of Discipline** is playable: discipline-college lore, Gage + Helia matches with prophylactic/conversion scripts, luft / hanging-queen / opposition drills, and a seal that moves the mastery plateau forward.
- **Successor unlock backfill** opens Chapter V for chronicles that sealed Chapter IV when it was the last compiled age.
- Hub copy: Chapter IV survivors are invited into the Machine; the mastery plateau now keys off Chapter V freeplay.
- Theme reuses `theme-classical` (CSS gzip locked). Docs: [`docs/PASS68_CHAPTER_V.md`](docs/PASS68_CHAPTER_V.md).

## [0.5.59] — 2026-08-22

Pass 67 — Square lamp facets:

- **Every marble/lapis square** gets a carved lamp and shade ellipse so the board reads as turned stone instead of a pillow balloon. The CSS corner blob on `.sq::before` is removed (no CSS budget growth).
- Playwright asserts 64 facets on calibration, including occupied e2 and empty e4.
- Docs: [`docs/PASS67_SQUARE_FACET.md`](docs/PASS67_SQUARE_FACET.md).

## [0.5.58] — 2026-08-22

Pass 66 — Queen coronet cup:

- **Ivory/lapis queens** deepen the lathe cup so calibration d1 is not a 3.6px dish under readable pearls. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration d1 and mate-puzzle e5 cups are at least 3.5 CSS pixels tall.
- Docs: [`docs/PASS66_QUEEN_BOWL.md`](docs/PASS66_QUEEN_BOWL.md).

## [0.5.57] — 2026-08-22

Pass 65 — King crown cup:

- **Ivory/lapis kings** deepen the lathe cup so calibration e1 is not a 3.2px dish under a readable plus. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration e1 and hanging-knight d1 cups are at least 3.5 CSS pixels tall.
- Docs: [`docs/PASS65_KING_BOWL.md`](docs/PASS65_KING_BOWL.md).

## [0.5.56] — 2026-08-22

Pass 64 — Knight eye:

- **Ivory/lapis knights** get a carved eye so calibration b1 is not a blank horse head after the other unique marks grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration b1 and hanging-knight d4 eyes are at least 2.4 CSS pixels across.
- Docs: [`docs/PASS64_KNIGHT_EYE.md`](docs/PASS64_KNIGHT_EYE.md).

## [0.5.55] — 2026-08-22

Pass 63 — Rook battlement cup:

- **Ivory/lapis rooks** deepen the lathe cup so calibration a1 is not a 2.4px dish under 4.2px merlon wells. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration a1 and castle-puzzle h1 cups are at least 3.5 CSS pixels tall.
- Docs: [`docs/PASS63_ROOK_CUP.md`](docs/PASS63_ROOK_CUP.md).

## [0.5.54] — 2026-08-22

Pass 62 — Pawn spark:

- **Ivory/lapis pawns** enlarge the globe spark so calibration e2 is not a 1.8px speck after the ferrule grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration e2 spark is at least 2.4 CSS pixels across.
- Docs: [`docs/PASS62_PAWN_SPARK.md`](docs/PASS62_PAWN_SPARK.md).

## [0.5.53] — 2026-08-22

Pass 61 — Foot ferrule band:

- **Ivory/lapis pieces** thicken the gold/lapis ferrule so calibration e2 is not a 1.4px hairline under a 2.3px wood plinth. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration e2 and hanging-knight c3 ferrules are at least 2.4 CSS pixels tall.
- Docs: [`docs/PASS61_FERRULE_BAND.md`](docs/PASS61_FERRULE_BAND.md).

## [0.5.52] — 2026-08-22

Pass 60 — King cross bar:

- **Ivory/lapis kings** thicken the crossbar so calibration e1 is not a 2px scratch after the bishop mitre plus grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration e1 and hanging-knight d1 bars are at least 2.6 CSS pixels tall.
- Docs: [`docs/PASS60_CROSS_BAR.md`](docs/PASS60_CROSS_BAR.md).

## [0.5.51] — 2026-08-22

Pass 59 — Bishop mitre bar:

- **Ivory/lapis bishops** thicken the cleft crossbar so calibration c1 is not a 1.7px scratch after the stem and rook wells grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration c1 and hanging-knight c3 bars are at least 2.6 CSS pixels tall.
- Docs: [`docs/PASS59_MITRE_BAR.md`](docs/PASS59_MITRE_BAR.md).

## [0.5.50] — 2026-08-22

Pass 58 — Rook merlon wells:

- **Ivory/lapis rooks** deepen the crenel wells so calibration a1 is not a 1.8px roof scratch after the bishop cleft grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration a1 and castle-puzzle h1 wells are at least 3.5 CSS pixels tall.
- Docs: [`docs/PASS58_ROOK_MERLON.md`](docs/PASS58_ROOK_MERLON.md).

## [0.5.49] — 2026-08-22

Pass 57 — Bishop mitre cleft:

- **Ivory/lapis bishops** thicken the mitre cleft so calibration c1 is not a 0.9px hairline after the king cross grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration c1 and hanging-knight c3 stems are at least 2 CSS pixels wide.
- Docs: [`docs/PASS57_BISHOP_MITRE.md`](docs/PASS57_BISHOP_MITRE.md).

## [0.5.48] — 2026-08-22

Pass 56 — King cross inlay:

- **Ivory/lapis kings** thicken the gold/lapis cross so calibration e1 is not a 1.4px hairline after the queen pearls grew. Forced **Visual: Lean** keeps the geometry.
- Playwright asserts the calibration e1 and hanging-knight d1 stems are at least 2 CSS pixels wide.
- Docs: [`docs/PASS56_KING_INLAY.md`](docs/PASS56_KING_INLAY.md).

## [0.5.47] — 2026-08-22

Pass 55 — Queen coronet pearls:

- **Ivory/lapis queens** enlarge the five coronet catch-lights so calibration d1 is not a 2.8px speck after the pawn globe grew. Forced **Visual: Lean** keeps the pearls.
- Playwright asserts the calibration d1 pearl is at least 3.5×3.5 CSS pixels.
- Docs: [`docs/PASS55_QUEEN_PEARL.md`](docs/PASS55_QUEEN_PEARL.md).

## [0.5.46] — 2026-08-22

Pass 54 — Wide calibration Hint:

- **Phone calibration** keeps a spent Hint hidden when the lab widens after an Archive reply or a 4/4 seal. `canHint` drops on seal and is mirrored onto `#btn-hint.disabled` so resize cannot revive a dead control.
- Playwright restores Hint when compact calibration widens on White’s turn, and keeps it hidden after a 4/4 seal.
- Docs: [`docs/PASS54_WIDE_CAL_HINT.md`](docs/PASS54_WIDE_CAL_HINT.md).

## [0.5.45] — 2026-08-22

Pass 53 — Pawn globe catch-light:

- **Ivory/lapis pawns** enlarge the globe catch-light and add a hot spark so calibration e2 is not a 2px speck on the phone. Forced **Visual: Lean** keeps orb and spark.
- **Queen pearls** grow with the same catch-light language.
- Playwright asserts the calibration e2 orb is at least 4×4 CSS pixels.
- Docs: [`docs/PASS53_PAWN_GLOBE.md`](docs/PASS53_PAWN_GLOBE.md).

## [0.5.44] — 2026-08-22

Pass 52 — Quiet calibration chrome:

- **Calibration** keeps Archive-reply pulse and auto-coach off the instrument so the marble and rail stay the command. Explicit Hint — lines still file.
- **Phone calibration** hides Hint so after e4, Prove and Reset share one row instead of Reset wrapping full-width.
- Playwright keeps the hanging-knight seal on one row and, after calibration e4, hides the pulse/coach with Prove|Reset on one row.
- Docs: [`docs/PASS52_QUIET_CAL_CHROME.md`](docs/PASS52_QUIET_CAL_CHROME.md).

## [0.5.43] — 2026-08-22

Pass 51 — Sealed puzzle tool row:

- **Phone puzzles** hide Reset once Prove is docked. After Bxd4, Advance and Take back share one row instead of Reset wrapping full-width. Take back still retries. Phone calibration keeps Reset (four-move restart).
- **Phone Duel** clears leftover calibration/puzzle lesson markers so leaving the opening board for a rival does not hide the dossier, ledger, or sound row.
- **Resize** hides Reset when Prove docks on a phone puzzle, and restores it on a wide lab.
- Playwright keeps hanging-knight Advance|Take back on one row after the seal.
- Docs: [`docs/PASS51_SEALED_RESET_ROW.md`](docs/PASS51_SEALED_RESET_ROW.md).

## [0.5.42] — 2026-08-22

Pass 50 — Phone calibration Prove dock:

- **Phone calibration** hides the duplicate manuscript, empty ledger, sound row, and lesson note. Prove docks next to Hint so the first board does not bury Advance below the fold. Wide labs keep the teaching card.
- Playwright keeps Hint|Prove on one row at 390×844 and hides the ledger after e4.
- Docs: [`docs/PASS50_PHONE_CAL_PROVE.md`](docs/PASS50_PHONE_CAL_PROVE.md).

## [0.5.41] — 2026-08-22

Pass 49 — Pawn globe orb:

- **Ivory/lapis pawns** get a lamp-side catch-light on the Staunton globe so calibration e2 is not a blank cup after the other types gained unique heads. Forced **Visual: Lean** keeps the orb.
- Playwright asserts `.piece-orb` on calibration e2.
- Docs: [`docs/PASS49_PAWN_ORB.md`](docs/PASS49_PAWN_ORB.md).

## [0.5.40] — 2026-08-22

Pass 48 — Quiet puzzle coach:

- **Teaching puzzles** omit move-insight coach lines after a sealing capture. Explicit Hint — lines still file. The marble already names the proof. Screen readers hear the seal through the live announcer.
- Playwright keeps `#coach-tip` hidden after hanging-knight Bxd4.
- Docs: [`docs/PASS48_QUIET_PUZZLE_COACH.md`](docs/PASS48_QUIET_PUZZLE_COACH.md).

## [0.5.39] — 2026-08-22

Pass 47 — Quiet puzzle draw:

- **Teaching puzzles** keep Draw. and king-hunt pulse off the instrument after a sealing capture. The marble already names the proof. Checkmate puzzles still show Checkmate.
- Playwright keeps the hanging-knight phone header quiet after Bxd4.
- Docs: [`docs/PASS47_QUIET_PUZZLE_DRAW.md`](docs/PASS47_QUIET_PUZZLE_DRAW.md).

## [0.5.38] — 2026-08-22

Pass 46 — Phone puzzle Prove dock:

- **Narrow phones** hide the leftover tutorial card on teaching puzzles and dock Prove beside Hint under the marble. Wide labs keep the manuscript.
- Playwright hides `#manuscript-panel` on the hanging-knight phone, places Hint|Prove on one row, then restores manuscript Advance after Prove. Wide castle keeps Prove inside the panel.
- Docs: [`docs/PASS46_PHONE_PROVE_DOCK.md`](docs/PASS46_PHONE_PROVE_DOCK.md).

## [0.5.37] — 2026-08-22

Pass 45 — King cross inlay:

- **Ivory/lapis kings** get a gold/lapis cross inlay so the hanging-knight king is not a blank crown after the bishop cleft. Forced **Visual: Lean** keeps the cross.
- Playwright asserts `.piece-cross` on hanging-knight d1 and four crosses on the title honor.
- Docs: [`docs/PASS45_KING_CROSS.md`](docs/PASS45_KING_CROSS.md).

## [0.5.36] — 2026-08-22

Pass 44 — Bishop mitre cleft:

- **Ivory/lapis bishops** get a carved mitre cleft (vertical cut and crossbar) so the hanging-knight bishop is not a smooth mitre blob. Forced **Visual: Lean** keeps the cleft.
- Playwright asserts `.piece-cleft` on hanging-knight c3 and four clefts on the title honor.
- Docs: [`docs/PASS44_BISHOP_CLEFT.md`](docs/PASS44_BISHOP_CLEFT.md).

## [0.5.35] — 2026-08-22

Pass 43 — Phone puzzle manuscript body:

- **Narrow phones** hide the empty `#narrative-body` on teaching puzzles so the 3rem min-height hole under the title collapses. The scene tag and Prove stay. Phone labs also hide the desktop keyboard hint (Playwright/desktop-narrow still use a fine pointer).
- Playwright hides `#narrative-body` and `#narrative-kbd-hint` on the hanging-knight phone; castle 1280 still shows the body and Your goal.
- Docs: [`docs/PASS43_PHONE_PUZZLE_BODY.md`](docs/PASS43_PHONE_PUZZLE_BODY.md).

## [0.5.34] — 2026-08-22

Pass 42 — Coronet pearls and rook merlons:

- **Ivory/lapis queens** get lamp-side catch-lights on the five coronet orbs. **Rooks** get carved wells between the three battlements. Forced **Visual: Lean** keeps both (geometry, not a filter).
- Playwright asserts ten pearls and four merlons on the title honor, merlons on the castle h1 rook, and pearls on the mate-in-one queen.
- Docs: [`docs/PASS42_CORONET_MERLON.md`](docs/PASS42_CORONET_MERLON.md).

## [0.5.33] — 2026-08-22

Pass 41 — Phone puzzle lesson-lead:

- **Narrow phones** hide the lesson-lead paragraph on teaching puzzles so the marble command is the only copy of the capture. Wide labs keep the lead.
- Playwright hides `.lesson-lead` on the hanging-knight phone and still shows it on the 1280 castle puzzle.
- Docs: [`docs/PASS41_PHONE_LESSON_LEAD.md`](docs/PASS41_PHONE_LESSON_LEAD.md).

## [0.5.32] — 2026-08-22

Pass 40 — Phone puzzle story-beat:

- **Narrow phones** hide the FIRST LESSON story-beat box on teaching puzzles so the lesson lead under the marble is the only manuscript copy. Wide labs keep the beat.
- Playwright hides `.story-beat` on the hanging-knight phone and still shows it on the 1280 castle puzzle.
- Docs: [`docs/PASS40_PHONE_STORY_BEAT.md`](docs/PASS40_PHONE_STORY_BEAT.md).

## [0.5.31] — 2026-08-22

Pass 39 — Phone puzzle lesson:

- **Narrow phones** hide Threat / Goal / Hint cards on teaching puzzles so the marble command is the lesson. Story beat and lesson lead stay. Wide labs keep the cards.
- Playwright hides `.teaching` on the hanging-knight phone and shows Your goal on the 1280 castle puzzle.
- Docs: [`docs/PASS39_PHONE_PUZZLE_LESSON.md`](docs/PASS39_PHONE_PUZZLE_LESSON.md).

## [0.5.30] — 2026-08-22

Pass 38 — Knight mane:

- **Ivory/lapis knights** get a carved mane crest so the hanging knight is not the flat leftover after the crown cup. Forced **Visual: Lean** keeps the mane.
- Playwright asserts `.piece-mane` on hanging-knight d4 and title honor.
- Docs: [`docs/PASS38_KNIGHT_MANE.md`](docs/PASS38_KNIGHT_MANE.md).

## [0.5.29] — 2026-08-22

Pass 37 — Foot ferrule:

- **Ivory/lapis glyphs** get a gold/lapis ferrule between the foot and the plinth so every type, including the knight, sits on a turned band. Forced **Visual: Lean** keeps the ferrule.
- Playwright asserts `.piece-ferrule` on the calibration pawn, hanging-knight bishop and d4 knight, and title honor.
- Docs: [`docs/PASS37_FOOT_FERRULE.md`](docs/PASS37_FOOT_FERRULE.md).

## [0.5.28] — 2026-08-22

Pass 36 — Crown cup:

- **Ivory/lapis** pawns, bishops, rooks, queens, and kings get a turned hollow in the head so the mitre, crown, and battlement read as carved bowls. Knights skip. Forced **Visual: Lean** keeps the cup.
- Playwright asserts `.piece-cup` on the calibration pawn, hanging-knight bishop, and title honor.
- Docs: [`docs/PASS36_CROWN_CUP.md`](docs/PASS36_CROWN_CUP.md).

## [0.5.27] — 2026-08-22

Pass 35 — Stem umbra:

- **Ivory/lapis glyphs** get a shadow-side stem umbra opposite the lamp flute (knight uses the far cheek) so the body has a dark core, not a one-sided highlight. Forced **Visual: Lean** keeps the umbra.
- Playwright asserts `.piece-umbra` on the calibration pawn, hanging-knight bishop, and title honor.
- Docs: [`docs/PASS35_STEM_UMBRA.md`](docs/PASS35_STEM_UMBRA.md).

## [0.5.26] — 2026-08-22

Pass 34 — Phone lab caption:

- **Narrow phones** show the chapter title on the lab overlay bar instead of clipping `Early chess — scholarly court`. Wide and short-landscape labs keep the era. The full string stays on `title` / `aria-label`.
- Playwright asserts `Chapter I` on the hanging-knight phone (no overflow) and `Prologue · Present` on a 1280×500 lab.
- Docs: [`docs/PASS34_LAB_CAPTION.md`](docs/PASS34_LAB_CAPTION.md).

## [0.5.25] — 2026-08-22

Pass 33 — Lamp fill and stem flute:

- **Ivory/lapis glyphs** get a fill lamp from the opposite side and a turned-stem flute (knight uses a cheek catch-light) so the body reads as a cylinder, not a sticker. Forced **Visual: Lean** keeps the flute and skips the extra filter lights.
- Playwright asserts the flute and three point lights on the calibration pawn and hanging-knight bishop.
- Docs: [`docs/PASS33_LAMP_FLUTE.md`](docs/PASS33_LAMP_FLUTE.md).

## [0.5.24] — 2026-08-22

Pass 32 — Phone lab nav:

- **Narrow phones** hide the duplicate Title / Chapters / Duel bar while the lab is open. The overlay sheet fills to the top; ← Chapters stays the way out. Wide and short-landscape labs keep the top nav.
- Playwright hides `.top-bar` on the hanging-knight phone and still shows Title / Chapters / Duel on a 1280×500 lab.
- Docs: [`docs/PASS32_PHONE_LAB_NAV.md`](docs/PASS32_PHONE_LAB_NAV.md).

## [0.5.23] — 2026-08-22

Pass 31 — Idle board tools:

- **Take back and Reset** stay off the instrument until a ply exists, so hanging-knight phones keep Hint on one row instead of wrapping a dead Take back above Reset. After Bxd4 both return.
- Playwright hides them on the first hanging-knight frame and shows them after the capture.
- Docs: [`docs/PASS31_IDLE_TOOLS.md`](docs/PASS31_IDLE_TOOLS.md).

## [0.5.22] — 2026-08-22

Pass 30 — Turned waist:

- **Ivory/lapis glyphs** get a waist ring between collar and plinth plus a bright inner plinth lip so the stem reads as turned wood, not a sticker on a disc. Knights keep the waist and skip the neck.
- Playwright asserts waist and rim on the calibration pawn, hanging-knight bishop, and title honor guard.
- Docs: [`docs/PASS30_TURNED_WAIST.md`](docs/PASS30_TURNED_WAIST.md).

## [0.5.21] — 2026-08-22

Pass 29 — Quiet puzzle chrome:

- **Teaching puzzles** drop the chapter crawl, empty move ledger, Sound/Move Guard row, and duplicate lesson line so the hanging-knight command sits on the marble. Hint, Take back, and Reset stay. Living matches restore the ledger and toggles.
- Playwright hides that chrome on hanging knight and shows it again on Amara.
- Docs: [`docs/PASS29_PUZZLE_CHROME.md`](docs/PASS29_PUZZLE_CHROME.md).

## [0.5.20] — 2026-08-22

Pass 28 — Idle instrument header:

- **Empty brass header collapses** on teaching boards once the turn pill is quiet and no court dossier is filed. Checkmate and living-rival dossiers keep the header.
- Playwright hides the header on the hanging knight and shows it again after queen to h8.
- Docs: [`docs/PASS28_IDLE_HEADER.md`](docs/PASS28_IDLE_HEADER.md).

## [0.5.19] — 2026-08-22

Pass 27 — Quiet turn pill:

- **Ordinary White/Black-to-move** no longer occupies the instrument. Check, thinking, seals, and outcomes still take the chip. The hanging-knight command sits next to the marble.
- Playwright hides the pill on hanging knight and Amara, and still shows Checkmate after queen to h8.
- Docs: [`docs/PASS27_QUIET_TURN.md`](docs/PASS27_QUIET_TURN.md).

## [0.5.18] — 2026-08-22

Pass 26 — Turned lathe rings:

- **Ivory/lapis glyphs** get a lathe-turned plinth and neck, plus lamp-side diffuse shade on the real Staunton silhouette. Knights skip the neck. Forced **Visual: Lean** keeps the rings without the filters.
- Playwright asserts plinth, neck, and both lighting primitives on the calibration pawn, hanging-knight bishop, and title honor guard.
- Docs: [`docs/PASS26_TURNED_LATHE.md`](docs/PASS26_TURNED_LATHE.md).

## [0.5.17] — 2026-08-22

Pass 25 — Match aim stays:

- **Match/duel instrument** keeps a short opening command after a piece is selected, instead of replacing it with a legal-move census. Amara's first game reads `Open the center; castle before Amara's symmetry hardens.`
- Playwright asserts that aim before and after selecting e2, and the archive duel keeps the accountable command the same way.
- Docs: [`docs/PASS25_MATCH_AIM.md`](docs/PASS25_MATCH_AIM.md).

## [0.5.16] — 2026-08-22

Pass 24 — First live match:

- Playwright walks Chapter I teaching through hanging knight, castle, and mate, then opens **Amara** on a full 32-piece lamp-lit board and plays `1. e4` against a live reply.
- Docs: [`docs/PASS24_FIRST_MATCH.md`](docs/PASS24_FIRST_MATCH.md).

## [0.5.15] — 2026-08-22

Pass 23 — Goal stays while you choose:

- **Teaching/calibration instrument** keeps the live goal after a piece is selected, instead of replacing it with a legal-move census. Castling still names `g1`.
- **Carved collar** — ivory/lapis glyphs get a waist ring so the set reads as turned pieces on a plinth.
- Docs: [`docs/PASS23_GOAL_STAYS.md`](docs/PASS23_GOAL_STAYS.md).

## [0.5.14] — 2026-08-22

Pass 22 — Lamp-lit ivory and the first mate:

- **Ivory/lapis glyphs** take brass-lamp lighting on the real Staunton silhouette (gradient fill + specular), not overlay shade blobs. Forced **Visual: Lean** keeps the gradient without the filter.
- Playwright seals Chapter I's mate-in-one with queen to h8, and the live duel plays e4, Nf3, and d4 against archive replies.
- Docs: [`docs/PASS22_LAMP_LIT.md`](docs/PASS22_LAMP_LIT.md).

## [0.5.13] — 2026-08-22

Pass 21 — Castle destination cue:

- **Kingside/queenside destinations** read as castle squares, not quiet-move dots, and the instrument names `castle kingside to g1` when the king is selected.
- Playwright plays hanging knight then O-O on the live Chapter I board.
- Docs: [`docs/PASS21_CASTLE_CUE.md`](docs/PASS21_CASTLE_CUE.md).

## [0.5.12] — 2026-08-22

Pass 20 — Puzzle instrument focus:

- **Teaching puzzles** no longer file a "Court dossier — Puzzle Counterplay Engine" above the goal. The hanging knight keeps the short d4 command next to the marble.
- **Carved glyphs sit in the square** — pieces fill 98% of the square and no longer hover 2px off the marble.
- Docs: [`docs/PASS20_PUZZLE_INSTRUMENT.md`](docs/PASS20_PUZZLE_INSTRUMENT.md).

## [0.5.11] — 2026-08-22

Pass 19 — First-puzzle presence:

- **Hanging knight** shows a short instrument command (`Take the loose knight on d4 with the bishop`) while the manuscript keeps the fuller goal.
- **Carved volume** — ivory/lapis glyphs get a ground shadow and lamp-side rim so they sit on the marble instead of floating as flat cutouts.
- Docs: [`docs/PASS19_FIRST_PUZZLE_PRESENCE.md`](docs/PASS19_FIRST_PUZZLE_PRESENCE.md).

## [0.5.10] — 2026-08-22

Pass 18 — Wide short-lab board:

- **Wide short labs** keep the two-column atelier so leftover height can grow the marble past the stacked 42vh postage stamp.
- Phone and narrow short windows still stack board-first; e2 stays on screen.
- Docs: [`docs/PASS18_WIDE_SHORT_BOARD.md`](docs/PASS18_WIDE_SHORT_BOARD.md).

## [0.5.9] — 2026-08-22

Pass 17 — Short-lab board fit:

- **Short landscape labs** stack the instrument first and shrink the marble so e2 stays on screen.
- Compact board-fit now runs below 620px tall at any width.
- Docs: [`docs/PASS17_SHORT_BOARD_FIT.md`](docs/PASS17_SHORT_BOARD_FIT.md).

## [0.5.8] — 2026-08-22

Pass 16 — Title honor + short nav:

- **Honor guard** — ten carved classic-royal glyphs stand on the title plate before you enter the Archive.
- **Short labs keep nav** — Title / Chapters / Duel stay reachable when the window is under 560px tall.
- Docs: [`docs/PASS16_TITLE_HONOR.md`](docs/PASS16_TITLE_HONOR.md).

## [0.5.7] — 2026-08-22

Pass 15 — Phone goal + carved types:

- **Instrument brief** shows the live goal on phones (board-guide is no longer hidden). The empty Board tips drawer stays closed.
- **Per-piece carve** — pawn, knight, bishop, rook, queen, and king each get their own sheen, shade, and foot so the set reads as carved ivory/lapis.
- Docs: [`docs/PASS15_PHONE_GOAL_CARVE.md`](docs/PASS15_PHONE_GOAL_CARVE.md).

## [0.5.6] — 2026-08-22

Pass 14 — Teaching clarity:

- **Threat and Your goal** lead the calibration manuscript and stay on screen. Why it works / Concept fold away.
- Teaching cards no longer sit in a two-column grid that clipped the brief.
- Docs: [`docs/PASS14_TEACHING_CLARITY.md`](docs/PASS14_TEACHING_CLARITY.md).

## [0.5.5] — 2026-08-22

Pass 13 — Carved piece presence:

- **Ivory/lapis glyphs** sit on a contact shadow with a crown sheen so the default set reads carved, not flat.
- High-contrast skin stays uncarved for tournament readability.
- Playwright finishes the prologue calibration in four developing moves and unlocks Advance.
- Docs: [`docs/PASS13_CARVED_PIECES.md`](docs/PASS13_CARVED_PIECES.md).

## [0.5.4] — 2026-08-22

Pass 12 — Board-first compact:

- **Phone lab crawl** shrinks to a single title row; the vestibule already names the passage.
- **Board-fit** counts Sound / Move Guard under the tools so the grid does not overflow.
- Playwright starts a duel and plays e2→e4 through an Archive reply.
- Docs: [`docs/PASS12_BOARD_FIRST.md`](docs/PASS12_BOARD_FIRST.md).

## [0.5.3] — 2026-08-22

Pass 11 — Play-surface clarity:

- **Live instrument is quieter.** Turn / ply chips no longer sit beside the status pill; calibration progress lives on the rail (`1 / 4 inscribed`).
- **Board guide** keeps the coaching line instead of repeating the remaining-move count.
- **Sound and Move Guard** sit under the board tools.
- **Carved presence** — larger glyphs, stronger ivory/lapis highlights, brighter last-move landing, tighter brass rim.
- Docs: [`docs/PASS11_PLAY_SURFACE.md`](docs/PASS11_PLAY_SURFACE.md).

## [0.5.2] — 2026-08-22

Pass 10 — First-session play feel:

- **Top nav works over the lab.** Title / Chapters / Duel were visible above the board but `inert`, so they looked enabled and did nothing. They now leave the simulation (with a confirm when the board has progress).
- **Leave confirms name the destination** — "Open the Duel Archive?" / "Return to Title?" / "Return to Chapters?"
- **Title and Chronicle lore** start collapsed so Enter the Archive and the first chapter are the first things you see.
- **Calibration Prove hint** says "N remaining" after the first ply.
- Confirm plaque sits above the lab (`z-index: 80`) with 44px actions.
- Docs: [`docs/PASS10_PLAY_FEEL.md`](docs/PASS10_PLAY_FEEL.md).

## [0.5.1] — 2026-08-22

Pass 9 — Board presence (playable graphics on the surface you stare at):

- **Legal-move dots** are large enough to read on marble and lapis (36% / 22px gold core + dark ring).
- **Last-move cue** keeps the square materials — inset rings and a wash instead of overwriting the board with `!important` fills.
- **Pieces** sit larger on the square with ivory/lapis fills and a carved highlight shadow.
- **Captured material** uses the active piece-skin SVGs; eval + captures also show on freeplay rehearsal boards.
- **Compact play** puts the live board above the manuscript under 960px and lets the instrument column grow past the old 420px cap.
- **Piece flight** is 280ms with a slightly higher arc.
- Playwright smoke: skip-ahead calibration registers e2→e4.
- Docs: [`docs/PASS9_BOARD_PRESENCE.md`](docs/PASS9_BOARD_PRESENCE.md).

## [0.5.0] — 2026-08-16

The Paradox age, finished as a living chapter rather than a locked teaser:

- **Chapter IV — The Paradox Masters** is playable: Bactrian Frontier lore, committee/Kallistos continuity, Nysa + Cassian matches with hypermodern scripts, and a seal that moves the mastery plateau forward.
- **Overreach drill** replaces the second habit puzzle — the fianchetto bishop taxes a hanging knight on the long diagonal.
- **Successor unlock backfill** opens Chapter IV for chronicles that sealed Chapter III when it was the last compiled age.
- **Doctrine atlas** on the Chapters screen names the succession (Lens → Ancient → Romantic → Classical → Paradox).
- **Paradox-opened hub** invites Chapter III survivors into the new age instead of leaving a silent unlock.
- Hypermodern personas now prefer fianchetto geometry; move coaching names Nysa, Cassian, and delayed-ownership bishops.
- CSS gzip budget **18350 → 18400** B for the doctrine atlas.
- Docs: [`docs/CHAPTER_IV_PARADOX_MASTERS.md`](docs/CHAPTER_IV_PARADOX_MASTERS.md).

## [0.4.4] — 2026-07-25

Doctrine succession — Chapter IV playable (unreleased draft lineage, now folded into 0.5.0):

- **Chapter IV — The Paradox Masters** (hypermodern): codex, drills, Nysa + Cassian matches, rehearsal, seal rewards.
- **Bactrian rivals** in Duel Archive with opening books and `hypermodern` AI profiles.
- **Plateau succession:** mastery plateau / campaign-finished copy now keys off Chapter IV; Chapter III opens the paradox age instead of ending the chronicle.
- Daily Calculus pool accrues the new hypermodern puzzles automatically.
- CSS gzip budget ratcheted to 18350 for the Chapter IV theme.

## [0.4.3] — 2026-07-12

Pass 8 — Playtest continuity:

- **Resume after vestibule** — live board progress now promotes into the pending recovery snapshot on persist (no reload required).
- **Lab exit / skip-ahead confirms** — leaving mid-board or an active duel (vestibule, top-nav, Escape) asks before closing; skip-ahead uses the same discard gate.
- **mvpFlag** matches plateau honesty after Chapter III reflection.
- **Mobile dossier** scroll-margin under sticky launch; duel-start confirm coverage; Daily Calculus OK replaces prior recovery with the daily puzzle session; live playtest fixtures fixed to calibration scene 4.
- Docs: [`docs/PASS8_PLAYTEST_CONTINUITY.md`](docs/PASS8_PLAYTEST_CONTINUITY.md).

## [0.4.2] — 2026-07-12

Playtest hardening after live Pages review:

- **P0 recovery wipe** — idle shell navigations no longer overwrite a pending `inProgress` recovery with `null` on persist.
- **P0/P1 confirm gates** — chapter jumps and duel starts confirm before discarding a recoverable / unsaved board session.
- **Plateau honesty** — mastery plateau “sealed” copy waits for `c3-freeplay`; reflection-only saves get softer “Almost sealed” copy.
- **Duel coaching** — graded `ok`/`good` tips outrank generic duel doctrine nudges; Chronicle Echoes open when present.
- Docs: [`docs/PASS7_PLAYTEST_HARDENING.md`](docs/PASS7_PLAYTEST_HARDENING.md).

## [0.4.1] — 2026-07-12

Pass 7 — Retention polish:

- **Mastery plateau hub** on the Chapters screen after Chapter III seals — Daily Calculus + Duel Archive CTAs so the content cliff becomes a practice loop.
- **Richer roadmap teasers** for locked Chapters IV–IX (doctrine hooks instead of “— locked.” stubs).
- **Dossier UX** — sticky duel launch controls on narrow screens; collapsible folds for prep, openings, training, analytics, echoes, and traits.
- **Chronicle Echoes** now list the last three games of any outcome (win / loss / draw) with outcome badges.
- **Duel coaching** — Kallistos prophylaxis doctrine label + duel-mode midgame nudges in `moveInsight`.
- **Copy centralization** — Calibration Lens labels/hints and Archive rating band names live in `strings.ts`; coach tip contrast raised.
- Docs: [`docs/PASS7_RETENTION_POLISH_PLAN.md`](docs/PASS7_RETENTION_POLISH_PLAN.md), [`docs/PASS7_PLAYTEST_CHECKLIST.md`](docs/PASS7_PLAYTEST_CHECKLIST.md).
- Theme: CSS gzip gate **17800 → 18200** B for plateau hub + dossier folds.

## [0.4.0] — 2026-07-12

Pass 6 — Continuity, Intuition, Chapter III:

- **Chapter III — The Professor's Law** compact classical arc (intro → codex → prophylaxis puzzle → Demetrios return → Kallistos → reflection → freeplay). Campaign finished framing points survivors to Daily Calculus + Duel Archive mastery instead of a hard content cliff. Chapters IV–IX remain locked teasers.
- **Kallistos** — new classical prophylaxis rival (profile, AI persona, opening bias, duel unlock, rewards).
- **Lukas + Marius** rematchable in the Duel Archive after their Chapter I scenes (unlock wiring + roster entries).
- **Post-loss / draw Verdict Recap** — empty-bundle games still open the recap overlay (rating delta, training focus); duel **Quick Rematch** works on wins, losses, and draws.
- **Calibration honesty** — dossiers always show **Archive rating** (default 1500 / Measured Foe); Lens status line (`Lens suggests … — selected`) and mismatch note when Pressure Band overrides recommendation; duel `aiFlavor` cites calibration band + rating.
- **Alexion + Kallistos opening SAN bias** in the book.
- **Settings** — title toggles for **AI Thread** (Auto / Worker / Main) and **Visual** quality (Auto / Full / Lean) overriding silent `perf-lean` heuristics.
- **Playtest gate** — expanded Playwright smoke (settings persist, seeded Lukas unlock + Chapter III visibility); [`docs/PASS6_PLAYTEST_CHECKLIST.md`](docs/PASS6_PLAYTEST_CHECKLIST.md); [`docs/PASS6_CONTINUITY_MAX_EFFORT_PLAN.md`](docs/PASS6_CONTINUITY_MAX_EFFORT_PLAN.md).
- Theme: compact `theme-classical` chapter skin; CSS gzip gate **17600 → 17800** B.
- **Playtest hardening** — final-chapter clear rewards now grant on campaign finish; duel unlocks backfill from `completedSceneIds` (pre-Pass-6 Lukas/Marius saves); Demetrios-return no longer maps to Alexion unlock; loss/draw recap no longer double-announces.

### Also shipping (previously unreleased on main)

- **Coaching that doesn't lie or read like a mad-lib (playtest find)** — driving real imperfect games surfaced two quality defects in the move coaching, the text a player reads every single turn. (1) *Stale advice*: the per-move tip was set on your move but never refreshed when the rival replied, so "the archive sees your knight on d8 can be won" stayed on screen after the rival had already captured that knight — wrong advice, which cheapens the whole coach. Threat warnings now clear the instant the rival replies (the reply pulse carries what they did); general insights still persist as your reading window — and that window now actually works: the coach was gated behind `!aiThinking`, so your fresh feedback was suppressed the moment your move handed the turn over (you only ever saw the *previous*, stale tip). It now shows while the rival ponders, exactly when you're looking. (2) *Clunky copy*: the rival-doctrine coaching was glued together as "Developed **vs** Alexion law" — grammatically broken and repeated every game. Rewritten into real coaching in the game's voice ("**Developed — Alexion law punishes a half-built army. Finish the rest before you move it twice.**", "Center claimed — hold it against Alexion law, and back it with a minor."). Verified live; locked by a new regression test (threat warnings must clear after the reply).
- **The "Forgiving band" is now actually forgiving (rigorous playtest find)** — playtesting the live build with an engine-backed bot exposed a discouraging first impression: a brand-new player can open the Duel Archive immediately and face the Alexion "Early Mentor", and a measurement against a near-beginner proxy showed the *Forgiving* band still beating beginners ~75% of the time (even the easiest `novice_court` tier won ~81%). The band was barely softer than Balanced. Retuned so a near-beginner now **wins ~75% of entry duels** (Early Mentor 6/8, novice 5.5/8 vs the proxy) — bigger bounded blunders, lower alertness, sloppier conversion — while the persona model's guarantees hold (legal moves only, never a queen-hang, never a walk into mate), so the rival reads as a beatable human, not a broken one. Campaign difficulty is untouched (it uses a separate tuner). Locked by a gated calibration harness (`CROWN_MATCH=1 npx vitest run src/chess/duelEntry.calibration.test.ts`). Same playtest also confirmed the runtime is clean and robust: a full duel to checkmate and five race/state stress scenarios (clicking during the rival's turn, hint spam, hint-then-move, starting a new duel mid-game, take-back spam) produced **zero console or page errors**.
- **Eval bar in duels (consistent learning feedback)** — a duel is a full rated game against a rival, identical in nature to a campaign match, yet duels alone hid the engine-truthful eval bar and the captured-material rows. They now show in duels too, so the player gets the same at-a-glance "how am I doing" feedback in every rated game — fitting for a learning-focused chess RPG. The eval value was already computed for duels (the bar reads the same memoized engine probe used by grading and the eval-arc), so this is pure wiring: the thin, unobtrusive side bar and captured rows the matches already use. Verified clean on desktop and mobile; trivially reversible; no new code or CSS.
- **Hardening pass (adversarial review)** — a fresh-context review of the recent waves found no real bugs (the per-ply `evalTrace`↔`sanLog`↔`history` alignment, rating NaN-hardening, eval-arc escaping, and the keyboard fix all verified correct) and surfaced two latent edge cases, now fixed: (1) `findCostliestMoment` no longer grades the very first ply, so a White game from a lopsided custom FEN can't mis-flag move 1 (there is no measurable pre-game baseline); (2) `accuracyTrend` now requires a full six-game window before labelling form, honouring its "three vs three" contract instead of comparing three games against one. Also made the KQ-vs-K conversion test **load-independent**: the persona search was wall-clock-bounded, so full-suite CPU load lowered the reached depth and the conversion occasionally drifted past the ply cap — the test now uses a generous think budget so the tiny-board search is depth-bounded, deterministic across machines (verified with three consecutive full-suite runs).
- **Eval-arc: the story of your game at a glance** — the verdict recap now opens with a compact sparkline of the engine evaluation across every move, drawn from *your* perspective (above the centre line = you were winning, below = losing), in a gold→crimson gradient, with your **costliest moment marked as a red dot** right where the line dips. It turns the numbers already captured (per-ply eval trace, turning point, costliest move) into one readable arc — see your game's whole narrative, and exactly where it swung, in a glance. Pure, unit-tested SVG builder in `app/recap/evalArc.ts`; **fully self-styled inline (zero new CSS)**, renders only when a real game's trace is present, and degrades to nothing gracefully. Also hardened a pre-existing test-isolation flake: the KQ-vs-K conversion test now clears the engine caches per game (mirroring `resetAiGameContext()`), so it no longer depends on suite ordering.
- **Bundle headroom: campaign data split into its own chunk** — the production JS had crept to the per-file budget cap (the `index` chunk was 100,996 / 101,376 gzip, ~380 bytes free), which constrained every new feature. A one-line Vite `manualChunks` change peels the pure narrative/data modules (`chapters`, `roadmap`, `rivals` — all type-only imports, so zero runtime duplication) into a separate `game-data` chunk. The budgeted `index` chunk drops to **82,535 gzip (~18 KB of headroom reclaimed)**; `game-data` is 17,843 gzip, well under budget. The data still loads at boot in parallel (`modulepreload`), so behavior and first paint are unchanged — the win is runway for the next sizable feature. Build-config only: no source, test, or service-worker changes (the SW already caches chunks via `staleWhileRevalidate`); gate + e2e green, every chunk under the per-file cap.
- **On-demand Hint — help while it is your move** — a learning-focused game finally helps a stuck player *during* their turn (coaching previously only appeared after a move). A **Hint** button in the board tools highlights the piece the archive would move (reusing the board's own select/legal-move highlight — zero new CSS) and explains the idea in the coach line as a teaching nudge, not engine notation: *"Develop a minor piece toward the centre,"* *"Look for a capture — this one wins material,"* *"Castle now — bring your king to safety,"* *"This piece is under pressure — move it to safety."* Bounded engine probe (≤80 ms), off the hot path, safe to tap repeatedly; it never spends rating (the move you finally play is graded normally). Shown only on a live board on your turn and hidden the instant the rival is thinking. Pure reason classifier in `app/play/hintReason.ts`; verified live (highlight + coach line + turn-gating). Fits the budget with no CSS growth.
- **Post-game coach: "Study this" — your costliest move, named** — the verdict recap now closes the learning loop the grading/rating work set up: it names the single move that cost you the most and the move the engine preferred instead — e.g. *"2. Qh5 cost about 3.2 pawns — the archive preferred d4."* Computed from the per-ply eval trace already captured during play (the player's own worst swing, opponent's best reply already priced in), with one short engine probe at recap time for the better move. Pure, unit-tested resolver in `app/recap/costliestMoment.ts`; the line is session-only and renders only when a real mistake occurred (a clean game shows nothing to scold). This is the most actionable nugget in the recap — see exactly where you slipped and what to do next time. JS gzip budget 98 → 99 KiB (documented; the bundle is dominated by the engine, story prose, and chess.js — a source-map audit confirmed the legacy engine is correctly tree-shaken out).
- **Onboarding accelerator: straight to the board** — a brand-new visitor used to advance through dialogue → codex → codex → dialogue (two lore dumps) before touching a piece, the documented first-session bounce point. The opening prologue's prose scenes now offer a subtle one-tap **"I know the rules — straight to the board →"** that jumps directly to the first playable board (the calibration). It is *surgical and safe by construction*: offered only in the opening prologue (the story everywhere else stays intact), and it collapses **only a run of consecutive reading** — `prosePeekSkipIndex` lands ON the next puzzle/calibration/match, never past it, and is generic over any current or future chapter shape. Pure, unit-tested resolver in `app/play/skipAhead.ts`. Accessibility: the skip button is fully keyboard-operable — fixed a latent bug where the global Enter/Space "advance" shortcut hijacked activation from *any* focused control (skip, top nav), so focused buttons now receive their own native activation. Verified live (mouse + keyboard, desktop + mobile); zero new CSS (reuses the tool-button style).
- **Player skill measurement: precision, form, and a performance-informed ladder** — the Stratarch Rating now measures *how* you played, not only whether you won. Every rated game earns an engine-graded **Precision** score (0–100, from the per-move quality stream; games under 8 graded moves don't count, so nothing can be farmed). Precision carries 25% of the Elo update with outcomes anchored — a precise loss against a monster costs only a point, a blunder-strewn win over a minnow earns only a token one, and the delta is provably monotonic in precision. The verdict recap now shows `Precision N% · Form rising/steady/settling` (recent three graded games vs the prior three — your improvement, visible), and the duel dossier prints the ledger's price for the pairing ("The ledger gives you **42 in 100** against this doctrine") from your ladder vs the rival's filed strength. Future-proof by construction: rival ratings derive from `AiProfile` fields, so new characters/chapters are priced automatically; `accuracy` is an optional, sanitized save field (old saves load untouched, corrupt values clamp or vanish); the rating core is pure, NaN-hardened, and property-tested against hostile inputs (never non-finite, never out of range, win always gains, loss always costs). Each browser profile keeps its own ladder (offline-first, no accounts), so every visitor is measured on their own play.
- **Court Dossier (de-AI'd rival card + layout fix)** — the rival assessment card no longer says "AI" anywhere and no longer collides its own labels (the old four-column grid overflowed in narrow panels; it is now a single readable column with larger type). Rivals are graded the way the archive would file an officer: **Audacity** (appetite for risk), **Canon** (fidelity to the studied line — the κανών), **Vigil** (the watch kept over the crown), **Foresight** (how deep their reading runs), each marked *faint / tempered / fervent* with an epithet ("invites fire", "keeps the studied line", "reads three intentions deep"). Conversion personas are filed as finishing schools — *finishes by the ledger / by the sword / by any road*. "Opponent intelligence profile:" → "Court dossier —", "Thinking as:" → "…is reading the board…", the turn chip's "AI calculating" → "Rival pondering", and persona tails now read "ledger/sword/open school". CSS net smaller (removed a redundant responsive override).
- **Retention wave: a rival worth playing again** — (1) *Reply cadence*: rivals now ponder like players, not vending machines — recaptures snap back, book moves come briskly, quiet committal decisions earn a real pause scaled to each rival's temperament (pure presentation in `app/ai/replyCadence.ts`; the engine's own search time counts toward the pause; disabled under vitest). (2) *Rivals speak after games*: the dormant talk-line system is finally wired — win and they concede the punishment (or sound rattled on your streak), lose and they get audacious, draw and they nod; the line lands on the board ticker and the verdict recap. (3) *Run it back*: a one-tap rematch button appears on any lost or drawn board — duels restart the pairing, campaign scenes reload — so a loss invites the next attempt instead of a menu crawl. (4) *Difficulty staircase, measured*: a gated calibration harness (`CROWN_MATCH=1`, greedy-beginner proxy) exposed a cliff at the second rival (8/8 vs beginners); the apprentice tier was re-tuned (depth 2, more oversights) giving a climbable novice 5.5 → apprentice 6.5 → veteran 8 ramp. (5) *Story hooks*: the Edred aftermath now shows the court reacting instead of memo-ing it, and both chapter seals end on forward pulls (the ledger-keepers reading Reed's file; a committee deciding what he is) instead of "the archive waits". JS gzip budget 96 → 98 KiB (documented).
- **Engine-truthful move grading + real turning points** — move quality (ledger glyphs, coach tips, style grade) is now judged by engine probes that bracket the player's move, so the score already accounts for the opponent's best reply: a capture that loses the queen to the recapture finally grades as a blunder, and a sound sacrifice (material offered while the engine approves) earns `brilliant` instead of `blunder` — the coach no longer scolds engine-approved offers. A mercy rule keeps sloppy-but-still-winning conversion at `inaccuracy`. Pure grading lives in `src/app/moveGrading.ts`. The style grade is now an average over graded moves (no more length inflation), and the recap's "Turning point" names the ply with the largest eval swing toward the player (from a new session-only per-ply eval trace) instead of defaulting to the first decent move.
- **Engine speedup: evaluation cache + zero-allocation search tree** — static evaluations are memoized by Zobrist hash (~2× nodes/sec) and the search tree now uses preallocated per-ply move stacks (no per-node allocation, no GC pauses inside the time budget). Net effect at unchanged time budgets: +1–2 plies of depth (e.g., rook endgames now reach depth 10 vs 8 in 300 ms); search results remain bit-identical at fixed depth. Strength harnesses re-verified (crown 8–0 legacy, veteran 6–0 novice).
- **Tactically truthful eval readout** — the eval bar now uses a bounded engine probe (depth 3, ≤12 ms, memoized per position) instead of bare material counting, so it reacts to hanging pieces and mate threats instead of reading "+0.0" while a queen is en prise.
- **Crown Engine v2** (`src/chess/engine/`) — in-house 0x88 search core replacing the chess.js-walking alpha-beta: incremental Zobrist hashing, typed-array transposition table, PVS + iterative deepening + quiescence, null-move/LMR/futility pruning, killer/history ordering, aspiration windows, soft/hard time management with instability extension. **40–110× node throughput** at equal budget; won an 8–0 match vs the legacy engine at 200 ms/move. Legality is proven against chess.js by perft reference fixtures and randomized cross-validation; every AI move is still validated through chess.js before touching game state. Legacy engine retained at `src/chess/legacyAi.ts` as a tree-shaken benchmark baseline.
- **Human-like difficulty model** (`src/chess/ai.ts`) — personas now Boltzmann-sample from exact root-move scores inside a bounded centipawn band, with "missed-depth" and bounded "oversight" episodes replacing uniform-random blunders; a conversion mode tightens play in won endgames (KQ-vs-K now converts at every tier); style/risk flavor is capped at ±40 cp so personality can never out-vote tactics. Apex tiers play the engine's best move.
- **AI off the main thread by default** — duel and match searches now run in the Web Worker when available (previously puzzle-only and opt-in); worker replies carry a FEN echo and are re-validated against the live board, a watchdog falls back to main-thread search if a worker is killed mid-think, and `GameFlow` holds `aiThinking` through the whole async turn with an epoch guard (enforced again with rollback at `commitEngineMove`) so scene changes can never receive a stale AI move. Note: the `cok-ai-worker` localStorage preference changed semantics — unset now means "auto (worker when available)"; an explicit `'0'` forces main-thread search.
- **Puzzle defenders stay calibrated** — puzzle opponents now play through tier-matched personas (`opponentAiDepth` 1/2/3 → novice/apprentice/scholar courts) instead of the full-strength engine, preserving the bait-accepting behavior puzzle solutions rely on; `opponentAiStyle` now meaningfully flavors them. Engine caches are reset between games so path-dependent repetition scores never leak across rematches.
- **Engine test firewall** — perft suite (6 reference positions), chess.js cross-validation playouts, mate-in-1/2 and tactics fixtures, determinism and time-budget gates, persona-behavior tests, and gated strength harnesses (`CROWN_MATCH=1`: crown-vs-legacy match, novice-vs-veteran ladder). JS gzip budget ratcheted 90 → 96 KiB (engine nets +4.8 KiB); engine design docs in `docs/fable/`.
- Per-rival **archive calibration rating** on `RivalMemoryEntry` (persisted, dossier-visible), updated after each logged duel/ladder result.
- **Rival opening SAN bias** in `chooseOpeningBookMove` (wired through `aiTurnController` for duel + campaign).
- **Alexandrine Imperial** UI polish (`style-alexandrine-imperial.css`): budget-conscious layer on the Hellenistic palette — stratarchic chrome, lapis/gold ambient bloom, forged buttons, archive lab scrim, duel/reward accents (no neon cyber accents). CSS gzip gate raised to **17600** B (base sheet was already at ~16.8 KiB).
- **mountApp** advance ticker stops rescheduling when `document` is unavailable (fixes vitest teardown races in `quality:gate`).

---

## [0.3.1] — 2026-05-30

Pass 5 — GameFlow shrink + real AI Worker:

- **RewardGrantService** — `grantMatchVictory`, `grantDuelVictory`, chapter bundles; `GameFlow` delegates victory rewards.
- **aiTurnController** — `runAiTurn`, `shouldScheduleAi`, pace delay; extracted ~250 lines from `playAiMove`.
- **aiSearch.worker** — FEN-in / SAN-out search off the main thread; `findBestMoveAsync` + `localStorage['cok-ai-worker']`.
- **495** tests in `quality:gate`; Playwright play-smoke green.

---

## [0.3.0] — 2026-05-30

Pass 4 complete — GameFlow decomposition wave:

- **PR1** — Pure `validateAndReplaySnapshot` + plan artifact.
- **PR2** — `SnapshotManager` (debounced persist, in-progress build).
- **PR3** — `DuelManager` (unlock, session lifecycle, roster/archive).
- **PR4** — AI surface: eval exports, phase PST skeleton, `searchBench`, `aiAsync`, opening bias helpers.
- **PR5** — `CampaignOrchestrator` (navigation, advance, jumps, completion bookkeeping).
- **489** tests in `quality:gate`; four persistence/duel/campaign/AI seams documented in `ARCHITECTURE.md`.

---

## [0.2.25] — 2026-05-30

Pass 4 PR4 — AI surface hardening (Pass 2 deep kickoff):

- **Evaluator** — exported mobility/king-safety/coordination terms; standalone `evaluateConnectedPawnBonus`; per-phase PST skeleton (`pieceSquareValue`, `resolveEvalPhase`); space + tempo terms.
- **Benchmark** — `src/chess/bench/searchBench.ts` with nodes/ms reporting via `getLastSearchNodes()`.
- **Openings** — `rankOpeningCandidates` for measurable rival repertoire bias.
- **Async adapter** — `findBestMoveAsync` (main-thread default; worker surface reserved).

---

## [0.2.24] — 2026-05-30

Pass 4 PR3 — DuelManager seam (unlock + session lifecycle):

- **`DuelManager` class** — `tryBeginDuel`, session restore, rematch params, active brief, unlock/archive roster.
- **`GameFlow`** — delegates duel validation/session; board/chess orchestration unchanged.
- **Tests** — 12 `DuelManager.test.ts` cases (**467** total in gate).

---

## [0.2.23] — 2026-05-30

Pass 4 PR2 — SnapshotManager extraction:

- **`SnapshotManager`** — debounced persist, synchronous test mode, pending snapshot ownership, `onPersistFailure` hook.
- **`buildInProgressSnapshot()`** — pure in-progress assembly moved out of `gameFlow.ts`.
- **`GameFlow`** — delegates save I/O to the manager; recovery orchestration unchanged.
- **Tests** — expanded `SnapshotManager.test.ts` (debounce coalescing, flush, failure hook, build paths).

---

## [0.2.14] — 2026-04-30

Product and reliability pass: live rival talk lines in AI flavor, Daily
Calculus confirmation when abandoning recoverable play, streak
`persistOk` + UI warning, Calibration Lens **Equilibrium** rename +
clearer dossier difficulty copy, lab overlay ARIA + `accessibility.html`,
ledger memo optimization, contrast tweaks, `contenteditable` shortcut
suppression, expanded tests (**231**), README refresh.

---

## [0.2.22] — 2026-05-29

Pass 3 PR5 — deploy guards, e2e smoke, recruiter visual:

- **`scripts/assert-pages-build.mjs`** — fails builds with absolute `/favicon` or `start_url: "/"`; requires OG/Twitter tags and `./` manifest `start_url` (wired into `quality:gate`).
- **Playwright** — `npm run test:e2e` against `vite preview` (`/Chess-of-Kings/`); optional `e2e-smoke` CI job (not in fast gate).
- **README** — hero screenshot at `docs/at-a-glance-hero.png`; quality row updated (**436** tests).

---

## [0.2.21] — 2026-05-29

Pass 3 PR4 — mountApp Pass 1.5 extraction:

- **`mountContext.ts`** — `MountDomRefs`, `MountPlayState`, `MountRuntime` for testable wiring.
- **`src/app/ui/`** — `applyChessUi`, `renderScene`, `renderDuelUi`, `showRewardBundles` extracted from `mountApp.ts`.
- **Tests** — focused jsdom coverage for prologue story-beat, Alexion dossier doctrine, rated reward HTML.
- **`ARCHITECTURE.md`** — updated module map and TypeScript scale note.

---

## [0.2.20] — 2026-05-29

Pass 3 PR3 — play-surface visual polish:

- **Lab board** — stronger brass corners on turn/check; richer eval-bar fill gradient.
- **Manuscript** — story-beat and interlude line rhythm.
- **Duel** — launch block separator; sealed rival row glass depth.
- **Mobile lab** — 44px vestibule/keyboard targets; safe-area play-inner padding.

CSS gzip remains under the **16800** byte gate.

---

## [0.2.19] — 2026-05-29

Pass 3 PR2 — screen controller and lab accessibility:

- **`screenController.ts`** — centralizes `hidden` / `aria-hidden` / `inert` for top-level screens; inerts `#shell` siblings while the lab is open (lab overlay and live modals exempt).
- **Lab chrome** — top bar reflects `inert` as an HTML attribute; play-smoke asserts shell inert contract.
- **Tests** — `screenController.test.ts` + expanded lab play-smoke (**433** gate tests).

---

## [0.2.18] — 2026-05-29

Pass 3 PR1 — fonts and CSS budget:

- **Self-hosted fonts** — Cinzel, Cormorant Garamond, and JetBrains Mono woff2 in `src/assets/fonts/`; removed blocking `fonts.googleapis.com` `@import`.
- **CSS dedupe** — merged duplicate `:root`, body background, `.display-title`, and premium-pass blocks; consolidated v0.2.17 polish rules.
- **PWA** — service worker cache bumped to `cok-static-v5` for hashed asset refreshes.

---

## [0.2.17] — 2026-05-29

README and visual polish:

- **README** — specific skills table and At-a-glance skills row; removed location line; expanded reviewer YAML `creator_skills`.
- **UI** — title gradient type, brass primary buttons, framed board, chronicle card panel, glass title plate, richer ambient blooms, daily-ribbon and reward depth, chapter arrow hover, instrument frame shadow.

Gate unchanged at **428** tests.

---

## [0.2.16] — 2026-05-29

README and UI polish (no employer names in public docs):

- **README** — refreshed Creator / At-a-glance sections with GitHub and LinkedIn links only; removed third-party employer references.
- **Keyboard atlas** — reward overlay help sheet now uses the shared `reward-hero` header block.
- **Chapters screen a11y** — play smoke asserts title and duel stay `inert` while the chronicle index is active.

Gate: **428** tests across 53 files.

---

## [0.2.15] — 2026-05-29

Play-test hardening and title-rating sync after **New chronicle**:

- **New chronicle UX** — `syncTitleRating()` runs after a confirmed reset so the Stratarch Rating line clears immediately instead of showing a stale value when returning to the title screen.
- **Play smoke** — duel screen `inert`/`aria-hidden` contract for title and chapters; Daily Calculus confirm gate when a recoverable session exists; ladder reset assertion on new chronicle.
- **SFX** — capture-promotion and check/mate promotion SAN precedence locked (`exd8=N`, `exd8=Q+`, `axb8=R#`).
- **GameFlow** — `newGame()` resets the Stratarch Rating ladder (unit test).

Gate: **427** tests across 53 files.

---

## [Unreleased] — Continuation Passes (2 / 3 / 4)

Deterministic, additive improvements layered on the Maximum Effort Pass.
Full `quality:gate` green at **422 tests** across 53 files; JS gzip
**~82.9 KB** (budget < 90 KB), CSS gzip **~16.2 KB**.

### Added

- **Stratarch Rating (Pass 4)** — a persistent, Elo-style ladder number in
  `src/game/rating.ts` (pure math: logistic expected score, provisional
  K-factor, clamped 100–3000 band). After every rated match / duel,
  `GameFlow` updates the rating against the rival's *stable* base-profile
  strength plus a per-mode difficulty offset (so the published rival
  strength is not perturbed by the dynamic anti-tilt / momentum ramps).
  The current rating + peak appear on the title screen; the signed delta
  appears in the reward overlay. Persisted in `SaveData.ladder` with a
  forward migration (legacy saves default to 800; malformed values are
  clamped). 20 new tests (rating math, migration round-trip, win/loss
  integration, title surfacing).
- **Exported evaluation feature terms (Pass 2)** — the pawn-structure and
  coordination scorers in `src/chess/evaluate.ts` are now individually
  exported and unit-tested in isolation.
- **Opening-book bias in search (Pass 3)** — `openingSanBias()` nudges the
  engine toward on-book replies during the opening; a guard re-selects a
  booked candidate when the raw engine choice would wander off-book within
  a discipline-scaled slack window.

### Changed

- Match-outcome labels on the board status pill now use the centralized
  `STATUS_LABELS` (Victory / Defeat / Drawn).
- The `?` keyboard-help shortcut is suppressed while a confirmation dialog
  is open.
- Higher-contrast thinking-pill colour and square coordinate labels.

---

## [Unreleased] — Maximum Effort Pass

A multi-pass polish, refactor, and test push. Current gate status in
this branch: lint, typecheck, full tests (293 cases), build, and UI
smoke are all passing.

### Added

- **Piece-movement physics (`src/chess/boardAnimation.ts`)** — a DOM-free,
  fully unit-tested geometry layer behind the board's visual state engine.
  Carries now follow a *lift → eased arc → settle* trajectory (the easing is
  baked into the spatial sampling so the carry can run on a `linear` GPU
  timeline with translate+scale only — no per-frame layout or paint). The
  module also derives the captured square (handling en-passant) and the
  castling rook's travel. `BoardView` consumes it to: dissolve a captured
  piece (fade + shrink + topple on the correct square, including en-passant),
  carry the **castling rook in tandem with the king** (previously castling
  did not animate at all), and squash-settle each piece as it lands. A single
  `flyGen` token cancels stale carries so a fast follow-up move can never
  leave a destination piece hidden. Pure helpers covered by
  `boardAnimation.test.ts` (22 cases); DOM orchestration covered by
  `boardView.animation.test.ts` (7 cases) under stubbed layout/WAAPI.
- **Hanging-piece coach (`src/app/hangingInsight.ts`)** — the highest-value
  real-world lesson. After every match / duel / freeplay move it runs a
  one-exchange static check over the opponent's *legal* captures (so pinned
  attackers never false-alarm) and, if the move left a piece to be won
  (≈ an exchange or more), overrides the coach tip with a specific warning
  (“your bishop on c4 can be won…”). Suppressed while the opponent is in
  check and in puzzles (curated sacrifices). Unit + `GameFlow` integration
  tested.
- **Chapter II — The Age of Fire** in `data/chapters.ts`: Romantic codex,
  king-hunt mate puzzle, two ladder matches (Rowan / Vega) with tuned
  `aiDepth`, chapter rewards, and freeplay rehearsal. Unlocks after
  Chapter I on the chronicle index (`roadmap.ts` no longer lists Ch II
  as future-only).
- **Romantic duel archive**: `rowan` / `vega` roster entries
  (`minChapterUnlock: 2`, tabiya FENs), victory rewards unlock their duel
  variants; `grantVictoryRewards` wires scene IDs to opponent unlocks.
- **`chapter2Complete`** on `SaveData` + `GameFlow` (set when leaving
  `c2-reflection`); title screen copy and campaign-finale message know
  when both chapters are sealed.
- **`theme-romantic`** lab atmosphere in `style.css`.
- `src/ARCHITECTURE.md` — 184-line directory map, Mermaid data-flow
  diagram, persistence model, and a "where do I add X?" recipe table.
- `.github/ISSUE_TEMPLATE/*` and `.github/PULL_REQUEST_TEMPLATE.md` for
  consistent bug reports, feature requests, and PR verification notes.
- `SECURITY.md` and `CODE_OF_CONDUCT.md` for standard repository health
  and disclosure expectations.
- `public/robots.txt`, `public/sitemap.xml`, `public/sw.js`, and PWA
  icon assets (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
  `apple-touch-icon.png`, `og-image.png`) for deploy/discovery and
  installability polish.
- `src/app/recap/styleGrade.ts` and `recap/rankLabels.ts` — pure
  recap helpers extracted from `mountApp`, with full test coverage.
- `src/app/audio/sfx.ts` — `createSfxController` factory; lazy
  AudioContext, iOS unlock-on-gesture, distinct cues for capture /
  check / mate / castle / promotion, plus event cues for undo /
  advance / reward / draw / unlock.
- `src/app/play/chapterRail.ts` — pure HTML builders for the
  manuscript-margin ladder rail and dot-strip ladder track.
- `src/app/keyboard/globalShortcuts.ts` — pure handler + attach helper
  for Escape / Enter / Space / `?` global shortcuts.
- `src/app/session/streak.ts` and `session/dailyCalculus.ts` — local
  session-streak counter and a deterministic daily puzzle picker. Both
  use dedicated localStorage keys, never participate in save migration.
- `src/app/duel/calibrationLens.ts` — 5-level adaptive-difficulty
  dial derivation from history + rival memory; pure, fully tested.
- `src/app/a11y/announcer.ts` — `aria-live="polite"` announcer wrapper.
- `src/data/strings.ts` — UI-chrome strings module scaffold (no i18n
  runtime; structural only).
- `src/data/rivals.ts` — per-rival doctrinal profile data: school
  blend, opening repertoires, talk profile (5 buckets), 3-bullet
  curated counter-prep briefing for Amara / Lukas / Edred / Marius /
  Demetrios.
- **Calibration Lens dial** in every duel dossier (5 brass ticks,
  current band highlighted, hint paragraph below).
- **Mastery Trial button** on every dossier — locks the rival to
  ceiling difficulty for one match.
- **Daily Calculus ribbon** on the title screen — one curated puzzle
  per local day, plus the session-streak badge.
- **Keyboard atlas overlay** triggered by `?` listing every shortcut
  in three column-grouped lists.
- **Promotion picker keyboard nav** — Esc cancel, Arrow / Home / End
  cycle, Tab focus trap.
- **Live-region outcome announcer** — match outcomes and reward
  inscriptions are spoken to assistive tech, gated by an
  outcome-key so we never re-announce.
- **`apple-touch-icon`, `mask-icon`, and `application-name` meta**
  in `index.html` so the iOS home-screen install renders crisply.
- 14 new test files covering recap helpers, audio cues, chapter rail,
  keyboard shortcuts, session streak, daily calculus, calibration
  lens, announcer, persistence robustness, shell-markup integrity,
  reduced-motion CSS, perf smoke, engine property, engine-vs-engine,
  rival profiles.

### Changed

- **Flying-piece skin theming fixed (`src/style.css`)** — the carried sprite
  lives on `<body>`, but its skin colours were keyed off
  `.chess-grid[data-skin] .piece-fly`, an ancestor that is never present
  there, so every carry rendered in the default ivory/ink regardless of skin
  (most visible on **Obsidian Neon**, which carried as plain cream instead of
  glowing). `BoardView` now stamps `data-skin` on the sprite itself and the
  rules are re-scoped to `.piece-fly[data-skin]`; capture sprites inherit the
  same theming. Verified in-browser across all four skins.
- **Interactive vector polish (`src/style.css`)** — a selected piece now lifts
  off the board (`translateY` + scale) to reinforce tap-to-move, and the hover
  lift uses the project's spring-out easing. All piece motion remains
  `transform`-only (compositor-friendly) and is gated by `prefers-reduced-motion`
  (JS guard in `BoardView` plus the universal CSS clamp) and trimmed under the
  `perf-lean` profile (shorter carry, fewer arc samples, no capture dissolve or
  landing squash).
- **Chapter II ladder scripts** tightened for legal black SAN sequences
  under typical white replies; Rowan/Vega after-match copy aligned with
  those lines.
- **Counterpart (Chapter I finale)** engine depth **5 → 4** for a
  slightly fairer ceiling against the composite scholar.
- **Board region hint (`#board-guide`)** is driven by `GameFlow` each
  chess update (wait for opponent / AI thinking / freeplay / terminal)
  so it cannot contradict “0 legal targets” when it is not your turn.
- **Universal bounded-narrative play area** (`src/style.css`,
  `src/app/mountApp.ts`) — fixes the iPhone-blocking bug where the
  **Advance** button after dialogue fell below the fold (and behind the
  iOS toolbar) and could not be pressed. No-board scenes now scroll the
  prose *inside* the manuscript while the Advance footer stays pinned and
  on-screen at every size; board scenes auto-scroll the button into view
  the moment the objective is met. Verified across iPhone (portrait +
  landscape), iPad, Android phones, small/landscape phones, Surface,
  laptop and desktop on both WebKit and Chromium. Adds a short-viewport
  layout (landscape phones hide the redundant in-lab nav and compress the
  crawl), a scroll-fade affordance, `prefers-reduced-motion`-aware
  auto-scroll, and reward/overlay docking with safe-area padding.
- **Promotion picker** (`src/chess/boardView.ts`) is now clamped to the
  viewport — White's top-rank promotion menu flips below the square
  instead of clipping off the top of a phone, so every choice stays
  tappable.
- Prologue **calibration `goalPlain`** copy now states explicitly that
  White moves only on White’s turn and to wait between trainer replies.
- `src/app/mountApp.ts` now enforces top-level screen isolation via
  `aria-hidden` + `inert` toggling so inactive title/chapter/duel
  screens are not left in the accessibility tree while the lab is open.
- `createRewardOverlayController` accepts optional `onOpenChange`; the
  app uses it to mark other `#shell` children `inert` while the reward
  dialog is open (the dialog node lives inside the shell, so a single
  parent `inert` would silence it).
- `src/app/gameFlow.ts` now persists after scene/chapter refresh in
  `jumpToScene` / `jumpToChapter` to avoid stale duel snapshots being
  written under destination chapter indices.
- `vitest.config.ts` now runs test files sequentially
  (`fileParallelism: false`, `maxConcurrency: 1`) to avoid the
  non-deterministic worker timeout exit seen in CI-like runs.
- Title hero, dossier, chapter index, reward overlays all received
  refined CSS and ARIA-label improvements.
- Board square `aria-label` now composes piece + flags (selected,
  last move, in check, legal target, legal capture, confirm-move
  target). `aria-pressed` mirrors selection state.
- Chess root references both `narrative-kbd-hint` and `board-guide`
  via `aria-describedby`.
- Typography uses ratios rather than absolute `line-height`s
  (1.18 for headings, 1.35 for ledger rows, 1.45–1.6 for prose).
- The reduced-motion CSS guarantee is now regression-locked by tests
  that read the CSS file and assert the universal selector + duration
  / iteration-count clamps.

### Engineering

- 86 → 224 tests pass. 34 test files (was 18).
- Lint clean: zero warnings, zero `as any` in production code.
- Bundle (measured 2026-04-29, `npm run build` + `npm run report:bundle-gzip`): JS gzip **63,661 B** (budget: < 90 KB), CSS gzip **12,496 B** (budget: < 13 KB).
- Lighthouse mobile CLI JSON: `docs/lighthouse-mobile-max-pass-2.json`
  (Perf 86 / A11y 100 / Best Practices 96 / SEO 100). Older snapshot remains at `docs/lighthouse-mobile.json`.

### Deferred (honest notes)

The following items from the original maximum-effort brief were
deliberately scoped out of this pass to keep voice consistency and
gates green; each is called out by name in the commit body of the
pass that touched the surrounding area.

- Full closure-extraction of `applyChessUi` / `renderScene` /
  `renderDuelUi` / `showRewardBundles` (Pass 1.5).
- Feature-decomposed `evaluate.ts` (Pass 2-deep).
- `selectTalkLine` integration into the live in-match flavor
  pipeline; opening-repertoire enforcement during play (Pass 3-deep).
  *(Partially addressed: opening-book bias now nudges engine search —
  see the Continuation Passes entry above.)*
- ~~Per-rival Elo-ish tracker on save with migration (Pass 4-deep).~~
  **Shipped** as the Stratarch Rating — see the Continuation Passes entry
  above.
- Web Worker for AI search (Pass 7-deep).
- Color contrast audit beyond the existing token system (Pass 8-deep).
- Mobile-viewport visual overflow check (jsdom limitation; needs a
  headless-browser pass).

### Save format

No change. `SaveData.version === 3`. The session streak and daily
puzzle picker live in dedicated localStorage keys (`cok-streak`),
not in `SaveData`. Older saves load unchanged.

---

## Earlier history

For releases before the Maximum Effort Pass, see the GitHub release
notes at <https://github.com/sauterreed24/Chess-of-Kings/releases>.
