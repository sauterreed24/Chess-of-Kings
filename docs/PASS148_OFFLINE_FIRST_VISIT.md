---
overview: "v0.5.140: the installed PWA starts offline after one visit, the AI worker is cached ahead of play, and a dead worker no longer stalls AI moves."
---

# Pass 148 — Offline after one visit (v0.5.140)

The game promises offline-first play. A production-build test against `vite preview` (service worker active) checked what a player who visits once and later opens the app offline actually gets.

## Findings

1. **One visit was not enough to start offline.** `APP_SHELL` precaches `index.html` and icons only. The hashed JS, CSS, `game-data` chunk, and fonts load before the new service worker controls the page, so they never pass through its fetch handler. Offline, the cached `index.html` referenced scripts that were not cached, and the page rendered only the skip link. Two visits happened to work.
2. **Cached entries could still miss.** Module scripts and `modulepreload` are CORS requests carrying `Origin`. With a host that answers `Vary: Origin` (the Vite preview does; some CDNs do), an entry cached by a plain `cache.add` never matched them.
3. **The AI search worker was only fetched on the first AI move**, so a player offline before their first game never had it.
4. **A worker that failed was kept.** Loading offline fires `onerror` in ~3 ms, so the first search fell back to the main thread at once. But the dead `Worker` object was reused: the next search posted into it, got no reply, and waited for the full watchdog before falling back (measured at 6.9 s per affected move; 4.6–13 s depending on the persona's think time). Every other searched move stalled.

## Shipped

1. **`cache-urls` message** — once the page is controlled (`controller` present or `controllerchange`), `main.ts` posts the same-origin URLs from Resource Timing. `sw.js` caches each one that is not already cached. The cache name moves to `cok-static-v7`, following the policy test's rule for app-shell changes.
2. **`ignoreVary` for static assets** — `staleWhileRevalidate` matches with `{ ignoreVary: true }`; hashed assets are immutable.
3. **`warmAiSearchWorker()`** — called at idle after the page is controlled; creates the search worker (no-op when the player chose main-thread search), so its script goes through, and is cached by, the service worker.
4. **Broken-worker latch** — `onerror` marks the worker broken for the session and terminates it; `ensureWorker()` returns `null` afterwards, so searches go straight to the main-thread engine.

The index chunk grows 207 B gzip (94,826 / 101,376).

## Playtest notes

| Scenario (production build, Chromium) | Before | After |
| --- | --- | --- |
| Visit once, go offline, reload | empty page (skip link only) | title, duel, play |
| AI worker in cache after one visit | no | yes |
| Offline duel, out-of-book replies | 0.56 s, then 6.9 s on alternate moves | ~0.56 s each |

- Online play is unchanged (~0.5–0.7 s replies).
- `npm run test:e2e` includes the new offline test; it runs against `vite preview`, so the service worker is exercised for real.

## Out of scope

- A build-time precache manifest (would need a service-worker build step).
- Persisting the "worker broken" latch across sessions.
