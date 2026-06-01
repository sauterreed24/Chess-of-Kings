import './style.css'
import './style-alexandrine-imperial.css'
import { mountApp } from './app/mountApp'

function applyRuntimeUiProfile() {
  const root = document.documentElement
  const mqCoarse = window.matchMedia('(pointer: coarse)')
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  root.classList.toggle('coarse-pointer', mqCoarse.matches)

  const nav = navigator as Navigator & { deviceMemory?: number }
  /** Treat missing Device Memory as unknown — do not assume 8GB (that forced perf-lean everywhere). */
  const mem = nav.deviceMemory
  const memoryLean = typeof mem === 'number' && mem <= 8
  const cores = navigator.hardwareConcurrency ?? 4
  const lean = mqReduced.matches || memoryLean || cores <= 4
  root.classList.toggle('perf-lean', lean)
}

applyRuntimeUiProfile()

const refreshProfile = () => applyRuntimeUiProfile()
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
