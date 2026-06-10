# Crown Engine v2 — design specification

In-house chess engine for The Calculus of Kings. Lives in
`src/chess/engine/`; the persona/difficulty layer lives in
`src/chess/ai.ts`. Zero runtime dependencies; chess.js remains the
legality oracle at every boundary.

## 1. Formal state

A position `P = (B, s, c, e, h, f)`:

- `B : Sq → Piece ∪ {∅}` over 0x88 squares (`sq = 16·rank + file`,
  on-board ⇔ `sq & 0x88 = 0`); pieces encode `type | color << 3`.
- `s ∈ {WHITE, BLACK}` side to move; `c ⊆ {WK, WQ, BK, BQ}` castling
  rights; `e` en-passant target square or none; `h` halfmove clock;
  `f` fullmove number.

Derived, maintained **incrementally** by `make/unmake` (O(1) per move):

- Zobrist hash as two independent 32-bit halves `(lo, hi)` from a
  deterministic seeded PRNG — keys for piece/square, castling set, EP
  file, side.
- Tapered accumulators `mg, eg` (White-positive, material baked into
  PSTs) and phase `φ ∈ [0, 24]` (N/B = 1, R = 2, Q = 4).
- King squares, non-pawn material per side (zugzwang guard).

`make(m)` always applies and returns `false` iff the mover's king is
attacked afterward (caller unmakes) — this single rule settles pins,
en-passant discovered checks, and king-into-check uniformly.

## 2. Legal move function

Pseudo-legal generation per piece type (pawn pushes/captures/EP/
promotions Q-N-R-B, knight/king offsets, slider rays, castling with
empty-and-unattacked path) filtered by the `make` legality rule.

**Correctness proof in CI**: perft equals published reference values on
six torture positions to depth 3–4 (`engine/perft.test.ts`), and the
legal-move set equals chess.js's exactly across randomized playouts from
five starts (`engine/crossValidation.test.ts`), alongside incremental
hash/accumulator drift checks against full recomputes.

## 3. Terminal states

At a node with no legal moves: `inCheck ? −(MATE − ply) : 0`. Inside
search: halfmove ≥ 100 → 0; two-fold repetition along the search path
(hash match within the last `min(h, ply)` plies, same side) → 0. Game-
level threefold/insufficient-material adjudication stays with chess.js.

## 4. Evaluation

`E(P) = sign(s) · [ (mg·φ + eg·(24−φ))/24 ] + tempo + hand terms`, in
centipawns from the side to move. Hand terms (weights inherited from the
project's classic evaluator to preserve its positional taste): doubled
−7/pawn, isolated −18, passed `[10,18,30,52,82]` by rank (+9 protected),
connected +3/+5, bishop pair +22, rook/queen open/semi-open file +18/+10,
slider mobility (B×3, R×2, Q×1 per ray square), king pawn-shield penalty
scaled by `φ/24`, tempo +10.

**Lazy margin**: hand terms are skipped when `|base − window| > 320 cp`,
which keeps quiescence cheap.

## 5. Search recurrence

Iterative deepening `d = 1..maxDepth` over PVS negamax:

```
negamax(P, d, α, β, ply):
  draw checks; mate-distance pruning
  if inCheck: d += 1                          (check extension)
  if d ≤ 0: return qsearch(P, α, β)
  TT probe (exact/lower/upper, depth-preferred, ply-corrected mates)
  static = E(P) unless in check
  null move: d ≥ 3, ¬PV, ¬inCheck, nonPawnMaterial > 0, static ≥ β
             → search(d − 3 − d/4) zero-window; ≥ β prunes
  futility: d ≤ 2, ¬inCheck, static + 130d ≤ α → skip late quiets
  move loop (selection-ordered: TT move ≫ MVV-LVA ≫ killers ≫ history):
    make; LMR for late quiet non-checks (−1, −2 when very late);
    PVS zero-window + re-search; unmake
    β-cutoff → killers/history update
  TT store
```

`qsearch`: stand-pat, captures + queen promotions only, MVV-LVA,
per-move delta pruning (`stand + victim + 180 ≤ α` skips), hopeless-
position delta (queen margin).

## 6. Transposition table

Fixed 2^18-entry typed-array table (~4 MB): `keyLo/keyHi` verification,
packed `score(16, biased) | depth(7) | flag(2) | generation(6)`.
Replacement: same-generation deeper entries win; new generations always
replace. Mate scores ply-corrected on store/probe. Persistent across
searches (generation aging); `freshTable` clears for reproducible tests.

## 7. Time management

`maxTimeMs` is a hard deadline checked every 1024 nodes (plus optional
`maxNodes`). Soft policy: a new iteration starts only if elapsed
< 0.55 × budget — extended to 0.78 × when the best move changed in the
previous iteration (criticality/tension extension). Time-out mid-
iteration discards the partial iteration; the last completed iteration's
move is always returned. Mate confirmed → stop early.

## 8. Difficulty model (persona layer)

For profile `ρ` (existing `AiProfile` schema):

- **Depth**: `D(ρ) = clamp(2·searchDepth − 2, 2, 10) + [alertness > 0.8]`
  (legacy depths 2–5 map to real plies 2–11). Budget = `thinkTimeMs`.
- **Apex tier** (`conversionStrictness ≥ 0.95`): plays the engine's best
  move outright.
- **Everyone else — spectrum mode**: every root move is searched with a
  full window, yielding exact scores `v₁ ≥ v₂ ≥ …`. Selection:
  1. *Miss episodes*: with probability `0.6·blunderRate`, re-search two
     plies shallower and judge from that spectrum (a coherent shallow
     mistake — "didn't calculate far enough").
  2. *Safe band*: `{ m : v(m) ≥ v₁ − Δ(ρ) }` with
     `Δ = 25 + 900·blunderRate`, shrunk by strictness when winning;
     moves at a seen forced mate (`v ≤ −MATE_BOUND`) are excluded while
     alternatives exist; a seen winning mate is always played.
  3. *Oversight episodes*: with probability `0.45·blunderRate` (never in
     conversion mode), sample from the tail `(v₁−3Δ−150, v₁−Δ)` — drops
     real material (a piece, an exchange), never a queen, never into mate.
  4. *Flavor*: style/risk/castling/anti-shuffle biases, each bounded so
     total ≤ ±40 cp, applied **inside the band only** — personality can
     never out-vote tactics.
  5. *Sampling*: Boltzmann `Pr(m) ∝ exp((v(m) − v₁)/T)` with
     `T = 8 + 260·blunderRate + 25·(1 − strictness)`, cooled in endgames
     by strictness.
- **Conversion mode** (`v₁ ≥ 500` in an endgame): re-search to depth ≥ 6,
  `Δ ← 0.3Δ`, `T ← 0.25T`, no oversights — every tier marches won
  endgames to mate (verified: KQ vs K converts at all tiers).
- **Opening books**: unchanged upstream gate; inside the persona, a book
  move within `30 + 40·openingDiscipline` cp of best is played.

## 9. Stochasticity

The engine core is fully deterministic (no RNG; stable ordering; verified
by a nodes/PV-equality test). All randomness lives in the persona layer
via `Math.random`, which the test harness seeds per test.

## 10. Correctness invariants

1. Perft equality with published values (6 positions).
2. Legal-move-set equality with chess.js on randomized playouts.
3. Incremental hash/mg/eg equal full recomputation after any make; FEN
   round-trips exactly; unmake restores the start position.
4. Every move the AI returns is an entry of `chess.moves({verbose:true})`
   for the live position (oracle validation at the boundary).
5. Search never returns an illegal or null move in a non-terminal
   position; terminal positions return null + correct score.
6. Mate scores are exact distances (`MATE − ply`), ply-corrected in TT.

## 11. Complexity

Move generation O(pieces × rays) with O(1) make/unmake; evaluation O(64)
board scan with O(1) incremental base and lazy exits. Search is
O(b^(d/2))-ish with PVS + ordering (effective branching ~2–4 observed).
Throughput in jsdom CI: ~70–400 k nodes/s vs the legacy ~1–4 k — a
40–110× improvement at equal wall time; typical browser mains are faster.
Memory: ~4.5 MB typed arrays (TT + history), no per-node allocation
except the move list array.

## 12. Measured results (evidence)

- **Match**: Crown v2 8–0 legacy at 200 ms/move
  (`CROWN_MATCH=1 npx vitest run src/chess/engine/crownVsLegacy.bench.test.ts`).
- **Throughput** at 300 ms/position (same harness, always-on):
  start 21,705 vs 512 nodes; italian 34,573 vs 384; kiwipete 19,756 vs
  256; rook endgame 123,078 (depth 8) vs 1,151.
- **Ladder**: veteran 6–0 novice at 120 ms
  (`CROWN_MATCH=1 npx vitest run src/chess/ai.persona.test.ts`).
- **Depth at fixed budget**: depth ≥ 6 within 500 ms on a development
  middlegame (gated in `engine/search.test.ts`).
- **Latency**: hard-budget compliance asserted (150 ms budget < 600 ms
  wall in CI incl. setup; profile budgets respected with headroom).

## 13. Known tradeoffs and future path

- Quiescence has no SEE (static exchange evaluation); bad captures are
  pruned only by delta margins. SEE ordering is the next cheap strength
  win.
- Stand-pat is allowed in check inside qsearch (slight tactical blind
  spot at the horizon; the check extension above it compensates).
- Spectrum mode costs ~2–4× a normal search at equal depth; acceptable
  because non-apex personas use shallow depths.
- Evaluation is hand-tuned, not learned. A future NNUE-lite path:
  generate self-play positions labeled by deep Crown searches (and/or
  spectra), train a small int8 feature-transformer (king-relative piece
  placement, 2×128 hidden), distill to a typed-array forward pass behind
  the existing `evaluate()` interface, keep the classical evaluator as
  fallback. Data plan: ~5 M positions, 90/10 split, val loss vs move-
  agreement metrics, and the ladder/match harnesses as regression gates.
- Endgame tablebases are out of scope (offline/bundle constraints);
  conversion mode covers the product need.
