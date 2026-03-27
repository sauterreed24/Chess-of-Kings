import { Chess } from 'chess.js'
import type { Color, Move, PieceSymbol, Square } from 'chess.js'
import type { PieceSkinId } from '../types'
import { glyphForSkin } from './skins'

const FILES = 'abcdefgh'

const PROMO_NAMES: Record<PieceSymbol, string> = {
  q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: '', k: '',
}

export type BoardPickMode = 'off' | 'solo' | 'free'

export interface BoardViewOptions {
  root: HTMLElement
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void
  orientation: 'w' | 'b'
}

const FLY_MS = 200

export class BoardView {
  private root: HTMLElement
  private onMove: BoardViewOptions['onMove']
  orientation: 'w' | 'b'
  private cells = new Map<Square, HTMLButtonElement>()
  private selected: Square | null = null
  private legalTargets = new Set<Square>()
  private checkSquare: Square | null = null
  private lastMove: { from: Square; to: Square } | null = null
  private pendingChess: Chess | null = null
  private pickMode: BoardPickMode = 'off'
  private soloColor: 'w' | 'b' = 'w'
  private flyGen = 0
  private promoBackdrop: HTMLElement | null = null
  private promoPanel: HTMLElement | null = null
  private skin: PieceSkinId = 'classic-royal'
  private moveGuard = false
  private guardFrom: Square | null = null
  private guardTo: Square | null = null
  private guardStamp = 0

  constructor(opts: BoardViewOptions) {
    this.root = opts.root
    this.onMove = opts.onMove
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
    for (const r of ranks) {
      for (const f of this.orientation === 'w' ? FILES : [...FILES].reverse()) {
        out.push(`${f}${r}` as Square)
      }
    }
    return out
  }

  private buildGrid() {
    this.root.innerHTML = ''
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
      btn.setAttribute('aria-label', sq)
      btn.addEventListener('click', () => this.clickSquare(sq as Square))
      this.cells.set(sq as Square, btn)
      this.root.appendChild(btn)
    }
    this.renderLabels()
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

    for (const p of ['q', 'r', 'b', 'n'] as PieceSymbol[]) {
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
    }

    document.body.appendChild(panel)
    this.promoPanel = panel
    /* focus first button for keyboard nav */
    ;(panel.querySelector('.promo-btn') as HTMLButtonElement | null)?.focus()
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

  draw(chess: Chess, last?: Move | null, pick?: { mode: BoardPickMode; soloColor?: 'w' | 'b' }) {
    this.pendingChess = chess
    if (pick) {
      this.pickMode = pick.mode
      if (pick.soloColor) this.soloColor = pick.soloColor
    }
    if (last) this.lastMove = { from: last.from, to: last.to }

    /* Clean up any leftover fly sprites or pending promotions */
    for (const el of document.querySelectorAll('.piece-fly')) el.remove()
    this.root.querySelectorAll<HTMLElement>('.piece--fly-pending').forEach((el) =>
      el.classList.remove('piece--fly-pending'),
    )
    this.dismissPromo()

    const isCastle = last?.isKingsideCastle() || last?.isQueensideCastle()
    const doFly =
      last &&
      !isCastle &&
      typeof document !== 'undefined' &&
      typeof document.body.animate === 'function'

    let fromRect: DOMRect | null = null
    let toRect: DOMRect | null = null
    let flyGlyph = ''
    let flyClass = ''
    if (doFly && last) {
      const fromBtn = this.cells.get(last.from)
      const toBtn = this.cells.get(last.to)
      if (fromBtn && toBtn) {
        fromRect = fromBtn.getBoundingClientRect()
        toRect = toBtn.getBoundingClientRect()
        const shown: PieceSymbol = last.promotion ?? last.piece
        flyGlyph = glyphForSkin(this.skin, last.color, shown)
        flyClass = `piece piece--${last.color}`
      }
    }

    for (const [sq, btn] of this.cells) {
      /* Preserve label spans, replace only piece content */
      const labels = [...btn.querySelectorAll('.sq-label')]
      const p = chess.get(sq)
      btn.innerHTML = p ? this.pieceSpanHtml(p) : ''
      btn.dataset.piece = p ? `${p.color}${p.type}` : ''
      for (const l of labels) btn.appendChild(l)
    }

    if (doFly && fromRect && toRect && flyGlyph && last) {
      const gen = ++this.flyGen
      const toSpan = this.cells.get(last.to)?.querySelector<HTMLElement>('.piece')
      if (toSpan) toSpan.classList.add('piece--fly-pending')

      const fly = document.createElement('div')
      fly.className = `piece-fly ${flyClass}`
      fly.textContent = flyGlyph
      const x0 = fromRect.left + fromRect.width / 2
      const y0 = fromRect.top + fromRect.height / 2
      const x1 = toRect.left + toRect.width / 2
      const y1 = toRect.top + toRect.height / 2
      document.body.appendChild(fly)

      const anim = fly.animate(
        [
          { transform: `translate(${x0}px,${y0}px) translate(-50%,-50%)` },
          { transform: `translate(${x1}px,${y1}px) translate(-50%,-50%)` },
        ],
        { duration: FLY_MS, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' },
      )
      anim.onfinish = () => {
        fly.remove()
        if (gen !== this.flyGen) return
        toSpan?.classList.remove('piece--fly-pending')
      }
    }

    this.selected = null
    this.legalTargets.clear()
    this.guardFrom = null
    this.guardTo = null
    this.guardStamp = 0
    this.updateHighlights()
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
    const moves = chess.moves({ square: from, verbose: true })
    for (const m of moves) this.legalTargets.add(m.to)
    this.updateHighlights()
  }

  private updateHighlights() {
    const ch = this.pendingChess
    for (const [sq, btn] of this.cells) {
      btn.classList.remove(
        'sq-selected',
        'sq-legal',
        'sq-legal-dot',
        'sq-legal-capture',
        'sq-last',
        'sq-check',
        'sq-guard',
      )
      if (this.lastMove && (sq === this.lastMove.from || sq === this.lastMove.to)) {
        btn.classList.add('sq-last')
      }
      if (this.checkSquare === sq) btn.classList.add('sq-check')
      if (this.selected === sq) btn.classList.add('sq-selected')
      if (this.legalTargets.has(sq)) {
        btn.classList.add('sq-legal')
        const occ = ch?.get(sq)
        if (occ) btn.classList.add('sq-legal-capture')
        else btn.classList.add('sq-legal-dot')
      }
      if (this.guardTo === sq && this.guardFrom && this.guardFrom === this.selected) {
        btn.classList.add('sq-guard')
      }
    }
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
    this.clearGuard()
    this.updateHighlights()
  }
}
