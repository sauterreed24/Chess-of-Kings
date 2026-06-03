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
          it(`${ch.id} / ${sc.id}: Bxd4+ wins enough material`, () => {
            const c = new Chess(sc.fen)
            const captures = c.moves({ verbose: true }).filter((m) => m.captured)
            expect(captures.length).toBeGreaterThan(0)
            const t = new Chess(sc.fen)
            t.move('Bxd4+')
            expect(materialAdvantage(t, sc.playerColor)).toBeGreaterThanOrEqual(goal.minCp)
          })
        }

        if (sc.goal.kind === 'pieceOn') {
          it(`${ch.id} / ${sc.id}: castling is legal`, () => {
            const c = new Chess(sc.fen)
            expect(c.moves().some((m) => m === 'O-O' || m === 'O-O-O')).toBe(true)
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
