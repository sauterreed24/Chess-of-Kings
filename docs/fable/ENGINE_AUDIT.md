# Engine Audit — what the legacy engine actually did

> Reverse-engineered from `src/chess/legacyAi.ts` (formerly `ai.ts`),
> `src/chess/evaluate.ts`, `src/chess/bitboard.ts` on 2026-06-10.

## 1. State representation

- No internal board. Every search node operated on the live `chess.js`
  instance via `move()/undo()`.
- Evaluation state (`PositionAnalysis`) was rebuilt per call from
  `chess.board()` → BigInt bitboards (64 single-bit BigInt masks, Kernighan
  popcount loops, per-piece sliding-attack ray walks). BigInts are
  heap-allocated in V8, so each evaluation allocated hundreds of objects.
- Hashing: `chess.hash()` string keys into a `Map<string, TTEntry>`.

## 2. Move generation

- `chess.moves({ verbose: true })` per node. chess.js computes **SAN for
  every move** in verbose mode, and SAN disambiguation/check-suffix
  requires an internal make/unmake per move — the single biggest cost.
- Tactical detection in quiescence used `san.includes('+')`, coupling
  search logic to string formatting.

## 3. Search (what existed)

Negamax + alpha-beta with: iterative deepening, aspiration windows (±45),
PVS zero-window for non-first moves, one-ply LMR (i ≥ 4, quiet), check
extension, killers (2/ply), history heuristic, MVV-LVA + "capture safety"
ordering (which itself called `analyzePosition` per node when any capture
existed), TT cleared at the start of every `findBestMove`.

The architecture was textbook-correct; the substrate made it ~1–4k
nodes/s, so nominal depths were never reached. Mate scores were stored
depth-relative (not ply-relative) in the TT — wrong across entries, mostly
masked by the shallow effective depth.

## 4. Evaluation

Material + phase PSTs + doubled/isolated/passed/connected pawns + bishop
pair + rook files + knight outposts + rook-on-7th + mobility + king
pressure + loose-piece pressure + center control + space + tempo + king
shield. Reasonable terms with sane weights — but ~50–200 µs per leaf, all
rebuilt from scratch, no incrementality, no laziness.

## 5. Difficulty layer (the quality ceiling)

`findBestMoveWithProfile` mixed four decision sources per move:

1. **Random blunder branch**: `Math.random() < blunderRate` → uniformly
   random legal move (novice = 20% of all moves, including positional
   suicide unrelated to skill).
2. **Risky branch**: `riskAppetite * 0.18` chance to play the most
   style-biased forcing move with zero safety check.
3. **1-ply candidate scoring** (static eval + heuristics + doctrines) that
   could **veto the deep search result** ("blunder guard"): if the search's
   move scored poorly on the shallow heuristic, the shallow heuristic won.
   This caps strength at the 1-ply layer's quality and can discard found
   tactics.
4. The actual alpha-beta result, otherwise.

Consequences: weak levels felt random rather than weak-human; strong
levels were capped by both throughput and the veto; difficulty did not map
to a predictable strength ladder.

## 6. Integration

- Duel/match search ran **synchronously on the main thread** (up to
  ~1.8 s freeze). The Worker path existed for puzzles only, opt-in via
  `localStorage['cok-ai-worker'] === '1'`.
- `executeAiTurn` set `aiThinking = false` *before* firing the async turn,
  so a fast player could move mid-AI-turn.
- Worker responses were applied by SAN re-parse with no check that the
  position hadn't changed.

## 7. What was preserved in Crown Engine v2

- chess.js as the legality oracle (boundary validation + equivalence tests).
- The evaluation *taste*: PST tables and pawn/file/bishop-pair weights were
  carried into the new tapered evaluator so the product's positional style
  is continuous.
- The profile schema (`AiProfile`), opening books, rival bias, phase
  adaptation, and all public APIs (`findBestMove`,
  `findBestMoveWithProfile`, `findRandomMove`, `materialAdvantage`,
  `PIECE_VALUES`).
- The legacy engine itself, as a tree-shaken benchmark baseline
  (`legacyAi.ts`) so improvements stay measurable.

## 8. What replaced it

See `CROWN_ENGINE_V2_SPEC.md`. Headline: 40–110× node throughput at equal
budget, 8–0 head-to-head at equal time, difficulty as a bounded Boltzmann
model over exact root-move scores instead of random-move roulette.
