# Architecture — The Calculus of Kings

> A living map of the codebase. Read this first when you join the project.
> If anything here disagrees with the source, the source wins — please open
> a PR to fix the diagram.

The Calculus of Kings is a Vite + TypeScript narrative chess RPG that runs as
a static, install-as-PWA single-page app. There is **no React, no router,
no state library** — the UI is plain DOM + a single `style.css`. The
"engine" is `chess.js` for legality, with a custom alpha-beta search and
evaluation in `src/chess/`.

The codebase is intentionally small and read-top-down: everything below
fits inside ~6,000 lines of TypeScript and one CSS file.

## Directory map

```
src/
├── main.ts                  Entry point. Mounts the app into #app.
├── style.css                One CSS file. Tokens at the top, components below.
├── types.ts                 Shared domain types (Scene, Chapter, RewardBundle,
│                            AiProfile, MatchHistoryEntry, save snapshots…).
├── ARCHITECTURE.md          (this file)
│
├── app/                     Application shell, screens, and persistence.
│   ├── mountApp.ts          Bootstraps the shell, wires GameFlow callbacks
│   │                        to the DOM, and drives the title / chapters /
│   │                        duel / lab screens.
│   ├── shellMarkup.ts       Single function returning the HTML shell that
│   │                        mountApp injects into #app.
│   ├── gameFlow.ts          The state machine. Owns chapter / scene / duel
│   │                        progress, the chess engine bridge, the player
│   │                        tendency profile, and rival memory. Emits
│   │                        onSceneChange / onChessUpdate / onChapterComplete.
│   ├── storage.ts           localStorage-backed save (key
│   │                        "calculus-of-kings-progress-v3"). Pure
│   │                        sanitization on load — never trusts the disk.
│   ├── htmlEscape.ts        4-char HTML escape helper used on every dynamic
│   │                        string injected into innerHTML (XSS guard).
│   ├── chronicleReplay.ts   Builds replay FEN sequences and timeline HTML
│   │                        for Chronicle Echo overlays.
│   ├── chronicleEchoTimer.ts Tiny play / pause timer used by echoes.
│   ├── escapeKeyRouting.ts  Pure function that decides what Escape does.
│   ├── ledgerFingerprint.ts 32-bit rolling hash over (SAN, quality) for
│   │                        cheap "did the ledger change?" checks.
│   ├── mainUiFormatters.ts  Pure HTML / text formatters (move ledger, captured
│   │                        rows, performance deltas, tier labels, …).
│   ├── rewardOverlayController.ts  Modal lifecycle, focus trap, focus restore.
│   ├── devLog.ts            devWarn helper that no-ops in production builds.
│   │
│   ├── audio/sfx.ts         Procedural move-cue audio (oscillator + envelope),
│   │                        lazy AudioContext, iOS unlock-on-gesture support.
│   ├── keyboard/globalShortcuts.ts  Global Escape / Enter / Space routing.
│   ├── play/chapterRail.ts  Pure HTML builders for the manuscript-margin
│   │                        ladder rail and the dot-strip ladder track.
│   └── recap/
│       ├── styleGrade.ts    Style grade (S–D) + turning-point line, pure.
│       └── rankLabels.ts    RP -> rank label + next-rank threshold, pure.
│
├── chess/                   Engine, board view, opening book, AI profiles.
│   ├── ai.ts                Alpha-beta search with transposition table,
│   │                        move ordering, profile-driven blunder + risk.
│   ├── evaluate.ts          Material + PST + style-bias evaluation.
│   ├── bitboard.ts          Compact board masks used by evaluation/search.
│   ├── aiProfiles.ts        Phase adaptation + resolveProfileBy* helpers.
│   ├── motifs.ts            Tactical motif detector (fork / pin / skewer / …).
│   ├── openings.ts          Tiny opening book + getBookTopLines for dossiers.
│   ├── skins.ts             Piece glyph maps for the four piece skins.
│   └── boardView.ts         The DOM board: roving tabindex, arrow-key nav,
│                            promotion picker, fly-piece animation,
│                            move-guard tap-to-confirm, ARIA labels.
│
├── data/                    Pure-data modules (no DOM, no IO).
│   ├── chapters.ts          PLAYABLE_CHAPTERS array — the campaign.
│   ├── roadmap.ts           Locked future chapters shown on the index.
│   ├── duelRoster.ts        Rivals + their unlocked variants.
│   └── rewards.ts           CHAPTER_CLEAR_REWARDS + BASE_VICTORY_REWARDS.
│
├── game/
│   └── trainingTips.ts      lossRecoveryMentorLine — coach copy after losses.
│
└── world/                   Legacy hub (no longer used by the title screen
                              flow; kept for reference; see worldRunner.ts).
```

## Data flow

```mermaid
flowchart LR
    user[User input<br/>click / key / touch]
    DOM[Custom DOM shell<br/>(shellMarkup.ts)]
    mount[mountApp.ts<br/>bridges DOM <-> GameFlow]
    flow[GameFlow<br/>(gameFlow.ts)]
    chessjs[chess.js<br/>legality oracle]
    ai[AI search<br/>(chess/ai.ts)]
    eval[Evaluation<br/>(chess/evaluate.ts)]
    storage[localStorage<br/>(app/storage.ts)]
    board[BoardView<br/>(chess/boardView.ts)]
    sfx[SfxController<br/>(audio/sfx.ts)]
    overlay[RewardOverlayController<br/>(rewardOverlayController.ts)]

    user -->|DOM events| board
    user -->|nav clicks| mount
    user -->|Escape / Enter| mount
    board -->|onMove| flow
    flow -->|legality| chessjs
    flow -->|search| ai
    ai --> eval
    flow -->|onChessUpdate| mount
    flow -->|onSceneChange| mount
    flow <-->|debounced 180ms| storage
    mount --> overlay
    mount --> sfx
    mount --> DOM
```

The hot loop is one direction: the user moves a piece on the board, the
board calls `GameFlow.onMove`, the flow updates state and emits a
`ChessUiPayload` on the next frame, and `mountApp.applyChessUi` does
**memoized** DOM writes (see `lastLedgerKey`, `lastCapturedFen`,
`lastEvalScore`, `lastAdvanceSig`).

## Persistence

- **Key:** `calculus-of-kings-progress-v3` in `localStorage`.
- **Shape:** `SaveData` (see `app/storage.ts`). Versioned (`version: 3`).
- **Writes:** debounced 180 ms; flushed eagerly on `pagehide` and
  `beforeunload` so closing the tab can never strand a result.
- **Loads:** every field is sanitized — unknown values fall back to
  defaults, FENs are validated by constructing a `Chess` from them.
- **Test mode:** `import.meta.env.MODE === 'test'` flips `SYNC_IO` so
  vitest sees deterministic writes.
- **Migration discipline:** changes to `SaveData` must add a forward
  migration in `app/storage.ts` and an assertion in
  `app/storage.migration.test.ts`.

## Where do I add X?

| Want to add… | Touch these files |
| --- | --- |
| A new chapter | `data/chapters.ts` (push to `PLAYABLE_CHAPTERS`) and `data/chapters.validation.test.ts` (assertions). |
| A new rival | `data/duelRoster.ts` (entry + variants), maybe `data/rewards.ts` (unlock), and a profile id wired through `chess/aiProfiles.ts`. |
| A new AI profile / school | `chess/aiProfiles.ts` (data + composition), `chess/evaluate.ts` (style bias if needed). |
| A new piece skin | `types.ts` (`PieceSkinId` union), `chess/skins.ts` (`glyphForSkin`), `app/storage.ts` (`normalizeSkin`). |
| A new scene type | `types.ts` (`Scene` union), `app/gameFlow.ts` (handlers), `mountApp.ts` `renderScene` branch. |
| A new reward | `data/rewards.ts`, `types.ts` (`RewardKind` only if novel). |
| A new move-cue SFX | `app/audio/sfx.ts` (extend `playMoveSfx` or add a sibling). |
| A new modal | `mountApp.ts` (compose HTML; pass to `rewardOverlayCtl.open`). |
| A new global keyboard shortcut | `app/keyboard/globalShortcuts.ts` (`handleGlobalKey` switch). |
| A new save field | `types.ts`, `app/storage.ts` (default + sanitizer + migration), and a migration test. |

## Testing scopes

The full suite is `npm test`; the fast UI gate is `npm run test:ui-smoke`.

- **Unit** — pure helpers (`recap/*`, `rankLabels`, `mainUiFormatters`,
  `escapeKeyRouting`, `htmlEscape`, `motifs`, `openings`, `aiProfiles`,
  `play/chapterRail`, `audio/sfx`, `keyboard/globalShortcuts`,
  `chronicleEchoTimer`, `ledgerFingerprint`).
- **Migration** — `app/storage.migration.test.ts` round-trips fixtures.
- **Engine legality** — `chess/ai.legality.test.ts` runs the AI against
  many random positions and asserts every returned move is legal.
- **UI smoke** — `app/uiEscape.smoke.test.ts` mounts the shell in jsdom
  and exercises Escape / overlay focus restoration.
- **DOM regression** — `chess/boardView.test.ts`, `app/chronicleReplay.test.ts`,
  `app/rewardOverlayController.test.ts`, `app/chronicleEchoTimer.test.ts`.

CI gates: `npm run lint`, `npm test`, `npm run build`, `npm run test:ui-smoke`.

## Invariants we will not break

1. **Saves are forward-compatible** — older save strings must still load.
2. **Zero new runtime dependencies** unless absolutely necessary; justify
   in the commit and the README.
3. **Accessibility is additive** — keyboard board, focus restore, ARIA
   labels, reduced-motion support, skip link. Don't remove; do improve.
4. **No regressions on the perf budget** — RAF batching, debounced
   saves, deferred IO, and the memoization guards in `applyChessUi`
   stay or get faster.
5. **`chess.js` is the legality oracle.** The custom search reasons
   about scores; legality is never reimplemented.
6. **Hellenistic / Alexandrine voice and brass-and-lapis art direction
   are part of the product.** Elevate; don't modernize away.
