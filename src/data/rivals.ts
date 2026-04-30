/**
 * Per-rival doctrinal profile: school blend, opening signature, talk
 * profile (lines triggered by phase / streak), and a counter-prep
 * briefing of three actionable bullets the player sees in the dossier.
 *
 * This is the data surface for Pass 3. The dossier renderer in mountApp
 * pulls from {@link RIVAL_PROFILES} when a known rival is selected;
 * unknown rivals fall back to the original heuristic-driven briefing.
 *
 * Schools follow the alt-history canon:
 *   - Macedonian Phalanx     center commitment, connected pawn chains
 *   - Achaemenid Patience    prophylaxis + king safety + late conversion
 *   - Egyptian Symmetry      closed structures, mirrored geometry
 *   - Indic Combinatorics    chaturanga-line tactics, fork/pin/skewer
 *   - Bactrian Frontier      hypermodern improvisation, fianchetto-like
 *   - Synthesis              phase-adaptive blend (boss / counterpart)
 */
export type DoctrinalSchool =
  | 'Macedonian Phalanx'
  | 'Achaemenid Patience'
  | 'Egyptian Symmetry'
  | 'Indic Combinatorics'
  | 'Bactrian Frontier'
  | 'Synthesis'

export interface SchoolBlend {
  /** Primary school -> percentage weight (0-100). Sum of values is 100. */
  primary: { school: DoctrinalSchool; weight: number }
  /** Secondary blend, omitted for pure-school rivals. */
  secondary?: { school: DoctrinalSchool; weight: number }
}

export interface TalkProfile {
  /** Spoken before the first move. */
  opening: string[]
  /** Spoken when the player resolves a tactical motif against the rival. */
  punished: string[]
  /** Spoken after losing to the player 3+ times in a row. */
  rattled: string[]
  /** Spoken after winning 3+ in a row. */
  audacious: string[]
  /** Spoken at the end of a drawn game. */
  draw: string[]
}

export interface RivalProfile {
  opponentId: string
  displayName: string
  blend: SchoolBlend
  /** 3 short prep bullets for the dossier. */
  counterPrep: string[]
  /** White-side opening signatures, mostly drawn from the existing book. */
  whiteOpenings: string[]
  /** Black-side opening signatures. */
  blackOpenings: string[]
  /** Signature move concept (one short phrase). */
  signature: string
  talk: TalkProfile
}

export const RIVAL_PROFILES: Record<string, RivalProfile> = {
  amara: {
    opponentId: 'amara',
    displayName: 'Amara',
    blend: {
      primary: { school: 'Egyptian Symmetry', weight: 70 },
      secondary: { school: 'Achaemenid Patience', weight: 30 },
    },
    counterPrep: [
      'Break symmetry early — push c4 / e4 to deny the closed pawn chain she wants.',
      'Castle short before move 9 so her late kingside expansion has nothing to bite into.',
      'Trade dark-square bishops; her structure relies on them to anchor the wing.',
    ],
    whiteOpenings: ['London System', 'Colle System', 'Closed Catalan'],
    blackOpenings: ['Caro-Kann Classical', "King's Indian Saemisch wall"],
    signature: 'Mirrored pawn chains and a late c-file break.',
    talk: {
      opening: [
        'I have studied the board for three seasons.',
        'Symmetry is the patient form of certainty.',
        'Mirror me only if you are ready to lose your mirror.',
      ],
      punished: [
        'A scholar should know better than to invite that fork.',
        'My structure is not yet finished — please proceed slowly.',
      ],
      rattled: [
        'I have re-read my notes. They will be different this time.',
        'You have taught me to fear the open file.',
      ],
      audacious: [
        'You will find your reflection a cold conversationalist.',
        'I have begun to enjoy your hesitations.',
      ],
      draw: [
        'A draw befits two careful readings of the same passage.',
      ],
    },
  },
  lukas: {
    opponentId: 'lukas',
    displayName: 'Lukas',
    blend: {
      primary: { school: 'Macedonian Phalanx', weight: 100 },
    },
    counterPrep: [
      'Avoid 1.e4 e5 unless you have prepared a Marshall — the classical center is his home water.',
      'Provoke an early f3 / f6 with a flank lance; the phalanx hates being asked to defend two files at once.',
      'When he plays Bc4, look for ...d5 breaks — his bishop is overloaded once you contest the center.',
    ],
    whiteOpenings: ['Italian Game (Giuoco Pianissimo)', 'Scotch Four Knights'],
    blackOpenings: ["Petrov's Defense", 'Two Knights Defense'],
    signature: 'Connected pawn chain on d4-e4 with rooks lifting via the second rank.',
    talk: {
      opening: [
        'My center will hold. Yours might not.',
        'A short castle, a long phalanx, a calm afternoon.',
      ],
      punished: [
        'I should not have left that knight unprotected.',
        'Discipline first. Tactics second. I forgot the order.',
      ],
      rattled: [
        'My instructor will hear about this opening line.',
        'I have begun to read the Bactrian commentaries.',
      ],
      audacious: [
        'Your king is still in the center. That is a confession.',
        'I will give you one more chance to develop a knight.',
      ],
      draw: [
        'A draw is a respectful structure between equals.',
      ],
    },
  },
  edred: {
    opponentId: 'edred',
    displayName: 'Edred',
    blend: {
      primary: { school: 'Macedonian Phalanx', weight: 50 },
      secondary: { school: 'Indic Combinatorics', weight: 50 },
    },
    counterPrep: [
      'Castle long, never short — his Dragon templates target the kingside before move 12.',
      'Trade the dark-square bishop early; without it his sacrifice patterns lose 30% of their venom.',
      'When he plays h4, prepare ...h5 — the only stable response to his pawn-storm doctrine.',
    ],
    whiteOpenings: ['Yugoslav Attack vs Dragon', 'English Attack'],
    blackOpenings: ['Sicilian Dragon', "Nimzo-Indian Saemisch"],
    signature: 'Sacrifices on h-file; rook lifts via h3.',
    talk: {
      opening: [
        'I care about the king. Show me where yours is hiding.',
        'Dragons do not negotiate.',
      ],
      punished: [
        'You declined the sacrifice. That is bad manners.',
        'I should have been three moves quicker.',
      ],
      rattled: [
        'I am told I attack too soon. I disagree, but I will try.',
        'Your prophylaxis is becoming irritating.',
      ],
      audacious: [
        'Your king has been a tourist all game.',
        'You should fear the h-file in your sleep.',
      ],
      draw: [
        'A draw — neither of us is happy about that.',
      ],
    },
  },
  marius: {
    opponentId: 'marius',
    displayName: 'Marius',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 80 },
      secondary: { school: 'Egyptian Symmetry', weight: 20 },
    },
    counterPrep: [
      'Manufacture imbalance early — opposite-side castling forces him out of his slow squeeze.',
      'Avoid trading queens before move 25; he converts queenless endgames mechanically.',
      'When he plays Re1 + Nf1 + Ng3, break with ...d5 — his slow regrouping is most vulnerable to a central break.',
    ],
    whiteOpenings: ['Closed Ruy Lopez', 'Catalan Mainline'],
    blackOpenings: ["Queen's Gambit Declined", 'Slav Triangle'],
    signature: 'Knight tour Nb1-d2-f1-g3 followed by a slow kingside expansion.',
    talk: {
      opening: [
        'Rule by patience is the only rule that lasts.',
        'I will let you make the first mistake.',
      ],
      punished: [
        'A small concession. I have time to repair it.',
        'Your tactics are loud. My answer will be quiet.',
      ],
      rattled: [
        'I have begun to hurry. That is your doing.',
        'Perhaps the Persian floor cannot bear three losses.',
      ],
      audacious: [
        'You played for tempo and bought yourself a long endgame.',
        'I have nothing left to teach you about waiting.',
      ],
      draw: [
        'A draw, well-administered.',
      ],
    },
  },
  demetrios: {
    opponentId: 'demetrios',
    displayName: 'Demetrios',
    blend: {
      primary: { school: 'Synthesis', weight: 100 },
    },
    counterPrep: [
      'Treat the opening as if facing Lukas, the middlegame as if facing Marius, the endgame as if facing Amara.',
      'Do not lose a tempo to a pawn move before move 15 — Demetrios punishes any inaccuracy in development with a phalanx-style central break.',
      'In the endgame his Egyptian conversion is mechanical. Aim for either a clean simplification or a sharp imbalance; do not drift.',
    ],
    whiteOpenings: ['Catalan Open', 'English Symmetrical', 'Ruy Lopez Closed'],
    blackOpenings: ['Caro-Kann Advance', "King's Indian Mar del Plata"],
    signature: 'Phase-adaptive: phalanx opening, Persian middlegame, Egyptian conversion endgame.',
    talk: {
      opening: [
        'Thirty years of court rule. I am rarely surprised.',
        'I will play one school at a time. Try to keep up.',
      ],
      punished: [
        'A small loss of structure. I have studied four schools to repair it.',
        'You found the seam between two doctrines. Well done.',
      ],
      rattled: [
        'I have begun to lose to my own pupils. That is its own lesson.',
      ],
      audacious: [
        'You have not yet seen my third school.',
        'You play as if you have read my library.',
      ],
      draw: [
        'A draw. The library is satisfied.',
      ],
    },
  },
}

/**
 * Look up the canonical profile for an opponent. Returns null when the
 * rival is not yet documented (e.g. composite scenes, future content).
 */
export function getRivalProfile(opponentId: string): RivalProfile | null {
  return RIVAL_PROFILES[opponentId] ?? null
}

/** Infer canonical rival id from a campaign scene id (substring match). */
export function inferRivalIdFromSceneId(sceneId: string): string | null {
  for (const key of Object.keys(RIVAL_PROFILES)) {
    if (sceneId.includes(key)) return key
  }
  return null
}

/**
 * Returns a flavor line for the rival appropriate for the supplied
 * record state. Pure: identical inputs always pick the same index.
 *
 * Selection model:
 *   - `losses` >= 3 in last 4 -> rattled
 *   - `wins`   >= 3 in last 4 -> audacious
 *   - default -> opening
 *   The `seed` parameter (typically the match id timestamp) chooses
 *   which line within the bucket.
 */
export function selectTalkLine(
  profile: RivalProfile,
  recentWins: number,
  recentLosses: number,
  seed: number,
): string {
  const bucket =
    recentLosses >= 3 ? profile.talk.rattled
      : recentWins >= 3 ? profile.talk.audacious
      : profile.talk.opening
  if (!bucket.length) return profile.talk.opening[0] ?? ''
  return bucket[Math.abs(seed) % bucket.length]!
}
