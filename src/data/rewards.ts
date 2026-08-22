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
  'c3-match-demetrios-return': [
    {
      id: 'rw-codex-demetrios-return',
      kind: 'codex',
      label: 'Archive Note: Returning Examiner',
      description: 'Demetrios files that fire without structure is only noise — and that you heard him.',
      codexId: 'codex-demetrios-return',
    },
  ],
  'c3-match-kallistos': [
    {
      id: 'rw-variant-kallistos-law',
      kind: 'duel-variant',
      label: "Duel Variant Unlocked: Kallistos Professor's Law",
      description: 'Replay Kallistos classical prophylaxis from Chapter III in Duel mode.',
      duelVariantId: 'kallistos-law',
    },
    {
      id: 'rw-title-classical',
      kind: 'title',
      label: 'Title Earned: Classical Analyst',
      description: 'Recognized for stopping threats one move before they earn a name.',
      titleId: 'classical-analyst',
    },
  ],
  'c4-match-nysa': [
    {
      id: 'rw-variant-nysa-frontier',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Nysa Bactrian Frontier',
      description: "Replay Nysa's hypermodern frontier doctrine from Chapter IV in Duel mode.",
      duelVariantId: 'nysa-frontier',
    },
    {
      id: 'rw-codex-nysa-frontier',
      kind: 'codex',
      label: 'Archive Note: Frontier Invitation',
      description: 'Nysa files that empty space is a tax, and that you learned to read the invoice.',
      codexId: 'codex-nysa-frontier',
    },
  ],
  'c4-match-cassian': [
    {
      id: 'rw-variant-cassian-paradox',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Cassian Paradox Master',
      description: "Replay Cassian's paradox doctrine from Chapter IV in Duel mode.",
      duelVariantId: 'cassian-paradox',
    },
    {
      id: 'rw-title-hypermodern',
      kind: 'title',
      label: 'Title Earned: Paradox Analyst',
      description: 'Recognized for refusing empty occupation and punishing overextended kings.',
      titleId: 'paradox-analyst',
    },
  ],
  'c5-match-gage': [
    {
      id: 'rw-variant-gage-discipline',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Gage Discipline Pause',
      description: "Replay Gage's prophylactic pause doctrine from Chapter V in Duel mode.",
      duelVariantId: 'gage-discipline',
    },
    {
      id: 'rw-codex-gage-pause',
      kind: 'codex',
      label: 'Archive Note: The Pause',
      description: 'Gage files that a donated square is how plans earn names, and that you learned to refuse the gift.',
      codexId: 'codex-gage-pause',
    },
  ],
  'c5-match-helia': [
    {
      id: 'rw-variant-helia-machine',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Helia Conversion Machine',
      description: "Replay Helia's conversion doctrine from Chapter V in Duel mode.",
      duelVariantId: 'helia-machine',
    },
    {
      id: 'rw-title-discipline',
      kind: 'title',
      label: 'Title Earned: Discipline Analyst',
      description: 'Recognized for making luft, refusing gifts, and converting advantage into fact.',
      titleId: 'discipline-analyst',
    },
  ],
  'c6-match-prax': [
    {
      id: 'rw-variant-prax-precision',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Prax Public Line',
      description: "Replay Prax's ledger-precision doctrine from Chapter VI in Duel mode.",
      duelVariantId: 'prax-precision',
    },
    {
      id: 'rw-codex-prax-line',
      kind: 'codex',
      label: 'Archive Note: The Public Line',
      description: 'Prax files that an unoccupied hole is a leak, and that you sat on it.',
      codexId: 'codex-prax-line',
    },
  ],
  'c6-match-iota': [
    {
      id: 'rw-variant-iota-threshold',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Iota Ledger Finish',
      description: "Replay Iota's threshold-finish doctrine from Chapter VI in Duel mode.",
      duelVariantId: 'iota-threshold',
    },
    {
      id: 'rw-title-ledger',
      kind: 'title',
      label: 'Title Earned: Ledger Analyst',
      description: 'Recognized for occupying holes, taking hanging pieces, and finishing forced lines.',
      titleId: 'ledger-analyst',
    },
  ],
  'c7-match-mira': [
    {
      id: 'rw-variant-mira-practical',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Mira Practical Tool',
      description: "Replay Mira's synthesis-practical doctrine from Chapter VII in Duel mode.",
      duelVariantId: 'mira-practical',
    },
    {
      id: 'rw-codex-mira-tool',
      kind: 'codex',
      label: 'Archive Note: The Practical Tool',
      description: 'Mira files that last week\'s school is a costume, and that you changed tools.',
      codexId: 'codex-mira-tool',
    },
  ],
  'c7-match-soren': [
    {
      id: 'rw-variant-soren-answer',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Soren Answering School',
      description: "Replay Soren's reply-school doctrine from Chapter VII in Duel mode.",
      duelVariantId: 'soren-answer',
    },
    {
      id: 'rw-title-synthesis',
      kind: 'title',
      label: 'Title Earned: Synthesis Analyst',
      description: 'Recognized for switching schools, castling the safer wing, and finishing the tactic the last tool made legal.',
      titleId: 'synthesis-analyst',
    },
  ],
  'c8-match-voss': [
    {
      id: 'rw-variant-voss-exchange',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Voss Exchange Clerk',
      description: "Replay Voss's sovereign-exchange doctrine from Chapter VIII in Duel mode.",
      duelVariantId: 'voss-exchange',
    },
    {
      id: 'rw-codex-voss-office',
      kind: 'codex',
      label: 'Archive Note: The Vacant Office',
      description: 'Voss files that a hanging queen is a court already closed, and that you took it.',
      codexId: 'codex-voss-office',
    },
  ],
  'c8-match-elara': [
    {
      id: 'rw-variant-elara-fork',
      kind: 'duel-variant',
      label: 'Duel Variant Unlocked: Elara Fork Registrar',
      description: "Replay Elara's temporal-fork doctrine from Chapter VIII in Duel mode.",
      duelVariantId: 'elara-fork',
    },
    {
      id: 'rw-title-alexandrine',
      kind: 'title',
      label: 'Title Earned: Alexandrine Analyst',
      description: 'Recognized for closing vacant offices, filing two futures on one square, and notarizing the mate.',
      titleId: 'alexandrine-analyst',
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
  ch3: [
    {
      id: 'rw-title-classical-seal',
      kind: 'title',
      label: "Title Earned: Seal of the Professor's Law",
      description: 'Chapter III completed. Your chronicle carries classical restraint as a civic virtue.',
      titleId: 'seal-professors-law',
    },
    {
      id: 'rw-chronicle-echo-ch3',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A third echo joins your archive: prophylaxis, outposts, and quiet refusals.',
    },
  ],
  ch4: [
    {
      id: 'rw-title-hypermodern-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Paradox Masters',
      description: 'Chapter IV completed. Your chronicle carries delayed ownership as a civic virtue.',
      titleId: 'seal-paradox-masters',
    },
    {
      id: 'rw-chronicle-echo-ch4',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A fourth echo joins your archive: fianchetto pressure, provocation, and the slow squeeze.',
    },
  ],
  ch5: [
    {
      id: 'rw-title-discipline-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Machine of Discipline',
      description: 'Chapter V completed. Your chronicle carries prophylaxis and conversion as civic virtues.',
      titleId: 'seal-machine-discipline',
    },
    {
      id: 'rw-chronicle-echo-ch5',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A fifth echo joins your archive: luft, the pause, and technical conversion.',
    },
  ],
  ch6: [
    {
      id: 'rw-title-ledger-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Silicon Threshold',
      description: 'Chapter VI completed. Your chronicle carries precision without a speech as a civic virtue.',
      titleId: 'seal-silicon-threshold',
    },
    {
      id: 'rw-chronicle-echo-ch6',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A sixth echo joins your archive: outposts, hanging captures, and forced finishes.',
    },
  ],
  ch7: [
    {
      id: 'rw-title-synthesis-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Human Synthesis',
      description: 'Chapter VII completed. Your chronicle carries style as a tool, not a loyalty, as a civic virtue.',
      titleId: 'seal-human-synthesis',
    },
    {
      id: 'rw-chronicle-echo-ch7',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'A seventh echo joins your archive: school switches, safer-wing castling, and smothered finishes.',
    },
  ],
  ch8: [
    {
      id: 'rw-title-alexandrine-seal',
      kind: 'title',
      label: 'Title Earned: Seal of the Alexandrine Board',
      description: 'Chapter VIII completed. Your chronicle carries succession without civil war as a civic virtue.',
      titleId: 'seal-alexandrine-board',
    },
    {
      id: 'rw-chronicle-echo-ch8',
      kind: 'chronicle',
      label: 'Chronicle Echo Unlocked',
      description: 'An eighth echo joins your archive: sovereign exchanges, temporal forks, and notarized finishes.',
    },
  ],
}
