import { afterEach, describe, expect, it, vi } from 'vitest'
import { PHONE_LAB_NAV_QUERY } from '../labModal'
import { paintTitleHonor } from './titleHonor'

describe('paintTitleHonor', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('plants ten carved classic-royal glyphs', () => {
    const root = document.createElement('div')
    paintTitleHonor(root)
    expect(root.querySelectorAll('.title-honor__piece')).toHaveLength(10)
    expect(root.querySelector('.title-honor__row')).not.toBeNull()
    expect(root.querySelectorAll('g[stroke-width="2.4"]').length).toBeGreaterThan(0)
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
    expect(root.querySelectorAll('.piece-pearl')).toHaveLength(10)
    expect(root.querySelectorAll('.piece-merlon')).toHaveLength(4)
    expect(root.querySelectorAll('.knight-silhouette')).toHaveLength(2)
    expect(root.querySelectorAll('.bishop-silhouette')).toHaveLength(2)
    expect(root.querySelectorAll('.queen-silhouette')).toHaveLength(2)
    expect(root.querySelectorAll('.rook-silhouette')).toHaveLength(2)
    expect(root.querySelectorAll('.pawn-silhouette')).toHaveLength(0)
    expect(root.querySelectorAll('.king-silhouette')).toHaveLength(2)
    expect(root.querySelectorAll('.king-cross-stem')).toHaveLength(2)
    expect(root.querySelectorAll('.king-cross-bar')).toHaveLength(2)
    expect(root.querySelectorAll('.rook-crenel')).toHaveLength(4)
    expect(root.querySelectorAll('.queen-orb')).toHaveLength(10)
    expect(root.querySelectorAll('.bishop-cleft-stem')).toHaveLength(2)
    expect(root.querySelectorAll('.piece-cleft')).toHaveLength(4)
    expect(root.querySelectorAll('.piece-cross')).toHaveLength(4)
    expect(root.querySelectorAll('.piece-orb')).toHaveLength(0)
    expect(root.querySelectorAll('.piece-spark')).toHaveLength(0)
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

  it('scales the honor guard into two ranks on phone', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === PHONE_LAB_NAV_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }))
    const root = document.createElement('div')
    paintTitleHonor(root)
    const row = root.querySelector<HTMLElement>('.title-honor__row')!
    const piece = root.querySelector<HTMLElement>('.title-honor__piece')!
    expect(row.style.flexWrap).toBe('wrap')
    expect(row.style.width).toBe('13.2rem')
    expect(piece.style.width).toBe('2.4rem')
    expect(piece.style.height).toBe('2.4rem')
  })
})
