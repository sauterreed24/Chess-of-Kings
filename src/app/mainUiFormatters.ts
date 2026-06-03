import type { Chess } from 'chess.js'
import type { MoveQuality } from './gameFlow'
import { escapeHtml } from './htmlEscape'
import type { AiProfile, MatchHistoryEntry, MatchScene, PuzzleScene, Scene, StoryBeat } from '../types'

/** Compiled once — applied on every chess HUD tick when AI persona is present. */
export const BOSS_PROFILE_RE = /(Apex|Advisor|Counterpart|Strategos|Boss)/i

export function labelForSpeaker(s: string): string {
  const map: Record<string, string> = {
    reed: 'Reed',
    alexion: 'Alexion Demaratos-Serapis',
    narrator: 'Archive',
    system: 'Adaptive trainer',
    scholar: 'Composite Scholar',
    amara: 'Amara',
    lukas: 'Lukas',
    edred: 'Edred',
    marius: 'Marius',
    demetrios: 'Demetrios',
  }
  return map[s] ?? s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
        <span class="teach-label">Threat</span>
        <p class="teach-body">${escapeHtml(teaching.threat)}</p>
      </div>
      <div class="teaching-card">
        <span class="teach-label">Your goal</span>
        <p class="teach-body">${escapeHtml(teaching.goalPlain)}</p>
      </div>
      <div class="teaching-card">
        <span class="teach-label">Why it works</span>
        <p class="teach-body">${escapeHtml(teaching.whyItWorks)}</p>
      </div>
      <div class="teaching-card">
        <span class="teach-label">Concept</span>
        <p class="teach-body">${escapeHtml(teaching.concept)}</p>
      </div>
    </div>`
}

export function storyBeatBlock(storyBeat: StoryBeat | undefined): string {
  if (!storyBeat) return ''
  const tone = storyBeat.tone ?? 'quiet'
  return `
    <aside class="story-beat story-beat--${escapeHtml(tone)}">
      <span class="story-beat__label">${escapeHtml(storyBeat.label)}</span>
      <strong class="story-beat__title">${escapeHtml(storyBeat.title)}</strong>
      <p class="story-beat__body">${escapeHtml(storyBeat.body)}</p>
    </aside>`
}

export function spokenLineText(text: string): string {
  let charIndex = 0
  const visible = text
    .split(/(\s+)/u)
    .map((token) => {
      if (!token) return ''
      if (/^\s+$/u.test(token)) return escapeHtml(token)
      const chars = Array.from(token)
        .map((char) => {
          const delay = charIndex * 6
          charIndex += 1
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

export function aiTraitBars(profile: AiProfile): string {
  const rows = [
    {
      label: 'Risk',
      value: profile.riskAppetite,
      note:
        profile.riskAppetite >= 0.74
          ? 'forces complications'
          : profile.riskAppetite >= 0.48
            ? 'chooses timed pressure'
            : 'prefers structure',
    },
    {
      label: 'Discipline',
      value: profile.openingDiscipline,
      note:
        profile.openingDiscipline >= 0.78
          ? 'keeps repertoire shape'
          : profile.openingDiscipline >= 0.55
            ? 'mostly stays on-book'
            : 'will improvise early',
    },
    {
      label: 'King safety',
      value: profile.kingSafetyUrgency,
      note:
        profile.kingSafetyUrgency >= 0.82
          ? 'shelter before spectacle'
          : profile.kingSafetyUrgency >= 0.58
            ? 'safety with pressure'
            : 'invites fire',
    },
  ]
  const rowsHtml = rows
    .map((row) => {
      const pct = pct01(row.value)
      return `<div class="ai-trait ai-trait--${traitBand(row.value)}">
        <div class="ai-trait__head">
          <span>${escapeHtml(row.label)}</span>
          <strong>${pct}%</strong>
        </div>
        <div class="ai-trait__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p>${escapeHtml(row.note)}</p>
      </div>`
    })
    .join('')
  return `<div class="ai-traits" aria-label="${escapeHtml(profile.label)} AI trait profile">
    <div class="ai-traits__title">
      <span class="teach-label">AI Doctrine</span>
      <strong>${escapeHtml(profile.label)}</strong>
      <small>${escapeHtml(profile.conversionPersona)} conversion</small>
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
    const wIcon = wQ ? `<span class="q-icon q-icon--${wQ}">${QUALITY_ICON[wQ] ?? ''}</span>` : ''
    const bIcon = bQ ? `<span class="q-icon q-icon--${bQ}">${QUALITY_ICON[bQ] ?? ''}</span>` : ''
    const latest = i + 2 >= sanLog.length
    rows.push(
      `<div class="ledger-row${latest ? ' ledger-row--latest' : ''}">` +
        `<span class="ledger-num">${n}.</span>` +
        `<span class="ledger-w ${wQ ? `ledger-w--${wQ}` : ''}">${escapeHtml(wSan)}${wIcon}</span>` +
        `<span class="ledger-b">${bSan ? escapeHtml(bSan) + bIcon : '…'}</span>` +
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
  const variants = ['Next Training Focus', 'Adaptive Next Steps', 'Refinement Focus']
  return variants[Math.abs(seed) % variants.length]!
}

export function performanceDeltaLines(history: MatchHistoryEntry[], latest: MatchHistoryEntry): string[] {
  const prev = history
    .filter((h) => h.id !== latest.id && h.opponentId === latest.opponentId)
    .slice(-6)
  const lines: string[] = []
  if (!prev.length) {
    lines.push('Baseline established: future recaps will compare this performance directly.')
    return lines
  }

  const avgPrevMoves = prev.reduce((a, h) => a + h.moves, 0) / prev.length
  const moveDelta = latest.moves - avgPrevMoves
  if (moveDelta <= -3) {
    lines.push(`Conversion speed improved: ${Math.abs(moveDelta).toFixed(1)} fewer ply than your recent average.`)
  } else if (moveDelta >= 3) {
    lines.push(`Longer battle than usual: ${moveDelta.toFixed(1)} extra ply — consider earlier simplification windows.`)
  } else {
    lines.push('Pacing remained consistent with your recent baseline.')
  }

  const avgPrevGrade = prev.reduce((a, h) => a + gradeScore(h.styleGrade), 0) / prev.length
  const gradeDelta = gradeScore(latest.styleGrade) - avgPrevGrade
  if (gradeDelta >= 0.8) {
    lines.push('Quality rose materially: your tactical/strategic execution is trending upward.')
  } else if (gradeDelta <= -0.8) {
    lines.push('Quality dipped versus baseline: reduce volatility and prioritize stable conversion lines.')
  } else {
    lines.push('Quality remained near baseline; consistency is strengthening.')
  }

  const streak = [...history]
    .reverse()
    .filter((h) => h.opponentId === latest.opponentId)
    .slice(0, 4)
  const wins = streak.filter((h) => h.outcome === 'win').length
  if (wins >= 3)
    lines.push('Rival pressure trend: sustained dominance detected — increase duel difficulty for sharper growth.')
  else if (wins === 0)
    lines.push('Rival pressure trend: opponent still dictating terms — use counter-prep before rematch.')

  return lines.slice(0, 3)
}

const PIECE_GLYPH: Record<string, [string, string]> = {
  q: ['♕', '♛'],
  r: ['♖', '♜'],
  b: ['♗', '♝'],
  n: ['♘', '♞'],
  p: ['♙', '♟'],
}

export function capturedRow(types: string[], color: 'w' | 'b'): string {
  if (!types.length) return '<span class="captured-empty">—</span>'
  const gi = color === 'w' ? 0 : 1
  return types
    .map((t) => `<span class="cap-piece" aria-hidden="true">${(PIECE_GLYPH[t] ?? ['?', '?'])[gi]}</span>`)
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
