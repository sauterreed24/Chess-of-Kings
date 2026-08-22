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
    expect(carved).toContain('class="piece-collar"')
    expect(carved).toContain('class="piece-plinth"')
    expect(carved).toContain('class="piece-waist"')
    expect(carved).toContain('class="piece-rim"')
    expect(carved).toContain('class="piece-neck"')
    expect(carved).toContain('class="piece-flute"')
    expect(carved).toContain('class="piece-umbra"')
    expect(carved).toContain('feSpecularLighting')
    expect(carved).toContain('feDiffuseLighting')
    expect(carved).toContain('linearGradient')
    expect(carved).toMatch(/fill="url\(#pl\d+g\)"/)
    expect(carved).toContain('rgba(255,255,255,0.36)')
    expect(carveGlyph(carved, 'w')).toBe(carved)
  })

  it('keeps lathe rings and lamp filters after HTML innerHTML', () => {
    const host = document.createElement('div')
    host.innerHTML = carveGlyph('<svg><path fill="var(--piece-fill)" d="M1"/></svg>', 'w', 'p')
    expect(host.querySelector('.piece-plinth')).toBeTruthy()
    expect(host.querySelector('.piece-waist')).toBeTruthy()
    expect(host.querySelector('.piece-rim')).toBeTruthy()
    expect(host.querySelector('.piece-neck')).toBeTruthy()
    expect(host.querySelector('.piece-flute')).toBeTruthy()
    expect(host.querySelector('.piece-umbra')).toBeTruthy()
    expect(host.querySelector('feDiffuseLighting')).toBeTruthy()
    expect(host.querySelectorAll('fePointLight')).toHaveLength(3)
    expect(host.querySelectorAll('feSpecularLighting')).toHaveLength(2)
  })

  it('uses a gold sheen on black pieces', () => {
    expect(carveGlyph('<svg></svg>', 'b')).toContain('rgba(232,201,126,0.32)')
    expect(carveGlyph('<svg></svg>', 'b')).toContain('#7aa8d4')
  })

  it('gives each piece type a distinct sheen path', () => {
    const pawn = carveGlyph('<svg></svg>', 'w', 'p')
    const king = carveGlyph('<svg></svg>', 'w', 'k')
    const rook = carveGlyph('<svg></svg>', 'w', 'r')
    expect(pawn).not.toBe(king)
    expect(king).not.toBe(rook)
    expect(pawn).toContain('rx="8.4"')
    expect(rook).toContain('rx="11.4"')
    expect(pawn).toContain('cy="31.8"')
    expect(rook).toContain('cy="34.6"')
    expect(pawn).toContain('class="piece-neck"')
    expect(pawn).toContain('class="piece-plinth"')
    expect(pawn).toContain('class="piece-waist"')
    expect(pawn).toContain('class="piece-flute"')
    expect(pawn).toContain('class="piece-umbra"')
    expect(pawn).toContain('cx="26.8"')
    expect(pawn).toContain('cy="35.1"')
    const knight = carveGlyph('<svg></svg>', 'w', 'n')
    expect(knight).toContain('class="piece-plinth"')
    expect(knight).toContain('class="piece-waist"')
    expect(knight).toContain('class="piece-flute"')
    expect(knight).toContain('class="piece-umbra"')
    expect(knight).not.toContain('class="piece-neck"')
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

  it('skips specular lighting when visual quality is forced lean', () => {
    const prev = globalThis.localStorage?.getItem('cok-visual-quality')
    globalThis.localStorage?.setItem('cok-visual-quality', 'lean')
    try {
      const carved = carveGlyph('<svg><path fill="var(--piece-fill)" d="M1"/></svg>', 'w', 'p')
      expect(carved).toContain('class="piece-lit"')
      expect(carved).toContain('linearGradient')
      expect(carved).not.toContain('feSpecularLighting')
      expect(carved).not.toContain('feDiffuseLighting')
      expect(carved).toContain('class="piece-plinth"')
      expect(carved).toContain('class="piece-waist"')
      expect(carved).toContain('class="piece-flute"')
      expect(carved).toContain('class="piece-umbra"')
      expect(carved).not.toContain(' filter=')
    } finally {
      if (prev == null) globalThis.localStorage?.removeItem('cok-visual-quality')
      else globalThis.localStorage?.setItem('cok-visual-quality', prev)
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
    expect(pawn).toContain('piece-collar')
    expect(pawn).toContain('piece-plinth')
    expect(pawn).toContain('piece-waist')
    expect(pawn).toContain('piece-rim')
    expect(pawn).toContain('piece-neck')
    expect(pawn).toContain('piece-flute')
    expect(pawn).toContain('piece-umbra')
    expect(pawn).toContain('feSpecularLighting')
    expect(pawn).toContain('feDiffuseLighting')
    expect(glyphForSkin('alexandrine-ornate', 'b', 'k')).toContain('piece-carve')
  })

  it('leaves high-contrast glyphs uncarved for tournament readability', () => {
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-carve')
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-lit')
    expect(glyphForSkin('high-contrast', 'w', 'q')).not.toContain('piece-umbra')
  })
})
