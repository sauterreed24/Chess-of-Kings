import { describe, expect, it } from 'vitest'
import swSource from '../../public/sw.js?raw'

describe('service worker caching policy', () => {
  it('uses a fresh cache version for app-shell policy changes', () => {
    expect(swSource).toContain("const CACHE_NAME = 'cok-static-v7'")
  })

  it('keeps navigations network-first with cached index fallback', () => {
    expect(swSource).toContain("request.mode === 'navigate'")
    expect(swSource).toContain('await fetch(request)')
    expect(swSource).toContain("caches.match('./index.html')")
    expect(swSource.indexOf('await fetch(request)')).toBeLessThan(
      swSource.indexOf("caches.match('./index.html')"),
    )
  })

  it('keeps static assets responsive while refreshing them in the background', () => {
    expect(swSource).toContain('async function staleWhileRevalidate(request)')
    expect(swSource).toContain('network.catch(() => {})')
    expect(swSource).toContain('isHtmlRequest(request) ? networkFirst(request) : staleWhileRevalidate(request)')
  })

  it('caches the assets a first visit loaded before the worker took control', () => {
    expect(swSource).toContain("self.addEventListener('message'")
    expect(swSource).toContain("event.data.type === 'cache-urls'")
    /* Same-origin only, and never overwrite an entry that is already cached. */
    expect(swSource).toContain('.origin === self.location.origin')
    expect(swSource).toContain('cache.match(url).then((hit) => hit || cache.add(url)')
  })

  it('matches static assets regardless of Vary so CORS module requests hit the cache', () => {
    expect(swSource).toContain('caches.match(request, { ignoreVary: true })')
  })
})
