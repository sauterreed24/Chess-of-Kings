/**
 * Pass 147 regression locks for text legibility. The dim text tokens carry
 * kickers, chapter indices, speaker names, and captions; at #7d6a38 / #8a8275
 * they measured ~3.5:1 on the panels. These read the stylesheet source (like
 * reducedMotion.test.ts) and check WCAG AA (4.5:1) against the panel tokens.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CSS = readFileSync(resolve(HERE, '..', 'style.css'), 'utf8')

function token(name: string): string {
  const m = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`).exec(CSS)
  expect(m, `missing ${name}`).not.toBeNull()
  return m![1]!
}

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

function ruleBody(selector: string): string {
  const at = CSS.indexOf(`${selector} {`)
  expect(at, `missing rule ${selector}`).toBeGreaterThanOrEqual(0)
  const open = CSS.indexOf('{', at)
  return CSS.slice(open + 1, CSS.indexOf('}', open))
}

describe('text tokens', () => {
  for (const text of ['--gold-dim', '--muted']) {
    for (const surface of ['--ink', '--panel', '--panel-elevated']) {
      it(`${text} reads at AA on ${surface}`, () => {
        expect(contrast(token(text), token(surface))).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it('keeps --gold-dim visibly dimmer than --gold so the label hierarchy survives', () => {
    expect(luminance(token('--gold-dim'))).toBeLessThan(luminance(token('--gold')) * 0.8)
  })
})

describe('labels on tinted surfaces', () => {
  it('lifts dialogue speaker names toward white over their own voice tint', () => {
    expect(CSS).toMatch(/\.line \.who \{ color: color-mix\(in srgb, rgb\(var\(--v\)\) 55%, #fff\); text-shadow: 0 1px 2px #000; \}/)
  })

  it('draws the title kicker in bright gold with a dark lift over the hero glow', () => {
    const body = ruleBody('.kicker')
    expect(body).toMatch(/color:\s*var\(--gold-bright\)/)
    expect(body).toMatch(/text-shadow:/)
  })
})

describe('duel archive layout', () => {
  it('gives rival rows one column so names are not squeezed by the stamp', () => {
    expect(ruleBody('.duel-row')).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\);/)
  })

  it('sets selects to 1rem so they read in Cormorant and iOS does not zoom on focus', () => {
    expect(CSS).toMatch(/\.duel-select \{[^}]*font-size:\s*1rem;/)
  })
})
