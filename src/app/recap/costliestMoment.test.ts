import { describe, expect, it } from 'vitest'
import { costliestLessonLine, costlyCandidates, plyMoveLabel, verifyCostliestMoment } from './costliestMoment'

/** The shallow pass alone: the largest candidate, or null. */
const findCostliestMoment = (...args: Parameters<typeof costlyCandidates>) => costlyCandidates(...args)[0] ?? null

describe('costlyCandidates (shallow pass)', () => {
  it('finds the White player\'s worst move (largest own-eval drop)', () => {
    /* White plays plies 0,2,4. White-positive trace: ply 2 drops 30 -> -260
       (a 290cp blunder); ply 4 only slips 10cp. */
    const sanLog = ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6']
    const evalTrace = [25, 20, -260, -250, -240, -245]
    const m = findCostliestMoment(sanLog, evalTrace, 'w')
    expect(m).not.toBeNull()
    expect(m!.ply).toBe(2)
    expect(m!.san).toBe('Qh5')
    expect(m!.dropCp).toBe(280) /* before = evalTrace[1]=20, after = -260 */
  })

  it('scores from Black\'s perspective on odd plies', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Qf6']
    /* White-positive trace; Black blunders on ply 3 (their eval falls). */
    const evalTrace = [25, 20, 30, 320]
    const m = findCostliestMoment(sanLog, evalTrace, 'b')
    expect(m).not.toBeNull()
    expect(m!.ply).toBe(3) /* Black's move */
    /* before = -evalTrace[2] = -30, after = -320 -> drop 290 */
    expect(m!.dropCp).toBe(290)
  })

  it('ignores the opponent\'s blunders (only grades the player\'s plies)', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6']
    /* The big swing is on ply 1 and 2 (opponent White moves for a Black player). */
    const evalTrace = [25, -400, -390, -395]
    const m = findCostliestMoment(sanLog, evalTrace, 'w')
    /* White player; their plies 0 and 2 are near-flat -> no costly move. */
    expect(m).toBeNull()
  })

  it('returns null for a clean game (no drop past the threshold)', () => {
    const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']
    const evalTrace = [25, 20, 30, 25, 35, 30]
    expect(findCostliestMoment(sanLog, evalTrace, 'w')).toBeNull()
  })

  it('respects a custom threshold', () => {
    const sanLog = ['e4', 'e5', 'Bc4', 'Nc6']
    const evalTrace = [25, 20, -60, -55] /* ply 2 drops 80cp */
    expect(findCostliestMoment(sanLog, evalTrace, 'w', 120)).toBeNull()
    expect(findCostliestMoment(sanLog, evalTrace, 'w', 70)?.ply).toBe(2)
  })

  it('is defensive against mismatched or empty input', () => {
    expect(findCostliestMoment([], [], 'w')).toBeNull()
    expect(findCostliestMoment(['e4'], [], 'w')).toBeNull()
    expect(findCostliestMoment(['e4', 'e5'], [10], 'w')).toBeNull()
    expect(findCostliestMoment(['e4'], [Number.NaN], 'w')).toBeNull()
  })

  it('never flags White\'s first move (no measurable pre-game baseline)', () => {
    /* A White game from a lopsided start: ply 0 must not be graded, even
       though the post-move eval is far from zero. */
    const sanLog = ['Qxa8', 'e5', 'Nf3', 'Nc6', 'Bc4', 'd6']
    const evalTrace = [900, 880, 890, 885, 895, 890]
    const m = findCostliestMoment(sanLog, evalTrace, 'w')
    expect(m).toBeNull()
  })

  it('formats ply move labels for both colors', () => {
    expect(plyMoveLabel(0)).toBe('1.')
    expect(plyMoveLabel(1)).toBe('1...')
    expect(plyMoveLabel(8)).toBe('5.')
    expect(plyMoveLabel(9)).toBe('5...')
  })
})

describe('verifyCostliestMoment', () => {
  const sanLog = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6']
  const fens = sanLog.map((_, i) => `fen${i}`).concat('fen8')
  /* Shallow trace: ply 2 looks worst (-300), ply 4 a smaller dip, ply 6 flat. */
  const trace = [25, 20, -300, 30, -150, -140, -130, -135]
  const engine = (roots: Record<string, Array<{ san: string; score: number }>>, positions: Record<string, number> = {}) => ({
    scoreRoots: (fen: string) => roots[fen] ?? null,
    scorePosition: (fen: string) => positions[fen] ?? null,
  })

  it('drops a trace dip on the archive\'s own best move and teaches the real one', () => {
    const m = verifyCostliestMoment(sanLog, trace, fens, 'w', engine({
      fen2: [{ san: 'Nf3', score: 30 }, { san: 'd4', score: 25 }],
      fen4: [{ san: 'd4', score: 40 }, { san: 'Bb5', score: -210 }],
    }))
    expect(m).not.toBeNull()
    expect(m!.ply).toBe(4)
    expect(m!.preferredSan).toBe('d4')
    expect(m!.dropCp).toBe(250)
    expect(costliestLessonLine(m!)).toBe('3. Bb5 cost about 2.5 pawns — the archive preferred d4.')
  })

  it('counts the fall after the rival\'s actual reply when the spectrum misses it', () => {
    const m = verifyCostliestMoment(sanLog, trace, fens, 'w', engine(
      { fen2: [{ san: 'd4', score: 40 }, { san: 'Nf3', score: 20 }] },
      { fen4: -400 },
    ))
    expect(m?.ply).toBe(2)
    expect(m?.dropCp).toBe(440)
  })

  it('never blames the archive\'s own best move for a fall that was already coming', () => {
    /* "38. Kh2 cost about 9.3 pawns": the only good move, in a lost position. */
    expect(verifyCostliestMoment(sanLog, trace, fens, 'w', engine(
      { fen2: [{ san: 'Nf3', score: -500 }, { san: 'd4', score: -900 }] },
      { fen4: -1200 },
    ))).toBeNull()
  })

  it('stays silent when nothing truly cost a pawn', () => {
    expect(verifyCostliestMoment(sanLog, trace, fens, 'w', engine({
      fen2: [{ san: 'd4', score: 40 }, { san: 'Nf3', score: 0 }],
      fen4: [{ san: 'd4', score: 40 }, { san: 'Bb5', score: -20 }],
    }))).toBeNull()
    expect(verifyCostliestMoment(sanLog, trace, fens, 'w', engine({}))).toBeNull()
  })

  it('names allowed and missed mates instead of a pawn count', () => {
    const allowed = verifyCostliestMoment(sanLog, trace, fens, 'w', engine({
      fen2: [{ san: 'd4', score: 10 }, { san: 'Nf3', score: -29_990 }],
    }))
    expect(allowed?.allowedMate).toBe(true)
    expect(costliestLessonLine(allowed!)).toBe('2. Nf3 allowed a forced mate — the archive preferred d4.')
    const missed = verifyCostliestMoment(sanLog, trace, fens, 'w', engine({
      fen2: [{ san: 'Qxf7#', score: 29_999 }, { san: 'Nf3', score: 50 }],
    }))
    expect(costliestLessonLine(missed!)).toBe('2. Nf3 missed a forced mate — Qxf7# was the finish.')
  })

  it('ranks candidates by the dip after the move or after the reply', () => {
    /* Ply 2 is flat on its own but the reply exposes it. */
    expect(costlyCandidates(['e4', 'e5', 'Nf3', 'Nc6'], [25, 20, 15, -400], 'w')[0]?.ply).toBe(2)
  })
})
