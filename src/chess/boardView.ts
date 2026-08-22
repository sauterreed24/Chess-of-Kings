import { Chess } from 'chess.js'
import type { Color, Move, PieceSymbol, Square } from 'chess.js'
import type { PieceSkinId } from '../types'
import { glyphForSkin } from './skins'
import {
  buildFlyKeyframes,
  capturedSquareFor,
  castlingRookMove,
  rectCenter,
  type FlyPoint,
} from './boardAnimation'

const FILES = 'abcdefgh'
/** Avoid allocating `[...FILES].reverse()` on every square-order walk. */
const FILES_REV = 'hgfedcba'

const PROMO_NAMES: Record<PieceSymbol, string> = {
  q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: '', k: '',
}

/** Carved lamp + shade on every square — inline so CSS gzip stays put. */
const SQ_FACET_STYLE =
  'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0'

function squareFacetSvg(light: boolean): string {
  const lamp = light ? 'rgba(255,252,244,0.32)' : 'rgba(196,226,255,0.2)'
  const shade = light ? 'rgba(42,22,8,0.2)' : 'rgba(0,4,16,0.3)'
  return (
    `<svg class="sq-facet" viewBox="0 0 40 40" aria-hidden="true" focusable="false" style="${SQ_FACET_STYLE}">` +
    `<ellipse class="sq-facet-lamp" cx="8.4" cy="7" rx="13.2" ry="9.8" fill="${lamp}"/>` +
    `<ellipse class="sq-facet-shade" cx="31.6" cy="33.2" rx="14" ry="10.6" fill="${shade}"/>` +
    `</svg>`
  )
}

export type BoardPickMode = 'off' | 'solo' | 'free'

export interface BoardSelectionState {
  selected: Square | null
  legalMoveCount: number
  captureCount: number
  quietMoveCount: number
  castleSquares: Square[]
  guardTarget: Square | null
}

export interface BoardViewOptions {
  root: HTMLElement
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void
  onSelectionChange?: (state: BoardSelectionState) => void
  orientation: 'w' | 'b'
}

/** Carry duration: long enough to read as weight, short enough to stay snappy. */
const FLY_MS = 280
/** Captured piece dissolve — overlaps the incoming carry so it reads as a strike. */
const CAPTURE_MS = 230
/** Settle squash when the carried piece is set down on its square. */
const LAND_MS = 180
/** Trimmed timings for low-power / lean hardware. */
const FLY_MS_LEAN = 150

interface Flight {
  from: FlyPoint
  to: FlyPoint
  glyph: string
  colorClass: Color
  toSquare: Square
  size: number
}

export class BoardView {
  private root: HTMLElement
  private onMove: BoardViewOptions['onMove']
  private onSelectionChange: BoardViewOptions['onSelectionChange']
  orientation: 'w' | 'b'
  private cells = new Map<Square, HTMLButtonElement>()
  private selected: Square | null = null
  private legalTargets = new Set<Square>()
  private castleTargets = new Set<Square>()
  private checkSquare: Square | null = null
  private lastMove: { from: Square; to: Square } | null = null
  private pendingChess: Chess | null = null
  private pickMode: BoardPickMode = 'off'
  private soloColor: 'w' | 'b' = 'w'
  private flyGen = 0
  private promoBackdrop: HTMLElement | null = null
  private promoPanel: HTMLElement | null = null
  private readonly onBoardKeyDown = (e: KeyboardEvent) => this.handleBoardKeyNav(e)
  private skin: PieceSkinId = 'classic-royal'
  private moveGuard = false
  private guardFrom: Square | null = null
  private guardTo: Square | null = null
  private guardStamp = 0
  /** Tracks flying-piece overlays for O(1) cleanup instead of document-wide queries. */
  private pieceFlyEls: HTMLElement[] = []
  /** Skip rewriting unchanged squares (majority of cells on typical moves). */
  private lastPieceSig = new Map<Square, string>()
  private lastSelectionSig = ''

  constructor(opts: BoardViewOptions) {
    this.root = opts.root
    this.onMove = opts.onMove
    this.onSelectionChange = opts.onSelectionChange
    this.orientation = opts.orientation
    this.buildGrid()
  }

  setOrientation(o: 'w' | 'b') {
    this.orientation = o
    this.flipSquareOrder()
    this.renderLabels()
  }

  setSkin(skin: PieceSkinId) {
    this.skin = skin
    this.root.setAttribute('data-skin', skin)
  }

  setMoveGuard(enabled: boolean) {
    this.moveGuard = enabled
    this.clearGuard()
  }

  private flipSquareOrder() {
    const frag = document.createDocumentFragment()
    for (const sq of this.squareOrder()) {
      const cell = this.cells.get(sq)
      if (cell) frag.appendChild(cell)
    }
    this.root.appendChild(frag)
  }

  private squareOrder(): Square[] {
    const out: Square[] = []
    const ranks = this.orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
    const files = this.orientation === 'w' ? FILES : FILES_REV
    for (const r of ranks) {
      for (let fi = 0; fi < 8; fi++) {
        out.push(`${files[fi]}${r}` as Square)
      }
    }
    return out
  }

  private buildGrid() {
    this.root.innerHTML = ''
    this.lastPieceSig.clear()
    this.root.classList.add('board-wrap', 'chess-grid')
    this.cells.clear()
    for (const sq of this.squareOrder()) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'sq'
      btn.dataset.square = sq
      const file = sq.charCodeAt(0) - 97
      const rank = Number(sq[1]) - 1
      const light = (file + rank) % 2 !== 0
      btn.classList.add(light ? 'sq-light' : 'sq-dark')
      btn.tabIndex = -1
      btn.setAttribute('aria-label', `Square ${sq}`)
      btn.setAttribute('aria-pressed', 'false')
      btn.insertAdjacentHTML('afterbegin', squareFacetSvg(light))
      btn.addEventListener('click', () => this.clickSquare(sq as Square))
      this.cells.set(sq as Square, btn)
      this.root.appendChild(btn)
    }
    this.root.addEventListener('keydown', this.onBoardKeyDown)
    this.renderLabels()
    const order = this.squareOrder()
    const start = order.includes('e4') ? ('e4' as Square) : order[0]!
    this.applyRovingTabindex(start)
  }

  /** One square participates in the tab order (0); the rest are −1 (roving tabindex pattern). */
  private applyRovingTabindex(active: Square) {
    for (const [s, btn] of this.cells) {
      btn.tabIndex = s === active ? 0 : -1
    }
  }

  /** Screen-oriented navigation: DOM order matches visual rows (8×8). */
  private handleBoardKeyNav(e: KeyboardEvent) {
    if (this.promoPanel || this.root.classList.contains('chess-grid--locked')) return
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(e.key)) return
    const target = e.target
    if (!(target instanceof HTMLElement) || !target.classList.contains('sq')) return
    const sq = target.dataset.square as Square | undefined
    if (!sq) return
    const order = this.squareOrder()
    const idx = order.indexOf(sq)
    if (idx < 0) return
    let next: number
    switch (e.key) {
      case 'ArrowUp':
        next = idx - 8
        break
      case 'ArrowDown':
        next = idx + 8
        break
      case 'ArrowLeft':
        if (idx % 8 === 0) return
        next = idx - 1
        break
      case 'ArrowRight':
        if (idx % 8 === 7) return
        next = idx + 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = 63
        break
      default:
        return
    }
    if (next < 0 || next >= 64) return
    e.preventDefault()
    e.stopPropagation()
    const nextSq = order[next]!
    this.applyRovingTabindex(nextSq)
    this.cells.get(nextSq)?.focus()
  }

  private renderLabels() {
    for (const btn of this.cells.values()) {
      btn.querySelectorAll('.sq-label').forEach((el) => el.remove())
    }
    const rankOrder = this.orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
    const fileOrder = this.orientation === 'w' ? 'abcdefgh' : 'hgfedcba'
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = `${fileOrder[f]}${rankOrder[r]}` as Square
        const btn = this.cells.get(sq)
        if (!btn) continue
        if (f === 0) {
          const span = document.createElement('span')
          span.className = 'sq-label sq-label--rank'
          span.textContent = String(rankOrder[r])
          span.setAttribute('aria-hidden', 'true')
          btn.appendChild(span)
        }
        if (r === 7) {
          const span = document.createElement('span')
          span.className = 'sq-label sq-label--file'
          span.textContent = fileOrder[f]!
          span.setAttribute('aria-hidden', 'true')
          btn.appendChild(span)
        }
      }
    }
  }

  private canPickPiece(piece: { color: Color } | undefined, ch: Chess): boolean {
    if (!piece) return false
    if (this.pickMode === 'off') return false
    if (this.pickMode === 'free') return piece.color === ch.turn()
    return piece.color === this.soloColor && piece.color === ch.turn()
  }

  private clickSquare(sq: Square) {
    const ch = this.pendingChess
    if (!ch || this.root.classList.contains('chess-grid--locked')) return
    this.applyRovingTabindex(sq)

    if (this.legalTargets.has(sq) && this.selected) {
      const from = this.selected
      if (this.moveGuard) {
        const now = performance.now()
        const isSameGuard = this.guardFrom === from && this.guardTo === sq && now - this.guardStamp < 1600
        if (isSameGuard) {
          this.clearGuard()
          this.tryPromoteAndMove(from, sq)
        } else {
          this.guardFrom = from
          this.guardTo = sq
          this.guardStamp = now
          this.updateHighlights()
        }
      } else {
        this.tryPromoteAndMove(from, sq)
      }
      return
    }

    const piece = ch.get(sq)
    if (this.canPickPiece(piece, ch)) {
      this.showLegalFrom(ch, sq)
    } else {
      this.clearSelection()
    }
  }

  private tryPromoteAndMove(from: Square, to: Square) {
    const piece = this.pendingChess?.get(from)
    const isPromo =
      piece?.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'))
    if (isPromo) {
      this.showPromotionPicker(from, to, piece.color)
    } else {
      this.onMove(from, to)
    }
  }

  /* ─── Promotion picker ─────────────────────────────────────────────── */
  private showPromotionPicker(from: Square, to: Square, color: Color) {
    this.dismissPromo()

    const toBtn = this.cells.get(to)
    const rect = toBtn?.getBoundingClientRect()

    const backdrop = document.createElement('div')
    backdrop.className = 'promo-backdrop'
    backdrop.addEventListener('click', () => {
      this.dismissPromo()
      this.clearSelection()
    })
    document.body.appendChild(backdrop)
    this.promoBackdrop = backdrop

    const panel = document.createElement('div')
    panel.className = 'promo-panel'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    panel.setAttribute('aria-label', 'Choose promotion piece')
    panel.dataset.color = color

    if (rect) {
      const cx = rect.left + rect.width / 2
      panel.style.setProperty('--px', `${cx}px`)
      if (color === 'w') {
        panel.style.setProperty('--py', `${rect.top}px`)
        panel.style.setProperty('--dir', '-100%')
      } else {
        panel.style.setProperty('--py', `${rect.bottom}px`)
        panel.style.setProperty('--dir', '0%')
      }
    }

    const pieces: PieceSymbol[] = ['q', 'r', 'b', 'n']
    const choiceButtons: HTMLButtonElement[] = []
    for (const p of pieces) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'promo-btn'
      btn.setAttribute('aria-label', PROMO_NAMES[p])
      btn.innerHTML = `<span class="piece piece--${color}" aria-hidden="true">${glyphForSkin(this.skin, color, p)}</span>`
      btn.addEventListener('click', () => {
        this.dismissPromo()
        this.onMove(from, to, p)
      })
      panel.appendChild(btn)
      choiceButtons.push(btn)
    }

    /* Keyboard: Esc dismisses, ArrowLeft/Right move focus between choices,
     * Home/End jump to first/last, Tab cycles within the panel. Enter and
     * Space activate the focused button via native behavior. */
    panel.addEventListener('keydown', (e) => {
      const idx = choiceButtons.indexOf(document.activeElement as HTMLButtonElement)
      if (e.key === 'Escape') {
        e.preventDefault()
        this.dismissPromo()
        this.clearSelection()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const next = idx <= 0 ? choiceButtons.length - 1 : idx - 1
        choiceButtons[next]?.focus()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = idx < 0 || idx === choiceButtons.length - 1 ? 0 : idx + 1
        choiceButtons[next]?.focus()
        return
      }
      if (e.key === 'Home') {
        e.preventDefault()
        choiceButtons[0]?.focus()
        return
      }
      if (e.key === 'End') {
        e.preventDefault()
        choiceButtons[choiceButtons.length - 1]?.focus()
        return
      }
      if (e.key === 'Tab') {
        if (choiceButtons.length === 0) return
        e.preventDefault()
        const dir = e.shiftKey ? -1 : 1
        const cur = idx < 0 ? 0 : idx
        const next = (cur + dir + choiceButtons.length) % choiceButtons.length
        choiceButtons[next]?.focus()
      }
    })

    document.body.appendChild(panel)
    this.promoPanel = panel
    /* Keep the picker fully on-screen. White promotes on the top rank, so the
     * default "open upward" placement can clip off the top of a phone; flip and
     * clamp as needed so every choice stays tappable. */
    if (rect) this.clampPromoPanel(panel, rect, color)
    /* focus first button for keyboard nav */
    choiceButtons[0]?.focus()
  }

  /** Nudges the promotion picker so it never spills past the viewport edges. */
  private clampPromoPanel(panel: HTMLElement, target: DOMRect, color: Color) {
    const margin = 8
    const vw = window.innerWidth
    const vh = window.innerHeight
    let pr = panel.getBoundingClientRect()

    /* Horizontal: clamp the centre so the panel stays within the viewport. */
    const halfW = pr.width / 2
    let cx = target.left + target.width / 2
    cx = Math.min(Math.max(cx, margin + halfW), vw - margin - halfW)
    panel.style.setProperty('--px', `${cx}px`)

    /* Vertical: prefer above for White / below for Black, but flip if it clips. */
    if (color === 'w' && target.top - pr.height < margin) {
      panel.style.setProperty('--py', `${target.bottom}px`)
      panel.style.setProperty('--dir', '0%')
    } else if (color === 'b' && target.bottom + pr.height > vh - margin) {
      panel.style.setProperty('--py', `${target.top}px`)
      panel.style.setProperty('--dir', '-100%')
    }

    /* Final guard: if it still overflows either edge, pin it inside. */
    pr = panel.getBoundingClientRect()
    if (pr.top < margin) {
      panel.style.setProperty('--py', `${margin}px`)
      panel.style.setProperty('--dir', '0%')
    } else if (pr.bottom > vh - margin) {
      panel.style.setProperty('--py', `${vh - margin}px`)
      panel.style.setProperty('--dir', '-100%')
    }
  }

  private dismissPromo() {
    this.promoBackdrop?.remove()
    this.promoBackdrop = null
    this.promoPanel?.remove()
    this.promoPanel = null
  }

  /* ─── Draw board ───────────────────────────────────────────────────── */
  private pieceSpanHtml(p: { color: Color; type: PieceSymbol }) {
    const glyph = glyphForSkin(this.skin, p.color, p.type)
    return `<span class="piece piece--${p.color}" aria-hidden="true">${glyph}</span>`
  }

  private squareAriaLabel(sq: Square, p: { color: Color; type: PieceSymbol } | null): string {
    if (!p) return `Square ${sq}, empty`
    const name =
      p.type === 'k'
        ? 'King'
        : p.type === 'p'
          ? 'Pawn'
          : PROMO_NAMES[p.type] || p.type
    const colorWord = p.color === 'w' ? 'White' : 'Black'
    return `${sq}, ${colorWord} ${name}`
  }

  draw(chess: Chess, last?: Move | null, pick?: { mode: BoardPickMode; soloColor?: 'w' | 'b' }) {
    this.pendingChess = chess
    if (pick) {
      this.pickMode = pick.mode
      if (pick.soloColor) this.soloColor = pick.soloColor
    }
    if (last) this.lastMove = { from: last.from, to: last.to }

    /* Clean up any leftover fly/capture sprites or pending promotions */
    for (const el of this.pieceFlyEls) el.remove()
    this.pieceFlyEls.length = 0
    this.root.querySelectorAll<HTMLElement>('.piece--fly-pending').forEach((el) =>
      el.classList.remove('piece--fly-pending'),
    )
    this.dismissPromo()

    const reduceMotion =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const lean =
      typeof document !== 'undefined' && document.documentElement.classList.contains('perf-lean')
    const doFly =
      !!last &&
      !reduceMotion &&
      typeof document !== 'undefined' &&
      typeof document.body.animate === 'function'

    /* Capture the outgoing occupant's glyph BEFORE the diff overwrites cells. */
    const captureSnapshot = doFly && last && !lean ? this.captureSnapshotFor(last) : null

    for (const [sq, btn] of this.cells) {
      const p = chess.get(sq)
      const sig = p ? `${p.color}${p.type}` : ''
      const prevKnown = this.lastPieceSig.has(sq)
      const prev = this.lastPieceSig.get(sq) ?? ''
      if (prevKnown && prev === sig) continue
      this.lastPieceSig.set(sq, sig)
      const keep = [...btn.querySelectorAll('.sq-label, .sq-facet')]
      btn.innerHTML = p ? this.pieceSpanHtml(p) : ''
      btn.dataset.piece = sig
      btn.setAttribute('aria-label', this.squareAriaLabel(sq, p ?? null))
      for (const el of keep) btn.appendChild(el)
      if (!btn.querySelector('.sq-facet')) {
        btn.insertAdjacentHTML('afterbegin', squareFacetSvg(btn.classList.contains('sq-light')))
      }
    }

    if (doFly && last) this.animateMove(last, captureSnapshot, lean)

    this.selected = null
    this.legalTargets.clear()
    this.castleTargets.clear()
    this.guardFrom = null
    this.guardTo = null
    this.guardStamp = 0
    this.updateHighlights()
  }

  /* ─── Piece-movement physics ───────────────────────────────────────── */

  private captureSnapshotFor(
    last: Move,
  ): { square: Square; glyph: string; colorClass: Color } | null {
    const square = capturedSquareFor(last)
    if (!square) return null
    const colorClass: Color = last.color === 'w' ? 'b' : 'w'
    return {
      square,
      glyph: glyphForSkin(this.skin, colorClass, last.captured ?? 'p'),
      colorClass,
    }
  }

  /** Reads cell geometry and packages one piece's carry, or null if unmeasurable. */
  private flightFor(from: Square, to: Square, color: Color, piece: PieceSymbol): Flight | null {
    const fromBtn = this.cells.get(from)
    const toBtn = this.cells.get(to)
    if (!fromBtn || !toBtn) return null
    const fromRect = fromBtn.getBoundingClientRect()
    const toRect = toBtn.getBoundingClientRect()
    if (fromRect.width === 0 || toRect.width === 0) return null
    return {
      from: rectCenter(fromRect),
      to: rectCenter(toRect),
      glyph: glyphForSkin(this.skin, color, piece),
      colorClass: color,
      toSquare: to,
      size: fromRect.width,
    }
  }

  /**
   * Orchestrates the move's motion: the captured piece dissolves, the mover
   * (and a castling rook) are carried along a lifted arc, and each landed piece
   * settles with a squash. A single `flyGen` token lets a follow-up draw cancel
   * stale callbacks so the destination piece is never left hidden.
   */
  private animateMove(
    last: Move,
    captureSnapshot: { square: Square; glyph: string; colorClass: Color } | null,
    lean: boolean,
  ) {
    const gen = ++this.flyGen
    if (captureSnapshot) this.spawnCaptureDissolve(captureSnapshot)

    const flights: Flight[] = []
    const primary = this.flightFor(last.from, last.to, last.color, last.promotion ?? last.piece)
    if (primary) flights.push(primary)
    const rook = castlingRookMove(last)
    if (rook) {
      const rookFlight = this.flightFor(rook.from, rook.to, last.color, 'r')
      if (rookFlight) flights.push(rookFlight)
    }
    for (const flight of flights) this.spawnFlight(flight, gen, lean)
  }

  private spawnFlight(flight: Flight, gen: number, lean: boolean) {
    const toSpan = this.cells.get(flight.toSquare)?.querySelector<HTMLElement>('.piece') ?? null
    if (toSpan) toSpan.classList.add('piece--fly-pending')

    const fly = document.createElement('div')
    fly.className = `piece-fly piece piece--${flight.colorClass}`
    fly.dataset.skin = this.skin
    fly.innerHTML = flight.glyph
    fly.style.width = `${flight.size}px`
    fly.style.height = `${flight.size}px`
    document.body.appendChild(fly)
    this.pieceFlyEls.push(fly)

    const duration = lean ? FLY_MS_LEAN : FLY_MS
    const frames = buildFlyKeyframes(flight.from, flight.to, flight.size, lean ? 4 : 6)
    const anim = fly.animate(frames, { duration, easing: 'linear', fill: 'forwards' })
    anim.onfinish = () => {
      fly.remove()
      const ix = this.pieceFlyEls.indexOf(fly)
      if (ix >= 0) this.pieceFlyEls.splice(ix, 1)
      if (gen !== this.flyGen) return
      if (toSpan) {
        toSpan.classList.remove('piece--fly-pending')
        if (!lean) this.settlePiece(toSpan)
      }
    }
  }

  /** A brief squash-and-settle as the carried piece is set down on its square. */
  private settlePiece(span: HTMLElement) {
    if (typeof span.animate !== 'function') return
    span.style.transformOrigin = 'center 84%'
    const anim = span.animate(
      [
        { transform: 'scale(1.02, 0.88)' },
        { transform: 'scale(0.99, 1.04)', offset: 0.55 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: LAND_MS, easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
    )
    anim.onfinish = () => {
      span.style.transformOrigin = ''
    }
  }

  private spawnCaptureDissolve(snap: { square: Square; glyph: string; colorClass: Color }) {
    const cell = this.cells.get(snap.square)
    if (!cell) return
    const rect = cell.getBoundingClientRect()
    if (rect.width === 0) return
    const el = document.createElement('div')
    el.className = `piece-fly piece-capture piece piece--${snap.colorClass}`
    el.dataset.skin = this.skin
    el.innerHTML = snap.glyph
    el.style.width = `${rect.width}px`
    el.style.height = `${rect.height}px`
    const center = rectCenter(rect)
    const base = `translate(${center.x}px, ${center.y}px) translate(-50%, -50%)`
    el.style.transform = base
    document.body.appendChild(el)
    this.pieceFlyEls.push(el)

    const anim = el.animate(
      [
        { transform: `${base} scale(1) rotate(0deg)`, opacity: 1 },
        { transform: `${base} scale(1.06) rotate(-3deg)`, opacity: 1, offset: 0.2 },
        { transform: `${base} translateY(10px) scale(0.5) rotate(-18deg)`, opacity: 0 },
      ],
      { duration: CAPTURE_MS, easing: 'cubic-bezier(0.4,0,0.7,0.2)', fill: 'forwards' },
    )
    anim.onfinish = () => {
      el.remove()
      const ix = this.pieceFlyEls.indexOf(el)
      if (ix >= 0) this.pieceFlyEls.splice(ix, 1)
    }
  }

  setCheckSquare(sq: Square | null) {
    this.checkSquare = sq
    this.updateHighlights()
  }

  setInteraction(enabled: boolean) {
    this.root.classList.toggle('chess-grid--locked', !enabled)
  }

  showLegalFrom(chess: Chess, from: Square) {
    this.selected = from
    this.legalTargets.clear()
    this.castleTargets.clear()
    const moves = chess.moves({ square: from, verbose: true })
    for (const m of moves) {
      this.legalTargets.add(m.to)
      if (m.flags.includes('k') || m.flags.includes('q')) this.castleTargets.add(m.to)
    }
    this.updateHighlights()
    this.cells.get(from)?.focus()
  }

  private updateHighlights() {
    const ch = this.pendingChess
    for (const [sq, btn] of this.cells) {
      const piece = ch?.get(sq) ?? null
      const labels = [this.squareAriaLabel(sq, piece)]
      btn.classList.remove(
        'sq-selected',
        'sq-legal',
        'sq-legal-dot',
        'sq-legal-capture',
        'sq-legal-castle',
        'sq-last',
        'sq-last-from',
        'sq-last-to',
        'sq-check',
        'sq-guard',
      )
      if (this.lastMove && sq === this.lastMove.from) {
        btn.classList.add('sq-last', 'sq-last-from')
        labels.push('last move origin')
      }
      if (this.lastMove && sq === this.lastMove.to) {
        btn.classList.add('sq-last', 'sq-last-to')
        labels.push('last move destination')
      }
      if (this.checkSquare === sq) {
        btn.classList.add('sq-check')
        labels.push('king in check')
      }
      if (this.selected === sq) {
        btn.classList.add('sq-selected')
        labels.push(`selected; ${this.legalTargets.size} legal target${this.legalTargets.size === 1 ? '' : 's'}`)
      }
      if (this.legalTargets.has(sq)) {
        btn.classList.add('sq-legal')
        const occ = piece
        if (this.castleTargets.has(sq)) {
          btn.classList.add('sq-legal-castle')
          labels.push('legal castle destination')
        } else if (occ) {
          btn.classList.add('sq-legal-capture')
          labels.push('legal capture target')
        } else {
          btn.classList.add('sq-legal-dot')
          labels.push('legal move target')
        }
      }
      if (this.guardTo === sq && this.guardFrom && this.guardFrom === this.selected) {
        btn.classList.add('sq-guard')
        labels.push('confirm move target; activate again to move')
      }
      btn.setAttribute('aria-pressed', this.selected === sq ? 'true' : 'false')
      btn.setAttribute('aria-label', labels.join(', '))
    }
    this.emitSelectionChange()
  }

  private currentSelectionState(): BoardSelectionState {
    let captureCount = 0
    const ch = this.pendingChess
    for (const sq of this.legalTargets) {
      if (ch?.get(sq)) captureCount++
    }
    return {
      selected: this.selected,
      legalMoveCount: this.legalTargets.size,
      captureCount,
      quietMoveCount: Math.max(0, this.legalTargets.size - captureCount),
      castleSquares: [...this.castleTargets],
      guardTarget: this.guardFrom === this.selected ? this.guardTo : null,
    }
  }

  private emitSelectionChange() {
    if (!this.onSelectionChange) return
    const state = this.currentSelectionState()
    const sig = [
      state.selected ?? '',
      state.legalMoveCount,
      state.captureCount,
      state.quietMoveCount,
      state.castleSquares.join(','),
      state.guardTarget ?? '',
    ].join('|')
    if (sig === this.lastSelectionSig) return
    this.lastSelectionSig = sig
    this.onSelectionChange(state)
  }

  private clearGuard() {
    this.guardFrom = null
    this.guardTo = null
    this.guardStamp = 0
    this.updateHighlights()
  }

  clearSelection() {
    this.selected = null
    this.legalTargets.clear()
    this.castleTargets.clear()
    this.clearGuard()
    this.updateHighlights()
  }
}
