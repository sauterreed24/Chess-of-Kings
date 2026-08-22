import type { Color, PieceSymbol } from 'chess.js'
import type { PieceSkinId } from '../types'

// SVGs processed to support dynamic CSS variables:
// --piece-fill (body color)
// --piece-stroke (outlines and details)
const SVGS: Record<Color, Record<PieceSymbol, string>> = {
  "w": {
    "p": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z\"/></svg>",
    "n": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"var(--piece-fill)\" d=\"M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21\"/><path fill=\"var(--piece-fill)\" d=\"M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3\"/><path fill=\"var(--piece-stroke)\" d=\"M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5\"/></g></svg>",
    "b": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g fill=\"var(--piece-fill)\" stroke-linecap=\"butt\"><path d=\"M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z\"/><path d=\"M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z\"/><path d=\"M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\"/></g><path stroke-linejoin=\"miter\" d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\"/></g></svg>",
    "r": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5\"/><path d=\"m34 14-3 3H14l-3-3\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M31 17v12.5H14V17\"/><path d=\"m31 29.5 1.5 2.5h-20l1.5-2.5\"/><path fill=\"none\" stroke-linejoin=\"miter\" d=\"M11 14h23\"/></g></svg>",
    "q": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0\"/><path stroke-linecap=\"butt\" d=\"M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z\"/><path stroke-linecap=\"butt\" d=\"M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\"/><path fill=\"none\" d=\"M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0\"/></g></svg>",
    "k": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"miter\" d=\"M22.5 11.63V6M20 8h5\"/><path fill=\"var(--piece-fill)\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\"/><path fill=\"var(--piece-fill)\" d=\"M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z\"/><path d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g></svg>"
  },
  "b": {
    "p": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z\"/></svg>",
    "n": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"var(--piece-stroke)\" d=\"M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21\"/><path fill=\"var(--piece-stroke)\" d=\"M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3\"/><path fill=\"var(--piece-stroke)\" stroke=\"var(--piece-stroke)\" d=\"M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5\"/><path fill=\"var(--piece-stroke)\" stroke=\"none\" d=\"m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z\"/></g></svg>",
    "b": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g fill=\"var(--piece-stroke)\" stroke-linecap=\"butt\"><path fill=\"var(--piece-fill)\" d=\"M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z\"/><path fill=\"var(--piece-fill)\" d=\"M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z\"/><path fill=\"var(--piece-fill)\" d=\"M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z\"/></g><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" stroke-linejoin=\"miter\" d=\"M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5\"/></g></svg>",
    "r": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M14 29.5v-13h17v13z\"/><path stroke-linecap=\"butt\" d=\"M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z\"/><path fill=\"none\" stroke=\"var(--piece-stroke)\" stroke-linejoin=\"miter\" stroke-width=\"1\" d=\"M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23\"/></g></svg>",
    "q": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><g fill=\"var(--piece-fill)\" stroke=\"none\"><circle cx=\"6\" cy=\"12\" r=\"2.75\"/><circle cx=\"14\" cy=\"9\" r=\"2.75\"/><circle cx=\"22.5\" cy=\"8\" r=\"2.75\"/><circle cx=\"31\" cy=\"9\" r=\"2.75\"/><circle cx=\"39\" cy=\"12\" r=\"2.75\"/></g><path stroke-linecap=\"butt\" d=\"M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z\"/><path stroke-linecap=\"butt\" d=\"M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z\"/><path fill=\"none\" stroke-linecap=\"butt\" d=\"M11 38.5a35 35 1 0 0 23 0\"/><path fill=\"none\" stroke=\"var(--piece-stroke)\" d=\"M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0\"/></g></svg>",
    "k": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"var(--piece-fill)\" stroke-linejoin=\"miter\" d=\"M22.5 11.6V6\"/><path fill=\"var(--piece-fill)\" fill=\"var(--piece-stroke)\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\"/><path fill=\"var(--piece-fill)\" fill=\"var(--piece-stroke)\" d=\"M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z\"/><path fill=\"var(--piece-fill)\" stroke-linejoin=\"miter\" d=\"M20 8h5\"/><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" d=\"M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9\"/><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g></svg>"
  }
};


export const PIECE_SKIN_LABEL: Record<PieceSkinId, string> = {
  'classic-royal': 'Classic Royal',
  'high-contrast': 'High Contrast Tournament',
  'alexandrine-ornate': 'Alexandrine Ornate',
  'obsidian-neon': 'Obsidian Neon',
}

export const PIECE_SKIN_MAP: Record<PieceSkinId, Record<Color, Record<PieceSymbol, string>>> = {
  'classic-royal': SVGS,
  'high-contrast': SVGS,
  'alexandrine-ornate': SVGS,
  'obsidian-neon': SVGS,
}

const FOOT_RX: Record<PieceSymbol, number> = {
  p: 8.4,
  n: 10.2,
  b: 10.4,
  r: 11.4,
  q: 11.6,
  k: 11.8,
}

/** Crown / mitre / battlement highlights keyed to Staunton silhouettes. */
const SHEEN_PATH: Record<PieceSymbol, string> = {
  p: 'M17.8 11c2.8-3.6 6.6-3.6 9.4 0-3.2 1.15-6.2 1.15-9.4 0z',
  n: 'M14.2 11.6c3.6-4.2 9.8-5 14.4-1.8-5 1.2-9.8 2-14.4 1.8z',
  b: 'M19 9.2c2.2-3 4.8-3 7 0-2.4.95-4.6.95-7 0z',
  r: 'M12.2 10.4h20.6v2.15H12.2z',
  q: 'M9.6 11.4c5.2-3.6 20.6-3.6 25.8 0-8 1.55-17.8 1.55-25.8 0z',
  k: 'M20.4 6.4h4.2v1.7h2.1v2.2h-2.1v2.4h-4.2v-2.4h-2.1V8.1h2.1z',
}

/** Ivory/lapis body turn — highlight and umber keyed to the side, mid-stop follows the skin. */
const COLLAR_CY: Record<PieceSymbol, number> = {
  p: 31.8,
  n: 33.4,
  b: 32.2,
  r: 34.6,
  q: 32.8,
  k: 32.4,
}

/** Neck ring under the head / mitre / crown. Knights skip this — the horse is not lathe-turned. */
const NECK_CY: Record<PieceSymbol, number> = {
  p: 21.2,
  n: 24.6,
  b: 18.4,
  r: 15.8,
  q: 19.6,
  k: 18.4,
}

/** Lamp-side flute on the turned stem (knight uses a cheek catch-light). Shadow-side umbra mirrors this. */
const FLUTE: Record<PieceSymbol, { cx: number; cy: number; rx: number; ry: number }> = {
  p: { cx: 18.2, cy: 26.4, rx: 1.35, ry: 5.8 },
  n: { cx: 19.6, cy: 16.8, rx: 1.15, ry: 3.1 },
  b: { cx: 18.0, cy: 24.2, rx: 1.4, ry: 7.1 },
  r: { cx: 17.6, cy: 23.8, rx: 1.5, ry: 6.3 },
  q: { cx: 17.8, cy: 24.8, rx: 1.45, ry: 7.0 },
  k: { cx: 17.8, cy: 24.1, rx: 1.45, ry: 6.7 },
}

/** Hollow turned cup in the head / mitre / battlement. Knights skip — the horse is not a lathe bowl. */
const CUP: Record<PieceSymbol, { cy: number; rx: number; ry: number } | null> = {
  p: { cy: 13.4, rx: 3.2, ry: 2.15 },
  n: null,
  b: { cy: 11.4, rx: 2.35, ry: 2.2 },
  r: { cy: 11.0, rx: 7.2, ry: 1.42 },
  q: { cy: 15.1, rx: 5.1, ry: 1.85 },
  k: { cy: 16.4, rx: 3.15, ry: 1.65 },
}

/** Molded plinth just above the foot. */
const PLINTH_CY: Record<PieceSymbol, number> = {
  p: 38.4,
  n: 39.0,
  b: 38.6,
  r: 39.2,
  q: 38.4,
  k: 38.2,
}

/** Belly waist between the collar and the plinth — the turned stem of the piece. */
const WAIST_CY: Record<PieceSymbol, number> = {
  p: 35.1,
  n: 36.2,
  b: 35.4,
  r: 36.9,
  q: 35.6,
  k: 35.3,
}

const LAMP = {
  w: { hi: '#ffffff', lo: '#4a2e10', spec: '#fff6e0', diff: '#ffe4b0' },
  b: { hi: '#7aa8d4', lo: '#000105', spec: '#f0d28a', diff: '#3d6a96' },
} as const

let carveSeq = 0

function preferLeanGlyphs(): boolean {
  try {
    return globalThis.localStorage?.getItem('cok-visual-quality') === 'lean'
  } catch {
    return false
  }
}

function latheRing(
  cls: string,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke: string,
): string {
  return (
    `<ellipse class="${cls}" cx="22.5" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(2)}" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="0.55"/>`
  )
}

/** Foot shadow + lamp-lit turned body so Staunton glyphs read as carved ivory/lapis, not flat cutouts. */
export function carveGlyph(svg: string, color: Color, piece: PieceSymbol = 'p'): string {
  if (svg.includes('piece-lit') || svg.includes('piece-carve')) return svg
  const id = `pl${(carveSeq += 1)}`
  const lamp = LAMP[color]
  const sheen = color === 'w' ? 'rgba(255,255,255,0.36)' : 'rgba(232,201,126,0.32)'
  const rx = FOOT_RX[piece] ?? 10.6
  const lean = preferLeanGlyphs()
  const gradient =
    `<linearGradient id="${id}g" x1=".12" y1=".03" x2=".9" y2=".97">` +
    `<stop offset="0" stop-color="${lamp.hi}"/><stop offset=".32" stop-color="var(--piece-fill)"/>` +
    `<stop offset="1" stop-color="${lamp.lo}"/></linearGradient>`
  const lampFilter = lean
    ? ''
    : `<filter id="${id}f" x="-.18" y="-.18" width="1.36" height="1.36" color-interpolation-filters="sRGB">` +
      `<feGaussianBlur in="SourceAlpha" stdDeviation=".45" result="b"/>` +
      `<feDiffuseLighting in="b" surfaceScale="3.2" diffuseConstant=".95" lighting-color="${lamp.diff}" result="d">` +
      `<fePointLight x="-12" y="-18" z="34"/></feDiffuseLighting>` +
      `<feComposite in="d" in2="SourceGraphic" operator="arithmetic" k1=".55" k2=".7" k3="0" k4="0" result="sh"/>` +
      `<feSpecularLighting in="b" surfaceScale="2.8" specularConstant="1.05" specularExponent="14" lighting-color="${lamp.spec}" result="s">` +
      `<fePointLight x="-8" y="-14" z="30"/></feSpecularLighting>` +
      `<feSpecularLighting in="b" surfaceScale="1.8" specularConstant=".55" specularExponent="10" lighting-color="${lamp.spec}" result="f">` +
      `<fePointLight x="46" y="-6" z="22"/></feSpecularLighting>` +
      `<feComposite in="s" in2="f" operator="arithmetic" k1="0" k2="1" k3=".62" k4="0" result="gl"/>` +
      `<feComposite in="sh" in2="gl" operator="arithmetic" k1="0" k2="1" k3="1.12" k4="0"/>` +
      `</filter>`
  const filterAttr = lean ? '' : ` filter="url(#${id}f)"`
  const defs = `<defs>${gradient}${lampFilter}</defs>`
  const ground = `<ellipse class="piece-ground" cx="22.5" cy="42.15" rx="${(rx + 2.3).toFixed(1)}" ry="2.6" fill="rgba(0,0,0,0.28)"/>`
  const foot = `<ellipse class="piece-foot" cx="22.5" cy="41.3" rx="${rx}" ry="1.65" fill="rgba(0,0,0,0.55)"/>`
  const highlight = `<path class="piece-carve" d="${SHEEN_PATH[piece]}" fill="${sheen}"/>`
  const ringFill = color === 'w' ? 'rgba(160,110,40,0.4)' : 'rgba(6,16,28,0.6)'
  const ringStroke = color === 'w' ? 'rgba(255,255,255,0.46)' : 'rgba(232,201,126,0.4)'
  const plinth = latheRing('piece-plinth', PLINTH_CY[piece] ?? 38.4, rx * 0.92, 1.35, ringFill, ringStroke)
  const rimFill = color === 'w' ? 'rgba(255,248,232,0.52)' : 'rgba(232,201,126,0.3)'
  const rim = latheRing(
    'piece-rim',
    (PLINTH_CY[piece] ?? 38.4) - 0.2,
    rx * 0.62,
    0.72,
    rimFill,
    ringStroke,
  )
  const waist = latheRing('piece-waist', WAIST_CY[piece] ?? 35.4, rx * 0.86, 1.18, ringFill, ringStroke)
  const collar = latheRing('piece-collar', COLLAR_CY[piece] ?? 32.8, rx * 0.78, 1.25, ringFill, ringStroke)
  const neck =
    piece === 'n'
      ? ''
      : latheRing('piece-neck', NECK_CY[piece] ?? 20, rx * 0.48, 1.05, ringFill, ringStroke)
  const fluteSpec = FLUTE[piece] ?? FLUTE.p
  const fluteFill = color === 'w' ? 'rgba(255,255,255,0.28)' : 'rgba(232,201,126,0.22)'
  const flute =
    `<ellipse class="piece-flute" cx="${fluteSpec.cx}" cy="${fluteSpec.cy}" ` +
    `rx="${fluteSpec.rx}" ry="${fluteSpec.ry}" fill="${fluteFill}"/>`
  const umbraFill = color === 'w' ? 'rgba(42,22,8,0.32)' : 'rgba(0,2,10,0.42)'
  const umbra =
    `<ellipse class="piece-umbra" cx="${(45 - fluteSpec.cx).toFixed(1)}" cy="${fluteSpec.cy}" ` +
    `rx="${(fluteSpec.rx * 0.92).toFixed(2)}" ry="${fluteSpec.ry}" fill="${umbraFill}"/>`
  const cupSpec = CUP[piece]
  const cupFill = color === 'w' ? 'rgba(36,18,6,0.34)' : 'rgba(0,2,8,0.48)'
  const cupStroke = color === 'w' ? 'rgba(255,248,232,0.28)' : 'rgba(232,201,126,0.22)'
  const cup = cupSpec
    ? `<ellipse class="piece-cup" cx="22.5" cy="${cupSpec.cy}" rx="${cupSpec.rx}" ry="${cupSpec.ry}" ` +
      `fill="${cupFill}" stroke="${cupStroke}" stroke-width="0.45"/>`
    : ''
  return svg
    .replace(
      /<svg([^>]*)>/,
      `<svg$1>${defs}${ground}${foot}<g class="piece-lit"${filterAttr}>`,
    )
    .replace(/fill="var\(--piece-fill\)"/g, `fill="url(#${id}g)"`)
    .replace('</svg>', `</g>${plinth}${rim}${waist}${collar}${neck}${flute}${umbra}${cup}${highlight}</svg>`)
}

export function glyphForSkin(
  skin: PieceSkinId,
  color: Color,
  piece: PieceSymbol,
): string {
  const raw = PIECE_SKIN_MAP[skin]?.[color]?.[piece] ?? PIECE_SKIN_MAP['classic-royal'][color][piece]
  if (skin === 'high-contrast') return raw
  return carveGlyph(raw, color, piece)
}
