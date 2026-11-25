import './style.css'
import './style-alexandrine-imperial.css'
import { mountApp } from './app/mountApp'
import { refreshDocumentUiProfile } from './app/runtimeUiProfile'
import { warmAiSearchWorker } from './chess/aiAsync'

refreshDocumentUiProfile()

const refreshProfile = () => refreshDocumentUiProfile()
for (const mq of [
  window.matchMedia('(pointer: coarse)'),
  window.matchMedia('(prefers-reduced-motion: reduce)'),
]) {
  mq.addEventListener('change', refreshProfile)
}
const app = document.querySelector<HTMLDivElement>('#app')!
mountApp(app)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL
    void navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
    /* Offline-first: load the AI search worker once the service worker controls
       the page, so its script is cached before the player ever goes offline. */
    const warm = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => warmAiSearchWorker(), { timeout: 5000 })
      else setTimeout(() => warmAiSearchWorker(), 2000)
    }
    const onControlled = () => {
      /* Hand the worker what this first visit already loaded (scripts, styles,
         fonts) so a single online visit is enough to start offline later. */
      const urls = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => url.startsWith(location.origin))
      navigator.serviceWorker.controller?.postMessage({ type: 'cache-urls', urls })
      warm()
    }
    if (navigator.serviceWorker.controller) onControlled()
    else navigator.serviceWorker.addEventListener('controllerchange', onControlled, { once: true })
  })
}
