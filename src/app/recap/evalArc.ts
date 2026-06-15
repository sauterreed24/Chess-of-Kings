/**
 * The "story of the game" — a compact eval-arc sparkline for the verdict
 * recap. Plots the engine evaluation after every ply from the PLAYER's
 * perspective (above the centre line = you were winning, below = losing),
 * with the costliest moment marked. Pure: builds a fully self-styled inline
 * SVG (presentation attributes only, no external CSS), or null when there
 * is nothing meaningful to draw.
 */
import { escapeHtml } from '../htmlEscape'
import { findCostliestMoment, plyMoveLabel } from './costliestMoment'

export interface EvalArcInput {
  sanLog: readonly string[]
  /** White-positive engine eval after each ply (1:1 with sanLog). */
  evalTrace: readonly number[]
  playerColor: 'w' | 'b'
}

const W = 300
const H = 60
const PAD = 5
const CLAMP = 800 /* ±8 pawns saturates the arc */
const MIN_PLIES = 6

export function buildEvalArcSvg(input: EvalArcInput): string | null {
  const { sanLog, evalTrace, playerColor } = input
  if (evalTrace.length !== sanLog.length || evalTrace.length < MIN_PLIES) return null

  const sign = playerColor === 'b' ? -1 : 1
  const n = evalTrace.length
  const mid = H / 2
  const span = mid - PAD

  const xy = (i: number, raw: number): [number, number] => {
    const v = sign * raw
    const clamped = Number.isFinite(v) ? Math.max(-CLAMP, Math.min(CLAMP, v)) : 0
    const x = n === 1 ? 0 : (i / (n - 1)) * W
    const y = mid - (clamped / CLAMP) * span
    return [x, y]
  }

  const pts = evalTrace.map((v, i) => xy(i, v))
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `0,${mid} ${line} ${W},${mid}`

  const moment = findCostliestMoment(sanLog, evalTrace, playerColor)
  let marker = ''
  if (moment) {
    const [mx, my] = xy(moment.ply, evalTrace[moment.ply]!)
    const tip = `Costliest: ${plyMoveLabel(moment.ply)} ${moment.san}`
    marker =
      `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="3.6" fill="#d4583a" stroke="#1a120b" stroke-width="1">` +
      `<title>${escapeHtml(tip)}</title></circle>`
  }

  const finalPov = sign * (evalTrace[n - 1] ?? 0)
  const aria = `Evaluation through the game from your perspective; it ends ${
    finalPov >= 0 ? 'in your favour' : 'against you'
  }.`

  return (
    `<svg class="eval-arc" width="100%" height="58" viewBox="0 0 ${W} ${H}" ` +
    `preserveAspectRatio="none" role="img" aria-label="${escapeHtml(aria)}" ` +
    `style="display:block;margin:0 0 0.55rem">` +
    `<defs><linearGradient id="eval-arc-grad" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#e8c97e"/><stop offset="48%" stop-color="#c9a96a"/>` +
    `<stop offset="100%" stop-color="#b3472f"/></linearGradient></defs>` +
    `<line x1="0" y1="${mid}" x2="${W}" y2="${mid}" stroke="rgba(201,169,98,0.28)" ` +
    `stroke-width="1" stroke-dasharray="3 3"/>` +
    `<polygon points="${area}" fill="rgba(232,201,126,0.07)"/>` +
    `<polyline points="${line}" fill="none" stroke="url(#eval-arc-grad)" stroke-width="2" ` +
    `stroke-linejoin="round" stroke-linecap="round"/>` +
    marker +
    `</svg>`
  )
}
