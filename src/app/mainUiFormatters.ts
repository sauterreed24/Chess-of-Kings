import type { Chess, Color, PieceSymbol } from 'chess.js'
import type { MoveQuality } from './gameFlow'
import { escapeHtml } from './htmlEscape'
import { glyphForSkin, pieceStrokeTone } from '../chess/skins'
import type { AiProfile, MatchHistoryEntry, MatchScene, PieceSkinId, PuzzleScene, Scene, StoryBeat } from '../types'

/** Compiled once — applied on every chess HUD tick when AI persona is present. */
export const BOSS_PROFILE_RE = /(Apex|Advisor|Counterpart|Strategos|Boss)/i

/** Shared phone-readable SAN / eval score floor. */
export const EVAL_BAR_SCORE_SIZE = '0.78rem'

type DialogueVoice = 'archive' | 'reed' | 'alexion' | 'system' | 'scholar' | 'fire' | 'rival'

type SpeakerMeta = {
  label: string
  sigil: string
  voice: DialogueVoice
  cadenceMs: number
}

const SPEAKER_META: Record<string, SpeakerMeta> = {
  narrator: { label: 'Archive', sigil: 'AR', voice: 'archive', cadenceMs: 8 },
  reed: { label: 'Reed', sigil: 'R', voice: 'reed', cadenceMs: 8 },
  alexion: { label: 'Alexion Demaratos-Serapis', sigil: 'A', voice: 'alexion', cadenceMs: 9 },
  system: { label: 'Archive lens', sigil: 'ARC', voice: 'system', cadenceMs: 7 },
  scholar: { label: 'Composite Scholar', sigil: 'SC', voice: 'scholar', cadenceMs: 9 },
  amara: { label: 'Amara', sigil: 'AM', voice: 'scholar', cadenceMs: 9 },
  lukas: { label: 'Lukas', sigil: 'LU', voice: 'scholar', cadenceMs: 8 },
  edred: { label: 'Edred', sigil: 'ED', voice: 'scholar', cadenceMs: 8 },
  marius: { label: 'Marius', sigil: 'MA', voice: 'scholar', cadenceMs: 9 },
  demetrios: { label: 'Demetrios', sigil: 'DE', voice: 'scholar', cadenceMs: 9 },
  kallistos: { label: 'Kallistos', sigil: 'KA', voice: 'scholar', cadenceMs: 9 },
  nysa: { label: 'Nysa', sigil: 'NY', voice: 'rival', cadenceMs: 8 },
  cassian: { label: 'Cassian', sigil: 'CA', voice: 'rival', cadenceMs: 9 },
  gage: { label: 'Gage', sigil: 'GA', voice: 'scholar', cadenceMs: 9 },
  helia: { label: 'Helia', sigil: 'HE', voice: 'rival', cadenceMs: 8 },
  prax: { label: 'Prax', sigil: 'PX', voice: 'scholar', cadenceMs: 8 },
  iota: { label: 'Iota', sigil: 'IO', voice: 'rival', cadenceMs: 8 },
  mira: { label: 'Mira', sigil: 'MI', voice: 'scholar', cadenceMs: 8 },
  soren: { label: 'Soren', sigil: 'SO', voice: 'rival', cadenceMs: 8 },
  voss: { label: 'Voss', sigil: 'VO', voice: 'scholar', cadenceMs: 8 },
  elara: { label: 'Elara', sigil: 'EL', voice: 'rival', cadenceMs: 8 },
  wren: { label: 'Wren', sigil: 'WR', voice: 'scholar', cadenceMs: 8 },
  bram: { label: 'Bram', sigil: 'BR', voice: 'rival', cadenceMs: 8 },
  rowan: { label: 'Rowan Vale', sigil: 'RO', voice: 'fire', cadenceMs: 7 },
  vega: { label: 'Vega Sorn', sigil: 'VE', voice: 'rival', cadenceMs: 8 },
}

function fallbackSpeakerLabel(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fallbackSpeakerSigil(s: string): string {
  const clean = s.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase()
  return clean || 'V'
}

export function labelForSpeaker(s: string): string {
  return SPEAKER_META[s]?.label ?? fallbackSpeakerLabel(s)
}

export function speakerSigilFor(s: string): string {
  return SPEAKER_META[s]?.sigil ?? fallbackSpeakerSigil(s)
}

export function speakerVoiceFor(s: string): DialogueVoice {
  return SPEAKER_META[s]?.voice ?? 'rival'
}

export function speakerCadenceMs(s: string): number {
  return SPEAKER_META[s]?.cadenceMs ?? 6
}

export function sceneTypeLabel(sc: Scene): string {
  switch (sc.type) {
    case 'dialogue':
      return 'Dialogue'
    case 'interlude':
      return 'Interlude'
    case 'codex':
      return sc.heading
    case 'puzzle':
      return 'Puzzle'
    case 'match':
      return 'Match'
    case 'calibration':
      return 'Calibration'
    case 'freeplay':
      return 'Free board'
  }
}

export function teachingBlock(teaching: NonNullable<PuzzleScene['teaching']>) {
  return `
    <div class="teaching">
      <div class="teaching-card">
        <span class="teach-label" style="font-size:0.7rem">Threat</span>
        <p class="teach-body">${escapeHtml(teaching.threat)}</p>
      </div>
      <div class="teaching-card">
        <span class="teach-label" style="font-size:0.7rem">Your goal</span>
        <p class="teach-body">${escapeHtml(teaching.goalPlain)}</p>
      </div>
    </div>
    <details class="dossier-fold teaching-more">
      <summary class="dossier-fold__summary">Why it works · Concept</summary>
      <div class="dossier-fold__body">
        <div class="teaching">
          <div class="teaching-card">
            <span class="teach-label" style="font-size:0.7rem">Why it works</span>
            <p class="teach-body">${escapeHtml(teaching.whyItWorks)}</p>
          </div>
          <div class="teaching-card">
            <span class="teach-label" style="font-size:0.7rem">Concept</span>
            <p class="teach-body">${escapeHtml(teaching.concept)}</p>
          </div>
        </div>
      </div>
    </details>`
}

export function storyBeatBlock(storyBeat: StoryBeat | undefined): string {
  if (!storyBeat) return ''
  const tone = storyBeat.tone ?? 'quiet'
  return `
    <aside class="story-beat story-beat--${escapeHtml(tone)}">
      <span class="story-beat__label" style="font-size:0.7rem">${escapeHtml(storyBeat.label)}</span>
      <strong class="story-beat__title">${escapeHtml(storyBeat.title)}</strong>
      <p class="story-beat__body">${escapeHtml(storyBeat.body)}</p>
    </aside>`
}

function glyphPauseMs(char: string): number {
  if (/[.!?]/u.test(char)) return 90
  if (/[,;:]/u.test(char)) return 45
  if (/["')\]]/u.test(char)) return 8
  return 0
}

function spokenGlyphOffsets(text: string, charStepMs: number): number[] {
  const offsets: number[] = []
  let cursor = 0
  for (const token of text.split(/(\s+)/u)) {
    if (!token || /^\s+$/u.test(token)) continue
    for (const char of Array.from(token)) {
      offsets.push(cursor)
      cursor += charStepMs + glyphPauseMs(char)
    }
  }
  return offsets
}

export function spokenLineDurationMs(text: string, speaker: string, lineDelayMs: number): number {
  const offsets = spokenGlyphOffsets(text, speakerCadenceMs(speaker))
  const lastDelay = offsets.length ? offsets[offsets.length - 1]! : 0
  return Math.round(lineDelayMs + lastDelay + 260)
}

export function spokenLineText(text: string, charStepMs = 6): string {
  const offsets = spokenGlyphOffsets(text, Math.max(1, Math.round(charStepMs)))
  let offsetIndex = 0
  const visible = text
    .split(/(\s+)/u)
    .map((token) => {
      if (!token) return ''
      if (/^\s+$/u.test(token)) return escapeHtml(token)
      const chars = Array.from(token)
        .map((char) => {
          const delay = offsets[offsetIndex] ?? 0
          offsetIndex += 1
          return `<span class="spoken-char" style="--char-delay:${delay}ms">${escapeHtml(char)}</span>`
        })
        .join('')
      return `<span class="spoken-word">${chars}</span>`
    })
    .join('')
  return `<span class="spoken-line"><span class="sr-only">${escapeHtml(text)}</span><span class="spoken-text" aria-hidden="true">${visible}</span></span>`
}

function pct01(n: number): number {
  return Math.round(Math.max(0, Math.min(1, n)) * 100)
}

function traitBand(value: number): string {
  if (value >= 0.78) return 'high'
  if (value >= 0.52) return 'measured'
  return 'low'
}

/* Archive grading vocabulary: one scale for every virtue, so a glance
   reads like a clerk's marginal note rather than a stat sheet. */
function traitGrade(value: number): string {
  if (value >= 0.78) return 'fervent'
  if (value >= 0.52) return 'tempered'
  return 'faint'
}

/** How the rival closes a won position, in the court's own idiom. */
const CONVERSION_SCHOOL: Record<string, string> = {
  technical: 'Finishes by the ledger',
  tactical: 'Finishes by the sword',
  universal: 'Finishes by any road',
}

/**
 * Court dossier — the archive's filed assessment of a rival's habits.
 * Four virtues, graded the way a Hellenistic war-academy would grade an
 * officer: Audacity (appetite for risk), Canon (fidelity to the studied
 * line — the kanon, the measuring rod), Vigil (the watch kept over the
 * crown), Foresight (how deep their reading runs).
 */
export function aiTraitBars(profile: AiProfile): string {
  const rows = [
    {
      label: 'Audacity',
      value: profile.riskAppetite,
      note:
        profile.riskAppetite >= 0.74
          ? 'forces complications'
          : profile.riskAppetite >= 0.48
            ? 'chooses timed pressure'
            : 'prefers structure',
    },
    {
      label: 'Canon',
      value: profile.openingDiscipline,
      note:
        profile.openingDiscipline >= 0.78
          ? 'keeps the studied line'
          : profile.openingDiscipline >= 0.55
            ? 'mostly honors the book'
            : 'will improvise early',
    },
    {
      label: 'Vigil',
      value: profile.kingSafetyUrgency,
      note:
        profile.kingSafetyUrgency >= 0.82
          ? 'shelter before spectacle'
          : profile.kingSafetyUrgency >= 0.58
            ? 'safety with pressure'
            : 'invites fire',
    },
    {
      label: 'Foresight',
      value: profile.tacticalAlertness,
      note:
        profile.tacticalAlertness >= 0.78
          ? 'reads three intentions deep'
          : profile.tacticalAlertness >= 0.5
            ? 'sees the named threats'
            : 'watches the loudest piece',
    },
  ]
  const rowsHtml = rows
    .map((row) => {
      const pct = pct01(row.value)
      return `<div class="ai-trait ai-trait--${traitBand(row.value)}">
        <div class="ai-trait__head">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(traitGrade(row.value))}</strong>
        </div>
        <div class="ai-trait__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p>${escapeHtml(row.note)}</p>
      </div>`
    })
    .join('')
  const school = CONVERSION_SCHOOL[profile.conversionPersona] ?? 'Finishes by any road'
  return `<div class="ai-traits" aria-label="${escapeHtml(profile.label)} court dossier">
    <div class="ai-traits__title">
      <span class="teach-label" style="font-size:0.7rem">Court Dossier</span>
      <strong>${escapeHtml(profile.label)}</strong>
      <small>${escapeHtml(school)}</small>
    </div>
    ${rowsHtml}
  </div>`
}

const QUALITY_ICON: Record<string, string> = {
  brilliant: '!!',
  good: '!',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
}

export function formatMoveLedger(sanLog: string[], sanQuality: MoveQuality[]): string {
  if (sanLog.length === 0) {
    return '<span class="ledger-empty">No moves yet.</span>'
  }
  const rows: string[] = []
  for (let i = 0; i < sanLog.length; i += 2) {
    const n = Math.floor(i / 2) + 1
    const wSan = sanLog[i] ?? ''
    const bSan = sanLog[i + 1] ?? ''
    const wQ = sanQuality[i] ?? null
    const bQ = sanQuality[i + 1] ?? null
    const wIcon = wQ ? `<span class="q-icon q-icon--${wQ}" style="font-size:0.7rem">${QUALITY_ICON[wQ] ?? ''}</span>` : ''
    const bIcon = bQ ? `<span class="q-icon q-icon--${bQ}" style="font-size:0.7rem">${QUALITY_ICON[bQ] ?? ''}</span>` : ''
    const latest = i + 2 >= sanLog.length
    rows.push(
      `<div class="ledger-row${latest ? ' ledger-row--latest' : ''}" style="font-size:${EVAL_BAR_SCORE_SIZE}">` +
        `<span class="ledger-num">${n}. </span>` +
        `<span class="ledger-w ${wQ ? `ledger-q--${wQ}` : ''}">${escapeHtml(wSan)}${wIcon} </span>` +
        `<span class="ledger-b ${bQ ? `ledger-q--${bQ}` : ''}">${bSan ? escapeHtml(bSan) + bIcon : '…'}</span>` +
        `</div>`,
    )
  }
  return rows.join('')
}

export function gradeScore(g: MatchHistoryEntry['styleGrade']): number {
  if (g === 'S') return 5
  if (g === 'A') return 4
  if (g === 'B') return 3
  if (g === 'C') return 2
  return 1
}

export function dynamicTrainingTitle(seed: number): string {
  const variants = ['Next Rematch Focus', 'Adaptive Drill', 'Refinement File']
  return variants[Math.abs(seed) % variants.length]!
}

export function performanceDeltaLines(history: MatchHistoryEntry[], latest: MatchHistoryEntry): string[] {
  const prev = history
    .filter((h) => h.id !== latest.id && h.opponentId === latest.opponentId)
    .slice(-6)
  const lines: string[] = []
  if (!prev.length) {
    lines.push('Baseline filed: next recaps compare speed, grade, and pressure.')
    return lines
  }

  const avgPrevMoves = prev.reduce((a, h) => a + h.moves, 0) / prev.length
  const moveDelta = latest.moves - avgPrevMoves
  if (moveDelta <= -3) {
    lines.push(`Converted faster: ${Math.abs(moveDelta).toFixed(1)} fewer ply than your rival baseline.`)
  } else if (moveDelta >= 3) {
    lines.push(`Fight ran long: ${moveDelta.toFixed(1)} extra ply. Seek earlier trades or a cleaner file.`)
  } else {
    lines.push('Tempo held steady against this rival.')
  }

  const avgPrevGrade = prev.reduce((a, h) => a + gradeScore(h.styleGrade), 0) / prev.length
  const gradeDelta = gradeScore(latest.styleGrade) - avgPrevGrade
  if (gradeDelta >= 0.8) {
    lines.push('Quality rose: calculation and conversion are carrying more weight.')
  } else if (gradeDelta <= -0.8) {
    lines.push('Quality slipped: reduce volatility and stabilize before forcing play.')
  } else {
    lines.push('Quality held: consistency is becoming a weapon.')
  }

  const streak = [...history]
    .reverse()
    .filter((h) => h.opponentId === latest.opponentId)
    .slice(0, 4)
  const wins = streak.filter((h) => h.outcome === 'win').length
  if (wins >= 3)
    lines.push('Rival trend: the file is yours. Raise pressure for a sharper archive.')
  else if (wins === 0)
    lines.push('Rival trend: they still set the terms. Use counter-prep before rematch.')

  return lines.slice(0, 3)
}

const CAPTURE_TYPES: readonly PieceSymbol[] = ['q', 'r', 'b', 'n', 'p']

/** Inline size so carved HUD glyphs read without a stylesheet bump. */
export const CAPTURED_GLYPH_SIZE = '2rem'

function capturedPieceStyleAttr(skin: PieceSkinId, color: Color): string {
  const tone = pieceStrokeTone(skin, color)
  const size = `width:${CAPTURED_GLYPH_SIZE};height:${CAPTURED_GLYPH_SIZE};flex-shrink:0`
  return tone ? ` style="${size};--piece-stroke:${tone}"` : ` style="${size}"`
}

/** Match, freeplay, and duel surfaces share the same eval / capture HUD. */
export function showsEvalHud(sceneType: Scene['type']): boolean {
  return sceneType === 'match' || sceneType === 'freeplay'
}

/** Rotated score must fit the tray; 8px + 0.38rem collapses on phone. */
export const EVAL_BAR_WIDTH = '18px'
export const EVAL_BAR_SCORE_COLOR = 'rgba(246,240,226,0.88)'

export function syncEvalBarScale(
  wrap: HTMLElement | null | undefined,
  score: HTMLElement | null | undefined,
  visible: boolean,
): void {
  if (wrap) {
    wrap.style.width = visible ? EVAL_BAR_WIDTH : ''
    wrap.style.flexShrink = visible ? '0' : ''
  }
  if (score) {
    score.style.fontSize = visible ? EVAL_BAR_SCORE_SIZE : ''
    score.style.color = visible ? EVAL_BAR_SCORE_COLOR : ''
  }
}

export function capturedRow(
  types: string[],
  color: Color,
  skin: PieceSkinId = 'classic-royal',
): string {
  if (!types.length) return '<span class="captured-empty">—</span>'
  return types
    .map((t) => {
      const piece = (CAPTURE_TYPES.includes(t as PieceSymbol) ? t : 'p') as PieceSymbol
      return `<span class="cap-piece piece piece--${color}"${capturedPieceStyleAttr(skin, color)} aria-hidden="true">${glyphForSkin(skin, color, piece)}</span>`
    })
    .join('')
}

export function getCaptured(chess: Chess): { byWhite: string[]; byBlack: string[] } {
  const init: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 }
  const wCurr: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 }
  const bCurr: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 }
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.type === 'k') continue
      if (p.color === 'w') wCurr[p.type] = (wCurr[p.type] ?? 0) + 1
      else bCurr[p.type] = (bCurr[p.type] ?? 0) + 1
    }
  }
  const byWhite: string[] = []
  const byBlack: string[] = []
  for (const t of ['q', 'r', 'b', 'n', 'p']) {
    const wLost = (init[t] ?? 0) - (wCurr[t] ?? 0)
    const bLost = (init[t] ?? 0) - (bCurr[t] ?? 0)
    for (let i = 0; i < bLost; i++) byWhite.push(t)
    for (let i = 0; i < wLost; i++) byBlack.push(t)
  }
  return { byWhite, byBlack }
}

export function diffStars(difficulty: number | undefined): string {
  const n = difficulty ?? 0
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="diff-star ${i < n ? 'diff-star--on' : ''}" aria-hidden="true">★</span>`,
  ).join('')
}

export function tierLabel(tier: MatchScene['ladderTier']): string {
  const map: Record<string, string> = {
    initiate: 'Initiate',
    apprentice: 'Apprentice',
    scholar: 'Scholar',
    'mini-boss': 'Mini-Boss',
    veteran: 'Veteran',
    boss: 'Boss',
    counterpart: 'Counterpart',
  }
  return tier ? (map[tier] ?? tier) : ''
}
