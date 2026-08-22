import { describe, it, expect } from 'vitest'
import { Chess, DEFAULT_POSITION } from 'chess.js'
import { PLAYABLE_CHAPTERS } from './chapters'
import { materialAndPst } from '../chess/evaluate'

function materialAdvantage(chess: Chess, forColor: 'w' | 'b'): number {
  return materialAndPst(chess, forColor)
}

describe('campaign story beats', () => {
  it('keeps every teaching-puzzle instrument command under 80 characters', () => {
    const overlong = PLAYABLE_CHAPTERS.flatMap((chapter) =>
      chapter.scenes.flatMap((scene) => {
        if (scene.type !== 'puzzle') return []
        const command = scene.teaching.goalBrief ?? scene.teaching.goalPlain
        return command.length >= 80 ? [`${scene.id} (${command.length})`] : []
      }),
    )
    expect(overlong).toEqual([])
  })

  it('authors Chapter III Demetrios return with a classical e5 reply', () => {
    const ch3 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch3')
    const drill = ch3?.scenes.find((scene) => scene.id === 'c3-puzzle-prophylaxis')
    const demetrios = ch3?.scenes.find((scene) => scene.id === 'c3-match-demetrios-return')
    expect(drill?.type === 'puzzle' && (drill.teaching.goalBrief ?? drill.teaching.goalPlain).length).toBeLessThan(80)
    expect(drill?.type === 'puzzle' && drill.teaching.goalBrief).toMatch(/e-file/i)
    expect(demetrios?.type === 'match' && demetrios.scriptedBlackSans?.[0]).toBe('e5')
    expect(demetrios?.type === 'match' && !demetrios.fen).toBe(true)
    const board = new Chess()
    expect(board.move('e4')).toBeTruthy()
    expect(board.move('e5')).toBeTruthy()
  })

  it('authors Chapter II Rowan from a King\'s Gambit tabiya', () => {
    const ch2 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch2')
    const hunt = ch2?.scenes.find((scene) => scene.id === 'c2-puzzle-king-hunt')
    const rowan = ch2?.scenes.find((scene) => scene.id === 'c2-match-rowan')
    expect(hunt?.type === 'puzzle' && (hunt.teaching.goalBrief ?? hunt.teaching.goalPlain).length).toBeLessThan(80)
    expect(hunt?.type === 'puzzle' && hunt.teaching.goalBrief).toMatch(/eighth rank/i)
    expect(rowan?.type === 'match' && rowan.scriptedBlackSans?.[0]).toBe('exf4')
    expect(rowan?.type === 'match' && rowan.fen).toContain('4PP2')
    if (rowan?.type !== 'match' || !rowan.fen) return
    const board = new Chess(rowan.fen)
    expect(board.move('Nf3')).toBeTruthy()
    expect(board.move('exf4')).toBeTruthy()
  })

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
    expect(ch4?.scenes.findIndex((scene) => scene.id === 'c4-before-cassian')).toBe(9)
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
    expect(ch5?.scenes.findIndex((scene) => scene.id === 'c5-before-helia')).toBe(9)
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

  it('authors Chapter VI as a playable Silicon Threshold arc', () => {
    const ch6 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch6')
    expect(ch6).toBeTruthy()
    expect(ch6?.subtitle).toMatch(/Silicon Threshold/)
    expect(ch6?.themeClass).toBe('theme-classical')
    const matches = ch6?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c6-match-prax', 'c6-match-iota'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'engine')).toBe(true)
    const prax = matches.find((scene) => scene.id === 'c6-match-prax')
    const iota = matches.find((scene) => scene.id === 'c6-match-iota')
    expect(prax?.type === 'match' && prax.scriptedBlackSans?.[0]).toBe('c5')
    expect(iota?.type === 'match' && iota.scriptedBlackSans?.[0]).toBe('c6')
    expect(ch6?.scenes.findIndex((scene) => scene.id === 'c6-before-iota')).toBe(9)
    const puzzles = ch6?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c6-puzzle-outpost', 'c6-puzzle-precision', 'c6-puzzle-backrank']),
    )
    const intro = ch6?.scenes.find((scene) => scene.id === 'c6-intro')
    const codex = ch6?.scenes.find((scene) => scene.id === 'c6-codex-ledger')
    const reflection = ch6?.scenes.find((scene) => scene.id === 'c6-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('Prax')
      expect(spoken).toContain('Iota')
      expect(intro.lines.some((line) => line.speaker === 'helia')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('Ledger engine')
      expect(codex.entries.map((entry) => entry.term)).toContain('Outpost')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('without vanishing into it')
    }
  })

  it('authors Chapter VII as a playable Human Synthesis arc', () => {
    const ch7 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch7')
    expect(ch7).toBeTruthy()
    expect(ch7?.subtitle).toMatch(/Human Synthesis/)
    expect(ch7?.themeClass).toBe('theme-classical')
    const matches = ch7?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c7-match-mira', 'c7-match-soren'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'universal')).toBe(true)
    const mira = matches.find((scene) => scene.id === 'c7-match-mira')
    const soren = matches.find((scene) => scene.id === 'c7-match-soren')
    expect(mira?.type === 'match' && mira.scriptedBlackSans?.[0]).toBe('e5')
    expect(soren?.type === 'match' && soren.scriptedBlackSans?.[0]).toBe('g6')
    expect(ch7?.scenes.findIndex((scene) => scene.id === 'c7-before-soren')).toBe(9)
    const puzzles = ch7?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c7-puzzle-switch', 'c7-puzzle-wing', 'c7-puzzle-smother']),
    )
    const intro = ch7?.scenes.find((scene) => scene.id === 'c7-intro')
    const codex = ch7?.scenes.find((scene) => scene.id === 'c7-codex-synthesis')
    const reflection = ch7?.scenes.find((scene) => scene.id === 'c7-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('Mira')
      expect(spoken).toContain('Soren')
      expect(intro.lines.some((line) => line.speaker === 'iota')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('School switch')
      expect(codex.entries.map((entry) => entry.term)).toContain('Human Synthesis')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('without becoming a costume trunk')
    }
  })

  it('authors Chapter VIII as a playable Alexandrine Board arc', () => {
    const ch8 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch8')
    expect(ch8).toBeTruthy()
    expect(ch8?.subtitle).toMatch(/Alexandrine Board/)
    expect(ch8?.themeClass).toBe('theme-classical')
    const matches = ch8?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c8-match-voss', 'c8-match-elara'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'alexandrine')).toBe(true)
    const voss = matches.find((scene) => scene.id === 'c8-match-voss')
    const elara = matches.find((scene) => scene.id === 'c8-match-elara')
    expect(voss?.type === 'match' && voss.scriptedBlackSans?.[0]).toBe('d5')
    expect(elara?.type === 'match' && elara.scriptedBlackSans?.[0]).toBe('c5')
    expect(ch8?.scenes.findIndex((scene) => scene.id === 'c8-before-elara')).toBe(9)
    const puzzles = ch8?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c8-puzzle-exchange', 'c8-puzzle-fork', 'c8-puzzle-file']),
    )
    const intro = ch8?.scenes.find((scene) => scene.id === 'c8-intro')
    const codex = ch8?.scenes.find((scene) => scene.id === 'c8-codex-board')
    const reflection = ch8?.scenes.find((scene) => scene.id === 'c8-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('Voss')
      expect(spoken).toContain('Elara')
      expect(intro.lines.some((line) => line.speaker === 'soren')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('Sovereign exchange')
      expect(codex.entries.map((entry) => entry.term)).toContain('Alexandrine Board')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('without starting a war')
    }
  })

  it('authors Chapter IX as a playable Apotheosis Engine arc', () => {
    const ch9 = PLAYABLE_CHAPTERS.find((chapter) => chapter.id === 'ch9')
    expect(ch9).toBeTruthy()
    expect(ch9?.subtitle).toMatch(/Apotheosis Engine/)
    expect(ch9?.themeClass).toBe('theme-classical')
    const matches = ch9?.scenes.filter((scene) => scene.type === 'match') ?? []
    expect(matches.map((scene) => scene.id)).toEqual(['c9-match-wren', 'c9-match-bram'])
    expect(matches.every((scene) => scene.type === 'match' && scene.aiStyle === 'apotheosis')).toBe(true)
    const wren = matches.find((scene) => scene.id === 'c9-match-wren')
    const bram = matches.find((scene) => scene.id === 'c9-match-bram')
    expect(wren?.type === 'match' && wren.scriptedBlackSans?.[0]).toBe('e5')
    expect(bram?.type === 'match' && bram.scriptedBlackSans?.[0]).toBe('Nf6')
    expect(ch9?.scenes.findIndex((scene) => scene.id === 'c9-before-bram')).toBe(9)
    const puzzles = ch9?.scenes.filter((scene) => scene.type === 'puzzle') ?? []
    expect(puzzles.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(['c9-puzzle-census', 'c9-puzzle-compile', 'c9-puzzle-last-rank']),
    )
    const intro = ch9?.scenes.find((scene) => scene.id === 'c9-intro')
    const codex = ch9?.scenes.find((scene) => scene.id === 'c9-codex-engine')
    const reflection = ch9?.scenes.find((scene) => scene.id === 'c9-reflection')
    expect(intro?.type).toBe('dialogue')
    expect(codex?.type).toBe('codex')
    expect(reflection?.type).toBe('dialogue')
    if (intro?.type === 'dialogue') {
      const spoken = intro.lines.map((line) => line.text).join(' ')
      expect(spoken).toContain('Wren')
      expect(spoken).toContain('Bram')
      expect(intro.lines.some((line) => line.speaker === 'elara')).toBe(true)
    }
    if (codex?.type === 'codex') {
      expect(codex.entries.map((entry) => entry.term)).toContain('Habit census')
      expect(codex.entries.map((entry) => entry.term)).toContain('Apotheosis Engine')
    }
    if (reflection?.type === 'dialogue') {
      expect(reflection.lines.map((line) => line.text).join(' ')).toContain('after the archive has watched')
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
