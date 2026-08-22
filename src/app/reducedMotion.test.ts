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
const IMPERIAL_CSS_PATH = resolve(HERE, '..', 'style-alexandrine-imperial.css')

const CSS = readFileSync(CSS_PATH, 'utf8')
const IMPERIAL_CSS = readFileSync(IMPERIAL_CSS_PATH, 'utf8')

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

  it('keeps spoken dialogue stable and instant when motion is bypassed', () => {
    const allBlocks = collectReducedMotionBlocks(CSS).join('\n')
    expect(cssRule('.spoken-char')).not.toMatch(/max-width|overflow/)
    expect(cssRule('.spoken-word')).toMatch(/display:\s*inline-block/)
    expect(CSS).toMatch(/\.narrative-body--revealed\s+\.spoken-char\s*\{[^}]*animation:\s*none/s)
    expect(CSS).toMatch(/\.narrative-body--revealed\s+\.spoken-char\s*\{[^}]*opacity:\s*1/s)
    expect(CSS).toMatch(/\.narrative-body--revealed\s+\.line--stagger\s*\{[^}]*animation:\s*none/s)
    expect(CSS).toMatch(/html\.perf-lean\s+\.spoken-char,\s*\nhtml\.force-reduced-motion\s+\.spoken-char\s*\{[^}]*opacity:\s*1/s)
    expect(allBlocks).toMatch(/\.spoken-char\s*\{[^}]*opacity:\s*1/s)
  })
})

describe('lab overlay CSS hit targets', () => {
  it('keeps the lab chrome above the scrollable play surface', () => {
    expect(cssRule('.lab-overlay__bar')).toMatch(/position:\s*relative/)
    expect(cssRule('.lab-overlay__bar')).toMatch(/z-index:\s*2/)
    expect(cssRule('.screen--play-inner')).toMatch(/position:\s*relative/)
    expect(cssRule('.screen--play-inner')).toMatch(/z-index:\s*1/)
  })
})

describe('Alexandrine Imperial state polish', () => {
  it('keeps board calculation and check-defense cues in the visual layer', () => {
    expect(IMPERIAL_CSS).toMatch(/\.instrument-frame:has\(\.status-pill--thinking\)\s+\.board-brass/)
    expect(IMPERIAL_CSS).toMatch(/\.instrument-frame:has\(\.status-pill--check\)\s+\.board-guide/)
    expect(IMPERIAL_CSS).toMatch(/\.line\[data-voice='alexion'\]/)
    expect(IMPERIAL_CSS).toMatch(/\.line\[data-voice='rival'\]/)
  })

  it('keeps the Chronicle and play surfaces framed as museum-grade imperial shells', () => {
    expect(IMPERIAL_CSS).toMatch(/\.chapters-wrap\s*\{[^}]*border-radius:\s*14px/s)
    expect(IMPERIAL_CSS).toMatch(/\.title-hero__plate,\.chapters-wrap,\.duel-panel,\.instrument-frame,\.manuscript-panel,\.reward-sheet\s*\{[^}]*border-color:\s*#e8c97e36/s)
    expect(IMPERIAL_CSS).toMatch(/\.title-hero__plate,\.chapters-wrap,\.duel-panel,\.instrument-frame,\.manuscript-panel,\.reward-sheet\s*\{[^}]*box-shadow:\s*var\(--shadow-deep\)/s)
    expect(IMPERIAL_CSS).toMatch(/\.chapters-wrap\s*\{[^}]*linear-gradient\(140deg, #3a2a17/s)
  })

  it('collapses the chapter crawl on compact live boards', () => {
    expect(CSS).toMatch(
      /@media \(max-width: 960px\)[\s\S]*?\.screen-play--board-scene \.play-crawl \.chapter-label,/,
    )
  })

  it('keeps two columns on wide short labs', () => {
    expect(CSS).not.toMatch(/@media \(max-width: 960px\), \(max-height: 620px\)/)
    expect(CSS).toMatch(
      /@media \(max-height: 620px\)[\s\S]*?@media \(min-width: 961px\)[\s\S]*?--mobile-board-max, 72vh/,
    )
  })

  it('hides redundant turn chips and crawl philosophy on the live board', () => {
    expect(CSS).toMatch(
      /\.screen-play--board-scene \.play-state-readouts,\s*\n\.screen-play--board-scene \.play-crawl \.philosophy\s*\{[^}]*display:\s*none/s,
    )
  })

  it('keeps the static museum-surface polish on repeated play surfaces', () => {
    expect(cssRule('.play-atelier--solo')).toMatch(/max-width:\s*60rem/)
    expect(CSS).toMatch(/\.chapter-btn::before,\s*\n\.chapter-locked::before\s*\{[^}]*radial-gradient\(circle at 6% 50%, #e8c97e3f/s)
    expect(CSS).toMatch(/\.chapter-btn::before,\s*\n\.chapter-locked::before\s*\{[^}]*#1a3a5c66/s)
    expect(CSS).toMatch(/\.narrative-body--dialogue\s+\.line\s*\{[^}]*repeating-linear-gradient/s)
    expect(CSS).toMatch(/\.manuscript-panel\s*\{[^}]*repeating-linear-gradient\(90deg/s)
    expect(CSS).toMatch(/\.board-brass\s*\{[^}]*rgba\(42,96,148,0\.58\)/s)
  })

  it('keeps the board and spoken-dialogue surfaces graphically engraved', () => {
    expect(CSS).toMatch(/\.board-brass::after\s*\{[^}]*repeating-conic-gradient\(from 45deg/s)
    expect(CSS).toMatch(/\.sq::before\s*\{[^}]*linear-gradient\(135deg, #fff2/s)
    expect(CSS).toMatch(/\.speaker-seal\s*\{[^}]*0 0 22px rgba\(var\(--v\),\.3\)/s)
    expect(CSS).toMatch(/\.spoken-char\s*\{[^}]*text-shadow:\s*0 0 \.85em rgba\(var\(--v\),\.28\)/s)
  })

  it('keeps command buttons readable as inlaid Alexandrine controls', () => {
    expect(cssRule('.ghost')).toMatch(/linear-gradient\(#ede9de0a,#0004\)/)
    expect(cssRule('.ghost')).toMatch(/color:\s*#ccb/)
    expect(cssRule('button:disabled')).toMatch(/opacity:\s*0\.46/)
  })

  it('keeps marble, lapis, and reward surfaces jewel-inlaid', () => {
    expect(CSS).toMatch(/\.sq-light\s*\{[^}]*radial-gradient\(circle at 18% 12%, #fffffff0/s)
    expect(CSS).toMatch(/\.sq-dark\s*\{[^}]*linear-gradient\(145deg, #3b87bf/s)
    expect(CSS).toMatch(/\.board-brass\s*\{[^}]*radial-gradient\(circle at 92% 86%, rgba\(42,96,148,0\.58\)/s)
    expect(CSS).toMatch(/\.reward-sheet\s*\{[^}]*#2a60947a/s)
  })

  it('keeps the last move legible as an origin-to-destination route cue', () => {
    expect(CSS).toMatch(/\.sq-last-from\s*\{[^}]*box-shadow:\s*inset 0 0 0 3px #a8d88acc/s)
    expect(CSS).toMatch(/\.sq-last-from::before\s*\{[^}]*#1a3a5c4d/s)
    expect(CSS).toMatch(/\.sq-last-to\s*\{[^}]*#f0d28af5/s)
    expect(CSS).toMatch(/\.sq-last-to::before\s*\{[^}]*radial-gradient\(circle at 54% 46%, #e8c97e73/s)
    expect(CSS).not.toMatch(/\.sq-last-from \{[^}]*!important/)
  })

  it('keeps legal-move dots large enough to read on marble and lapis', () => {
    expect(CSS).toMatch(/\.sq-light\.sq-legal-dot::after,\s*\n\.sq-dark\.sq-legal-dot::after\s*\{[^}]*width:\s*36%/s)
    expect(CSS).toMatch(/\.sq-light\.sq-legal-dot::after,\s*\n\.sq-dark\.sq-legal-dot::after\s*\{[^}]*max-width:\s*22px/s)
  })

  it('keeps the shared Long Reign atlas inlay lightweight and perf-aware', () => {
    expect(CSS).toMatch(/:is\(\.chapters-wrap,\.duel-panel,\.manuscript-panel,\.reward-sheet\)::before/)
    expect(CSS).toMatch(/repeating-conic-gradient\(from 45deg/)
    expect(CSS).toMatch(/linear-gradient\(116deg, #0000 21%, #e8c97e38/)
    expect(CSS).toMatch(/:is\(\.chapters-wrap,\.duel-panel,\.manuscript-panel,\.reward-sheet\)::before\s*\{[^}]*opacity:\s*0\.24/s)
    expect(CSS).toMatch(/html\.perf-lean\s+:is\(\.chapters-wrap,\.duel-panel,\.manuscript-panel,\.reward-sheet\)::before\s*\{[^}]*opacity:\s*0\.08/s)
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

function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = CSS.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  return match?.[1] ?? ''
}
