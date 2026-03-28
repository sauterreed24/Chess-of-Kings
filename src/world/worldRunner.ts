import { escapeHtml } from '../app/htmlEscape'
import {
  HUB_SITES,
  HUB_NPCS,
  WORLD,
  VIEW,
  type WorldSite,
  type WorldNPC,
  distanceToSite,
  distanceToNpc,
  isSiteUnlocked,
  isNpcVisible,
} from './hub'

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export type WorldRunnerOptions = {
  viewport: HTMLElement
  promptEl: HTMLElement
  dialogueEl: HTMLElement
  getHighestUnlocked: () => number
  onOpenSimulation: (chapterIndex: number, sceneIndex: number) => void
  onOpenCatalogue: () => void
  onOpenDuel: () => void
}

export function createWorldRunner(opts: WorldRunnerOptions) {
  const keys = new Set<string>()
  let px = 110
  let py = 78
  let lastT = 0
  let raf = 0
  let activeSite: WorldSite | null = null
  let activeNpc: WorldNPC | null = null
  let dialogue: { npc: WorldNPC; lineIndex: number } | null = null
  let isMoving = false

  const playerEl = opts.viewport.querySelector<HTMLElement>('#world-player')

  let scale = 1
  const worldLayer = document.createElement('div')
  worldLayer.className = 'world-layer'
  opts.viewport.insertBefore(worldLayer, opts.viewport.firstChild)

  const siteEls = new Map<string, HTMLElement>()
  const npcEls = new Map<string, HTMLElement>()

  for (const site of HUB_SITES) {
    const wrap = document.createElement('div')
    wrap.className = 'world-site'
    wrap.dataset.siteId = site.id
    const icon = site.kind === 'catalogue' ? '♟' : site.kind === 'duel' ? '⚔' : site.id === 'ancient' ? '♛' : '♔'
    wrap.innerHTML = `
      <div class="world-site__plinth" aria-hidden="true">
        <span class="world-site__icon" aria-hidden="true">${icon}</span>
      </div>
      <div class="world-site__glow" aria-hidden="true"></div>
      <div class="world-site__label">
        <span class="world-site__title"></span>
        <span class="world-site__sub"></span>
      </div>`
    const title = wrap.querySelector('.world-site__title')!
    const sub = wrap.querySelector('.world-site__sub')!
    title.textContent = site.title
    sub.textContent = site.subtitle
    worldLayer.appendChild(wrap)
    siteEls.set(site.id, wrap)
  }

  for (const npc of HUB_NPCS) {
    const el = document.createElement('div')
    el.className = `world-npc world-npc--${npc.variant}`
    el.dataset.npcId = npc.id
    el.innerHTML = `<div class="world-npc__sprite" aria-hidden="true"></div>`
    worldLayer.appendChild(el)
    npcEls.set(npc.id, el)
  }

  const speed = 46

  function updateScale() {
    const w = opts.viewport.clientWidth
    const h = opts.viewport.clientHeight
    if (w < 8 || h < 8) return
    scale = w / VIEW.w
    worldLayer.style.width = `${WORLD.w * scale}px`
    worldLayer.style.height = `${WORLD.h * scale}px`
  }

  function layoutEntities() {
    for (const site of HUB_SITES) {
      const el = siteEls.get(site.id)!
      el.style.left = `${site.x * scale}px`
      el.style.top = `${site.y * scale}px`
    }
    for (const npc of HUB_NPCS) {
      const el = npcEls.get(npc.id)!
      el.style.left = `${npc.x * scale}px`
      el.style.top = `${npc.y * scale}px`
    }
  }

  function syncCamera() {
    const vw = opts.viewport.clientWidth
    const vh = opts.viewport.clientHeight
    const ww = WORLD.w * scale
    const wh = WORLD.h * scale
    let tx = vw / 2 - px * scale
    let ty = vh / 2 - py * scale
    tx = clamp(tx, vw - ww, 0)
    ty = clamp(ty, vh - wh, 0)
    worldLayer.style.transform = `translate(${tx}px, ${ty}px)`
  }

  function renderDialogue() {
    if (!dialogue) {
      opts.dialogueEl.classList.add('hidden')
      opts.dialogueEl.innerHTML = ''
      return
    }
    const { npc, lineIndex } = dialogue
    const text = npc.lines[lineIndex] ?? ''
    const last = lineIndex >= npc.lines.length - 1
    opts.dialogueEl.classList.remove('hidden')
    opts.dialogueEl.innerHTML = `
      <div class="world-dialogue">
        <p class="world-dialogue__who"><span class="world-dialogue__name">${escapeHtml(npc.name)}</span> · ${escapeHtml(npc.title)}</p>
        <p class="world-dialogue__text">${escapeHtml(text)}</p>
        <p class="world-dialogue__hint"><span class="world-prompt__key">E</span> ${last ? 'Close' : 'Next'} · <kbd>Esc</kbd> close</p>
      </div>`
  }

  function closeDialogue() {
    dialogue = null
    renderDialogue()
  }

  function advanceDialogue() {
    if (!dialogue) return
    if (dialogue.lineIndex >= dialogue.npc.lines.length - 1) {
      closeDialogue()
      return
    }
    dialogue.lineIndex++
    renderDialogue()
  }

  function tick(t: number) {
    const dt = lastT ? Math.min(0.045, (t - lastT) / 1000) : 0
    lastT = t

    if (!dialogue) {
      let dx = 0
      let dy = 0
      if (keys.has('w') || keys.has('arrowup')) dy -= 1
      if (keys.has('s') || keys.has('arrowdown')) dy += 1
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1
      if (keys.has('d') || keys.has('arrowright')) dx += 1

      const m = Math.hypot(dx, dy)
      if (m > 0) {
        px = clamp(px + (dx / m) * speed * dt, 12, WORLD.w - 12)
        py = clamp(py + (dy / m) * speed * dt, 14, WORLD.h - 14)
      }
      const nowMoving = m > 0
      if (nowMoving !== isMoving) {
        isMoving = nowMoving
        playerEl?.classList.toggle('world-player--walking', isMoving)
      }
    } else {
      if (isMoving) {
        isMoving = false
        playerEl?.classList.remove('world-player--walking')
      }
    }

    syncCamera()

    const hi = opts.getHighestUnlocked()
    activeSite = null
    activeNpc = null
    let nearestSite: WorldSite | null = null
    let nearestSiteD = Infinity
    let nearestNpc: WorldNPC | null = null
    let nearestNpcD = Infinity

    for (const site of HUB_SITES) {
      const el = siteEls.get(site.id)!
      const unlocked = isSiteUnlocked(site, hi)
      const d = distanceToSite(px, py, site)
      el.classList.toggle('world-site--locked', !unlocked)
      el.classList.toggle('world-site--near', unlocked && d < site.interactRadius)
      if (unlocked && d < site.interactRadius && d < nearestSiteD) {
        nearestSiteD = d
        nearestSite = site
      }
    }

    for (const npc of HUB_NPCS) {
      const el = npcEls.get(npc.id)!
      const vis = isNpcVisible(npc, hi)
      el.classList.toggle('world-npc--hidden', !vis)
      if (!vis) continue
      const d = distanceToNpc(px, py, npc)
      el.classList.toggle('world-npc--near', d < npc.interactRadius)
      if (d < npc.interactRadius && d < nearestNpcD) {
        nearestNpcD = d
        nearestNpc = npc
      }
    }

    if (dialogue) {
      opts.promptEl.innerHTML = ''
    } else if (nearestNpc && (!nearestSite || nearestNpcD <= nearestSiteD)) {
      activeNpc = nearestNpc
      opts.promptEl.innerHTML = `<span class="world-prompt__key">E</span> <span class="world-prompt__action">Speak — ${escapeHtml(nearestNpc.name)}</span>`
    } else if (nearestSite) {
      activeSite = nearestSite
      opts.promptEl.innerHTML = `<span class="world-prompt__key">E</span> <span class="world-prompt__action">Engage — ${escapeHtml(nearestSite.title)}</span>`
    } else {
      opts.promptEl.textContent = 'Walk the vestibule. Seek scholars, plinths, and lit columns.'
    }

    raf = requestAnimationFrame(tick)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && dialogue) {
      e.preventDefault()
      closeDialogue()
      return
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      if (!e.repeat) {
        e.preventDefault()
        if (dialogue) {
          advanceDialogue()
          return
        }
        tryInteract()
      }
      return
    }
    const k = e.key.toLowerCase()
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      e.preventDefault()
      keys.add(k)
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    keys.delete(e.key.toLowerCase())
  }

  function tryInteract() {
    if (activeNpc) {
      dialogue = { npc: activeNpc, lineIndex: 0 }
      renderDialogue()
      return
    }
    if (!activeSite) return
    if (activeSite.kind === 'catalogue') {
      opts.onOpenCatalogue()
      return
    }
    if (activeSite.kind === 'duel') {
      opts.onOpenDuel()
      return
    }
    const ch = activeSite.chapterIndex ?? 0
    const sc = activeSite.sceneIndex ?? 0
    opts.onOpenSimulation(ch, sc)
  }

  let detachResize: (() => void) | undefined
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      updateScale()
      layoutEntities()
      syncCamera()
    })
    ro.observe(opts.viewport)
    detachResize = () => ro.disconnect()
  } else {
    const onWinResize = () => {
      updateScale()
      layoutEntities()
      syncCamera()
    }
    window.addEventListener('resize', onWinResize)
    detachResize = () => window.removeEventListener('resize', onWinResize)
  }

  return {
    start() {
      updateScale()
      layoutEntities()
      lastT = 0
      syncCamera()
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      raf = requestAnimationFrame(tick)
    },
    stop() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(raf)
      detachResize?.()
    },
    interact: tryInteract,
    refreshLocks() {
      const hi = opts.getHighestUnlocked()
      for (const site of HUB_SITES) {
        const el = siteEls.get(site.id)!
        el.classList.toggle('world-site--locked', !isSiteUnlocked(site, hi))
      }
      for (const npc of HUB_NPCS) {
        const el = npcEls.get(npc.id)!
        el.classList.toggle('world-npc--hidden', !isNpcVisible(npc, hi))
      }
    },
  }
}
