import { describe, expect, it } from 'vitest'
import { escapeHtml } from './htmlEscape'

describe('escapeHtml', () => {
  it('escapes HTML special characters for text injection', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;')
  })

  it('leaves safe prose unchanged', () => {
    expect(escapeHtml('The Calculus of Kings')).toBe('The Calculus of Kings')
  })

  it('escapes ampersands before other replacements', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })
})
