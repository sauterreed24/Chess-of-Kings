import type { Chapter } from '../types'

/**
 * Playable campaign: Prologue + Chapters I–IX.
 * Chapter I: six-rung ladder (Initiate → … → Counterpart).
 * Chapter II: shorter Romantic ladder — two rated encounters + rehearsal.
 * Chapter III: compact Classical arc — Demetrios return + Kallistos + rehearsal.
 * Chapter IV: Hypermodern / Paradox Masters — Nysa + Cassian + rehearsal.
 * Chapter V: Discipline colleges — Gage + Helia + rehearsal.
 * Chapter VI: Silicon Threshold — Prax + Iota + rehearsal.
 * Chapter VII: Human Synthesis — Mira + Soren + rehearsal.
 * Chapter VIII: Alexandrine Board — Voss + Elara + rehearsal.
 * Chapter IX: Apotheosis Engine — Wren + Bram + rehearsal.
 */
export const PLAYABLE_CHAPTERS: Chapter[] = [
  /* ═══════════════════════════════════════════════════════════════
     PROLOGUE — The White Screen
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'prologue',
    index: 0,
    title: 'Prologue',
    subtitle: 'The White Screen',
    era: "Present — Reed's apartment, Alexandrine Reckoning 2341",
    themeClass: 'theme-prologue',
    philosophy: 'An ordinary room can still inherit an empire.',
    scenes: [
      {
        type: 'dialogue',
        id: 'pr-apartment',
        storyBeat: {
          label: 'Human pressure',
          title: 'A player without a method',
          body: 'Reed is not chasing mastery yet. In a commonwealth that treats chess as civic literacy, he is chasing proof that his attention has not gone dull.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Rain threads the window. Reed, twenty-eight, cannot sleep. An archive lens glows beside an untouched notebook, cold coffee, and the brass housing of his apartment civic terminal. He knows how pieces move; everyone in the Commonwealth knows that. What he does not know is how to stay calm when a position stops explaining itself.',
          },
          {
            speaker: 'reed',
            text: 'Archive lens. Any school in history, stratarch-calibrated. Ministry software with better manners.',
          },
          {
            speaker: 'narrator',
            text: 'He opens it anyway. The screen is the only light in the room. Above it, the Alexandrine date glows in lapis numerals from the municipal mesh, ordinary as weather and just as hard to argue with.',
          },
          {
            speaker: 'reed',
            text: 'Fine. Let it tell me what I am.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'pr-codex-pieces',
        heading: 'The Pieces — a brief codex',
        entries: [
          {
            term: 'Pawn',
            body: 'Advances one square forward; two on its first move. Captures one square diagonally. Promotes to any piece when it reaches the final rank. Weak alone — powerful in coordinated chains.',
          },
          {
            term: 'Knight',
            body: 'Moves in an L-shape: two squares in one direction, one square perpendicular. The only piece that leaps over others. Devastating in closed positions; less so in open ones.',
          },
          {
            term: 'Bishop',
            body: 'Moves any number of squares diagonally. One bishop remains on light squares, the other on dark — so a side can never cover both colors with bishops alone.',
          },
          {
            term: 'Rook',
            body: 'Moves any number of squares along a rank or file. Most powerful once the center opens; can be connected by castling and early development.',
          },
          {
            term: 'Queen',
            body: 'The most mobile piece — she combines rook and bishop. Losing her without compensation is usually catastrophic. Do not deploy her early and recklessly.',
          },
          {
            term: 'King',
            body: 'Moves one square in any direction. May castle once per game with a rook, provided neither has moved and the squares between them are clear and not under attack. Protect the king — the game ends when he cannot escape.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'pr-codex-long-reign',
        heading: 'The Long Reign — modern commonwealth',
        storyBeat: {
          label: 'World thread',
          title: 'History did not break where Reed was taught it held',
          body: 'The codex names facts Reed has always treated as background: Alexander lived, succession stabilized, and chess became public proof of judgment.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Alexander III, the Long-Reigning',
            body: 'He did not die young at Babylon. He lived into his eighties, made succession boring on purpose, and forced Macedonian, Persian, Egyptian, Levantine, and Indian offices to share a single administrative grammar.',
          },
          {
            term: 'Chaturanga West',
            body: 'Indian war-game patterns reached Alexandria centuries early. Court scholars fused them with Macedonian command drills until the board became a compact language for policy, logistics, and restraint.',
          },
          {
            term: 'The Calculus of Kings',
            body: 'A civic examination more than a game: candidates prove judgment by making lawful moves under incomplete information. Reed knows the phrase the way he knows tax forms and train maps.',
          },
          {
            term: 'Stratarch Rating',
            body: 'A public ladder of practical command, carried by schools, ministries, and archive universities. Most citizens ignore their number until a door asks for it — a posting, a tribunal seat, a marriage contract\'s fine print. Reed\'s number is about to start mattering.',
          },
          {
            term: "Reed's apartment",
            body: 'Cedar shelves, rain glass, a brass-lapis terminal, and archive notices scrolling beside rent reminders. Nothing about the room feels ancient to him. That is the point.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'pr-trainer',
        lines: [
          {
            speaker: 'system',
            text: 'Calibration opened. Play as you do when no examiner is watching. The Archive will resist just enough to measure instinct before knowledge.',
          },
          {
            speaker: 'reed',
            text: 'Badly, then. Honestly.',
          },
          {
            speaker: 'system',
            text: 'Four White moves. Choose honestly. The record begins now.',
          },
        ],
      },
      {
        type: 'calibration',
        id: 'pr-calibration',
        title: 'Calibration — archive lens',
        storyBeat: {
          label: 'Archive pressure',
          title: 'The Archive watches habits, not moves',
          body: "Every pawn push and repeated move becomes evidence. The Lab is sketching Reed before he knows there is a Lab.",
          tone: 'pressure',
        },
        lesson:
          'Make at least four moves as White. The Archive replies with unpredictable moves — just enough resistance to reveal how you think. Develop pieces, control the center, keep your king safe.',
        minMovesByPlayer: 4,
        teaching: {
          threat: 'There is no single threat yet — you are learning tempo and instinct.',
          goalPlain:
            'Complete four White moves. When Black is on move, wait for the Archive reply.',
          whyItWorks:
            'Even random replies punish wasted time. Pieces that trip over each other early lose initiative for the whole game.',
          concept:
            'Every move should have a reason — development, safety, or threat creation.',
        },
      },
      {
        type: 'dialogue',
        id: 'pr-glitch',
        lines: [
          {
            speaker: 'narrator',
            text: 'The analysis bar fills. Four moves. Five. The screen flickers, not like a weak backlight but like a door deciding whether to be seen.',
          },
          {
            speaker: 'reed',
            text: 'Wait — the interface just…',
          },
          {
            speaker: 'narrator',
            text: 'The board disappears. Not a crash. Not a timeout. The screen becomes the color of old paper, and then white: clean, absolute, impossibly deep, as though the device has opened into a room with no walls.',
          },
          {
            speaker: 'reed',
            text: 'No. What is this?',
          },
        ],
      },
      {
        type: 'interlude',
        id: 'pr-white',
        lines: ['WHITE', '', 'THE CALCULUS OF KINGS'],
      },
      {
        type: 'dialogue',
        id: 'pr-lab',
        storyBeat: {
          label: 'Story hinge',
          title: 'The curator knows the wrong door opened',
          body: 'The Archive is no longer a tool. It is a door into an institution that studies history by forcing players to inhabit its decisions — and Alexion seems disturbed that Reed crossed it.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Stone. Lamplight. Folios in tall shelves. The faint smell of wax and cedar. A man in formal academic robes stands beside a suspended wooden diagram: a chess position frozen in mid-game.',
          },
          {
            speaker: 'alexion',
            text: 'You are not cleared for the seed archives.',
          },
          {
            speaker: 'reed',
            text: 'I am not assigned anywhere. Where am I?',
          },
          {
            speaker: 'alexion',
            text: 'The History Lab. We use chess because no other record compresses conflict, order, and time so cleanly. The Long Reign made the board civic. The Lab makes it dangerous again.',
          },
          {
            speaker: 'reed',
            text: 'And I got here by clicking "train."',
          },
          {
            speaker: 'alexion',
            text: 'The interface accepted you. That matters. I am Alexion Demaratos-Serapis, curator of these simulations. You should not be here. The Lab opens for candidates, witnesses, and errors. I have not decided which you are, and the seed archive has already begun deciding without me.',
          },
          {
            speaker: 'alexion',
            text: 'The first chamber is ancient: ceremonial chess, played as duty rather than sport. Scholarly. Patient. Unforgiving of sloppiness. Learn its laws, and we will speak of what comes after.',
          },
          {
            speaker: 'reed',
            text: 'And if I refuse?',
          },
          {
            speaker: 'alexion',
            text: 'The vestibule door remains behind you. But you have already begun to think in here. Refusing now would be dishonest.',
          },
        ],
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     CHAPTER I — The Ancient Board
     Six-rung ladder: Initiate · Apprentice · Scholar (mini-boss)
                      Veteran · Advisor (boss) · Counterpart
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch1',
    index: 1,
    title: 'Chapter I',
    subtitle: 'The Ancient Board',
    era: 'Early chess — scholarly court',
    themeClass: 'theme-ancient',
    philosophy: 'Every piece is an office; every move, a reason.',
    scenes: [
      /* ── Intro dialogue ───────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'A court where every mistake has witnesses',
          body: 'Reed enters a world that treats chess as proof of character. The first test is not brilliance; it is whether he can notice what everyone else is expected to notice.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Warm lamplight catches carved ivory and dark wood. The position on the board is not a battlefield — it is a diagram of duty. Scholars here believe chess is a language for explaining obligation, rank, and consequence.',
          },
          {
            speaker: 'alexion',
            text: 'Before anything else: what do you see on the board?',
          },
          {
            speaker: 'reed',
            text: 'A knight left in the open. No cover.',
          },
          {
            speaker: 'alexion',
            text: "The court does not forgive blindness. Show me that you can see what is undefended. That is the first law.",
          },
        ],
      },

      /* ── Codex ────────────────────────────────────────────────── */
      {
        type: 'codex',
        id: 'c1-codex-principles',
        heading: 'The Ancient Laws — opening theory',
        storyBeat: {
          label: 'Doctrine',
          title: 'Principles become obligations',
          body: 'The court does not teach openings as memorized names. It teaches them as duties: develop, claim the center, secure the king, and waste no tempo without cause.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Develop your pieces',
            body: 'Move knights and bishops from their starting squares before launching any attack. A piece on its original square contributes nothing to the fight. Every tempo spent re-routing an undeveloped piece is a gift to your opponent.',
          },
          {
            term: 'Control the center',
            body: 'The central squares — e4, e5, d4, d5 — are the most contested on the board. A piece in the center commands more squares and can reach either wing faster than a piece on the edge.',
          },
          {
            term: 'Castle early',
            body: 'Castling tucks the king behind a wall of pawns and connects the rooks. A king left in the center during active play is a liability the opponent will exploit. Castle first; attack afterward.',
          },
          {
            term: 'Do not move a piece twice in the opening',
            body: 'Unless there is a specific and concrete reason, each extra re-routing move is a tempo lost. Your opponent uses that tempo to complete their own development.',
          },
          {
            term: "Do not bring the queen out early",
            body: "An exposed queen can be chased by minor pieces, losing multiple tempos. Develop knights and bishops first. The queen's power is greatest when her allies are already in position.",
          },
        ],
      },

      /* ── Puzzle 1: Hanging knight ─────────────────────────────── */
      {
        type: 'puzzle',
        id: 'c1-tutorial-hanging',
        title: 'Tutorial — the hanging knight',
        storyBeat: {
          label: 'First lesson',
          title: 'See the undefended thing',
          body: 'Before Reed can plan, he has to learn attention. A loose piece is the board admitting where discipline has failed.',
          tone: 'quiet',
        },
        fen: '8/8/8/4k3/3n4/2B5/8/3K4 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          "Black's knight has no defender and stands loose on d4. Punish the looseness — the court rewards economy of means.",
        teaching: {
          threat:
            'If you do nothing, the knight can retreat or create counterplay. Loose pieces do not stay loose forever.',
          goalPlain:
            'Win material by capturing the undefended knight with your bishop — the check forces the king away before it can recapture.',
          goalBrief: 'Take the loose knight on d4 with the bishop.',
          whyItWorks:
            'A checking capture is a "free" capture: the opponent must answer the check first, and by the time they do, you have already kept the piece.',
          concept:
            'Undefended pieces are invitations. Always ask: what is loose on the other side?',
        },
        hint: 'The bishop can give check and capture the knight in the same move.',
        opponentAiDepth: 1,
        opponentAiStyle: 'development',
      },

      {
        type: 'dialogue',
        id: 'c1-after-hanging',
        lines: [
          {
            speaker: 'alexion',
            text: 'You saw it. Good. Most players look at what a piece can do — you looked at what it cannot do. That is a different kind of attention.',
          },
          {
            speaker: 'reed',
            text: 'A check buys the move. The king has to move before it can recapture.',
          },
          {
            speaker: 'alexion',
            text: 'Precisely. Forcing moves create their own tempo. Next: where should a king live when the center is contested?',
          },
        ],
      },

      /* ── Puzzle 2: Castle ─────────────────────────────────────── */
      {
        type: 'puzzle',
        id: 'c1-tutorial-castle',
        title: 'Tutorial — king safety',
        storyBeat: {
          label: 'Second lesson',
          title: 'Safety is a tempo move',
          body: 'The Lab frames castling as more than escape. Reed has to see how one quiet move can prepare every loud one that follows.',
          tone: 'quiet',
        },
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'g1', color: 'w', pieceType: 'k' },
        lesson:
          'The center is tense — both sides have developed and the queens are still watching the middle. The king does not belong there.',
        teaching: {
          threat:
            'Black has developed both knights and the bishop. The center can open at any moment, and an uncastled king in the center is the first target.',
          goalPlain: 'Castle kingside — place your king safely on g1 behind the pawns.',
          goalBrief: 'Castle kingside — king to g1.',
          whyItWorks:
            'Castling simultaneously moves the king to safety and connects the rooks along the back rank. Two goals, one move.',
          concept:
            "King safety enables aggression. A king who must run mid-game costs you a full rook's worth of momentum.",
        },
        hint: 'Short castle: the king moves two squares toward the h-rook.',
        opponentAiDepth: 2,
        opponentAiStyle: 'development',
      },

      {
        type: 'dialogue',
        id: 'c1-after-castle',
        lines: [
          {
            speaker: 'alexion',
            text: 'The rooks are now connected. Notice that — development does not end with the minor pieces. The rooks must be allowed to speak to each other.',
          },
          {
            speaker: 'reed',
            text: 'Castling does two things at once.',
          },
          {
            speaker: 'alexion',
            text: 'All strong moves in chess tend to do two things. The best do three. This is why tempo matters more than any single piece.',
          },
        ],
      },

      /* ── Puzzle 3: Mate in one ────────────────────────────────── */
      {
        type: 'puzzle',
        id: 'c1-puzzle-mate',
        title: 'Puzzle — the first verdict',
        storyBeat: {
          label: 'Third lesson',
          title: 'Finish only when every door is shut',
          body: 'Checkmate is the first moment where the archive stops asking for improvement and demands finality.',
          tone: 'pressure',
        },
        fen: '3k4/8/3K4/4Q3/8/8/8/8 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'The black king stands on the back rank with nowhere to run. One quiet move ends the trial — geometry, not force.',
        teaching: {
          threat: 'Delay, and the king may slip to another file. The court does not wait.',
          goalPlain:
            'Deliver checkmate in one move. The queen commands the whole diagonal and rank — find the square that seals every escape.',
          goalBrief: 'Checkmate in one with the queen.',
          whyItWorks:
            'Back-rank and corner mates are verdicts of coverage: every flight square must be denied or the king must be unable to capture the attacker.',
          concept:
            'After your move, ask: can the king move, capture, or interpose? If not, and it is check, the game is finished.',
        },
        hint: 'The dark corner calls. The queen can deliver the verdict from the edge of the board.',
        opponentAiDepth: 3,
        opponentAiStyle: 'classical',
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 1 — The Initiate
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-amara',
        storyBeat: {
          label: 'Ladder opens',
          title: 'The first opponent can still punish carelessness',
          body: 'Amara is not a villain or a difficulty knob. She is a young doctrine of symmetry, the first proof that even simple plans have teeth.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You have studied the principles. Now prove them. The court ladder begins here — with Amara, the newest initiate of Egyptian symmetry. She knows the rules. She does not yet know which rule to break.',
          },
          {
            speaker: 'reed',
            text: 'She can play, though?',
          },
          {
            speaker: 'alexion',
            text: "Enough to punish a blunder. But she will develop slowly, leave pieces loose, and forget to castle. You have been warned — do not be the one who develops slowly.",
          },
          {
            speaker: 'amara',
            text: 'I have studied the board for three seasons. Do not expect an easy game.',
          },
          {
            speaker: 'reed',
            text: "I'll keep that in mind.",
          },
        ],
      },
      {
        type: 'match',
        id: 'c1-match-amara',
        title: 'Encounter 1 of 6 — The Initiate',
        opponentName: 'Amara',
        opponentNote:
          'The newest initiate of the court. Develops passively and delays castling. Use your opening principles to build an advantage quickly.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Win without inventing complications',
          body: 'The cleanest victory proves Reed can follow the ancient laws when the board finally lets him choose.',
          tone: 'quiet',
        },
        playerColor: 'w',
        aiDepth: 2,
        aiStyle: 'development',
        scriptedBlackSans: ['d5', 'e6', 'Nf6', 'Be7', 'O-O', 'b6', 'Bb7', 'Nbd7'],
        ladderTier: 'initiate',
        difficulty: 1,
      },
      {
        type: 'dialogue',
        id: 'c1-after-amara',
        lines: [
          {
            speaker: 'amara',
            text: 'I made the right moves. I developed. I castled. I cannot explain why I lost.',
          },
          {
            speaker: 'alexion',
            text: 'You played correctly in the abstract. But correct principles without correct timing produce nothing. You castled too late — the center had already opened.',
          },
          {
            speaker: 'reed',
            text: 'She did the same things I was told to do.',
          },
          {
            speaker: 'alexion',
            text: 'She did them in the right order, but not at the right moment. Principles are not steps in a recipe. They are claims about what matters — and when it matters most is the knowledge you build from experience.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 2 — The Apprentice
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-lukas',
        storyBeat: {
          label: 'Theory pressure',
          title: 'Names are not understanding',
          body: 'Lukas knows the opening map. Reed has to prove that a smaller map, honestly understood, can outplay memorized territory.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Lukas. He has studied for two years. He knows the names of openings — he does not fully know why they exist. He will try a recognized structure and follow it mechanically.',
          },
          {
            speaker: 'reed',
            text: "So he's not improvising.",
          },
          {
            speaker: 'alexion',
            text: 'No. And that is his strength and his weakness. He will not make obvious errors — but he will not adapt when you deviate from what he expects.',
          },
          {
            speaker: 'lukas',
            text: 'I know the Italian lines. I know the response to 1.e4 and 1.d4. You are not going to surprise me with theory.',
          },
          {
            speaker: 'reed',
            text: "Then we'll go off-book.",
          },
        ],
      },
      {
        type: 'match',
        id: 'c1-match-lukas',
        title: 'Encounter 2 of 6 — The Apprentice',
        opponentName: 'Lukas',
        opponentNote:
          'A two-year court apprentice with solid opening knowledge. He follows scripted theory well but struggles when the position deviates. Look for imbalances.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Leave the book before the book leaves you',
          body: 'This encounter rewards comprehension over recall. Reed should choose positions he can explain, not lines he can merely name.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 2,
        aiStyle: 'development',
        scriptedBlackSans: ['e5', 'Nf6', 'Nc6', 'Bc5', 'O-O', 'd6', 'a6', 'Ba7', 'Be6'],
        ladderTier: 'apprentice',
        difficulty: 2,
      },
      {
        type: 'dialogue',
        id: 'c1-after-lukas',
        lines: [
          {
            speaker: 'lukas',
            text: 'You deviated from the main line on move six. I had not prepared for that.',
          },
          {
            speaker: 'reed',
            text: 'I was guessing. I just wanted a position I understood.',
          },
          {
            speaker: 'alexion',
            text: 'That instinct is more valuable than it sounds. A position you understand at depth three beats a theoretically correct position you have merely memorised. Memory is not comprehension.',
          },
          {
            speaker: 'lukas',
            text: 'I understand. The principles matter more than the names.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 3 — The Scholar (Mini-Boss)
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-edred',
        storyBeat: {
          label: 'First real threat',
          title: 'Principles under attack',
          body: 'Edred does not care whether Reed understands development. He wants to know whether those habits survive contact with danger.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Edred is the court guard assigned to the archive. He learned chess as a practical matter — in the way a soldier learns maps. Fast, tactical, aggressive. He is the first real test.',
          },
          {
            speaker: 'reed',
            text: 'What style does he play?',
          },
          {
            speaker: 'alexion',
            text: 'He does not play style. He plays threats. He will put pressure on your king early and dare you to castle through fire. Every piece of his is aimed at something.',
          },
          {
            speaker: 'edred',
            text: 'I do not care about principles. I care about the king. Show me where yours is hiding.',
          },
          {
            speaker: 'reed',
            text: "It isn't hiding yet.",
          },
          {
            speaker: 'edred',
            text: 'It will be.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c1-match-edred',
        title: 'Encounter 3 of 6 — The Scholar (Mini-Boss)',
        opponentName: 'Edred',
        opponentNote:
          'The court archive guard — tactical and aggressive. He plays the Dragon formation and creates kingside pressure. Castle decisively and counter-attack before he gains momentum.',
        storyBeat: {
          label: 'Mini-boss pressure',
          title: 'Keep the attack short of oxygen',
          body: 'Edred thrives on open lines. Reed has to deny space first, then punish the impatience that follows.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 3,
        aiStyle: 'romantic',
        scriptedBlackSans: [
          'c5', 'Nc6', 'g6', 'Bg7', 'd6', 'Nf6', 'O-O', 'a6', 'b5', 'Bb7',
        ],
        ladderTier: 'mini-boss',
        difficulty: 2,
      },
      {
        type: 'dialogue',
        id: 'c1-after-edred',
        lines: [
          {
            speaker: 'edred',
            text: 'You held the center. I had no room to attack.',
          },
          {
            speaker: 'alexion',
            text: 'A tactical player without space is a weapon without range. Reed did not give you space.',
          },
          {
            speaker: 'reed',
            text: 'I was scared of his bishop on g7 the whole game.',
          },
          {
            speaker: 'alexion',
            text: 'Good. You should have been. Respect is not the same as fear — respect means you gave it something to watch. You kept the pawns in front of it closed until you were ready. That is a different kind of patience from Amara or Lukas.',
          },
          {
            speaker: 'alexion',
            text: 'Down the colonnade, two senior scholars stop mid-argument to watch your ledger update. One closes his notebook without finishing the line. The court has begun keeping a second set of notes — about you.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 4 — The Veteran
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-marius',
        storyBeat: {
          label: 'Structural pressure',
          title: 'No obvious mistake is still a position',
          body: 'Marius removes the easy targets. Reed must learn that equal material can still contain a plan, a preference, and a weakness.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Marius has taught chess at this court for eleven years. He will not make errors in the opening. He will not leave pieces loose. He will not be rushed.',
          },
          {
            speaker: 'reed',
            text: "How do I beat someone who doesn't make mistakes?",
          },
          {
            speaker: 'alexion',
            text: 'You accumulate pressure. A player without errors still makes decisions, and decisions contain preferences. Find where his preferences are too narrow — and occupy the space he ignores.',
          },
          {
            speaker: 'marius',
            text: 'You have beaten an initiate, an apprentice, and a guard. The ladder is not a trophy case. Every rung tests something different.',
          },
          {
            speaker: 'marius',
            text: 'What you learned from Edred will not work on me. I do not play the king hunt. I build.',
          },
          {
            speaker: 'reed',
            text: 'Then I build too.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c1-match-marius',
        title: 'Encounter 4 of 6 — The Veteran',
        opponentName: 'Marius',
        opponentNote:
          'Senior court scholar with eleven years of teaching. Plays solidly with few weaknesses — classical structure and patient build-up. Outplay him in the middlegame.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Manufacture the imbalance',
          body: 'Marius will not donate a tactic. Reed has to create pressure patiently enough that a small preference becomes a real weakness.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'classical',
        scriptedBlackSans: [
          'e5', 'Nc6', 'Nf6', 'd6', 'Be7', 'O-O', 'Nd7', 'Nb6', 'Be6', 'Qd7',
        ],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c1-after-marius',
        lines: [
          {
            speaker: 'marius',
            text: 'You found the rook manoeuvre on the seventh rank. I did not expect that from someone three weeks into this chamber.',
          },
          {
            speaker: 'reed',
            text: 'I thought you might ignore the back rank if I kept the pieces active on the queenside.',
          },
          {
            speaker: 'marius',
            text: 'I did. That was my error. A lapse in vigilance at the right moment. You manufactured the moment.',
          },
          {
            speaker: 'alexion',
            text: 'Manufacturing moments from a structurally equal position is the core of practical chess. Theory gives equal positions. Practical skill creates unequal ones.',
          },
          {
            speaker: 'alexion',
            text: 'Two remain. Neither of them will be generous.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 5 — The Advisor (Boss)
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-demetrios',
        storyBeat: {
          label: 'Court pressure',
          title: 'The record becomes personal',
          body: 'Demetrios is not another rung. He is proof that the chamber can keep a hierarchy intact for decades.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Demetrios is the court advisor. He has held this position for thirty years. He has never lost to a student in this chamber.',
          },
          {
            speaker: 'reed',
            text: 'Is that supposed to comfort me?',
          },
          {
            speaker: 'alexion',
            text: 'No. It is data. Records exist so they can be broken. But only by someone who understands why the record stands — not by accident, and not by bravado.',
          },
          {
            speaker: 'demetrios',
            text: "So. Alexion's pupil reaches the fifth rung. Faster than I expected.",
          },
          {
            speaker: 'reed',
            text: "I've been told you don't lose.",
          },
          {
            speaker: 'demetrios',
            text: 'I have been told the same. The board does not care about our reputations. Sit down.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c1-match-demetrios',
        title: 'Encounter 5 of 6 — The Advisor (Boss)',
        opponentName: 'Demetrios',
        opponentNote:
          'Court advisor — thirty unbeaten years in this chamber. Plays the Giuoco Piano with precision and punishes any inaccuracy. His endgame is ruthless. Win to become the first.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Break the office, not the man',
          body: 'A victory here changes the court record. A loss proves Demetrios correct: students can threaten tradition, but not govern it.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 5,
        aiStyle: 'alexandrine',
        scriptedBlackSans: [
          'e5', 'Nc6', 'Bc5', 'Nf6', 'd6', 'O-O', 'a6', 'Ba7', 'Be6', 'Qe7', 'Rfd8',
        ],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c1-after-demetrios',
        storyBeat: {
          label: 'Record broken',
          title: 'Survival becomes evidence',
          body: 'The win matters because Demetrios respects why it happened. Reed did not overpower the office; he found the moments where the office overtrusted itself.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'demetrios',
            text: '…',
          },
          {
            speaker: 'demetrios',
            text: 'Thirty years. I concede. You did not win by accident.',
          },
          {
            speaker: 'reed',
            text: 'I thought the endgame was over for me three times.',
          },
          {
            speaker: 'demetrios',
            text: 'It should have been. You survived by refusing to simplify when simplification favoured me. That is a difficult instinct to develop — and you have it, for reasons I do not fully understand yet.',
          },
          {
            speaker: 'alexion',
            text: 'One opponent remains. Not a scholar. Not a guard or advisor.',
          },
          {
            speaker: 'alexion',
            text: 'The Counterpart is a composite built from every important game played in this era. It is the court, distilled. When you play it, you are playing the collective understanding of ancient chess itself.',
          },
          {
            speaker: 'reed',
            text: 'And when I beat it?',
          },
          {
            speaker: 'alexion',
            text: 'If you beat it — you carry the knowledge forward. Not as theory. As your own.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 6 — The Counterpart (Final)
         ─────────────────────────────────────────────────────────── */
      {
        type: 'match',
        id: 'c1-boss',
        title: 'Encounter 6 of 6 — The Counterpart',
        opponentName: 'Composite Court Scholar',
        opponentNote:
          'The court distilled — every important game of the ancient era. Plays precise development with no weaknesses. Win by checkmate, or force a true dead draw if no side can still mate.',
        storyBeat: {
          label: 'Era verdict',
          title: 'Play the court itself',
          body: 'The Counterpart has no pride to exploit. It is the archive asking whether Reed learned habits or merely survived opponents.',
          tone: 'pressure',
        },
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'apotheosis',
        scriptedBlackSans: ['Nc6', 'Nf6', 'Bc5', 'O-O', 'd6', 'Be6', 'Qd7', 'Rad8'],
        ladderTier: 'counterpart',
        difficulty: 5,
      },

      /* ── Reflection ───────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Ancient habits become Reed habits',
          body: 'The first chamber ends when Reed stops treating principles as instructions from Alexion and starts hearing them as his own questions at the board.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'scholar',
            text: 'You did not win by accident — or you would still be here, resetting the board.',
          },
          {
            speaker: 'reed',
            text: 'I kept thinking about the hanging pieces. Everything I left loose was a target.',
          },
          {
            speaker: 'alexion',
            text: 'Notice what improved across the six matches: you developed before you attacked. You refused to donate material without compensation. You castled when the center was tense. You found rook activity when the position was equal. These are ancient habits — they were ancient when these scholars first wrote them down.',
          },
          {
            speaker: 'demetrios',
            text: 'And you broke my record. I will not pretend that is nothing.',
          },
          {
            speaker: 'reed',
            text: "I still don't know theory. Openings. Names.",
          },
          {
            speaker: 'alexion',
            text: 'Theory is a map drawn by people who walked the terrain first. You are learning to read terrain. The next chamber is different — the Romantic era, when chess became fire. Everything will be sharper. The games shorter, the stakes higher, the sacrifices more creative.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter I is sealed. The door to the next age stands open — romantic gambits first, then classical precision, hypermodern paradox, the Soviet machine. Each is built on what you learned here. And understand what you have done tonight: a record that stood for thirty years has been struck from the ledger, and the people who keep that ledger are now reading your file. The archive is no longer waiting. It is watching.',
          },
        ],
      },

      /* ── Freeplay ─────────────────────────────────────────────── */
      {
        type: 'freeplay',
        id: 'c1-freeplay',
        title: 'Free board — open rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice without the court watching',
          body: 'After the ladder, the free board turns judgment into repetition. This is where learned principles become quicker than narration.',
          tone: 'quiet',
        },
        lesson:
          'The board is yours. Move for both sides — alternate White and Black from the starting position. No story objective: only rehearsal. Return to the vestibule when you are done.',
        teaching: {
          threat: 'None — this is a sandbox.',
          goalPlain:
            'Explore opening ideas legally. Try applying the ancient laws: develop, castle, control the center.',
          whyItWorks:
            'Repetition turns pattern into instinct. The positions you practice in silence become the moves you find quickly under pressure.',
          concept: 'Free play cements what the structured lessons demanded.',
        },
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     CHAPTER II — The Age of Fire (Romantic ladder — compact)
     Two encounters + puzzle; tuned slightly below Chapter I finale.
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch2',
    index: 2,
    title: 'Chapter II',
    subtitle: 'The Age of Fire',
    era: 'Romantic attack — initiative as creed',
    themeClass: 'theme-romantic',
    philosophy: 'The king is not only a sovereign to hide — sometimes he is the weakness the attack hungers for.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c2-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'Patience enters a room full of fire',
          body: 'Chapter I taught Reed not to donate material. Chapter II asks whether he can spend material deliberately without mistaking heat for progress.',
          tone: 'fire',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The chamber walls shift from candle-wax to forge-ember. The pieces are the same, but the air between them feels thinner, as though every exchange could ignite before anyone admits who struck the match.',
          },
          {
            speaker: 'alexion',
            text: 'Welcome to the Romantic age. Here, players paid for clarity with risk. Gambits offered pawns for minutes of confusion. Sacrifices bought time against the opponent\'s composure.',
          },
          {
            speaker: 'reed',
            text: 'So the mistakes I was punished for in Chapter I — loose pieces, slow development — they still matter?',
          },
          {
            speaker: 'alexion',
            text: 'More. A Romantic attack punishes hesitation twice: once in material, once in tempo. You will meet players who want the king exposed. Your job is not to refuse drama; it is to choose which drama you can survive.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c2-codex-fire',
        heading: 'The Romantic Laws — fire without self-immolation',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Romance is calculation wearing a mask',
          body: 'The era praises courage, but the archive is stricter: only sacrifices with follow-up deserve to be remembered as art.',
          tone: 'fire',
        },
        entries: [
          {
            term: 'Initiative',
            body: 'The player whose threats demand answers controls the pulse of the game. Initiative is not the same as attack — it means your opponent’s useful moves are fewer than yours. If you sacrifice, buy initiative you can use before the debt comes due.',
          },
          {
            term: 'The king as target',
            body: 'In the Romantic era, kings wandered into storms on purpose — to shelter behind enemy weaknesses. A king in the centre can be powerful or fatal. Ask each move: am I inviting tactics I can calculate, or ones I am hoping away?',
          },
          {
            term: 'Gambits',
            body: 'A gambit offers material for development, open lines, or a broken pawn structure the opponent cannot repair. Accept only if you know the repair; decline if you prefer to let the attacker prove the compensation.',
          },
          {
            term: 'Sacrifice vs. blunder',
            body: 'A sacrifice has a receipt: concrete threats, a recapture, or a forced sequence. A blunder is a donation. The archive records both — learn to feel the difference in your stomach before the ledger confirms it.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c2-puzzle-king-hunt',
        title: 'Puzzle — corner the king',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The attack must end cleanly',
          body: 'A king hunt that lingers becomes self-indulgence. The lesson is restraint at full speed.',
          tone: 'fire',
        },
        fen: '3k4/6Q1/3K4/8/8/8/8/8 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'The black king is already driven toward the edge. The queen commands the long diagonals and ranks — finish with geometry, not noise.',
        teaching: {
          threat: 'Delay, and the king slips toward the centre again. The Romantic court does not forgive slow hands.',
          goalPlain:
            'Deliver checkmate in one. Every flight square must be denied — find the queen move that seals the verdict.',
          goalBrief: 'Checkmate in one on the eighth rank.',
          whyItWorks:
            'Corner and edge mates are exercises in coverage: the attacker uses the board’s rim as a second defender.',
          concept:
            'King hunts end when the attacker runs out of checks with purpose — or when the defender trades into an endgame. Here, you end it before the escape.',
        },
        hint: 'The eighth rank is a cliff. Stand on its edge with authority.',
        opponentAiDepth: 2,
        opponentAiStyle: 'romantic',
      },
      {
        type: 'dialogue',
        id: 'c2-after-puzzle',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Speed still needs a destination',
          body: 'The first Romantic lesson clarifies the era: an attack is only beautiful when every urgent move narrows the ending.',
          tone: 'fire',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Clean. You did not add a single superfluous check. That restraint is Romantic discipline, not ancient caution dressed in new clothes.',
          },
          {
            speaker: 'reed',
            text: 'I was looking for the pattern where the king runs out of squares.',
          },
          {
            speaker: 'alexion',
            text: 'Good. This ladder is shorter than Chapter I, but hungrier. First: Rowan, who plays like a duelist under chandeliers.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c2-before-rowan',
        storyBeat: {
          label: 'Rival pressure',
          title: 'Rowan fights for tempo, not truth',
          body: 'He wants Reed to answer noise with panic. The real test is whether the ancient habits survive a flamboyant opening.',
          tone: 'fire',
        },
        lines: [
          {
            speaker: 'rowan',
            text: 'Alexion sends students to me when they stop hanging knights and start hunting kings. I will give you a messy King\'s Gambit: pawn taken, complications welcomed, reputations set lightly on fire.',
          },
          {
            speaker: 'reed',
            text: 'If I decline the mess?',
          },
          {
            speaker: 'rowan',
            text: 'Then I will drag you into it politely. Fire spreads.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c2-match-rowan',
        title: 'Encounter 1 of 2 — The Gambiteer',
        opponentName: 'Rowan Vale',
        opponentNote:
          'A Romantic duelist — tempo-first fire from open games, poisoned captures, and King\'s Gambit pressure. Keep the king safe; if you accept a pawn, know the invoice.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not eat the poisoned pawn',
          body: 'Rowan is a living doctrine of fire. He wins when beauty makes greed sound like courage; survive the first wave and the flame begins paying rent.',
          tone: 'fire',
        },
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 2',
        playerColor: 'w',
        aiDepth: 3,
        aiStyle: 'romantic',
        scriptedBlackSans: ['exf4', 'Nf6', 'Bc5', 'Nc6', 'O-O', 'd5'],
        ladderTier: 'initiate',
        difficulty: 2,
      },
      {
        type: 'dialogue',
        id: 'c2-after-rowan',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The archive rewards refusal',
          body: 'Not every offered capture is a prize. Reed wins the moment he lets a tempting pawn remain bait.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'rowan',
            text: 'You did not flinch when I offered the fork on f2. Most students reach for the poisoned pawn like it is owed to them.',
          },
          {
            speaker: 'reed',
            text: 'Chapter I drilled "loose pieces drop off." Your bishop on c5 was eyeing f2 the whole time.',
          },
          {
            speaker: 'alexion',
            text: 'One more rung. Vega does not gamble. She sacrifices with invoices. If you survive her accounting, Chapter II is yours.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c2-before-vega',
        storyBeat: {
          label: 'Boss pressure',
          title: 'Vega turns drama into accounting',
          body: 'Rowan tests nerve. Vega tests receipts: every sacrifice must name the square, tempo, and defender it intends to ruin.',
          tone: 'fire',
        },
        lines: [
          {
            speaker: 'vega',
            text: 'I am not here to entertain you. I am here to see whether you can calculate while the board is loud.',
          },
          {
            speaker: 'reed',
            text: 'Loud how?',
          },
          {
            speaker: 'vega',
            text: 'Open files, half-open diagonals, knights that remember every fork you missed. Bring your king to safety before you dream of attack.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c2-match-vega',
        title: 'Encounter 2 of 2 — The Flamekeeper',
        opponentName: 'Vega Sorn',
        opponentNote:
          'Romantic pressure audited by discipline — Italian pressure, defender overloads, and sacrifices with receipts. Castle early or pay in tempi.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Bring the king home before the board opens',
          body: 'Vega is strongest when the center breaks while your king is still negotiating shelter. Her pressure does not roar; it itemizes.',
          tone: 'fire',
        },
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'romantic',
        scriptedBlackSans: ['Bc5', 'Nf6', 'd6', 'O-O', 'Bg4', 'h6'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c2-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Fire becomes a tool',
          body: 'The Romantic lesson is not to attack more often. It is to know when danger has become usable.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You walked through fire without confusing bravery with recklessness. That distinction is the hinge the Romantic era turned on.',
          },
          {
            speaker: 'reed',
            text: 'Rowan wanted chaos. Vega wanted me to prove I could see through it.',
          },
          {
            speaker: 'alexion',
            text: 'Exactly. The next chambers will ask different questions: structure, restraint, systems. You carry both ancient patience and Romantic tempo into them.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter II is sealed. The forge cools, and the chronicle remembers the heat. The classical chamber opens next: structure, weak squares, prophylaxis — the Professor\'s Law. Beyond it, hypermodern shadows and later steel still wait behind locked doors. Somewhere upstairs, a committee is deciding what you are.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c2-freeplay',
        title: 'Free board — Romantic rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Turn heat into pattern',
          body: 'The forge is quiet now. Free play lets Reed repeat the dangerous shapes until a sacrifice feels like calculation again.',
          tone: 'fire',
        },
        lesson:
          'Re-open any line you nearly lost — alternate sides from a sharp Italian or gambit position. No objective beyond rehearsal.',
        teaching: {
          threat: 'None — this is a sandbox after the ladder.',
          goalPlain:
            'Practice tactical shots and king safety under self-imposed time pressure. Return to the vestibule when finished.',
          whyItWorks:
            'Romantic skill is pattern recognition under noise; repetition turns noise back into signal.',
          concept: 'The ladder tested you; the sandbox lets you steal back intuition cheaply.',
        },
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     CHAPTER III — The Professor's Law (Classical ladder — compact)
     Prophylaxis, weak squares, Demetrios return + Kallistos.
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch3',
    index: 3,
    title: 'Chapter III',
    subtitle: "The Professor's Law",
    era: 'Classical truth — structure before spark',
    themeClass: 'theme-classical',
    philosophy: 'Stop the opponent\'s idea one move before it is born. Beauty that ignores structure is only noise.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c3-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'Fire cools into law',
          body: 'Romantic tempo got Reed through the forge. Classical doctrine asks whether he can govern a position without needing drama to feel progress.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The chamber walls turn from forge-ember to pale stone. Files look longer. Weak squares feel like accusations. The pieces have not changed; the excuses have.',
          },
          {
            speaker: 'alexion',
            text: 'Welcome to classical truth. Here, players win by preventing the opponent\'s plan, not by inventing a louder one. Prophylaxis is not fear — it is authorship.',
          },
          {
            speaker: 'reed',
            text: 'So I stop attacking?',
          },
          {
            speaker: 'alexion',
            text: 'You stop attacking without a reason. You will meet Demetrios again — older in doctrine, not softer — and then Kallistos, who teaches the board to refuse your favorite mistakes before you make them.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c3-codex-law',
        heading: "The Professor's Law — structure, outposts, prophylaxis",
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Prevention is a move',
          body: 'Classical court doctrine files three tools: the weak square, the outpost, and the quiet move that denies the opponent\'s only idea.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Weak squares',
            body: 'A square the opponent can no longer defend with a pawn becomes a lodging for a piece. If you create one in your own camp, you have written an invitation. If you create one in theirs, you have written a plan.',
          },
          {
            term: 'Outposts',
            body: 'A knight on a protected square that cannot be kicked by a pawn is not a decoration — it is a tax the opponent pays every move. Build the outpost; then force them to live with it.',
          },
          {
            term: 'Prophylaxis',
            body: 'Ask what they want. Then make that idea illegal. The best classical move often looks quiet because it stole the loud reply before it existed.',
          },
          {
            term: 'Restraint',
            body: 'Classical conversion prefers small edges and clean trades over speculative storms. If the endgame is good, do not invent a middlegame crisis to feel brave.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c3-puzzle-prophylaxis',
        title: 'Puzzle — finish with geometry',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The quiet file is already loaded',
          body: 'Classical attacks often look late: the pieces are already where they need to be. Finish without noise.',
          tone: 'pressure',
        },
        fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'Black\'s back rank is undefended. The rook already owns the open file — one classical stroke ends the story.',
        teaching: {
          threat: 'If you dawdle, Black can make luft with ...h6 or ...g6 and the geometry evaporates.',
          goalPlain: 'Deliver checkmate in one move using the open e-file.',
          goalBrief: 'Checkmate on the open e-file.',
          whyItWorks:
            'Classical mating patterns punish neglected back ranks. Prophylaxis for Black would have been a pawn move; you punish the omission.',
          concept: 'Geometry over noise — the file was the plan.',
        },
        hint: 'The e-file is already loaded. Occupying e8 ends it.',
      },
      {
        type: 'dialogue',
        id: 'c3-after-puzzle',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The archive prefers clean ends',
          body: 'Reed learns that classical beauty is often a single forced geometry, not a speech.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Clean. No checks for their own sake. That restraint is already classical discipline.',
          },
          {
            speaker: 'reed',
            text: 'Demetrios is waiting again?',
          },
          {
            speaker: 'alexion',
            text: 'As examiner, not as the Chapter I ladder\'s final mask. He will test whether your structures survive cross-examination.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c3-before-demetrios',
        storyBeat: {
          label: 'Match pressure',
          title: 'The library returns',
          body: 'Demetrios brings synthesis into a classical classroom: development, restraint, and a refusal to gift tempos.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'demetrios',
            text: 'You have learned fire. Show me whether you can govern a position when nothing is on fire.',
          },
          {
            speaker: 'reed',
            text: 'That sounds like a trap dressed as patience.',
          },
          {
            speaker: 'demetrios',
            text: 'Patience is the trap. Play as if every pawn move writes law.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c3-match-demetrios-return',
        title: 'Encounter 1 of 2 — The Returning Examiner',
        opponentName: 'Demetrios',
        opponentNote:
          'Classical examiner — disciplined development, central restraint, and prophylactic replies. Do not lose tempi to pawn moves before move 15.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Survive the quiet cross-examination',
          body: 'Demetrios wins when you invent drama in a position that only needed accuracy. Keep structure; answer threats before they grow a name.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'classical',
        scriptedBlackSans: ['e5', 'Nc6', 'Nf6', 'Bc5', 'd6', 'O-O'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c3-after-demetrios',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The examiner nods once',
          body: 'A classical win does not always feel like a triumph. Sometimes it feels like the board agreeing with you.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'demetrios',
            text: 'Adequate. You did not donate a weak square for entertainment.',
          },
          {
            speaker: 'alexion',
            text: 'One more rung. Kallistos is the Professor\'s Law made personal — prophylaxis as manners.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c3-before-kallistos',
        storyBeat: {
          label: 'Boss pressure',
          title: 'The professor does not raise her voice',
          body: 'Kallistos wins by making your intended plan illegal a move early. If you feel smothered, you are being taught.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'kallistos',
            text: 'I am not here to entertain the gallery. I am here to see whether you can stop an idea before it is born.',
          },
          {
            speaker: 'reed',
            text: 'And if I miss it?',
          },
          {
            speaker: 'kallistos',
            text: 'Then the outpost arrives, the file opens, and you will wonder when the game left you. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c3-match-kallistos',
        title: 'Encounter 2 of 2 — The Professor',
        opponentName: 'Kallistos',
        opponentNote:
          'Classical prophylaxis specialist — denies breaks, occupies outposts, and converts small edges. Manufacture a plan that survives her quiet refusals.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Write a plan she cannot veto',
          body: 'Kallistos is strongest when you play hope chess. Name your break, prepare it, and do not gift her the weak-square ledger.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'classical',
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c3-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Law after fire',
          body: 'Classical doctrine does not erase Romantic tempo — it decides when tempo is allowed to spend structure.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You carried fire into a room that rewards silence. That is the Professor\'s Law: drama is optional; structure is not.',
          },
          {
            speaker: 'reed',
            text: 'Demetrios tested patience. Kallistos tested whether I could see the threat before it had a name.',
          },
          {
            speaker: 'kallistos',
            text: 'Remember the habit. Hypermodern shadows and later machines will try to make you forget it.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter III is sealed. The Professor\'s Law stands. Beyond this door the Paradox Masters wait — refuse the center to own it later. Daily Calculus and the Duel Archive remain open while you prepare.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c3-freeplay',
        title: 'Free board — Classical rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the quiet refusals',
          body: 'Rehearse outposts, pawn breaks, and prophylactic waits until they feel as natural as captures.',
          tone: 'quiet',
        },
        lesson:
          'Set up a closed or semi-closed structure and alternate sides. Practice stopping the opponent\'s break before it lands.',
        teaching: {
          threat: 'None — this is a sandbox after the classical ladder.',
          goalPlain:
            'Rehearse prophylaxis and weak-square control without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Classical skill is recognizing the opponent\'s plan early enough to veto it cheaply.',
          concept: 'The professor\'s drills become instinct only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER IV — The Paradox Masters (Hypermodern ladder — compact)
     Fianchetto doctrine, provocation, Nysa + Cassian.
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch4',
    index: 4,
    title: 'Chapter IV',
    subtitle: 'The Paradox Masters',
    era: 'Hypermodernism — refuse the center to own it later',
    themeClass: 'theme-hypermodern',
    philosophy:
      'Occupation is not ownership. Invite the center, tax the overreach, and let the long diagonal collect the rent.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c4-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'Law meets paradox',
          body: 'Classical structure taught Reed to stop bad ideas. Hypermodern doctrine asks whether he can win without planting a flag on every central square.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The chamber light thins. Files look longer from the corners. A sealed brief waits on the lectern — the same upstairs committee that has been deciding what Reed is since the Romantic seal. The center of the board is empty on purpose: not abandoned, invited.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as school-flexible. That is not a compliment. It is a warrant to test whether you can change doctrine without becoming a tourist.',
          },
          {
            speaker: 'kallistos',
            text: 'I warned you the shadows would try to make you forget structure. They will. The frontier does not cancel the Professor\'s Law. It asks whether you can keep it while refusing a flag.',
          },
          {
            speaker: 'reed',
            text: 'So I give up the middle?',
          },
          {
            speaker: 'alexion',
            text: 'You refuse empty occupation. The Bactrian commentaries reached Alexandria with the same caravans that brought chaturanga west. Nysa taxes greed from a fianchetto. Cassian makes ambition confess. Development still matters. Drama still lies.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c4-codex-paradox',
        heading: 'Paradox doctrine — fianchetto, provocation, delayed ownership',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Ownership without occupation',
          body: 'Hypermodern court files three tools: the long diagonal, the invited overextension, and the break that arrives after the opponent has seized too much.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Fianchetto',
            body: 'A bishop developed to b2 or g2 (or the black mirrors) does not hide — it aims through the whole board. The diagonal is a delayed claim on the center.',
          },
          {
            term: 'Provocation',
            body: 'Allowing central pawns to advance is not surrender when those pawns become targets. Ask whether the opponent can defend what they seized.',
          },
          {
            term: 'Overextension',
            body: 'Pawns that outrun their pieces write IOUs. Hypermodern wins often begin when the center looks impressive and ends when it cannot be held.',
          },
          {
            term: 'Delayed ownership',
            body: 'Strike the overbuilt center with breaks and pressure only after development is real. Paradox is patience with teeth, not passivity.',
          },
          {
            term: 'Bactrian Frontier',
            body: 'Eastern archive colleges treated the center as a caravan road: you do not occupy every mile. You tax the ones who try. Alexander\'s long reign made that commentary civic law, not a provincial curiosity.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c4-puzzle-fianchetto',
        title: 'Puzzle — finish the fianchetto',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The diagonal needs its bishop',
          body: 'Hypermodern plans begin with a habit: put the bishop where the long diagonal can collect rent.',
          tone: 'pressure',
        },
        fen: 'rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQKBNR w KQkq - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'g2', color: 'w', pieceType: 'b' },
        lesson:
          'g3 alone is only a promise. Bg2 completes the fianchetto and aims the bishop through the center.',
        teaching: {
          threat: 'If you wander with knights first, the diagonal stays empty and the paradox never starts.',
          goalPlain: 'Place your light-squared bishop on g2.',
          whyItWorks:
            'The fianchetto bishop pressures central squares from a distance — ownership without planting a pawn on e4 first.',
          concept: 'Habit before paradox — finish the diagonal.',
        },
      },
      {
        type: 'puzzle',
        id: 'c4-puzzle-overreach',
        title: 'Puzzle — collect the rent',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The diagonal taxes greed',
          body: 'A knight that parked on an open long diagonal is not a guest. It is an invoice. Take it.',
          tone: 'pressure',
        },
        fen: '6k1/5ppp/8/3n4/8/6P1/5PBP/6K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          'Black\'s knight sat on the long diagonal as if the bishop were furniture. Bxd5 is the frontier\'s favorite tax.',
        teaching: {
          threat: 'If you ignore the hanging knight, the paradox stays a lecture.',
          goalPlain: 'Win the knight on d5 with the fianchetto bishop.',
          whyItWorks:
            'Hypermodern geometry is patient until a piece steps onto the diagonal without a defender. Then ownership arrives as a capture.',
          concept: 'Overextension is a confession. Accept it.',
        },
      },
      {
        type: 'puzzle',
        id: 'c4-puzzle-battery',
        title: 'Puzzle — diagonal battery',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The long diagonal finishes loud',
          body: 'Hypermodern geometry is patient until the battery arrives. Then the empty back rank becomes a verdict.',
          tone: 'fire',
        },
        fen: '6k1/5ppp/8/8/8/6PQ/5PBP/6K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'Queen and fianchetto bishop share the long diagonal. One quiet-looking geometry ends the game.',
        teaching: {
          threat: 'If you shuffle without using the diagonal, Black makes luft and the battery loses its lawsuit.',
          goalPlain: 'Deliver checkmate using the queen-and-bishop battery.',
          whyItWorks:
            'Qc8# seals the back rank while the g2-bishop owns the escape geometry — paradox ending as force.',
          concept: 'Delayed ownership can still mate.',
        },
      },
      {
        type: 'dialogue',
        id: 'c4-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the frontier',
          body: 'Reed has the diagonal habits. Nysa will ask whether he can hold a center without becoming the overextended king in the codex.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Good. You can build the claim, and you can cash it. Now survive someone who wants you to seize too much.',
          },
          {
            speaker: 'reed',
            text: 'Nysa — the frontier examiner?',
          },
          {
            speaker: 'alexion',
            text: 'She learned the board on Bactrian roads, not marble courts. She will leave the center open like a dare, then ask what it cost you.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c4-before-nysa',
        storyBeat: {
          label: 'Match pressure',
          title: 'The invitation',
          body: 'Nysa thrives when ambition outruns development. Occupy with purpose, or become the example in her dossier.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'nysa',
            text: 'Take the center if you must. I will measure what it costs you.',
          },
          {
            speaker: 'reed',
            text: 'And if I refuse?',
          },
          {
            speaker: 'nysa',
            text: 'Then we both wait — and waiting is a frontier skill. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c4-match-nysa',
        title: 'Encounter 1 of 2 — The Frontier',
        opponentName: 'Nysa',
        opponentNote:
          'Hypermodern provocateur — fianchetto pressure, invited overextension, and diagonal taxation. Occupy only what you can defend twice.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not buy the empty center',
          body: 'Nysa wins when your pawns look impressive and your pieces look late. Develop, castle, and ask which diagonal is collecting rent.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'hypermodern',
        scriptedBlackSans: ['g6', 'Bg7', 'd6', 'Nf6', 'O-O', 'c5'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c4-after-nysa',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The invoice is paid',
          body: 'Surviving Nysa feels less like a charge and more like refusing a bad loan.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'nysa',
            text: 'You treated space like a ledger. The frontier notices.',
          },
          {
            speaker: 'alexion',
            text: 'One more rung. Cassian is paradox with patience — delayed ownership as law.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c4-before-cassian',
        storyBeat: {
          label: 'Boss pressure',
          title: 'The paradox master',
          body: 'Cassian does not need the center to own it. If you seize everything early, he will strangle the confession out of your structure.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'cassian',
            text: 'I do not need the center to own it. Prove you can hold what you seize.',
          },
          {
            speaker: 'reed',
            text: 'And if the seizure is sound?',
          },
          {
            speaker: 'cassian',
            text: 'Then your breaks arrive on time, and my diagonals stay hungry. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c4-match-cassian',
        title: 'Encounter 2 of 2 — The Paradox Master',
        opponentName: 'Cassian',
        opponentNote:
          'Paradox specialist — knight-first refusals, fianchetto strangling, and breaks timed against overcommitment. Manufacture a center that survives provocation.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Hold the center without confessing',
          body: 'Cassian is strongest when you invent a plan after the pawns are already overcommitted. Name your break, develop fully, and contest the long diagonal.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'hypermodern',
        scriptedBlackSans: ['Nf6', 'g6', 'Bg7', 'd5', 'c5', 'O-O'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c4-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Ownership after refusal',
          body: 'Hypermodern doctrine does not erase classical law — it decides when occupation is a loan and when it is a title.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to refuse empty flags. That is the Paradox Masters\' seal: ownership can wait, but development cannot.',
          },
          {
            speaker: 'reed',
            text: 'Nysa taxed greed. Cassian asked whether my center could survive its own ambition.',
          },
          {
            speaker: 'kallistos',
            text: 'You kept the habit. The committee will have to amend the file.',
          },
          {
            speaker: 'cassian',
            text: 'Remember the geometry. Later machines will calculate faster than your fear — but they still punish overextension. The next door teaches how to wait without becoming furniture.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter IV is sealed. Upstairs, the brief is rewritten: Reed is no longer only a control specimen. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, the Machine of Discipline waits — prophylaxis, luft, and the long squeeze. The chronicle has another age to inscribe.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c4-freeplay',
        title: 'Free board — Paradox rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice delayed ownership',
          body: 'Rehearse fianchetto structures, invited centers, and timely breaks until paradox feels as natural as occupation.',
          tone: 'quiet',
        },
        lesson:
          'Set up a fianchetto structure and alternate sides. Practice inviting a big center, then striking it only after development is complete.',
        teaching: {
          threat: 'None — this is a sandbox after the hypermodern ladder.',
          goalPlain:
            'Rehearse provocation and diagonal pressure without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Hypermodern skill is recognizing when the opponent\'s center is a trophy and when it is a liability.',
          concept: 'Paradox becomes instinct only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER V — The Machine of Discipline (compact ladder)
     Prophylaxis, luft, conversion. Gage + Helia.
     Reuses theme-classical (CSS gzip locked).
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch5',
    index: 5,
    title: 'Chapter V',
    subtitle: 'The Machine of Discipline',
    era: 'Discipline colleges — prophylaxis, luft, and the long squeeze',
    themeClass: 'theme-classical',
    philosophy:
      'A pause is not fear. Make luft before the back rank names you, convert what you won, and refuse to gift the opponent a square.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c5-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'Paradox meets the pause',
          body: 'Frontier geometry taught Reed to refuse empty flags. The discipline colleges ask whether he can wait without becoming furniture — and whether a winning file is a fact or a rumor.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The chamber does not brighten. Files arrive already indexed: luft, conversion, the long squeeze. No caravan roads this time. Desks. Clocks. A doctrine that treats inspiration as a leak in the hull.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as school-flexible, then as paradox-capable. That is not a medal. It is a warrant to test whether you can stop an idea one square before it earns a name.',
          },
          {
            speaker: 'cassian',
            text: 'I asked whether your center could survive its own ambition. Gage will ask whether you gift squares. Helia will ask whether you cash what you win. Neither is a villain. Drought taught their colleges that drama spends water.',
          },
          {
            speaker: 'reed',
            text: 'So I wait?',
          },
          {
            speaker: 'kallistos',
            text: 'You refuse the gift. The Professor\'s Law still holds. The machine is only the habit of applying it before the opponent notices the hole.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c5-codex-discipline',
        heading: 'Discipline doctrine — prophylaxis, luft, conversion, squeeze',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Stop the square, then cash the file',
          body: 'Northern archive colleges under the Long Reign treat patience as civic infrastructure: make an escape square, convert a won piece, and squeeze without needing a speech.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Prophylaxis',
            body: 'Prevent the opponent\'s idea before it is born. The cheapest tactic is the square you refuse to gift — a pause with a reason, not a freeze.',
          },
          {
            term: 'Luft',
            body: 'An air hole for the king. A quiet pawn step that makes back-rank mates illegal. Discipline begins by surviving the cheap shot you should have seen.',
          },
          {
            term: 'Conversion',
            body: 'A hanging piece or a won endgame is only a rumor until you take it. Advantage that stays on the board as courtesy is how wins become draws.',
          },
          {
            term: 'Long squeeze',
            body: 'Technical pressure without a sacrifice speech. Restrict, improve, and let the opponent run out of useful squares. The machine is slow on purpose.',
          },
          {
            term: 'Discipline colleges',
            body: 'Steppe and river-city archives that survived drought by treating chess as logistics: no wasted tempi, no romantic leaks. Gage files pauses. Helia files conversion. The Long Reign made both civic law, not a provincial temper.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c5-puzzle-luft',
        title: 'Puzzle — make luft',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The back rank wants a name',
          body: 'Discipline begins with a quiet pawn. Give the king an air hole before the e-file rook writes a verdict.',
          tone: 'pressure',
        },
        fen: '4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'h3', color: 'w', pieceType: 'p' },
        lesson:
          'h3 is not decoration. It is luft — the king can step up if the back rank ever opens.',
        teaching: {
          threat: 'If you shuffle without making air, the e-file contest can name you on the back rank.',
          goalPlain: 'Make luft — push the h-pawn to h3.',
          whyItWorks:
            'A flight square costs one quiet tempo and cancels a whole class of mates. Prophylaxis is cheapest when it looks like nothing.',
          concept: 'Luft before drama.',
        },
      },
      {
        type: 'puzzle',
        id: 'c5-puzzle-conversion',
        title: 'Puzzle — cash the hanging queen',
        storyBeat: {
          label: 'Drill pressure',
          title: 'Advantage is a rumor until taken',
          body: 'A queen sitting undefended is not a guest. Conversion is the habit of taking what the file already granted.',
          tone: 'pressure',
        },
        fen: '6k1/5ppp/8/3q4/8/8/5PPP/3Q2K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          'Black\'s queen sat on d5 as if courtesy were a rule. Qxd5 is the machine\'s favorite receipt.',
        teaching: {
          threat: 'If you ignore the hanging queen, the conversion lecture stays a lecture.',
          goalPlain: 'Win the hanging queen on d5.',
          whyItWorks:
            'Discipline does not wait for a prettier tactic. A free piece is the squeeze beginning, not a plot twist.',
          concept: 'Convert what you already won.',
        },
      },
      {
        type: 'puzzle',
        id: 'c5-puzzle-squeeze',
        title: 'Puzzle — convert the opposition',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The long squeeze finishes quiet',
          body: 'King opposition plus a rook file is not a speech. It is a door closing. Convert it.',
          tone: 'fire',
        },
        fen: '4k3/8/4K3/8/8/8/8/R7 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'The kings face each other. The rook owns the back rank. One file move ends the rumor.',
        teaching: {
          threat: 'If you check from the side instead of sealing the rank, the king wriggles and the squeeze leaks.',
          goalPlain: 'Deliver checkmate with the rook on the back rank.',
          whyItWorks:
            'Ra8# uses opposition: the black king cannot step forward, and the rook owns every flight square on the eighth.',
          concept: 'Conversion can still mate.',
        },
      },
      {
        type: 'dialogue',
        id: 'c5-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the pause',
          body: 'Reed has luft, capture, and opposition. Gage will ask whether he can refuse a square before it becomes a threat with a name.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Good. You can make air, you can cash a piece, and you can close a file. Now survive someone who wants you to gift a square.',
          },
          {
            speaker: 'reed',
            text: 'Gage — the pause examiner?',
          },
          {
            speaker: 'alexion',
            text: 'He learned the board in river-city drill halls, not on marble. He will leave a hole in your camp like a dare, then ask why you filled it too late.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c5-before-gage',
        storyBeat: {
          label: 'Match pressure',
          title: 'The pause',
          body: 'Gage thrives when you attack a square that was never the idea. Refuse the gift, or become the example in his dossier.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'gage',
            text: 'A pause is not fear. It is a refusal to gift the opponent a name. Begin.',
          },
          {
            speaker: 'reed',
            text: 'And if the name is already on the board?',
          },
          {
            speaker: 'gage',
            text: 'Then you stop the square it wanted next. That is the whole machine.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c5-match-gage',
        title: 'Encounter 1 of 2 — The Pause',
        opponentName: 'Gage',
        opponentNote:
          'Discipline examiner — quiet structures, prophylactic pauses, and luft before drama. Do not gift a square that names his plan.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not gift the next square',
          body: 'Gage wins when your attack arrives one tempo after his idea is already illegal. Develop, castle, and ask which hole you are about to donate.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'soviet',
        scriptedBlackSans: ['d6', 'Nf6', 'Be7', 'O-O', 'h6'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c5-after-gage',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The pause is filed',
          body: 'Surviving Gage feels less like a charge and more like refusing a bad gift.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'gage',
            text: 'You treated squares like a ledger. The colleges notice.',
          },
          {
            speaker: 'alexion',
            text: 'One more rung. Helia is conversion with patience — a won file as law, not as a rumor.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c5-before-helia',
        storyBeat: {
          label: 'Boss pressure',
          title: 'The converter',
          body: 'Helia does not need a sacrifice speech. If you leave a hanging advantage on the table, she will cash it and call it weather.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'helia',
            text: 'Advantage that is not converted is a rumor. Make it a fact.',
          },
          {
            speaker: 'reed',
            text: 'And if the conversion is ugly?',
          },
          {
            speaker: 'helia',
            text: 'Ugly facts still feed cities in a drought. Pretty rumors do not. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c5-match-helia',
        title: 'Encounter 2 of 2 — The Converter',
        opponentName: 'Helia',
        opponentNote:
          'Conversion specialist — French and queen-pawn squeezes, technical endgames, and no courtesy toward hanging pieces. Cash what you win.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Cash the file',
          body: 'Helia is strongest when you treat a won piece as atmosphere. Name the conversion, simplify when ahead, and do not donate counterplay.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'soviet',
        scriptedBlackSans: ['e6', 'd5', 'Nf6', 'Be7', 'O-O'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c5-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Discipline after paradox',
          body: 'The machine does not erase frontier geometry — it decides when a pause is law and when a won file is still a rumor.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to refuse gifts and to cash facts. That is the Machine of Discipline\'s seal: patience with a receipt.',
          },
          {
            speaker: 'reed',
            text: 'Gage asked which square I was about to donate. Helia asked whether my advantage was a fact.',
          },
          {
            speaker: 'kallistos',
            text: 'You kept the habit. The committee will have to amend the file again.',
          },
          {
            speaker: 'helia',
            text: 'Remember the conversion. Later ledger-engines will calculate faster than your fear — but they still punish courtesy toward hanging pieces. The next door asks whether you can follow a line you did not invent.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter V is sealed. Upstairs, the brief is rewritten again: Reed can wait without becoming furniture. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, the Silicon Threshold waits — precision without a speech. The chronicle has another age to inscribe.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c5-freeplay',
        title: 'Free board — Discipline rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the pause and the cash',
          body: 'Rehearse luft, quiet refusals, and technical conversion until discipline feels as natural as a capture.',
          tone: 'quiet',
        },
        lesson:
          'Set up a simple structure and alternate sides. Practice making luft, stopping a plan one square early, and converting a won piece without a speech.',
        teaching: {
          threat: 'None — this is a sandbox after the discipline ladder.',
          goalPlain:
            'Rehearse prophylaxis and conversion without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Discipline is recognizing the opponent\'s idea early enough to veto it cheaply, then cashing what the veto won.',
          concept: 'The machine becomes instinct only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER VI — The Silicon Threshold (compact ladder)
     Precision, outposts, forced finishes. Prax + Iota.
     Reuses theme-classical (CSS gzip locked).
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch6',
    index: 6,
    title: 'Chapter VI',
    subtitle: 'The Silicon Threshold',
    era: 'Ledger engines — precision without a speech',
    themeClass: 'theme-classical',
    philosophy:
      'The line is already there. Occupy the hole, take what hangs, finish the file. Intuition is a luxury the counting rooms do not budget.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c6-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'Discipline meets the ledger',
          body: 'The pause taught Reed to refuse gifts. The counting rooms ask whether he can follow a line he did not invent — and whether a human still belongs in the verdict.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The chamber smells of oil and index cards. Brass gears tick behind lapis glass: civic ledger-engines, older than Reed, younger than the Long Reign. They do not dream. They enumerate. A clerk has already laid out three positions the machine called trivial.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as disciplined. That is not a compliment here. It is a warrant to test whether you can keep up when the line is public and your pulse is not.',
          },
          {
            speaker: 'helia',
            text: 'I asked whether your advantage was a fact. Prax will ask whether you occupy the hole the ledger already named. Iota will ask whether you finish a plus instead of narrating it. Neither is a villain. Drought taught the counting rooms that inspiration is a leak.',
          },
          {
            speaker: 'reed',
            text: 'So I become the machine?',
          },
          {
            speaker: 'gage',
            text: 'You follow the line without becoming furniture. A pause that ignores a hanging piece is not prophylaxis. It is vanity.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c6-codex-ledger',
        heading: 'Ledger doctrine — outpost, precision, forced finish',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'The line is public',
          body: 'Civic counting rooms under the Long Reign treat chess as audit: occupy the hole, take the hanging piece, finish the back rank. Mercy is how facts become rumors.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Outpost',
            body: 'A hole the opponent cannot easily challenge. The ledger names it first. A knight that sits there is not drama — it is rent.',
          },
          {
            term: 'Precision capture',
            body: 'If a piece hangs, take it. The counting rooms do not wait for a prettier tactic. Missed captures are how drought files get people killed in the real city.',
          },
          {
            term: 'Forced finish',
            body: 'Back-rank mates, locked kings, and one-move conversions. When the line is forced, narration is delay. Finish it.',
          },
          {
            term: 'Ledger engine',
            body: 'Brass-and-lapis civic calculators in archive counting rooms. They enumerate legal moves faster than a clerk can blush. They do not hate you. They do not love you. They report the plus.',
          },
          {
            term: 'Silicon Threshold',
            body: 'The civic argument of this age: if the ledger sees further than a human, what is a stratarch for? Prax answers follow. Iota answers finish. Reed has to answer without becoming a rubber stamp.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c6-puzzle-outpost',
        title: 'Puzzle — occupy the hole',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The ledger named d5 first',
          body: 'Engine doctrine begins with a habit: put the knight where the hole already is. Do not wait for a speech.',
          tone: 'pressure',
        },
        fen: '6k1/5ppp/8/8/8/2N5/5PPP/6K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'd5', color: 'w', pieceType: 'n' },
        lesson:
          'd5 is a hole. Nd5 occupies it. The ledger does not ask whether the move feels inspired.',
        teaching: {
          threat: 'If you wander with checks, the outpost stays empty and the threshold never starts.',
          goalPlain: 'Plant your knight on the d5 outpost.',
          whyItWorks:
            'An unchallenged central knight restricts the king and owns key squares — precision as occupancy, not as a sacrifice.',
          concept: 'Occupy what the ledger already named.',
        },
      },
      {
        type: 'puzzle',
        id: 'c6-puzzle-precision',
        title: 'Puzzle — take the hanging queen',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The plus is a fact',
          body: 'A queen sitting undefended is not a plot twist. Precision is the habit of taking it on this move.',
          tone: 'pressure',
        },
        fen: '6k1/5ppp/8/3q4/8/4N3/5PPP/6K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          'Black\'s queen sat on d5 as if the knight were furniture. Nxd5 is the counting room\'s favorite receipt.',
        teaching: {
          threat: 'If you ignore the hanging queen, the ledger files you as a leak.',
          goalPlain: 'Win the hanging queen on d5 with the knight.',
          whyItWorks:
            'Engine geometry is unkind: the knight already attacks the queen. Taking it is not greed. It is audit.',
          concept: 'Take what hangs. Now.',
        },
      },
      {
        type: 'puzzle',
        id: 'c6-puzzle-backrank',
        title: 'Puzzle — finish the back rank',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The line is forced',
          body: 'King locked behind his own pawns. The rook owns the eighth. Finish the file; do not narrate it.',
          tone: 'fire',
        },
        fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'No luft, no escape. Re8 is mate. The ledger would not spend a tempo on anything else.',
        teaching: {
          threat: 'If you check from the side or shuffle, the king makes air and the plus becomes a rumor.',
          goalPlain: 'Deliver back-rank checkmate with the rook.',
          whyItWorks:
            'Re8# seals the eighth while the king is boxed by his own pawns — a forced finish, not a speech.',
          concept: 'When the line is forced, finish it.',
        },
      },
      {
        type: 'dialogue',
        id: 'c6-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the counting room',
          body: 'Reed has the outpost, the capture, and the finish. Prax will ask whether he can follow a public line when his pulse disagrees.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'Good. You can occupy, you can take, and you can finish. Now survive someone who already knows the next eight moves of a clean file.',
          },
          {
            speaker: 'reed',
            text: 'Prax — the precision examiner?',
          },
          {
            speaker: 'alexion',
            text: 'He learned the board against ledger-engines, not against poets. He will leave a hole like an invoice, then ask why you did not sit on it.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c6-before-prax',
        storyBeat: {
          label: 'Match pressure',
          title: 'The public line',
          body: 'Prax thrives when you invent instead of occupying. Follow the hole, or become the leak in his dossier.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'prax',
            text: 'The line is already there. Follow it, or be the leak.',
          },
          {
            speaker: 'reed',
            text: 'And if the line is ugly?',
          },
          {
            speaker: 'prax',
            text: 'Ugly lines still feed cities. Pretty leaks do not. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c6-match-prax',
        title: 'Encounter 1 of 2 — The Public Line',
        opponentName: 'Prax',
        opponentNote:
          'Ledger examiner — Sicilian-sharp structures, outposts, and no patience for missed captures. Occupy the hole; take what hangs.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not invent past the hole',
          body: 'Prax wins when you look for a speech instead of the outpost. Develop, castle, and ask which square the ledger already named.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'engine',
        scriptedBlackSans: ['c5', 'Nc6', 'd6', 'Nf6', 'Be7', 'O-O'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c6-after-prax',
        storyBeat: {
          label: 'After-action pressure',
          title: 'The line was followed',
          body: 'Surviving Prax feels less like a charge and more like passing an audit.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'prax',
            text: 'You sat on the hole. The counting rooms notice.',
          },
          {
            speaker: 'alexion',
            text: 'One more rung. Iota is the finish — a plus as law, not as atmosphere.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c6-before-iota',
        storyBeat: {
          label: 'Boss pressure',
          title: 'The finisher',
          body: 'Iota does not need a sacrifice speech. If you leave a plus on the table, she will cash it and call it weather.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'iota',
            text: 'A plus of one pawn is a fact. Mercy is how facts become rumors.',
          },
          {
            speaker: 'reed',
            text: 'And if the finish is ugly?',
          },
          {
            speaker: 'iota',
            text: 'Then finish it uglier than drought. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c6-match-iota',
        title: 'Encounter 2 of 2 — The Finisher',
        opponentName: 'Iota',
        opponentNote:
          'Threshold specialist — Caro and Slav walls, tiny pluses converted without courtesy, and back-rank finishes. Cash the file.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Finish the plus',
          body: 'Iota is strongest when you treat a small advantage as atmosphere. Name the conversion, occupy the hole, and do not donate a back rank.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'engine',
        scriptedBlackSans: ['c6', 'd5', 'Nf6', 'e6', 'Be7', 'O-O'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c6-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Judgment after the ledger',
          body: 'The threshold does not erase discipline — it decides when a human is still required once the line is public.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to occupy, take, and finish. That is the Silicon Threshold\'s seal: a human who can keep up without becoming a stamp.',
          },
          {
            speaker: 'reed',
            text: 'Prax asked whether I would sit on the hole. Iota asked whether my plus was a fact.',
          },
          {
            speaker: 'gage',
            text: 'You kept the pause. The ledger does not cancel it. It only punishes the pause that ignores a hanging piece.',
          },
          {
            speaker: 'iota',
            text: 'Remember the finish. The next door will ask you to switch schools without dropping the plus you already earned.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter VI is sealed. Upstairs, the brief is rewritten again: Reed can follow a public line without vanishing into it. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, the Human Synthesis waits — style as a tool, not a loyalty. The chronicle has another age to inscribe.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c6-freeplay',
        title: 'Free board — Ledger rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the public line',
          body: 'Rehearse outposts, hanging-piece captures, and forced finishes until precision feels as natural as a pause.',
          tone: 'quiet',
        },
        lesson:
          'Set up a simple structure and alternate sides. Practice occupying holes, taking hanging pieces, and finishing back ranks without a speech.',
        teaching: {
          threat: 'None — this is a sandbox after the ledger ladder.',
          goalPlain:
            'Rehearse outposts and forced finishes without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Ledger skill is recognizing the public line early enough to follow it cheaply, then finishing what the follow won.',
          concept: 'Precision becomes instinct only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER VII — The Human Synthesis (compact ladder)
     Switch schools mid-game. Mira + Soren.
     Reuses theme-classical (CSS gzip locked).
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch7',
    index: 7,
    title: 'Chapter VII',
    subtitle: 'The Human Synthesis',
    era: 'Modern universal play — style as a tool',
    themeClass: 'theme-classical',
    philosophy:
      'A school is a tool, not a loyalty. Take the hanging piece instead of the speech, castle the safer wing, and finish with the tactic the last school made legal.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c7-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'The ledger meets a human who can switch',
          body: 'Precision taught Reed to follow a public line. The synthesis rooms ask whether he can change schools without dropping the plus — and whether a human still chooses when every doctrine is already on file.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The vestibule is a practice hall, not a counting room. Boards are already mid-game: one Italian, one Modern, one wrecked kingside. Clerks have labeled none of them. The lesson is the switch.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as precise. That is not a compliment here. It is a warrant to test whether you can abandon a school the moment the board stops paying it.',
          },
          {
            speaker: 'iota',
            text: 'I asked whether your plus was a fact. Mira will ask whether you take the piece instead of the check. Soren will answer your doctrine with another and wait to see if you notice. Neither is a villain. Drought taught the halls that loyalty to one school is how cities drown on a Tuesday.',
          },
          {
            speaker: 'reed',
            text: 'So I become everyone?',
          },
          {
            speaker: 'prax',
            text: 'You become the person who can sit on a hole, then castle the other way, then finish. The line is still there. It just changes clothes.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c7-codex-synthesis',
        heading: 'Synthesis doctrine — switch, answer, finish',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Style is a tool',
          body: 'Civic practice halls under the Long Reign treat schools as instruments: occupy when the hole is named, castle the safer wing when one is wrecked, and finish with the tactic the last tool made legal.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'School switch',
            body: 'The romantic check is not always the move. If a piece hangs, take it. Synthesis begins when you drop a beloved idea for a cheaper fact.',
          },
          {
            term: 'Safer wing',
            body: 'Castling is not a loyalty to the kingside. When that cover is gone, go the other way. Universal play is the habit of asking which palace still has walls.',
          },
          {
            term: 'Answered doctrine',
            body: 'If you pause, the rival occupies. If you occupy, the rival switches wings. Synthesis is noticing the reply school before it names you.',
          },
          {
            term: 'Smothered finish',
            body: 'A knight mate against a king boxed by his own men. After the switch, finish with the tactic the last structure made legal — not with a speech about flexibility.',
          },
          {
            term: 'Human Synthesis',
            body: 'The civic argument of this age: if every school is already on file, what is a stratarch for? Mira answers choose the tool. Soren answers survive the reply. Reed has to answer without becoming a costume trunk.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c7-puzzle-switch',
        title: 'Puzzle — take, do not check',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The other school would check',
          body: 'A rook check looks like fire. The hanging knight is a fact. Switch: take it.',
          tone: 'pressure',
        },
        fen: 'r5k1/5ppp/8/3n4/4B3/8/5PPP/4R1K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          'Re8+ is a speech. Bxd5 is the school that fits this board. Synthesis is dropping the check for the piece.',
        teaching: {
          threat: 'If you check instead of taking, the knight walks and the plus stays a rumor.',
          goalPlain: 'Win the hanging knight on d5 with the bishop.',
          whyItWorks:
            'The bishop already attacks the undefended knight. Taking it is not greed. It is changing tools.',
          concept: 'Switch schools: take the hanging piece instead of the check.',
        },
      },
      {
        type: 'puzzle',
        id: 'c7-puzzle-wing',
        title: 'Puzzle — castle the safer wing',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The kingside has no walls',
          body: 'Kingside pawns are gone. Castling short is a loyalty. Castling long is the tool.',
          tone: 'pressure',
        },
        fen: 'r3k2r/ppp2ppp/8/8/8/8/PPP5/R3K2R w KQkq - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'c1', color: 'w', pieceType: 'k' },
        lesson:
          'O-O lands in a wreck. O-O-O puts the king behind a2-b2-c2. Synthesis asks which palace still has walls.',
        teaching: {
          threat: 'If you castle short, the open kingside files you as loyal to a school that already drowned.',
          goalPlain: 'Castle queenside so the king sits on c1.',
          whyItWorks:
            'Queenside still has a pawn wall. The other wing does not. Universal play is the cheaper palace.',
          concept: 'Castle the safer wing, not the familiar one.',
        },
      },
      {
        type: 'puzzle',
        id: 'c7-puzzle-smother',
        title: 'Puzzle — smothered finish',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The last tool made this legal',
          body: 'King boxed by his own rook and pawns. The knight owns f7. Finish; do not narrate flexibility.',
          tone: 'fire',
        },
        fen: '6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'Nf7 is mate. The king has no luft because his own men stole it. Synthesis finishes with the tactic the structure already paid for.',
        teaching: {
          threat: 'If you check from elsewhere, the king wriggles and the plus becomes a lecture.',
          goalPlain: 'Deliver smothered mate with the knight on f7.',
          whyItWorks:
            'Nf7# seals a king trapped by g7, h7, and the rook on g8 — a forced finish after the switch, not a new school speech.',
          concept: 'When the last tool made mate legal, take it.',
        },
      },
      {
        type: 'dialogue',
        id: 'c7-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the practice hall',
          body: 'Reed has the take, the safer wing, and the smother. Mira will ask whether he can choose a tool when his pulse wants last week\'s school.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Three receipts: a knight taken instead of a check, a king sent the long way, a smother the structure had already bought. Mira does not applaud. She changes the opening.',
          },
          {
            speaker: 'mira',
            text: 'You can switch on a diagram. Now switch while I am still talking.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c7-before-mira',
        storyBeat: {
          label: 'Match pressure',
          title: 'The practical tool',
          body: 'Mira thrives when you replay yesterday\'s school. Play the board in front of you, or become the costume.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'mira',
            text: 'The school that fits this board is the only loyalty I file. Begin.',
          },
          {
            speaker: 'reed',
            text: 'And if I loved the last one?',
          },
          {
            speaker: 'mira',
            text: 'Then drop it cheaper than drought. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c7-match-mira',
        title: 'Encounter 1 of 2 — The Practical Tool',
        opponentName: 'Mira',
        opponentNote:
          'Synthesis examiner — open-game structures that change tools without a speech. Take what hangs; castle the wing that still has walls.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not replay last week',
          body: 'Mira wins when you stay loyal to a school the board stopped paying. Develop, castle the safer side, and ask which tool this position actually buys.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'universal',
        scriptedBlackSans: ['e5', 'Nf6', 'Nc6', 'Bc5', 'd6', 'O-O'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c7-after-mira',
        storyBeat: {
          label: 'After-action quiet',
          title: 'A tool, not a costume',
          body: 'Mira files whether Reed chose the board in front of him. Soren is waiting to answer whatever school that was.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'mira',
            text: 'You changed tools. That is the only medal this hall issues.',
          },
          {
            speaker: 'narrator',
            text: 'Soren is already setting a different opening. He will answer whatever Reed just played with a school Reed did not pack.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c7-before-soren',
        storyBeat: {
          label: 'Match pressure',
          title: 'The answering school',
          body: 'Soren is strongest when you announce a doctrine. He replies with another and waits to see if you notice the wing has changed.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'soren',
            text: 'Play a school. I will answer it with another. If you keep the first costume, you lose.',
          },
          {
            speaker: 'reed',
            text: 'And if I switch when you switch?',
          },
          {
            speaker: 'soren',
            text: 'Then you are still in the room. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c7-match-soren',
        title: 'Encounter 2 of 2 — The Answering School',
        opponentName: 'Soren',
        opponentNote:
          'Synthesis specialist — Modern and hypermodern walls that answer your last doctrine. Castle, occupy, and do not donate the other wing.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Survive the reply school',
          body: 'Soren is strongest when you stay in the opening you named. Meet g6 with development, castle before the fianchetto bites, and switch when the wing changes.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'universal',
        scriptedBlackSans: ['g6', 'Bg7', 'd6', 'Nf6', 'O-O', 'c5'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c7-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Judgment after the switch',
          body: 'Synthesis does not erase precision — it decides whether a human can still choose a tool once every school is on file.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to take instead of checking, to castle the safer wing, and to finish the smother. That is the Human Synthesis seal: a player who can change clothes without vanishing.',
          },
          {
            speaker: 'reed',
            text: 'Mira asked whether I would drop last week\'s school. Soren asked whether I would notice the reply.',
          },
          {
            speaker: 'iota',
            text: 'You kept the plus. Synthesis does not cancel it. It only punishes the plus you narrated while the other wing burned.',
          },
          {
            speaker: 'soren',
            text: 'Remember the answer. The next door will fork two offices onto one square and ask whether you file both.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter VII is sealed. Upstairs, the brief is rewritten again: Reed can switch schools without becoming a costume trunk. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, the Alexandrine Board waits — civic chess as statecraft when succession is no longer a civil war. The chronicle has another age to inscribe.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c7-freeplay',
        title: 'Free board — Synthesis rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the switch',
          body: 'Rehearse taking hanging pieces instead of checks, castling the safer wing, and smothered finishes until style feels like a tool.',
          tone: 'quiet',
        },
        lesson:
          'Set up a simple structure and alternate sides. Practice dropping a beloved check for a capture, castling long when short is wrecked, and finishing mates the structure already bought.',
        teaching: {
          threat: 'None — this is a sandbox after the synthesis ladder.',
          goalPlain:
            'Rehearse school switches without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Synthesis is recognizing which school the board is paying, then changing tools before loyalty names you.',
          concept: 'Style becomes a tool only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER VIII — The Alexandrine Board (compact ladder)
     Sovereign exchange and temporal forks. Voss + Elara.
     Reuses theme-classical (CSS gzip locked).
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch8',
    index: 8,
    title: 'Chapter VIII',
    subtitle: 'The Alexandrine Board',
    era: 'Stratarchia · Chronos dominance',
    themeClass: 'theme-classical',
    philosophy:
      'Succession is a filing, not a civil war. Take the vacant office, put two futures on one square, and finish the mate the archive already notarized.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c8-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'The synthesis meets a board that files succession',
          body: 'Switching schools taught Reed to change tools. The Alexandrine rooms ask whether he can exchange an office without starting a war, and whether two futures can share one square.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The vestibule is a registry, not a battlefield. One board shows two queens staring across an empty file. Another shows a knight that can land on a square that files both king and rook. Clerks have labeled neither. The lesson is succession without a siege.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as flexible. That is not a compliment here. It is a warrant to test whether you can take a hanging crown instead of keeping both courts in session.',
          },
          {
            speaker: 'soren',
            text: 'I answered your school with another. Voss will ask whether you exchange the office that already hangs. Elara will fork two futures onto one square and wait to see if you file both. Neither is a villain. Drought taught the stratarchy that civil war is how cities miss the harvest.',
          },
          {
            speaker: 'reed',
            text: 'So I become a clerk?',
          },
          {
            speaker: 'mira',
            text: 'You become the person who can drop a school, then take a queen, then fork a file. The tool is still there. It just carries a seal.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c8-codex-board',
        heading: 'Alexandrine doctrine — exchange, fork, file',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'Statecraft on sixty-four squares',
          body: 'Civic registries under Chronos treat the board as succession law: exchange the vacant office, fork two claims onto one square, and file the mate the rook already notarized.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Sovereign exchange',
            body: 'A hanging queen is an office that already resigned. Take it. Keeping both courts in session is how a succession becomes a civil war.',
          },
          {
            term: 'Temporal fork',
            body: 'A knight that checks the king while attacking the rook files two futures on one square. Not time travel — a clerk\'s stamp that names both claims at once.',
          },
          {
            term: 'Notarized finish',
            body: 'If a rook already stares down the file, the queen may take the last pawn that boxed the king. The archive paid for this mate. File it.',
          },
          {
            term: 'Stratarchia',
            body: 'The civic argument of this age: when every school is already on file, government is the habit of exchanging offices without a siege.',
          },
          {
            term: 'Alexandrine Board',
            body: 'Voss answers take the vacant crown. Elara answers file both futures. Reed has to answer without turning succession into a second drought.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c8-puzzle-exchange',
        title: 'Puzzle — take the vacant office',
        storyBeat: {
          label: 'Drill pressure',
          title: 'Both courts are still in session',
          body: 'A queen hangs on a5. Leaving it is a civil war you did not budget. Exchange: take the office.',
          tone: 'pressure',
        },
        fen: '4k2r/ppp3pp/8/q7/8/8/PPPQ2PP/4K2R w Kk - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 800 },
        lesson:
          'Qxa5 files the vacant office. Keeping both queens is a succession speech. Alexandrine play takes the crown that already hangs.',
        teaching: {
          threat: 'If you develop instead of taking, the hanging queen stays a second court and the plus stays a rumor.',
          goalPlain: 'Win the hanging queen on a5.',
          whyItWorks:
            'The queen on d2 already attacks the undefended queen. Taking it is not greed. It is closing a court.',
          concept: 'Sovereign exchange: take the vacant office instead of keeping both courts.',
        },
      },
      {
        type: 'puzzle',
        id: 'c8-puzzle-fork',
        title: 'Puzzle — file two futures',
        storyBeat: {
          label: 'Drill pressure',
          title: 'One square, two claims',
          body: 'King and rook share a knight landing. A fork is not magic. It is two futures stamped on one square.',
          tone: 'pressure',
        },
        fen: 'r3k3/pp6/8/3N4/8/8/PPP5/4K3 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'c7', color: 'w', pieceType: 'n' },
        lesson:
          'Nc7+ checks the king and attacks the rook. Temporal fork means filing both claims before either walks.',
        teaching: {
          threat: 'If you check from elsewhere, one office walks and the fork becomes a lecture about tempo.',
          goalPlain: 'Land the knight on c7, forking king and rook.',
          whyItWorks:
            'c7 is the only square that names both the king and the a8 rook at once. Statecraft is the cheaper stamp.',
          concept: 'Temporal fork: two futures, one square.',
        },
      },
      {
        type: 'puzzle',
        id: 'c8-puzzle-file',
        title: 'Puzzle — notarized finish',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The archive already paid',
          body: 'King boxed by his own pawns. The rook already stares down the g-file. The queen files g7. Finish; do not convene another court.',
          tone: 'fire',
        },
        fen: '6k1/5ppp/8/8/8/2Q5/5P1P/6RK w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'Qxg7 is mate. The rook on g1 already notarized the square. Alexandrine play files the finish the structure bought.',
        teaching: {
          threat: 'If you take with the rook instead, the king wriggles to f8 and the plus becomes a committee.',
          goalPlain: 'Deliver mate by taking g7 with the queen.',
          whyItWorks:
            'Qxg7# is protected by the rook on g1. The pawn wall stole the king\'s luft. File the mate; do not restamp it.',
          concept: 'When the archive already notarized mate, take it with the queen.',
        },
      },
      {
        type: 'dialogue',
        id: 'c8-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the registry',
          body: 'Reed has the exchange, the fork, and the filed mate. Voss will ask whether he can close a court while his pulse wants both queens on the payroll.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Three receipts: a queen taken instead of a siege, a knight that named two offices, a mate the rook had already stamped. Voss does not applaud. He changes the opening.',
          },
          {
            speaker: 'voss',
            text: 'You can exchange on a diagram. Now exchange while I am still talking.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c8-before-voss',
        storyBeat: {
          label: 'Match pressure',
          title: 'The exchange clerk',
          body: 'Voss thrives when you keep both courts in session. Take the vacant office, or become the civil war.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'voss',
            text: 'An office that hangs is already vacant. Begin.',
          },
          {
            speaker: 'reed',
            text: 'And if I still need both queens?',
          },
          {
            speaker: 'voss',
            text: 'Then you are budgeting a war. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c8-match-voss',
        title: 'Encounter 1 of 2 — The Exchange Clerk',
        opponentName: 'Voss',
        opponentNote:
          'Alexandrine examiner — queen-pawn structures that close vacant offices without a speech. Take the hanging crown; do not keep both courts.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not keep both courts',
          body: 'Voss wins when you refuse a queen trade the position already paid for. Develop, castle, and ask which office is already vacant.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'alexandrine',
        scriptedBlackSans: ['d5', 'e6', 'Nf6', 'Be7', 'O-O', 'c5'],
        ladderTier: 'veteran',
        difficulty: 3,
      },
      {
        type: 'dialogue',
        id: 'c8-after-voss',
        storyBeat: {
          label: 'After-action quiet',
          title: 'A closed court, not a siege',
          body: 'Voss files whether Reed took the vacant office. Elara is waiting to put two futures on one square.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'voss',
            text: 'You closed a court. That is the only medal this registry issues.',
          },
          {
            speaker: 'narrator',
            text: 'Elara is already setting a different opening. She will fork whatever Reed just filed and wait to see if he names both claims.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c8-before-elara',
        storyBeat: {
          label: 'Match pressure',
          title: 'The fork registrar',
          body: 'Elara is strongest when you answer only one of the two futures. She lands on the square that names both and waits to see if you notice the second office.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'elara',
            text: 'Two futures. One square. If you file only the king, the rook walks.',
          },
          {
            speaker: 'reed',
            text: 'And if I file both?',
          },
          {
            speaker: 'elara',
            text: 'Then you are still in the registry. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c8-match-elara',
        title: 'Encounter 2 of 2 — The Fork Registrar',
        opponentName: 'Elara',
        opponentNote:
          'Alexandrine specialist — Sicilian walls that fork two offices onto one square. Castle, develop, and do not donate the second claim.',
        storyBeat: {
          label: 'Match pressure',
          title: 'File both futures',
          body: 'Elara is strongest when you treat a fork as a single check. Meet c5 with development, castle before the second office walks, and stamp both claims.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'alexandrine',
        scriptedBlackSans: ['c5', 'd6', 'Nf6', 'Nc6', 'g6', 'Bg7'],
        ladderTier: 'boss',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c8-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Judgment after the filing',
          body: 'The Alexandrine Board does not erase synthesis — it decides whether a human can still file succession once every school is on record.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to take the vacant office, to fork two futures, and to file the notarized mate. That is the Alexandrine seal: a player who can close a court without starting a war.',
          },
          {
            speaker: 'reed',
            text: 'Voss asked whether I would keep both queens. Elara asked whether I would name both claims.',
          },
          {
            speaker: 'mira',
            text: 'You kept the tool. The Board does not cancel it. It only punishes the court you left open while the harvest dried.',
          },
          {
            speaker: 'elara',
            text: 'Remember the stamp. The next door has already compiled every school you survived and will ask whether you still choose.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter VIII is sealed. Upstairs, the brief is rewritten again: Reed can exchange an office without a siege. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, the Apotheosis Engine waits — a civic archive that remembers how you play. The chronicle has one last age to inscribe.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c8-freeplay',
        title: 'Free board — Registry rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the filing',
          body: 'Rehearse taking hanging queens, knight forks that name two offices, and notarized mates until succession feels like a stamp.',
          tone: 'quiet',
        },
        lesson:
          'Set up a simple structure and alternate sides. Practice queen exchanges that close a court, knight forks that file two claims, and mates a rook already notarized.',
        teaching: {
          threat: 'None — this is a sandbox after the Alexandrine ladder.',
          goalPlain:
            'Rehearse sovereign exchanges and temporal forks without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Alexandrine skill is recognizing which office is already vacant, then filing both futures before either walks.',
          concept: 'Succession becomes instinct only through quiet repetition.',
        },
      },
    ],
  },
  /* ═══════════════════════════════════════════════════════════════
     CHAPTER IX — The Apotheosis Engine (compact ladder)
     Habit census and compiled schools. Wren + Bram.
     Reuses theme-classical (CSS gzip locked).
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 'ch9',
    index: 9,
    title: 'Chapter IX',
    subtitle: 'The Apotheosis Engine',
    era: 'Fused prediction stack',
    themeClass: 'theme-classical',
    philosophy:
      'Every school you survived is already on file. Pin what your habits leave hanging, fork the census that remembers you, and file the last rank without a speech.',
    scenes: [
      {
        type: 'dialogue',
        id: 'c9-intro',
        storyBeat: {
          label: 'Chapter pressure',
          title: 'The registry meets a file that already knows you',
          body: 'Succession taught Reed to close a court. The last rooms ask whether he can still choose once every school he used is compiled into one doctrine that remembers his habits.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'The vestibule is a census hall, not a temple. One board shows a knight pinned to its king. Another shows a fork that names a queen the file already expected. Clerks have not labeled a villain. They have labeled Reed.',
          },
          {
            speaker: 'alexion',
            text: 'They filed you as a stratarch. That is not a crown. It is a warrant to test whether you can still pin, fork, and finish after the archive has watched you do it eight ages running.',
          },
          {
            speaker: 'elara',
            text: 'I asked you to file two futures. Wren will read the census of how you actually move. Bram will answer with every school you survived, compiled. Neither is a god. Drought taught the last hall that worship is how a file becomes a famine.',
          },
          {
            speaker: 'reed',
            text: 'So I play myself?',
          },
          {
            speaker: 'voss',
            text: 'You play a clerk who kept notes. The vacant office is still vacant. The last rank is still a rank. Begin without a hymn.',
          },
        ],
      },
      {
        type: 'codex',
        id: 'c9-codex-engine',
        heading: 'Apotheosis doctrine — census, compile, file',
        storyBeat: {
          label: 'Doctrine tension',
          title: 'A doctrine that remembers',
          body: 'The last civic archive under Chronos treats Reed\'s habits as a public line: pin what the census says he leaves hanging, fork the piece the file already named, and finish the last rank.',
          tone: 'quiet',
        },
        entries: [
          {
            term: 'Habit census',
            body: 'The archive does not guess. It lists the captures you delay and the checks you prefer. Apotheosis begins when you take the pinned piece the census already circled.',
          },
          {
            term: 'Compiled school',
            body: 'Every doctrine you survived is in the same drawer. Bram answers Italian with Modern, ledger with fork. The test is noticing which compiled reply is on the board.',
          },
          {
            term: 'Last rank',
            body: 'A rook on the back rank is not a miracle. It is the finish the pawn wall already paid for. File it before the census writes that you hesitated.',
          },
          {
            term: 'Fused prediction stack',
            body: 'Clerks, brass, and lapis — not a spirit. They compile. They remember. They do not dream. A stratarch who worships the file drowns on a Tuesday.',
          },
          {
            term: 'Apotheosis Engine',
            body: 'Wren answers I have your census. Bram answers I play what you survived. Reed has to answer without becoming a hymn to his own archive.',
          },
        ],
      },
      {
        type: 'puzzle',
        id: 'c9-puzzle-census',
        title: 'Puzzle — take what the census circled',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The pin you always delay',
          body: 'A knight hangs on the file of its king. The census already marked it. Take it.',
          tone: 'pressure',
        },
        fen: '4k3/ppp5/4n3/8/8/8/PPP1R3/4K3 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'advantage', minCp: 250 },
        lesson:
          'Rxe6 takes the pinned knight. Checking from elsewhere is the habit the census already named. Apotheosis is cheaper than your reputation.',
        teaching: {
          threat: 'If you wait, the knight unpins and the plus the archive predicted stays a rumor.',
          goalPlain: 'Win the pinned knight on e6 with the rook.',
          whyItWorks:
            'The knight cannot leave the e-file without abandoning the king. Taking it is not a guess. It is reading your own file.',
          concept: 'Habit census: take the pin you usually narrate.',
        },
      },
      {
        type: 'puzzle',
        id: 'c9-puzzle-compile',
        title: 'Puzzle — fork the compiled queen',
        storyBeat: {
          label: 'Drill pressure',
          title: 'The file already named both',
          body: 'King and queen share a knight landing. The compiled school expects you to check the king only. Name both.',
          tone: 'pressure',
        },
        fen: '4k3/pqp5/8/8/4N3/8/PPP5/4K3 w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'pieceOn', square: 'd6', color: 'w', pieceType: 'n' },
        lesson:
          'Nd6+ checks the king and attacks the queen. Compiled play files both claims the census already held.',
        teaching: {
          threat: 'If you check from elsewhere, the queen walks and the compiled reply laughs.',
          goalPlain: 'Land the knight on d6, forking king and queen.',
          whyItWorks:
            'd6 is the square that names e8 and b7 at once. The stack compiled this fork before you sat down.',
          concept: 'Compiled school: fork both pieces the file already named.',
        },
      },
      {
        type: 'puzzle',
        id: 'c9-puzzle-last-rank',
        title: 'Puzzle — file the last rank',
        storyBeat: {
          label: 'Tactical pressure',
          title: 'The pawn wall already paid',
          body: 'King boxed in the corner. The a-file is empty. The census wrote that you sometimes look for a prettier mate. File this one.',
          tone: 'fire',
        },
        fen: '7k/6pp/8/8/8/8/6PP/R6K w - - 0 1',
        playerColor: 'w',
        goal: { kind: 'mate' },
        lesson:
          'Ra8 is mate. The pawns stole luft. Apotheosis finishes the last rank without a hymn.',
        teaching: {
          threat: 'If you hunt a slower mate, the king wriggles and the census files hesitation.',
          goalPlain: 'Deliver back-rank mate with the rook on a8.',
          whyItWorks:
            'Ra8# seals a king trapped by g7 and h7. The empty file was the cheaper stamp.',
          concept: 'When the last rank is already paid for, file it.',
        },
      },
      {
        type: 'dialogue',
        id: 'c9-after-puzzles',
        storyBeat: {
          label: 'After-action pressure',
          title: 'Habits before the census hall',
          body: 'Reed has the pin, the compiled fork, and the last rank. Wren will ask whether he can still choose after the archive has watched him choose.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'narrator',
            text: 'Three receipts: a pinned knight taken, a fork that named a queen, a rook that filed a8. Wren does not applaud. She opens his census.',
          },
          {
            speaker: 'wren',
            text: 'You can finish on a diagram. Now finish while I am reading you aloud.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c9-before-wren',
        storyBeat: {
          label: 'Match pressure',
          title: 'The census clerk',
          body: 'Wren thrives when you replay the habit she already circled. Play the board, or become the file.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'wren',
            text: 'I have your census. The captures you delay are already underlined. Begin.',
          },
          {
            speaker: 'reed',
            text: 'And if I change?',
          },
          {
            speaker: 'wren',
            text: 'Then the file is wrong, which is the only medal this hall issues. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c9-match-wren',
        title: 'Encounter 1 of 2 — The Census Clerk',
        opponentName: 'Wren',
        opponentNote:
          'Apotheosis examiner — open-game structures drawn from your census. Take the pin; do not donate the habit she already named.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Do not replay the underlined line',
          body: 'Wren wins when you delay the capture her file already circled. Develop, castle, and ask which habit this position is taxing.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 4,
        aiStyle: 'apotheosis',
        scriptedBlackSans: ['e5', 'Nf6', 'Nc6', 'd6', 'Be7', 'O-O'],
        ladderTier: 'veteran',
        difficulty: 4,
      },
      {
        type: 'dialogue',
        id: 'c9-after-wren',
        storyBeat: {
          label: 'After-action quiet',
          title: 'A file, not a hymn',
          body: 'Wren files whether Reed still chose. Bram is waiting with every school Reed survived, compiled into one reply.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'wren',
            text: 'You changed a line I had underlined. That is the only surprise this hall allows.',
          },
          {
            speaker: 'narrator',
            text: 'Bram is already setting a different opening. He will answer whatever Reed just played with a school Reed already beat, stacked.',
          },
        ],
      },
      {
        type: 'dialogue',
        id: 'c9-before-bram',
        storyBeat: {
          label: 'Match pressure',
          title: 'The compiled reply',
          body: 'Bram is strongest when you recognize only one of the schools in the stack. He replies with another you survived and waits to see if you notice.',
          tone: 'pressure',
        },
        lines: [
          {
            speaker: 'bram',
            text: 'Every school you sealed is in this drawer. I will answer you with the one you are not wearing.',
          },
          {
            speaker: 'reed',
            text: 'And if I switch when you switch?',
          },
          {
            speaker: 'bram',
            text: 'Then you are still a person, not a hymn. Begin.',
          },
        ],
      },
      {
        type: 'match',
        id: 'c9-match-bram',
        title: 'Encounter 2 of 2 — The Compiled Reply',
        opponentName: 'Bram',
        opponentNote:
          'Apotheosis specialist — Indian walls that compile every school you survived. Castle, occupy, and do not donate the last rank.',
        storyBeat: {
          label: 'Match pressure',
          title: 'Survive the stacked school',
          body: 'Bram is strongest when you stay in the opening you named. Meet Nf6 with development, castle before the fianchetto bites, and finish the plus the census already counted.',
          tone: 'pressure',
        },
        playerColor: 'w',
        aiDepth: 5,
        aiStyle: 'apotheosis',
        scriptedBlackSans: ['Nf6', 'g6', 'Bg7', 'O-O', 'd6', 'c5'],
        ladderTier: 'boss',
        difficulty: 5,
      },
      {
        type: 'dialogue',
        id: 'c9-reflection',
        storyBeat: {
          label: 'Chapter seal',
          title: 'Judgment after the census',
          body: 'The Apotheosis Engine does not erase the Board — it decides whether a human can still choose once every school is compiled.',
          tone: 'quiet',
        },
        lines: [
          {
            speaker: 'alexion',
            text: 'You learned to take the pinned piece, to fork the compiled queen, and to file the last rank. That is the Apotheosis seal: a player who can still choose after the archive has watched.',
          },
          {
            speaker: 'reed',
            text: 'Wren asked whether I would delay the capture she underlined. Bram asked whether I would notice the stacked school.',
          },
          {
            speaker: 'elara',
            text: 'You kept the stamp. The Engine does not cancel it. It only punishes the hymn you sang while the last rank waited.',
          },
          {
            speaker: 'bram',
            text: 'Remember the drawer. There is no later age in this building. Daily Calculus still opens. The Duel Archive still summons. The file is yours to keep sharp.',
          },
          {
            speaker: 'narrator',
            text: 'Chapter IX is sealed. Upstairs, the brief is rewritten a last time: Reed can still choose after the census. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. The chronicle is a plateau with work left on it — not a wall, and not a god.',
          },
        ],
      },
      {
        type: 'freeplay',
        id: 'c9-freeplay',
        title: 'Free board — Census rehearsal',
        storyBeat: {
          label: 'Rehearsal',
          title: 'Practice the last filing',
          body: 'Rehearse taking pinned pieces, knight forks that name a queen, and last-rank mates until the census feels like a tool.',
          tone: 'quiet',
        },
        lesson:
          'Set up a simple structure and alternate sides. Practice pinned captures, compiled forks, and back-rank finishes without a hymn.',
        teaching: {
          threat: 'None — this is a sandbox after the last compiled ladder.',
          goalPlain:
            'Rehearse census pins and last-rank mates without a story timer. Return to the vestibule when finished.',
          whyItWorks:
            'Apotheosis is recognizing which habit the file already named, then choosing anyway.',
          concept: 'A compiled doctrine stays a tool only through quiet repetition.',
        },
      },
    ],
  },
]
