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
  alexion: {
    opponentId: 'alexion',
    displayName: 'Alexion Demaratos-Serapis',
    blend: {
      primary: { school: 'Synthesis', weight: 65 },
      secondary: { school: 'Achaemenid Patience', weight: 35 },
    },
    counterPrep: [
      'Do not mistake the mentor mask for mercy; he invites complexity only after your development is accountable.',
      'Trade into clear structures when ahead. Alexion is strongest when two plans can survive in the same position.',
      'Watch his quiet king-safety moves. In the Lab, they usually prepare a central break rather than a retreat.',
    ],
    whiteOpenings: ['Queen Pawn Mentor System', 'English Reversed Sicilian', 'Catalan Archive Lines'],
    blackOpenings: ['Caro-Kann Mentor File', 'Queen\'s Gambit Declined', 'Classical e5 mirror'],
    signature: 'Balanced doctrine that asks whether your plan survives its own consequences.',
    talk: {
      opening: [
        'The Archive does not forget. It waits, which is worse.',
        'I will not punish every mistake. Only the instructive ones.',
        'A candidate reveals more by choosing a plan than by discovering a tactic.',
      ],
      punished: [
        'Good. You found the cost hidden inside my invitation.',
        'That move had a reason. Keep that habit.',
      ],
      rattled: [
        'You are becoming less useful as a control specimen and more useful as a problem.',
        'The chamber is beginning to answer you before I do.',
      ],
      audacious: [
        'Momentum is not mastery. Prove that you can convert it.',
        'You are leaning on confidence. I will test the joint.',
      ],
      draw: [
        'A draw can be a verdict when both plans survive cross-examination.',
      ],
    },
  },
  rowan: {
    opponentId: 'rowan',
    displayName: 'Rowan Vale',
    blend: {
      primary: { school: 'Indic Combinatorics', weight: 70 },
      secondary: { school: 'Bactrian Frontier', weight: 30 },
    },
    counterPrep: [
      'Decline at least one tempting capture before move 12; Rowan counts on greed to open your king.',
      'Finish development before chasing his f-pawn. His best attacks begin when you win material without shelter.',
      'Force trades after the first wave. If the initiative stalls, his sacrifice ledger becomes expensive quickly.',
    ],
    whiteOpenings: ['King\'s Gambit Accepted', 'Evans Gambit', 'Vienna Gambit'],
    blackOpenings: ['Latvian Countergambit', 'Two Knights Max Lange', 'Dragon-side pawn storm'],
    signature: 'Tempo-first sacrifices that turn a poisoned pawn into a loyalty test.',
    talk: {
      opening: [
        'Fire spreads if you answer it politely.',
        'A pawn is only poisoned if you insist on eating it.',
        'Let us find out whether your king enjoys fresh air.',
      ],
      punished: [
        'You left the bait on the table. That is disciplined and deeply impolite.',
        'I spent the tempo before I owned it.',
      ],
      rattled: [
        'Fine. I will make the sacrifice earn its applause this time.',
        'You keep refusing the dramatic move. I dislike that discipline.',
      ],
      audacious: [
        'You are starting to like the flames. Dangerous habit.',
        'If you want beauty, you must pay for it with accuracy.',
      ],
      draw: [
        'A draw is just an attack that ran out of witnesses.',
      ],
    },
  },
  vega: {
    opponentId: 'vega',
    displayName: 'Vega Sorn',
    blend: {
      primary: { school: 'Macedonian Phalanx', weight: 45 },
      secondary: { school: 'Indic Combinatorics', weight: 55 },
    },
    counterPrep: [
      'Castle before ambition. Vega times central breaks around every king that lingers on e1.',
      'Meet pressure with development, not pawn grabbing. Her sacrifices are strongest against loose back ranks.',
      'When she improves a piece without check, ask which defender just became responsible for too much.',
    ],
    whiteOpenings: ['Italian Game pressure', 'Scotch Gambit with restraint', 'Bishop\'s Opening'],
    blackOpenings: ['Two Knights Defense', 'Giuoco Piano counter-pressure', 'Classical e5 systems'],
    signature: 'Romantic pressure audited by classical receipts: every sacrifice names its defender.',
    talk: {
      opening: [
        'Bring your king to safety before you dream out loud.',
        'Drama without calculation is just a shorter loss.',
        'I prefer sacrifices that can explain themselves.',
      ],
      punished: [
        'That refutation had structure. Rowan would hate it.',
        'I omitted a defender from the receipt. Correctly noticed.',
      ],
      rattled: [
        'You are castling earlier. Good. Irritating, but good.',
        'The attack must now justify itself twice.',
      ],
      audacious: [
        'Confidence is acceptable. Exposure is not.',
        'You have learned to make danger useful. I will raise the price of using it.',
      ],
      draw: [
        'A draw with kings safe is not failure. It is accounting.',
      ],
    },
  },
  kallistos: {
    opponentId: 'kallistos',
    displayName: 'Kallistos',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 70 },
      secondary: { school: 'Egyptian Symmetry', weight: 30 },
    },
    counterPrep: [
      'Name your pawn break before move 12 and prepare it; Kallistos vetoes improvisation that creates weak squares.',
      'Trade a pair of minor pieces if she plants an outpost knight — leaving it forever is how quiet positions become lost ones.',
      'Do not chase ghosts on the flank while her center remains flexible; prophylaxis works both ways.',
    ],
    whiteOpenings: ['Exchange Ruy Lopez', 'Quiet Italian with d3', 'Queen\'s Gambit Declined systems'],
    blackOpenings: ['Berlin-structure solidity', 'Orthodox Queen\'s Gambit Declined', 'Caro-Kann classical'],
    signature: 'Prophylactic waits that make the opponent\'s only plan illegal a move early.',
    talk: {
      opening: [
        'I am here to see whether you can stop an idea before it is born.',
        'Structure first. Spark later, if the ledger allows it.',
      ],
      punished: [
        'You vetoed the break. That is classical manners.',
        'Good. The outpost never arrived.',
      ],
      rattled: [
        'You are reading one move deeper than I filed for a student.',
        'The professor\'s law bends. Rare.',
      ],
      audacious: [
        'You left a weak square for entertainment. I will collect rent.',
        'Hope is not a plan. The outpost is.',
      ],
      draw: [
        'A draw can be a correctly administered refusal.',
      ],
    },
  },
  nysa: {
    opponentId: 'nysa',
    displayName: 'Nysa',
    blend: {
      primary: { school: 'Bactrian Frontier', weight: 75 },
      secondary: { school: 'Indic Combinatorics', weight: 25 },
    },
    counterPrep: [
      'Occupy the center with purpose, then ask whether her fianchetto still bites — empty space is her favorite tax.',
      'Do not overextend the e- and d-pawns before development finishes; Nysa punishes greed that looks like ambition.',
      'Trade her dark-square bishop when you can; the long diagonal is how the frontier collects rent.',
    ],
    whiteOpenings: ['Quiet king-pawn with restraint', 'Closed structures against fianchetto', 'English-like flank probes'],
    blackOpenings: ['Modern g6 systems', 'King\'s Indian structures', 'Hypermodern knight-first refusals'],
    signature: 'Fianchetto pressure that invites the center, then taxes whoever takes too much of it.',
    talk: {
      opening: [
        'Take the center if you must. I will measure what it costs you.',
        'The frontier does not occupy. It waits for overreach.',
      ],
      punished: [
        'You refused the empty invitation. That is disciplined greed.',
        'My diagonal lost its lawsuit. Annoying.',
      ],
      rattled: [
        'You are treating space like a ledger, not a trophy. Rare for a student.',
        'The paradox is bending toward you. I dislike that arithmetic.',
      ],
      audacious: [
        'You planted pawns where pieces should live. I will harvest them.',
        'Ambition without development is how frontiers become graves.',
      ],
      draw: [
        'A draw can be a correctly refused invitation.',
      ],
    },
  },
  cassian: {
    opponentId: 'cassian',
    displayName: 'Cassian',
    blend: {
      primary: { school: 'Bactrian Frontier', weight: 60 },
      secondary: { school: 'Achaemenid Patience', weight: 40 },
    },
    counterPrep: [
      'Name a break before move fourteen and prepare it; Cassian thrives when you invent a plan after the pawns are already overcommitted.',
      'Keep a minor ready to challenge his fianchetto bishop — leaving the long diagonal uncontested is how quiet positions become lost ones.',
      'If he offers the center, take only what you can defend twice; paradox masters collect the third weakness.',
    ],
    whiteOpenings: ['Catalan-flavored restraint', 'English pressure with delayed center', 'Quiet queen-pawn systems'],
    blackOpenings: ['Nimzo-Indian spirit without the modern label', 'King\'s Indian counterpunch', 'Hypermodern provocation suites'],
    signature: 'Refuse the center, provoke overextension, then strangle with diagonals and breaks.',
    talk: {
      opening: [
        'I do not need the center to own it. Prove you can hold what you seize.',
        'Paradox is not mysticism. It is delayed ownership.',
      ],
      punished: [
        'You kept the center from becoming a museum. Correct.',
        'The strangling line never closed. Well seen.',
      ],
      rattled: [
        'You answered provocation with structure. That is the Long Reign habit.',
        'I filed you as impatient. Amend the file.',
      ],
      audacious: [
        'You took every square and defended none. The diagonal thanks you.',
        'Overextension is a confession. I accept it.',
      ],
      draw: [
        'A draw is a paradox that refused to resolve. Acceptable.',
      ],
    },
  },
  gage: {
    opponentId: 'gage',
    displayName: 'Gage',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 75 },
      secondary: { school: 'Macedonian Phalanx', weight: 25 },
    },
    counterPrep: [
      'Castle before you hunt a hole — Gage files unmade luft as a confession, then names the back rank.',
      'Do not push the pawn that gifts him a square; ask which idea you are about to baptize for him.',
      'If he plays a quiet waiting move, improve a piece instead of inventing an attack; donated tempi are how the pause becomes a squeeze.',
    ],
    whiteOpenings: ['Quiet king-pawn with restraint', 'Closed structures against overreach', 'Prophylactic rook lifts'],
    blackOpenings: ['Philidor-quiet d6 systems', 'Solid e5 with Be7', 'Luft-first king safety'],
    signature: 'Refuse the gifted square, then make luft before the file earns a name.',
    talk: {
      opening: [
        'A pause is not fear. It is a refusal to gift the opponent a name.',
        'Show me the square you were about to donate.',
      ],
      punished: [
        'You stopped the idea one square early. Correct.',
        'My pause lost its lawsuit. Annoying, and earned.',
      ],
      rattled: [
        'You are treating squares like a ledger. Rare for a tourist.',
        'I filed you as impatient. Amend the file.',
      ],
      audacious: [
        'You attacked a hole that was never the idea. I accept the gift.',
        'Drama spends water. You spent a river.',
      ],
      draw: [
        'A draw can be two correctly refused gifts.',
      ],
    },
  },
  helia: {
    opponentId: 'helia',
    displayName: 'Helia',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 80 },
      secondary: { school: 'Indic Combinatorics', weight: 20 },
    },
    counterPrep: [
      'When you win a piece, take it — Helia treats unconverted advantage as a leak in the hull.',
      'Keep the position messy if you are behind; her squeeze wants a quiet file and a simplified ledger.',
      'If she offers a queen trade while ahead, decline only with a concrete break; courtesy toward her extra piece is how rumors stay rumors.',
    ],
    whiteOpenings: ['Queen-pawn squeezes', 'French structures as White pressure', 'Technical rook endings'],
    blackOpenings: ['French e6-d5 walls', "Queen's Gambit Declined spirit", 'Conversion-first simplifications'],
    signature: 'Cash hanging pieces, then squeeze until useful squares run out.',
    talk: {
      opening: [
        'Advantage that is not converted is a rumor. Make it a fact.',
        'Ugly facts still feed cities. Pretty rumors do not.',
      ],
      punished: [
        'You cashed the file. The machine notices.',
        'My squeeze never closed. Well seen.',
      ],
      rattled: [
        'You treated a won piece as weather, then changed the weather. Rare.',
        'I filed you as courteous. Courtesy is a leak. Amend the file.',
      ],
      audacious: [
        'You left a queen on the table and called it atmosphere. I collect atmosphere.',
        'A rumor is not a win. I will demonstrate the difference.',
      ],
      draw: [
        'A draw is a conversion that stayed a rumor. Acceptable, barely.',
      ],
    },
  },
  prax: {
    opponentId: 'prax',
    displayName: 'Prax',
    blend: {
      primary: { school: 'Indic Combinatorics', weight: 60 },
      secondary: { school: 'Macedonian Phalanx', weight: 40 },
    },
    counterPrep: [
      'Sit on the hole he names — Prax files an empty d5 or e5 as a leak, then harvests the file.',
      'Do not hunt a pretty tactic while a piece hangs; his ledger treats missed captures as confession.',
      'If he offers a sharp Sicilian structure, castle first and occupy; invention past the outpost is how you become the leak.',
    ],
    whiteOpenings: ['Open Sicilian pressure', 'English holes against c5', 'Quiet king-pawn with an outpost plan'],
    blackOpenings: ['Sicilian Nc6 systems', 'Najdorf-quiet d6 walls', 'Precision c5 counters'],
    signature: 'Occupy the named hole, then take whatever the occupancy left hanging.',
    talk: {
      opening: [
        'The line is already there. Follow it, or be the leak.',
        'Show me the hole you were about to walk past.',
      ],
      punished: [
        'You sat on the square. Correct.',
        'My invoice lost its lawsuit. Earned.',
      ],
      rattled: [
        'You are treating the ledger like a conversation. Rare, and irritating.',
        'I filed you as a tourist. Amend the file.',
      ],
      audacious: [
        'You invented past the hole. I collect invention as tax.',
        'Pretty leaks still drown cities. Watch.',
      ],
      draw: [
        'A draw can be two correctly followed lines that refused to finish.',
      ],
    },
  },
  iota: {
    opponentId: 'iota',
    displayName: 'Iota',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 70 },
      secondary: { school: 'Indic Combinatorics', weight: 30 },
    },
    counterPrep: [
      'When you are a pawn up, finish — Iota treats an unconverted plus as weather you failed to collect.',
      'Keep luft; her favorite finish is the back rank you donated while narrating a nicer idea.',
      'If she offers a queen trade while ahead, take it unless you have a concrete mate; courtesy toward her extra pawn is how rumors stay rumors.',
    ],
    whiteOpenings: ['Caro structures as White pressure', 'Slav walls with a plus', 'Technical rook endings'],
    blackOpenings: ['Caro-Kann c6-d5', 'Slav solidity', 'Finish-first simplifications'],
    signature: 'Convert the smallest plus, then finish the back rank if you donate luft.',
    talk: {
      opening: [
        'A plus of one pawn is a fact. Mercy is how facts become rumors.',
        'Finish it uglier than drought.',
      ],
      punished: [
        'You finished the file. The counting rooms notice.',
        'My plus never closed. Well seen.',
      ],
      rattled: [
        'You treated a one-pawn lead as weather, then changed the weather. Rare.',
        'I filed you as courteous. Courtesy is a leak. Amend the file.',
      ],
      audacious: [
        'You left a plus on the table and called it atmosphere. I collect atmosphere.',
        'A rumor is not a win. I will demonstrate the difference.',
      ],
      draw: [
        'A draw is a plus that stayed a rumor. Acceptable, barely.',
      ],
    },
  },
  mira: {
    opponentId: 'mira',
    displayName: 'Mira',
    blend: {
      primary: { school: 'Macedonian Phalanx', weight: 55 },
      secondary: { school: 'Achaemenid Patience', weight: 45 },
    },
    counterPrep: [
      'Play the board in front of you — Mira files last week\'s school as a costume and taxes the delay.',
      'If a piece hangs, take it even when a check looks prettier; her practical tool is the cheaper fact.',
      'Castle the wing that still has pawns. Short-castle loyalty is how she files you as inflexible.',
    ],
    whiteOpenings: ['Italian and Two Knights pressure', 'Quiet king-pawn with a tool switch', 'Safer-wing castling drills'],
    blackOpenings: ['Open-game e5 systems', 'Italian Bc5 practical lines', 'Tool-first development'],
    signature: 'Drop the beloved check for the hanging piece, then castle the palace that still has walls.',
    talk: {
      opening: [
        'The school that fits this board is the only loyalty I file.',
        'Show me the tool you were about to keep wearing.',
      ],
      punished: [
        'You changed tools. Correct.',
        'My costume lost its lawsuit. Earned.',
      ],
      rattled: [
        'You are treating schools like weather. Rare, and irritating.',
        'I filed you as loyal. Amend the file.',
      ],
      audacious: [
        'You replayed last week. I collect loyalty as tax.',
        'A beloved check is still a leak. Watch.',
      ],
      draw: [
        'A draw can be two tools that refused to finish the job.',
      ],
    },
  },
  soren: {
    opponentId: 'soren',
    displayName: 'Soren',
    blend: {
      primary: { school: 'Bactrian Frontier', weight: 60 },
      secondary: { school: 'Indic Combinatorics', weight: 40 },
    },
    counterPrep: [
      'When he answers your school with another, switch with him — staying in the first costume is how the other wing burns.',
      'Meet g6 with development and castle before the fianchetto bites; Soren files undeveloped kings as announced doctrine.',
      'If the wing changes, change with it. His favorite finish is the smother you donated while narrating flexibility.',
    ],
    whiteOpenings: ['Modern structures as White pressure', 'Hypermodern answers to e4', 'Wing-switch middle games'],
    blackOpenings: ['Modern g6-Bg7', 'Pirc-quiet walls', 'Reply-school c5 breaks'],
    signature: 'Answer the named school with another, then finish if the opponent keeps the first costume.',
    talk: {
      opening: [
        'Play a school. I will answer it with another.',
        'If you keep the first costume, you lose.',
      ],
      punished: [
        'You noticed the reply. The halls notice.',
        'My second school never landed. Well seen.',
      ],
      rattled: [
        'You treated my answer as weather, then changed the weather. Rare.',
        'I filed you as loyal. Loyalty is a leak. Amend the file.',
      ],
      audacious: [
        'You announced a doctrine and wore it into the fire. Watch.',
        'A costume is not a plan. I will demonstrate the difference.',
      ],
      draw: [
        'A draw can be two answering schools that refused to finish.',
      ],
    },
  },
  voss: {
    opponentId: 'voss',
    displayName: 'Voss',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 60 },
      secondary: { school: 'Macedonian Phalanx', weight: 40 },
    },
    counterPrep: [
      'If a queen hangs, take it — Voss files both courts in session as a civil war you volunteered to budget.',
      'Meet d5 with development and castle before the queen-pawn wall names a hole; hanging pieces are vacant offices.',
      'When he offers an exchange the board already paid for, take it. Refusing the stamp is how the harvest dries.',
    ],
    whiteOpenings: ['Queen-pawn exchange structures', 'Quiet d4 with an offered trade', 'Closed-court middle games'],
    blackOpenings: ['Queen\'s Gambit declined walls', 'e6-Be7 patience', 'c5 breaks after the office closes'],
    signature: 'Take the hanging crown, then refuse to keep a second court on the payroll.',
    talk: {
      opening: [
        'An office that hangs is already vacant.',
        'Show me the court you were about to keep open.',
      ],
      punished: [
        'You closed a court. Correct.',
        'My second queen lost its lawsuit. Earned.',
      ],
      rattled: [
        'You are treating succession like weather. Rare, and irritating.',
        'I filed you as a siege. Amend the file.',
      ],
      audacious: [
        'You kept both courts. I collect civil wars as tax.',
        'A hanging crown is still a leak. Watch.',
      ],
      draw: [
        'A draw can be two offices that refused to close.',
      ],
    },
  },
  elara: {
    opponentId: 'elara',
    displayName: 'Elara',
    blend: {
      primary: { school: 'Indic Combinatorics', weight: 55 },
      secondary: { school: 'Bactrian Frontier', weight: 45 },
    },
    counterPrep: [
      'When a knight can name king and rook at once, land there — Elara files a single check as a clerk who missed the second office.',
      'Meet c5 with development and castle before the Sicilian wall forks the uncastled king; two futures share one square.',
      'If she forks, name both claims. Treating the check as the whole stamp is how the rook walks.',
    ],
    whiteOpenings: ['Sicilian structures as White pressure', 'Knight-fork middle games', 'Notarized-file finishes'],
    blackOpenings: ['Sicilian c5-d6', 'Dragon-quiet walls', 'Fork-first knight landings'],
    signature: 'Land on the square that files two futures, then finish if the opponent names only one.',
    talk: {
      opening: [
        'Two futures. One square. If you file only the king, the rook walks.',
        'Show me which claim you were about to leave unstamped.',
      ],
      punished: [
        'You named both. The registry notices.',
        'My second office never walked. Well seen.',
      ],
      rattled: [
        'You treated my fork as weather, then changed the weather. Rare.',
        'I filed you as a single check. Amend the file.',
      ],
      audacious: [
        'You answered only the king. Watch the rook leave.',
        'A fork is not a speech. I will demonstrate the difference.',
      ],
      draw: [
        'A draw can be two futures that refused to share a square.',
      ],
    },
  },
  wren: {
    opponentId: 'wren',
    displayName: 'Wren',
    blend: {
      primary: { school: 'Achaemenid Patience', weight: 55 },
      secondary: { school: 'Macedonian Phalanx', weight: 45 },
    },
    counterPrep: [
      'If a piece is pinned, take it — Wren files delayed captures as the habit her census already underlined.',
      'Meet e5 with development and castle before the census names a hanging file; she taxes the check you prefer to the piece.',
      'When she reads your last delay aloud, change the line. Staying in the underlined capture is how the last rank waits.',
    ],
    whiteOpenings: ['Petroff structures as White pressure', 'Quiet king-pawn with a circled pin', 'Last-rank conversion drills'],
    blackOpenings: ['Open-game e5 systems', 'Two Knights / Petroff replies', 'Census-first development'],
    signature: 'Take the pinned piece the census already circled, then refuse to replay the underlined delay.',
    talk: {
      opening: [
        'I have your census. The captures you delay are already underlined.',
        'Show me the habit you were about to keep wearing.',
      ],
      punished: [
        'You changed a line I had underlined. Correct.',
        'My census missed. Earned.',
      ],
      rattled: [
        'You are treating the file like weather. Rare, and irritating.',
        'I filed you as predictable. Amend the file.',
      ],
      audacious: [
        'You delayed the capture I circled. I collect hesitation as tax.',
        'A habit is still a leak. Watch.',
      ],
      draw: [
        'A draw can be a census that refused to finish the last rank.',
      ],
    },
  },
  bram: {
    opponentId: 'bram',
    displayName: 'Bram',
    blend: {
      primary: { school: 'Indic Combinatorics', weight: 60 },
      secondary: { school: 'Bactrian Frontier', weight: 40 },
    },
    counterPrep: [
      'When he answers with a school you already sealed, switch with him — staying in the first compiled costume is how the last rank waits.',
      'Meet Nf6 with development and castle before the Indian wall bites; Bram files undeveloped kings as announced doctrine.',
      'If the stacked school changes wings, change with it. His favorite finish is the last rank you donated while narrating memory.',
    ],
    whiteOpenings: ['Indian structures as White pressure', 'Compiled-school middle games', 'Last-rank conversion'],
    blackOpenings: ['King\'s Indian Nf6-g6', 'Gruenfeld-quiet walls', 'Compiled c5 breaks'],
    signature: 'Answer the named school with one you already survived, then finish if the opponent keeps the first costume.',
    talk: {
      opening: [
        'Every school you sealed is in this drawer.',
        'I will answer you with the one you are not wearing.',
      ],
      punished: [
        'You noticed the stacked school. The halls notice.',
        'My compiled reply never landed. Well seen.',
      ],
      rattled: [
        'You treated my drawer as weather, then changed the weather. Rare.',
        'I filed you as a hymn. Amend the file.',
      ],
      audacious: [
        'You announced a doctrine and wore it into the stack. Watch.',
        'A compiled costume is not a plan. I will demonstrate the difference.',
      ],
      draw: [
        'A draw can be two compiled schools that refused to finish.',
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
/**
 * A rival's spoken reaction after a finished game. `playerOutcome` is from
 * the PLAYER's perspective. Pure: identical inputs pick the same line.
 *  - player won and is on a streak -> the rival sounds rattled
 *  - player won                    -> the rival concedes the punishment
 *  - draw                          -> the draw bucket
 *  - player lost                   -> the rival gets audacious
 */
export function postGameTalkLine(
  profile: RivalProfile,
  playerOutcome: 'win' | 'loss' | 'draw',
  playerWinStreakVsRival: number,
  seed: number,
): string {
  const bucket =
    playerOutcome === 'draw'
      ? profile.talk.draw
      : playerOutcome === 'win'
        ? playerWinStreakVsRival >= 2
          ? profile.talk.rattled
          : profile.talk.punished
        : profile.talk.audacious
  if (!bucket.length) return profile.talk.opening[0] ?? ''
  return bucket[Math.abs(seed) % bucket.length]!
}

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
