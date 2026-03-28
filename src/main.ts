import './style.css'
import { mountApp } from './app/mountApp'

const app = document.querySelector<HTMLDivElement>('#app')!
mountApp(app)
