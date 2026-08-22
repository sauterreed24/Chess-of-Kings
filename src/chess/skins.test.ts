import { describe, expect, it } from 'vitest'
import { carveGlyph, glyphForSkin } from './skins'

describe('carveGlyph', () => {
  it('plants a foot shadow, crown sheen, and lamp-lit body on a raw Staunton svg', () => {
    const raw = '<svg class="svg-piece" viewBox="0 0 45 45"><path fill="var(--piece-fill)" d="M1"/></svg>'
    const carved = carveGlyph(raw, 'w')
    expect(carved).toContain('class="piece-foot"')
    expect(carved).toContain('class="piece-carve"')
    expect(carved).toContain('class="piece-ground"')
    expect(carved).toContain('class="piece-lit"')
    expect(carved).toContain('feSpecularLighting')
    expect(carved).toContain('linearGradient')
    expect(carved).toMatch(/fill="url\(#pl\d+g\)"/)
    expect(carved).toContain('rgba(255,255,255,0.32)')
    expect(carveGlyph(carved, 'w')).toBe(carved)
  })

  it('uses a gold sheen on black pieces', () => {
    expect(carveGlyph('<svg></svg>', 'b')).toContain('rgba(232,201,126,0.28)')
    expect(carveGlyph('<svg></svg>', 'b')).toContain('#4a7aa8')
  })

  it('gives each piece type a distinct sheen path', () => {
    const pawn = carveGlyph('<svg></svg>', 'w', 'p')
    const king = carveGlyph('<svg></svg>', 'w', 'k')
    const rook = carveGlyph('<svg></svg>', 'w', 'r')
    expect(pawn).not.toBe(king)
    expect(king).not.toBe(rook)
    expect(pawn).toContain('rx="8.4"')
    expect(rook).toContain('rx="11.4"')
  })

  it('assigns unique lamp ids so neighboring glyphs do not clash', () => {
    const a = carveGlyph('<svg fill="var(--piece-fill)"></svg>', 'w', 'p')
    const b = carveGlyph('<svg fill="var(--piece-fill)"></svg>', 'w', 'p')
    const idA = a.match(/url\(#(pl\d+f)\)/)?.[1]
    const idB = b.match(/url\(#(pl\d+f)\)/)?.[1]
    expect(idA).toBeTruthy()
    expect(idB).toBeTruthy()
    expect(idA).not.toBe(idB)
  })

  it('skips specular lighting in lean performance mode', () => {
    document.documentElement.classList.add('perf-lean')
    try {
      const carved = carveGlyph('<svg><path fill="var(--piece-fill)" d="M1"/></svg>', 'w', 'p')
      expect(carved).toContain('class="piece-lit"')
      expect(carved).toContain('linearGradient')
      expect(carved).not.toContain('feSpecularLighting')
      expect(carved).not.toContain(' filter=')
    } finally {
      document.documentElement.classList.remove('perf-lean')
    }
  })
})

describe('glyphForSkin', () => {
  it('carves classic royal ivory and lapis pieces with lamp lighting', () => {
    const pawn = glyphForSkin('classic-royal', 'w', 'p')
    expect(pawn).toContain('class="svg-piece"')
    expect(pawn).toContain('piece-carve')
    expect(pawn).toContain('piece-foot')
    expect(pawn).toContain('piece-ground')
    expect(pawn).toContain('piece-lit')
    expect(pawn).toContain('feSpecularLighting')
    expect(glyphForSkin('alexandrine-ornate', 'b', 'k')).toContain('piece-carve')
  })

  it('leaves high-contrast glyphs uncarved for tournament readability', () => {
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-carve')
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-lit')
  })
})
