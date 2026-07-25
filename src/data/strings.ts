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

/** Short Lens dial tooltips — keep in sync with deriveCalibrationLens. */
export const CALIBRATION_LENS_HINTS = {
  Forgiving: 'Anti-tilt active: slower replies, looser tactics.',
  Measured: 'Measured pressure: the rival is reading your tendencies.',
  Equilibrium: 'Rival doctrine unshifted.',
  Sharpened: 'Sharpened pressure: the rival tightens their lines.',
  Relentless: 'Ceiling band for Mastery Trials.',
} as const

/** Archive rating band names shown beside Elo-ish calibration numbers. */
export const ARCHIVE_RATING_BAND_LABELS = {
  elite: 'Archive Elite',
  courtMaster: 'Court Master',
  seasoned: 'Seasoned Rival',
  measured: 'Measured Foe',
  forgiving: 'Forgiving Band',
} as const

export const PLATEAU_COPY = {
  heading: 'Mastery plateau',
  lede: 'Chapters I–IV are sealed. Keep the ledger sharp with Daily Calculus, or reopen every doctrine in the Duel Archive while later ages wait.',
  dailyCta: 'Daily Calculus',
  duelCta: 'Duel Archive',
  resumeCta: 'Resume Recovered Session',
} as const

/** Softer hub while Chapter III freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_COPY = {
  heading: 'Almost sealed',
  lede: 'The Professor\'s Law reflection is inscribed. Finish the Chapter III rehearsal to claim the classical seal, then the Paradox Masters open.',
} as const

/** Hub after Chapter IV reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH4_COPY = {
  heading: 'Almost sealed',
  lede: 'The Paradox Masters reflection is inscribed. Finish the Chapter IV rehearsal to claim the hypermodern seal, then the mastery plateau opens fully.',
} as const

export const ECHO_OUTCOME_LABELS = {
  win: 'Victory',
  loss: 'Defeat',
  draw: 'Draw',
} as const

export const DOSSIER_ECHO_EMPTY =
  'Play this rival to inscribe chronicle echoes — wins, losses, and draws all count.'

export const KEYBOARD_HELP_HEADING = 'Keyboard atlas'

export const CONFIRM_COPY = {
  dailyCalculus: {
    title: 'Leave the current passage?',
    message: "Today's Daily Calculus will replace your open simulation.",
    confirmLabel: 'Open Daily Calculus',
  },
  replaceRecoveredSession: {
    title: 'Replace the recovered session?',
    message: 'You have a recoverable board position. Continuing here will discard that recovery.',
    confirmLabel: 'Continue and discard',
  },
  leaveLabSession: {
    title: 'Leave the simulation?',
    message: 'Your current board position will be saved for Resume, but this passage will close.',
    confirmLabel: 'Leave simulation',
  },
  replaceWithDuel: {
    title: 'Replace the recovered session?',
    message: 'Starting this duel will discard your recoverable campaign or board session.',
    confirmLabel: 'Start duel',
  },
  newChronicle: {
    title: 'Begin a new chronicle?',
    message: 'Your saved expedition, unlocks, and chronicle will be cleared from this browser.',
    confirmLabel: 'New chronicle',
  },
} as const

export const STORAGE_FAILURE_MESSAGE =
  'Progress could not be saved in this browser. Check storage settings or exit private mode.'

/** Short coach line shown when there is no specific lesson context. */
export const FALLBACK_LESSON =
  'Hold the ancient laws: center first, develop minors, castle early, then ask what hangs.'

export type StatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]
export type AnnounceKey = keyof typeof ANNOUNCE_TEMPLATES
