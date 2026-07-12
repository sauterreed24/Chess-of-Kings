/**
 * Centralized UI strings. Pass 8 deliberately scaffolds the structure
 * (a single TS module of named constants) without introducing any
 * runtime translation layer — if i18n becomes a real product
 * requirement later, this is where translators (or a runtime t() helper)
 * would plug in.
 *
 * Rules of thumb:
 *   - Long-form prose (chapter dialogue / interlude text / codex bodies)
 *     stays in src/data/chapters.ts; that file is curated narrative.
 *   - This module owns SHORT, REPEATED, UI-CHROME strings: status pill
 *     labels, button copy, screen reader announcement templates, etc.
 *   - Every entry is `as const` so types are literal-narrowed at use
 *     sites (autocomplete, exhaustive-switch hints, etc.).
 *   - No template-literal interpolation here -- callers concatenate.
 */

export const STATUS_LABELS = {
  win: 'Victory',
  loss: 'Defeat',
  draw: 'Drawn',
  thinking: 'Thinking…',
  recovered: 'Session recovered',
} as const

export const ANNOUNCE_TEMPLATES = {
  /** Used by the aria-live outcome announcer. {0} = rival name. */
  matchWin: 'Match won against',
  matchLoss: 'Match lost to',
  matchDraw: 'Match drawn with',
  rewardsInscribed: 'New rewards inscribed.',
  chapterThreshold: 'Chapter threshold crossed.',
  rankUp: 'Rank advanced.',
  newDay: 'New session streak day recorded.',
} as const

export const RIBBON_LABELS = {
  dailyCalculus: 'Daily Calculus',
  newStreak: 'Day 1 of a new streak',
  /** Used as `${count} ${dayStreakSuffix}` in callsites; kept as a noun phrase. */
  dayStreakSuffix: 'day streak',
} as const

export const CALIBRATION_LEVEL_LABELS = {
  Forgiving: 'Forgiving',
  Measured: 'Measured',
  Equilibrium: 'Equilibrium',
  Sharpened: 'Sharpened',
  Relentless: 'Relentless',
} as const

export const KEYBOARD_HELP_HEADING = 'Keyboard atlas'

export const CONFIRM_COPY = {
  dailyCalculus: {
    title: 'Leave the current passage?',
    message: "Today's Daily Calculus will replace your open simulation.",
    confirmLabel: 'Open Daily Calculus',
  },
  newChronicle: {
    title: 'Begin a new chronicle?',
    message: 'Your saved expedition, unlocks, and chronicle will be cleared from this browser.',
    confirmLabel: 'New chronicle',
  },
  leavePassage: {
    title: 'Leave the current passage?',
    message: 'Your open simulation will be replaced. Resume it later from the chronicle index if you return soon.',
    confirmLabel: 'Switch passage',
  },
} as const

export const STORAGE_FAILURE_MESSAGE =
  'Progress could not be saved in this browser. Check storage settings or exit private mode.'

/** Short coach line shown when there is no specific lesson context. */
export const FALLBACK_LESSON = 'Apply the ancient laws — develop, castle early, avoid loose pieces.'

export type StatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]
export type AnnounceKey = keyof typeof ANNOUNCE_TEMPLATES
