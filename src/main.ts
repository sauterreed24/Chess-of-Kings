import './style.css'
import './style-alexandrine-imperial.css'
import { mountApp } from './app/mountApp'
import { refreshDocumentUiProfile } from './app/runtimeUiProfile'

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
  })
}
