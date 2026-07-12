import type { Chapter } from '../types'

/**
 * Playable campaign: Prologue + Chapter I + Chapter II (Romantic) + Chapter III (Classical).
 * Chapter I: six-rung ladder (Initiate → … → Counterpart).
 * Chapter II: shorter Romantic ladder — two rated encounters + rehearsal.
 * Chapter III: compact Classical arc — Demetrios return + Kallistos + rehearsal.
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
            'Complete four moves as White — only on White’s turn (read the status line). When Black is on move, wait for the Archive’s reply; your pieces are idle until then. Development and king safety still matter; the Lab is watching every choice.',
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
          whyItWorks:
            'Classical mating patterns punish neglected back ranks. Prophylaxis for Black would have been a pawn move; you punish the omission.',
          concept: 'Geometry over noise — the file was the plan.',
        },
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
            text: 'Chapter III is sealed. The compiled ages of this build end here. Daily Calculus still opens each morning; the Duel Archive still summons every doctrine you have beaten. Beyond these doors, later schools wait — locked, not gone. The chronicle is no longer a cliff. It is a plateau with work left on it.',
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
]
