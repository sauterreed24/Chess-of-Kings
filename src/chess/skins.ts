import type { Color, PieceSymbol } from 'chess.js'
import type { PieceSkinId } from '../types'

/**
 * Civic Staunton horse — pointed ear, muzzle, and a 45×45 footprint that
 * still seats the carved plinth. Wikipedia's scribble read as a blob at
 * phone size; this silhouette has to read even in high-contrast (no overlays).
 */
const KNIGHT_BODY =
  'M22.4 9.2 24.8 5.6C26.6 5.2 28 7.8 26.6 10.6 31.8 13.4 36.4 21 37.6 32 38.2 35.6 37.8 37.6 37.6 39.2H15C14.8 35.2 16.4 32 19.2 29.8 16.2 28 12.4 26.6 9.4 25 7 23.8 5.6 21.6 6 19.4 6.4 17.2 9.2 16.2 12 16.8 13.2 14.4 16.6 11.4 19.8 9.6 20.8 9 21.6 8.8 22.4 9.2z'

function knightGlyph(crestHighlight: boolean): string {
  const crest = crestHighlight
    ? '<path fill="var(--piece-stroke)" stroke="none" d="M25.2 8.4c4.8 2.2 9.4 9.6 11.2 19.4-3.6-5.8-7.6-13.2-11.2-19.4z"/>'
    : ''
  return (
    `<svg class="svg-piece" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">` +
    `<g fill="none" fill-rule="evenodd" stroke="var(--piece-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">` +
    `<path class="knight-silhouette" fill="var(--piece-fill)" d="${KNIGHT_BODY}"/>` +
    crest +
    `<circle class="knight-nostril" fill="var(--piece-stroke)" stroke="none" cx="7.8" cy="19.8" r="0.85"/>` +
    `<ellipse class="knight-iris" fill="var(--piece-stroke)" stroke="none" cx="13.2" cy="17.4" rx="1.15" ry="0.95"/>` +
    `</g></svg>`
  )
}

/**
 * Civic Staunton mitre — pointed hat, plus-cut, and a 45×45 footprint that
 * still seats the carved plinth. Wikipedia's teardrop-plus-ball read as a
 * blob at phone size; this silhouette has to read even in high-contrast
 * (no overlays).
 */
const BISHOP_BODY =
  'M12 40C11.2 37.6 11.6 36 13.6 35.4C16.8 34.2 16.8 32.8 17.2 31.2L17.6 22.8C13.2 21 12.2 17.6 13.4 14.4C15.2 9.2 19.2 5.4 22.5 4.8C25.8 5.4 29.8 9.2 31.6 14.4C32.8 17.6 31.8 21 27.4 22.8L27.8 31.2C28.2 32.8 28.2 34.2 31.4 35.4C33.4 36 33.8 37.6 33 40z'

function bishopGlyph(facetHighlight: boolean): string {
  const facet = facetHighlight
    ? '<path fill="var(--piece-stroke)" stroke="none" d="M22.5 5.2c-2.6 1.4-6 5.2-8 10.8 3-4.6 6-9 8-10.8z"/>'
    : ''
  return (
    `<svg class="svg-piece" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">` +
    `<g fill="none" fill-rule="evenodd" stroke="var(--piece-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">` +
    `<path class="bishop-silhouette" fill="var(--piece-fill)" d="${BISHOP_BODY}"/>` +
    facet +
    `<rect class="bishop-cleft-stem" fill="var(--piece-stroke)" stroke="none" x="21.3" y="6.8" width="2.4" height="12.8" rx="0.5"/>` +
    `<rect class="bishop-cleft-bar" fill="var(--piece-stroke)" stroke="none" x="19.2" y="15.4" width="6.6" height="3.4" rx="0.5"/>` +
    `</g></svg>`
  )
}

/**
 * Civic Staunton coronet — five readable orbs on a circlet, plus a 45×45
 * footprint that still seats the carved plinth. Wikipedia's spike scribble
 * vanished at phone size; this silhouette has to read even in high-contrast
 * (no overlays).
 */
const QUEEN_BODY =
  'M10.4 40C9.6 37.6 10 35.8 12.8 35.2C15.8 34.2 15.6 32.8 15.4 31.2L16.2 23C10.4 21.4 6.6 18 7 15C7.4 13.2 11.2 12.6 16.4 12.6L20.2 12.6C21 10.6 21.6 9.4 22.5 9C23.4 9.4 24 10.6 24.8 12.6L28.6 12.6C33.8 12.6 37.6 13.2 38 15C38.4 18 34.6 21.4 28.8 23L29.6 31.2C29.4 32.8 29.2 34.2 32.2 35.2C35 35.8 35.4 37.6 34.6 40z'

const QUEEN_ORB_R = 2.52
const QUEEN_ORBS: ReadonlyArray<{ cx: number; cy: number }> = [
  { cx: 8.4, cy: 13.2 },
  { cx: 15.6, cy: 10.6 },
  { cx: 22.5, cy: 8.2 },
  { cx: 29.4, cy: 10.6 },
  { cx: 36.6, cy: 13.2 },
]

function queenGlyph(facetHighlight: boolean): string {
  const facet = facetHighlight
    ? '<path fill="var(--piece-stroke)" stroke="none" d="M22.5 9.2c-5.4 1.2-12.2 3.6-14.8 7.6 5-4 10.2-6.8 14.8-7.6z"/>'
    : ''
  const orbs = QUEEN_ORBS.map(
    (p) =>
      `<circle class="queen-orb" fill="var(--piece-stroke)" stroke="none" cx="${p.cx}" cy="${p.cy}" r="${QUEEN_ORB_R}"/>`,
  ).join('')
  return (
    `<svg class="svg-piece" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">` +
    `<g fill="none" fill-rule="evenodd" stroke="var(--piece-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">` +
    `<path class="queen-silhouette" fill="var(--piece-fill)" d="${QUEEN_BODY}"/>` +
    facet +
    orbs +
    `</g></svg>`
  )
}

// SVGs processed to support dynamic CSS variables:
// --piece-fill (body color)
// --piece-stroke (outlines and details)
const SVGS: Record<Color, Record<PieceSymbol, string>> = {
  "w": {
    "p": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z\"/></svg>",
    "n": knightGlyph(false),
    "b": bishopGlyph(false),
    "r": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5\"/><path d=\"m34 14-3 3H14l-3-3\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M31 17v12.5H14V17\"/><path d=\"m31 29.5 1.5 2.5h-20l1.5-2.5\"/><path fill=\"none\" stroke-linejoin=\"miter\" d=\"M11 14h23\"/></g></svg>",
    "q": queenGlyph(false),
    "k": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"miter\" d=\"M22.5 11.63V6M20 8h5\"/><path fill=\"var(--piece-fill)\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5\"/><path fill=\"var(--piece-fill)\" d=\"M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z\"/><path d=\"M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0\"/></g></svg>"
  },
  "b": {
    "p": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><path fill=\"var(--piece-fill)\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z\"/></svg>",
    "n": knightGlyph(true),
    "b": bishopGlyph(true),
    "r": "<svg class=\"svg-piece\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"var(--piece-fill)\" fill-rule=\"evenodd\" stroke=\"var(--piece-stroke)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"butt\" d=\"M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z\"/><path stroke-linecap=\"butt\" stroke-linejoin=\"miter\" d=\"M14 29.5v-13h17v13z\"/><path stroke-linecap=\"butt\" d=\"M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z\"/><path fill=\"none\" stroke=\"var(--piece-stroke)\" stroke-linejoin=\"miter\" stroke-width=\"1\" d=\"M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23\"/></g></svg>",
    "q": queenGlyph(true),
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

/** Lamp-side bloom on the Staunton pawn globe — sized to read on a ~40px phone square. */
const PAWN_ORB = { cx: 20.85, cy: 11.35, r: 2.72 }

/** Hot core inside the pawn bloom — a glass-globe spark, not a second cup. */
const PAWN_SPARK = { cx: 19.95, cy: 10.45, r: 1.55 }

/** Crown / mitre / battlement highlights keyed to Staunton silhouettes. */
const SHEEN_PATH: Record<PieceSymbol, string> = {
  p: 'M17.8 11c2.8-3.6 6.6-3.6 9.4 0-3.2 1.15-6.2 1.15-9.4 0z',
  n: 'M17.6 8.8c3.4-3.6 9-4 13 0.2-4.6 1.1-9 1.8-13-0.2z',
  b: 'M19.6 6.4c2-2.2 4.8-2.2 6.8 0-2.3.8-4.5.8-6.8 0z',
  r: 'M12.2 10.4h20.6v2.15H12.2z',
  q: 'M9.2 12.4c5.8-2.4 20.8-2.4 26.6 0-8 1.15-18.6 1.15-26.6 0z',
  k: 'M20.4 6.4h4.2v1.7h2.1v2.2h-2.1v2.4h-4.2v-2.4h-2.1V8.1h2.1z',
}

/** Crest shade on the horse — knights skip the lathe cup, so the mane carries the volume. */
const MANE_PATH = 'M23.8 7.2c5.6 2.4 10.4 10.2 12 20.6-4.4-6.6-8.8-14.8-12-20.6z'

/** Carved eye on the horse head — not the snout. Sized to read on a ~40px phone square. */
const KNIGHT_EYE = { cx: 13.2, cy: 17.4, r: 1.72 }

/** Lamp-side catch-lights on the five coronet orbs — sized to read on a phone square. */
const QUEEN_PEARL_R = 2.18
const QUEEN_PEARLS = QUEEN_ORBS

/** Crenel wells between the three Staunton merlons — deep enough to read on a ~40px phone square. */
const ROOK_MERLONS: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 15.15, y: 9.05, w: 4.7, h: 4.85 },
  { x: 25.15, y: 9.05, w: 4.7, h: 4.85 },
]

/** Mitre cleft — vertical cut and crossbar, thick enough to read on a ~40px phone square. */
const BISHOP_CLEFT: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 21.3, y: 6.8, w: 2.4, h: 12.8 },
  { x: 19.2, y: 15.4, w: 6.6, h: 3.4 },
]

/** Gold/lapis inlay on the king’s cross — thick enough to read on a ~40px phone square. */
const KING_CROSS: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 21.15, y: 5.9, w: 2.7, h: 5.95 },
  { x: 19.15, y: 6.25, w: 6.7, h: 3.45 },
]

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
  b: 22.8,
  r: 15.8,
  q: 22.6,
  k: 18.4,
}

/** Lamp-side flute on the turned stem (knight uses a cheek catch-light). Shadow-side umbra mirrors this. */
const FLUTE: Record<PieceSymbol, { cx: number; cy: number; rx: number; ry: number }> = {
  p: { cx: 18.2, cy: 26.4, rx: 1.35, ry: 5.8 },
  n: { cx: 16.8, cy: 18.0, rx: 1.2, ry: 3.15 },
  b: { cx: 18.2, cy: 27.4, rx: 1.35, ry: 5.6 },
  r: { cx: 17.6, cy: 23.8, rx: 1.5, ry: 6.3 },
  q: { cx: 17.8, cy: 26.6, rx: 1.45, ry: 6.2 },
  k: { cx: 17.8, cy: 24.1, rx: 1.45, ry: 6.7 },
}

/** Hollow turned cup in the head / mitre / battlement. Knights skip — the horse is not a lathe bowl. */
const CUP: Record<PieceSymbol, { cy: number; rx: number; ry: number } | null> = {
  p: { cy: 13.4, rx: 3.2, ry: 2.15 },
  n: null,
  b: { cy: 10.6, rx: 2.55, ry: 2.25 },
  r: { cy: 11.4, rx: 7.35, ry: 2.38 },
  q: { cy: 16.4, rx: 5.6, ry: 2.38 },
  k: { cy: 15.2, rx: 3.45, ry: 2.38 },
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

/** Gold/lapis band on the foot — thick enough to read on a ~40px phone square. */
const FERRULE_RY = 1.52
const FERRULE_CY_OFFSET = 2.2

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
  const ferruleFill = color === 'w' ? 'rgba(232,201,126,0.78)' : 'rgba(140,186,220,0.45)'
  const ferrule = latheRing(
    'piece-ferrule',
    (PLINTH_CY[piece] ?? 38.4) + FERRULE_CY_OFFSET,
    rx * 0.97,
    FERRULE_RY,
    ferruleFill,
    ringStroke,
  )
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
  const maneFill = color === 'w' ? 'rgba(62,32,10,0.3)' : 'rgba(0,4,12,0.42)'
  const mane =
    piece === 'n' ? `<path class="piece-mane" d="${MANE_PATH}" fill="${maneFill}"/>` : ''
  const eyeFill = color === 'w' ? 'rgba(36,18,6,0.72)' : 'rgba(0,2,8,0.78)'
  const eye =
    piece === 'n'
      ? `<circle class="piece-eye" cx="${KNIGHT_EYE.cx}" cy="${KNIGHT_EYE.cy}" r="${KNIGHT_EYE.r}" fill="${eyeFill}"/>`
      : ''
  const pearlFill = color === 'w' ? 'rgba(255,255,255,0.55)' : 'rgba(232,201,126,0.42)'
  const pearls =
    piece === 'q'
      ? QUEEN_PEARLS.map(
          (p) =>
            `<circle class="piece-pearl" cx="${(p.cx - 0.55).toFixed(2)}" cy="${(p.cy - 0.7).toFixed(2)}" r="${QUEEN_PEARL_R}" fill="${pearlFill}"/>`,
        ).join('')
      : ''
  const orb =
    piece === 'p'
      ? `<circle class="piece-orb" cx="${PAWN_ORB.cx}" cy="${PAWN_ORB.cy}" r="${PAWN_ORB.r}" fill="${pearlFill}"/>`
      : ''
  const sparkFill = color === 'w' ? 'rgba(255,255,255,0.9)' : 'rgba(255,248,220,0.78)'
  const spark =
    piece === 'p'
      ? `<circle class="piece-spark" cx="${PAWN_SPARK.cx}" cy="${PAWN_SPARK.cy}" r="${PAWN_SPARK.r}" fill="${sparkFill}"/>`
      : ''
  const merlonFill = color === 'w' ? 'rgba(36,18,6,0.5)' : 'rgba(0,2,8,0.6)'
  const merlons =
    piece === 'r'
      ? ROOK_MERLONS.map(
          (m) =>
            `<rect class="piece-merlon" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="0.55" fill="${merlonFill}"/>`,
        ).join('')
      : ''
  const cleftFill = merlonFill
  const cleft =
    piece === 'b'
      ? BISHOP_CLEFT.map(
          (m) =>
            `<rect class="piece-cleft" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="0.45" fill="${cleftFill}"/>`,
        ).join('')
      : ''
  const crossFill = color === 'w' ? 'rgba(232,201,126,0.82)' : 'rgba(232,201,126,0.62)'
  const cross =
    piece === 'k'
      ? KING_CROSS.map(
          (m) =>
            `<rect class="piece-cross" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="0.45" fill="${crossFill}"/>`,
        ).join('')
      : ''
  return svg
    .replace(
      /<svg([^>]*)>/,
      `<svg$1>${defs}${ground}${foot}<g class="piece-lit"${filterAttr}>`,
    )
    .replace(/fill="var\(--piece-fill\)"/g, `fill="url(#${id}g)"`)
    .replace(
      '</svg>',
      `</g>${ferrule}${plinth}${rim}${waist}${collar}${neck}${flute}${umbra}${cup}${mane}${eye}${orb}${spark}${pearls}${merlons}${cleft}${cross}${highlight}</svg>`,
    )
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
