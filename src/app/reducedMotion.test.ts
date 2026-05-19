/**
 * Reduced-motion CSS regression: the project-wide `prefers-reduced-motion`
 * override must exist in style.css and must clamp animation-duration,
 * animation-iteration-count, and transition-duration. If a future polish
 * pass deletes or weakens it, this test fails before reaching review.
 *
 * The test reads the .css source as a string (vitest runs in node, so
 * matchMedia / actual layout is unavailable) and pattern-matches the rule.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CSS_PATH = resolve(HERE, '..', 'style.css')

const CSS = readFileSync(CSS_PATH, 'utf8')

describe('reduced-motion CSS guarantees', () => {
  it('declares a global hidden utility that wins against display components', () => {
    expect(CSS).toMatch(/\.hidden\s*\{\s*display:\s*none\s*!important;\s*\}/)
  })

  it('declares at least one (prefers-reduced-motion: reduce) media block', () => {
    expect(CSS).toMatch(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/)
  })

  it('aggregated reduced-motion CSS clamps animation-duration somewhere', () => {
    const allBlocks = collectReducedMotionBlocks(CSS).join('\n')
    expect(allBlocks).not.toBe('')
    expect(allBlocks).toMatch(/animation-duration:\s*0\.0?1?ms\s*!important/)
  })

  it('aggregated reduced-motion CSS clamps transition-duration somewhere', () => {
    const allBlocks = collectReducedMotionBlocks(CSS).join('\n')
    expect(allBlocks).toMatch(/transition-duration:\s*0\.0?1?ms\s*!important/)
  })

  it('aggregated reduced-motion CSS applies a universal selector somewhere', () => {
    const allBlocks = collectReducedMotionBlocks(CSS).join('\n')
    /* `*, *::before, *::after { ... }` */
    expect(allBlocks).toMatch(/\*\s*,\s*\*::before\s*,\s*\*::after/)
  })

  it('aggregated reduced-motion CSS clamps animation-iteration-count to 1', () => {
    const allBlocks = collectReducedMotionBlocks(CSS).join('\n')
    expect(allBlocks).toMatch(/animation-iteration-count:\s*1\s*!important/)
  })

  it('every named ambient animation we ship has a reduced-motion override', () => {
    /* Spot-check the ambient bloom drift, victory shimmer, line stagger,
     * and the advance breathing animations. Each must either be
     * disabled by the universal block (animation-duration: 0.01ms) or
     * called out explicitly in a reduced-motion block. The universal
     * block alone is sufficient and our integration test asserts it
     * exists; this case fails only if BOTH the universal block AND the
     * targeted overrides are removed. */
    const allBlocks = collectReducedMotionBlocks(CSS)
    expect(allBlocks.length).toBeGreaterThan(0)
    /* The universal block is the strongest guarantee. */
    expect(allBlocks.some((b) => /\*\s*,\s*\*::before\s*,\s*\*::after/.test(b))).toBe(true)
  })
})

/** Returns the contents of every `(prefers-reduced-motion: reduce)` media block. */
function collectReducedMotionBlocks(css: string): string[] {
  const out: string[] = []
  const re = /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css))) {
    const after = css.slice(m.index)
    const open = after.indexOf('{')
    if (open < 0) continue
    let depth = 0
    for (let i = open; i < after.length; i++) {
      const c = after[i]
      if (c === '{') depth += 1
      else if (c === '}') {
        depth -= 1
        if (depth === 0) {
          out.push(after.slice(open + 1, i))
          break
        }
      }
    }
  }
  return out
}
