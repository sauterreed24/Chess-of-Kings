import { describe, it, expect } from 'vitest'
import { Chess, DEFAULT_POSITION } from 'chess.js'
import { PLAYABLE_CHAPTERS } from './chapters'
import { materialAndPst } from '../chess/evaluate'

function materialAdvantage(chess: Chess, forColor: 'w' | 'b'): number {
  return materialAndPst(chess, forColor)
}

describe('campaign story beats', () => {
  it('gives every campaign match explicit story stakes', () => {
    const matches = PLAYABLE_CHAPTERS.flatMap((chapter) =>
      chapter.scenes.filter((scene) => scene.type === 'match'),
    )

    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every((scene) => scene.storyBeat)).toBe(true)
  })

  it('authors Chapter IV as a playable Paradox Masters arc', () => {
    const ch4 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch4')
    expect(ch4).toBeTruthy()
    expect(ch4?.subtitle).toMatch(/Paradox/)
    const matches = ch4?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c4-match-nysa', 'c4-match-cassian'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'hypermodern')).toBe(true)
    const nysa = matches.find((scene) => scene.id === 'c4-match-nysa')
    const cassian = matches.find((scene) => scene.id === 'c4-match-cassian')
    expect(nysa?.type === 'match' && nysa.scriptedBlackSans?.[0]).toBe('g6')
    expect(cassian?.type === 'match' && cassian.scriptedBlackSans?.[0]).toBe('Nf6')
    const puzzles = ch4?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c4-puzzle-fianchetto', 'c4-puzzle-overreach', 'c4-puzzle-battery']),
    )
    const intro = ch4?.scenes.find((scene) => scene.id === 'c4-intro')
    const codex = ch4?.scenes.find((scene) => scene.id === 'c4-codex-paradox')
    const reflection = ch4?.scenes.find((scene) => scene.id === 'c4-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('committee')
      expect(spoken).toContain('Bactrian')
      expect(intro.lines.some((line) => line.speaker === 'kallistos')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('Bactrian Frontier')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('amend the file')
    }
  })

  it('authors Chapter V as a playable Machine of Discipline arc', () => {
    const ch5 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch5')
    expect(ch5).toBeTruthy()
    expect(ch5?.subtitle).toMatch(/Machine of Discipline/)
    expect(ch5?.themeClass).toBe('theme-classical')
    const matches = ch5?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c5-match-gage', 'c5-match-helia'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'soviet')).toBe(true)
    const gage = matches.find((scene) => scene.id === 'c5-match-gage')
    const helia = matches.find((scene) => scene.id === 'c5-match-helia')
    expect(gage?.type === 'match' && gage.scriptedBlackSans?.[0]).toBe('d6')
    expect(helia?.type === 'match' && helia.scriptedBlackSans?.[0]).toBe('e6')
    const puzzles = ch5?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c5-puzzle-luft', 'c5-puzzle-conversion', 'c5-puzzle-squeeze']),
    )
    const intro = ch5?.scenes.find((scene) => scene.id === 'c5-intro')
    const codex = ch5?.scenes.find((scene) => scene.id === 'c5-codex-discipline')
    const reflection = ch5?.scenes.find((scene) => scene.id === 'c5-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('Gage')
      expect(spoken).toContain('Helia')
      expect(intro.lines.some((line) => line.speaker === 'cassian')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('Discipline colleges')
      expect(codex.entries.map((entry) => entry.term)).toContain('Luft')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('amend the file again')
    }
  })

  it('anchors the Prologue in the Long Reign modern commonwealth', () => {
    const prologue = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'prologue')
    const codex = prologue?.scenes.find((scene) => scene.id === 'pr-codex-long-reign')
    expect(codex?.type).toBe('codex')
    if (codex?.type !== 'codex') return
    const terms = codex.entries.map((entry) => entry.term).join(' ')
    const body = codex.entries.map((entry) => entry.body).join(' ')
    expect(terms).toContain('Alexander III')
    expect(terms).toContain('Chaturanga West')
    expect(terms).toContain('Stratarch Rating')
    expect(body).toContain('brass-lapis terminal')
  })

  it('keeps Reed and the Archive natural in the opening calibration beats', () => {
    const prologue = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'prologue')
    const apartment = prologue?.scenes.find((scene) => scene.id === 'pr-apartment')
    const trainer = prologue?.scenes.find((scene) => scene.id === 'pr-trainer')
    expect(apartment?.type).toBe('dialogue')
    expect(trainer?.type).toBe('dialogue')
    if (apartment?.type !== 'dialogue' || trainer?.type !== 'dialogue') return

    const reedAside = apartment.lines.find((line) => line.speaker === 'reed')?.text ?? ''
    const systemLines = trainer.lines.filter((line) => line.speaker === 'system').map((line) => line.text).join(' ')
    expect(reedAside).toContain('Any school in history')
    expect(reedAside).not.toMatch(/^"/)
    expect(systemLines).toContain('no examiner is watching')
    expect(systemLines).toContain('The record begins now')
    expect(systemLines).not.toContain('Calibration sequence initiated')
  })
})

describe('PLAYABLE_CHAPTERS — FENs & solvable goals', () => {
  for (const ch of PLAYABLE_CHAPTERS) {
    for (const sc of ch.scenes) {
      if (sc.type === 'puzzle') {
        it(`${ch.id} / ${sc.id}: FEN loads`, () => {
          expect(() => new Chess(sc.fen)).not.toThrow()
        })

        if (sc.goal.kind === 'mate') {
          it(`${ch.id} / ${sc.id}: at least one move checkmates`, () => {
            const c = new Chess(sc.fen)
            expect(c.turn()).toBe(sc.playerColor)
            const startFen = c.fen()
            const mates = c.moves().filter((san) => {
              const t = new Chess(startFen)
              t.move(san)
              return t.isCheckmate()
            })
            expect(mates.length).toBeGreaterThan(0)
          })
        }

        if (sc.goal.kind === 'advantage') {
          const goal = sc.goal
          it(`${ch.id} / ${sc.id}: some capture reaches the advantage threshold`, () => {
            const c = new Chess(sc.fen)
            const captures = c.moves({ verbose: true }).filter((m) => m.captured)
            expect(captures.length).toBeGreaterThan(0)
            const reached = captures.some((m) => {
              const t = new Chess(sc.fen)
              t.move(m.san)
              return materialAdvantage(t, sc.playerColor) >= goal.minCp
            })
            expect(reached).toBe(true)
          })
        }

        if (sc.goal.kind === 'pieceOn') {
          const goal = sc.goal
          it(`${ch.id} / ${sc.id}: a legal move places the goal piece`, () => {
            const c = new Chess(sc.fen)
            expect(c.turn()).toBe(sc.playerColor)
            const hits = c.moves({ verbose: true }).filter(
              (m) =>
                m.to === goal.square &&
                m.piece === goal.pieceType &&
                (goal.pieceType !== 'k' || m.san === 'O-O' || m.san === 'O-O-O' || m.to === goal.square),
            )
            expect(hits.length).toBeGreaterThan(0)
          })
        }
      }

      if (sc.type === 'match') {
        it(`${ch.id} / ${sc.id}: match FEN loads`, () => {
          expect(() => new Chess(sc.fen ?? DEFAULT_POSITION)).not.toThrow()
        })
      }

      if ('storyBeat' in sc && sc.storyBeat) {
        it(`${ch.id} / ${sc.id}: story beat copy is complete`, () => {
          expect(sc.storyBeat?.label.trim()).toBeTruthy()
          expect(sc.storyBeat?.title.trim()).toBeTruthy()
          expect(sc.storyBeat?.body.trim()).toBeTruthy()
          expect(['quiet', 'pressure', 'fire', undefined]).toContain(sc.storyBeat?.tone)
        })
      }
    }
  }
})
