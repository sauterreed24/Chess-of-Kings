import type { RewardDefinition } from '../types'

export const BASE_VICTORY_REWARDS: Record<string, RewardDefinition[]> = {
  'c1-match-amara': [
    {
      id: 'rw-skin-classic',
      kind: 'skin',
      label: 'Skin Unlocked: Classic Royal',
      description: 'The court grants a standard royal set for duel replay.',
      skinId: 'classic-royal',
    },
  ],
  'c1-match-lukas': [
    {
      id: 'rw-codex-lukas',
      kind: 'codex',
      label: 'Archive Note: Lukas Deviation',
      description: 'Off-book transitions force understanding over memory.',
      codexId: 'codex-lukas-deviation',
    },
  ],
  'c1-match-edred': [
    {
      id: 'rw-skin-contrast',
      kind: 'skin',
      label: 'Skin Unlocked: High Contrast Tournament',
      description: 'A practical set optimized for tactical visibility.',
      skinId: 'high-contrast',
    },
  ],
  'c1-match-marius': [
    {
      id: 'rw-title-court',
      kind: 'title',
      label: 'Title Earned: Court Tactician',
      description: 'Recognized for manufacturing winning moments from equal structures.',
      titleId: 'court-tactician',
    },
  ],
  'c1-match-demetrios': [
    {
      id: 'rw-skin-ornate',
      kind: 'skin',
      label: 'Skin Unlocked: Alexandrine Ornate',
      description: 'Ceremonial set reserved for high record challengers.',
      skinId: 'alexandrine-ornate',
    },
  ],
  'c1-boss': [
    {
      id: 'rw-skin-neon',
      kind: 'skin',
      label: 'Skin Unlocked: Obsidian Neon',
      description: 'A modernized contrast skin from archive reconstruction.',
      skinId: 'obsidian-neon',
    },
    {
      id: 'rw-variant-alexion-apex',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Alexion Archive Apex',
      description: 'The apex mentor simulation is now available in Duel mode.',
      duelVariantId: 'alexion-apex',
    },
  ],
}

export const CHAPTER_CLEAR_REWARDS: Record<string, RewardDefinition[]> = {
  ch1: [
    {
      id: 'rw-title-ancient-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Ancient Court',
      description: 'Chapter I completed. Your chronicle now carries the first court seal.',
      titleId: 'seal-ancient-court',
    },
    {
      id: 'rw-chronicle-echo-ch1',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A replay-ready summary of your chapter triumph was archived.',
    },
  ],
  ch2: [
    {
      id: 'rw-title-romantic-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Romantic Flame',
      description: 'Chapter II completed. Your chronicle carries the forge-mark of the Romantic ladder.',
      titleId: 'seal-romantic-flame',
    },
    {
      id: 'rw-chronicle-echo-ch2',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A second echo — Romantic trials and verdicts — joins your archive.',
    },
  ],
}
