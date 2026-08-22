import { describe, expect, it } from 'vitest'
import { paintTitleHonor } from './titleHonor'

describe('paintTitleHonor', () => {
  it('plants ten carved classic-royal glyphs', () => {
    const root = document.createElement('div')
    paintTitleHonor(root)
    expect(root.querySelectorAll('.title-honor__piece')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-carve')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-lit')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-collar')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-plinth')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-waist')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-rim')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-neck')).toHaveLength(8)
    expect(root.querySelectorAll('.piece-flute')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-umbra')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-cup')).toHaveLength(8)
    expect(root.querySelectorAll('.piece-ferrule')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-mane')).toHaveLength(2)
    expect(root.querySelectorAll('.piece-ground')).toHaveLength(10)
    expect(root.querySelectorAll('feSpecularLighting')).toHaveLength(20)
    expect(root.querySelectorAll('feDiffuseLighting')).toHaveLength(10)
    expect(root.querySelectorAll('fePointLight')).toHaveLength(30)
    expect(root.querySelectorAll('.piece--w')).toHaveLength(5)
    expect(root.querySelectorAll('.piece--b')).toHaveLength(5)
    paintTitleHonor(root)
    expect(root.querySelectorAll('.title-honor__piece')).toHaveLength(10)
  })

  it('ignores a missing root', () => {
    expect(() => paintTitleHonor(null)).not.toThrow()
  })
})
