import { describe, expect, it } from 'vitest'
import { carveGlyph, glyphForSkin } from './skins'

describe('carveGlyph', () => {
  it('plants a foot shadow and crown sheen on a raw Staunton svg', () => {
    const raw = '<svg class="svg-piece" viewBox="0 0 45 45"><path d="M1"/></svg>'
    const carved = carveGlyph(raw, 'w')
    expect(carved).toContain('class="piece-foot"')
    expect(carved).toContain('class="piece-carve"')
    expect(carved).toContain('class="piece-shade"')
    expect(carved).toContain('class="piece-rim"')
    expect(carved).toContain('class="piece-ground"')
    expect(carved).toContain('rgba(255,255,255,0.48)')
    expect(carveGlyph(carved, 'w')).toBe(carved)
  })

  it('uses a gold sheen on black pieces', () => {
    expect(carveGlyph('<svg></svg>', 'b')).toContain('rgba(232,201,126,0.38)')
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
})

describe('glyphForSkin', () => {
  it('carves classic royal ivory and lapis pieces', () => {
    const pawn = glyphForSkin('classic-royal', 'w', 'p')
    expect(pawn).toContain('class="svg-piece"')
    expect(pawn).toContain('piece-carve')
    expect(pawn).toContain('piece-foot')
    expect(pawn).toContain('piece-shade')
    expect(pawn).toContain('piece-rim')
    expect(pawn).toContain('piece-ground')
    expect(glyphForSkin('alexandrine-ornate', 'b', 'k')).toContain('piece-carve')
  })

  it('leaves high-contrast glyphs uncarved for tournament readability', () => {
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-carve')
  })
})
