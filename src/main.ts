import './style.css'
import { mountApp } from './app/mountApp'

const app = document.querySelector<HTMLDivElement>('#app')!
mountApp(app)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js')
  })
}
