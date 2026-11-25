/**
 * Pass 145 regression locks for the compact board on touch phones.
 *
 * On a 390×664 Safari viewport the global coarse-pointer button floor
 * (2.6rem) gave each of the 64 square buttons a 44px height, so eight rows
 * overflowed the overflow-hidden grid and whole ranks disappeared. The compact
 * rule also capped height at a fixed 42vh while width followed the measured
 * fit, leaving a non-square marble. Layout is not available under vitest, so
 * these read the stylesheet source, like reducedMotion.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CSS = readFileSync(resolve(HERE, '..', 'style.css'), 'utf8')

function ruleBody(selector: string, from = 0): string {
  const at = CSS.indexOf(`${selector} {`, from)
  expect(at, `missing rule ${selector}`).toBeGreaterThanOrEqual(0)
  const open = CSS.indexOf('{', at)
  return CSS.slice(open + 1, CSS.indexOf('}', open))
}

describe('compact board fit CSS', () => {
  it('keeps the coarse-pointer button floor off board squares', () => {
    expect(CSS).not.toMatch(/\.coarse-pointer button\s*\{/)
    expect(ruleBody('.coarse-pointer button:not(.sq)')).toMatch(/min-height:\s*2\.6rem/)
  })

  it('folds the board-scene rail overrides into the base rules (the rail only shows on boards)', () => {
    expect(CSS).not.toMatch(/\.screen-play--board-scene \.calibration-rail/)
    expect(ruleBody('.calibration-rail')).toMatch(/display:\s*grid/)
    expect(ruleBody('.calibration-rail__label')).toMatch(/font-size:\s*0\.5rem/)
  })

  it('caps compact board height with the same measured fit as its width', () => {
    const body = ruleBody('.screen-play--board-scene :is(.board-brass, .board-wrap)')
    expect(body).toMatch(/max-width:\s*var\(--mobile-board-max,\s*42vh\)/)
    expect(body).toMatch(/max-height:\s*var\(--mobile-board-max,\s*42vh\)/)
  })

  it('backs the calibration rail label with an ink chip in bright gold', () => {
    const body = ruleBody('.calibration-rail__label')
    expect(body).toMatch(/color:\s*var\(--gold-bright\)/)
    expect(body).toMatch(/background:\s*var\(--ink\)/)
    expect(body).toMatch(/border-radius:\s*1em/)
  })
})
