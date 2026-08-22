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
  proofSealed: 'Proof sealed. Advance when ready.',
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
  lede: 'Chapters I–IX are sealed. Keep the ledger sharp with Daily Calculus, or reopen every doctrine in the Duel Archive.',
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
  lede: 'The Paradox Masters reflection is inscribed. Finish the Chapter IV rehearsal to claim the hypermodern seal, then the Machine of Discipline opens.',
} as const

/** Hub after Chapter V reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH5_COPY = {
  heading: 'Almost sealed',
  lede: 'The Machine of Discipline reflection is inscribed. Finish the Chapter V rehearsal to claim the discipline seal, then the Silicon Threshold opens.',
} as const

/** Hub after Chapter VI reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH6_COPY = {
  heading: 'Almost sealed',
  lede: 'The Silicon Threshold reflection is inscribed. Finish the Chapter VI rehearsal to claim the ledger seal, then the Human Synthesis opens.',
} as const

/** Hub after Chapter VII reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH7_COPY = {
  heading: 'Almost sealed',
  lede: 'The Human Synthesis reflection is inscribed. Finish the Chapter VII rehearsal to claim the synthesis seal, then the Alexandrine Board opens.',
} as const

/** Hub after Chapter VIII reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH8_COPY = {
  heading: 'Almost sealed',
  lede: 'The Alexandrine Board reflection is inscribed. Finish the Chapter VIII rehearsal to claim the stratarchic seal, then the Apotheosis Engine opens.',
} as const

/** Hub after Chapter IX reflection while freeplay / clear rewards are still outstanding. */
export const PLATEAU_PENDING_CH9_COPY = {
  heading: 'Almost sealed',
  lede: 'The Apotheosis Engine reflection is inscribed. Finish the Chapter IX rehearsal to claim the last seal, then the mastery plateau opens fully.',
} as const

/** Shown when Chapter III is sealed and Chapter IV is waiting, including migrated saves. */
export const PARADOX_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Professor\'s Law is sealed. The Paradox Masters wait in the vestibule — refuse the center to own it later.',
  enterCta: 'Enter the Paradox Masters',
} as const

/** Shown when Chapter IV is sealed and Chapter V is waiting, including migrated saves. */
export const MACHINE_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Paradox Masters are sealed. The Machine of Discipline waits in the vestibule — prophylaxis, luft, and the long squeeze.',
  enterCta: 'Enter the Machine of Discipline',
} as const

/** Shown when Chapter V is sealed and Chapter VI is waiting, including migrated saves. */
export const SILICON_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Machine of Discipline is sealed. The Silicon Threshold waits in the vestibule — occupy the hole, take what hangs, finish the file.',
  enterCta: 'Enter the Silicon Threshold',
} as const

/** Shown when Chapter VI is sealed and Chapter VII is waiting, including migrated saves. */
export const SYNTHESIS_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Silicon Threshold is sealed. The Human Synthesis waits in the vestibule — switch schools, castle the safer wing, finish the tactic.',
  enterCta: 'Enter the Human Synthesis',
} as const

/** Shown when Chapter VII is sealed and Chapter VIII is waiting, including migrated saves. */
export const ALEXANDRINE_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Human Synthesis is sealed. The Alexandrine Board waits in the vestibule — take the vacant office, fork two futures, file the mate.',
  enterCta: 'Enter the Alexandrine Board',
} as const

/** Shown when Chapter VIII is sealed and Chapter IX is waiting, including migrated saves. */
export const APOTHEOSIS_OPENED_COPY = {
  heading: 'A new age is open',
  lede: 'The Alexandrine Board is sealed. The Apotheosis Engine waits in the vestibule — read the census, survive the compiled school, file the last rank.',
  enterCta: 'Enter the Apotheosis Engine',
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
  leaveLabToChapters: {
    title: 'Return to Chapters?',
    message: 'Your board will be saved for Resume. This passage will close.',
    confirmLabel: 'Open Chapters',
  },
  leaveLabToTitle: {
    title: 'Return to Title?',
    message: 'Your board will be saved for Resume. This passage will close.',
    confirmLabel: 'Open Title',
  },
  leaveLabToDuel: {
    title: 'Open the Duel Archive?',
    message: 'Your board will be saved for Resume. This passage will close.',
    confirmLabel: 'Open Duel Archive',
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

export type LabExitDest = 'title' | 'chapters' | 'duel'

export function confirmCopyForLabExit(dest: LabExitDest, inDuel: boolean) {
  if (inDuel) return CONFIRM_COPY.replaceRecoveredSession
  if (dest === 'duel') return CONFIRM_COPY.leaveLabToDuel
  if (dest === 'title') return CONFIRM_COPY.leaveLabToTitle
  return CONFIRM_COPY.leaveLabToChapters
}

export const STORAGE_FAILURE_MESSAGE =
  'Progress could not be saved in this browser. Check storage settings or exit private mode.'

/** Short coach line shown when there is no specific lesson context. */
export const FALLBACK_LESSON =
  'Hold the ancient laws: center first, develop minors, castle early, then ask what hangs.'

export type StatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]
export type AnnounceKey = keyof typeof ANNOUNCE_TEMPLATES
