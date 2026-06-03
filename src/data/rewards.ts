import type { RewardDefinition } from '../types'

export const BASE_VICTORY_REWARDS: Record<string, RewardDefinition[]> = {
  'c1-match-amara': [
    {
      id: 'rw-skin-classic',
      kind: 'skin',
      label: 'Skin Unlocked: Commonwealth Royal',
      description: 'The archive grants the civic tournament set used in schools across the Long Reign.',
      skinId: 'classic-royal',
    },
  ],
  'c1-match-lukas': [
    {
      id: 'rw-codex-lukas',
      kind: 'codex',
      label: 'Archive Note: Phalanx Deviation',
      description: 'A Macedonian center holds only if you understand when the line stops being ceremony.',
      codexId: 'codex-lukas-deviation',
    },
  ],
  'c1-match-edred': [
    {
      id: 'rw-skin-contrast',
      kind: 'skin',
      label: 'Skin Unlocked: High Contrast Tournament',
      description: 'A practical set optimized for tactics under lapis civic glass.',
      skinId: 'high-contrast',
    },
  ],
  'c1-match-marius': [
    {
      id: 'rw-title-court',
      kind: 'title',
      label: 'Title Earned: Court Tactician',
      description: 'Recognized for turning equal structures into lawful pressure before the court can look away.',
      titleId: 'court-tactician',
    },
  ],
  'c1-match-demetrios': [
    {
      id: 'rw-skin-ornate',
      kind: 'skin',
      label: 'Skin Unlocked: Alexandrine Ornate',
      description: 'A brass-and-lapis ceremonial set reserved for candidates who can govern a position.',
      skinId: 'alexandrine-ornate',
    },
  ],
  'c1-boss': [
    {
      id: 'rw-skin-neon',
      kind: 'skin',
      label: 'Skin Unlocked: Obsidian Neon',
      description: 'A reconstruction of civic night boards used by late Commonwealth engine rooms.',
      skinId: 'obsidian-neon',
    },
    {
      id: 'rw-variant-alexion-apex',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Alexion Archive Apex',
      description: 'The mentor mask lifts. Alexion\'s sovereign synthesis is now available in Duel mode.',
      duelVariantId: 'alexion-apex',
    },
  ],
  'c2-match-rowan': [
    {
      id: 'rw-variant-rowan-gambit',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Rowan Gambit Tabiya',
      description: "Replay Rowan's fire doctrine from the Chapter II King's Gambit tabiya in Duel mode.",
      duelVariantId: 'rowan-gambit',
    },
  ],
  'c2-match-vega': [
    {
      id: 'rw-variant-vega-italian',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Vega Italian Pressure',
      description: "Replay Vega's audited Romantic pressure line from Chapter II in Duel mode.",
      duelVariantId: 'vega-italian',
    },
  ],
}

export const CHAPTER_CLEAR_REWARDS: Record<string, RewardDefinition[]> = {
  ch1: [
    {
      id: 'rw-title-ancient-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Ancient Court',
      description: 'Chapter I completed. Your chronicle now carries the first court seal of duty.',
      titleId: 'seal-ancient-court',
    },
    {
      id: 'rw-chronicle-echo-ch1',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A replay-ready echo of your ancient verdict was sealed in cedar and brass.',
    },
  ],
  ch2: [
    {
      id: 'rw-title-romantic-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Romantic Flame',
      description: 'Chapter II completed. Your chronicle carries the forge-mark: fire made accountable.',
      titleId: 'seal-romantic-flame',
    },
    {
      id: 'rw-chronicle-echo-ch2',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A second echo joins your archive: Romantic trials, verdicts, and fire made legible.',
    },
  ],
}
