import type { Chapter } from '../types'

/**
 * MVP playable campaign: Prologue + Chapter I.
 * Chapter I now features a full 6-rung ladder: Initiate → Apprentice
 * → Scholar (mini-boss) → Veteran → Advisor (boss) → Counterpart.
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
    era: "Present — Reed's apartment",
    themeClass: 'theme-prologue',
    philosophy: 'Curiosity without theory is still a door.',
    scenes: [
      {
        type: 'dialogue',
        id: 'pr-apartment',
        lines: [
          {
            speaker: 'narrator',
            text: 'Rain threads the window. Reed, twenty-eight, cannot sleep. A chess trainer sits open on his laptop. He knows how pieces move — he has known since childhood. What he does not know is how to think.',
          },
          {
            speaker: 'reed',
            text: '"Adaptive trainer. Any style in history. Learns as you play." Sounds like marketing.',
          },
          {
            speaker: 'narrator',
            text: 'He opens it anyway. The screen is the only light in the room.',
          },
          {
            speaker: 'reed',
            text: 'Fine. Let it learn me.',
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
        type: 'dialogue',
        id: 'pr-trainer',
        lines: [
          {
            speaker: 'system',
            text: 'Calibration sequence initiated. Play naturally. The trainer will emulate resistance without attempting to win — it is measuring your instincts, not your knowledge.',
          },
          {
            speaker: 'reed',
            text: 'Naturally. Sure.',
          },
          {
            speaker: 'system',
            text: 'Make at least four moves as White. Move anything. The data begins now.',
          },
        ],
      },
      {
        type: 'calibration',
        id: 'pr-calibration',
        title: 'Calibration — adaptive trainer',
        lesson:
          'Make at least four moves as White. The trainer replies with unpredictable moves — just enough resistance to reveal how you think. Develop pieces, control the center, keep your king safe.',
        minMovesByPlayer: 4,
        teaching: {
          threat: 'There is no single threat yet — you are learning tempo and instinct.',
          goalPlain:
            'Complete four moves as White. Development and king safety still matter; the Lab is watching every choice.',
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
            text: 'The analysis bar fills. Four moves. Five. The screen flickers — not the window backlight, something deeper.',
          },
          {
            speaker: 'reed',
            text: 'Wait — the interface just…',
          },
          {
            speaker: 'narrator',
            text: 'The board disappears. Not a crash. Not a timeout. The screen becomes the colour of old paper, and then — white. Clean, absolute, impossibly deep white, as though the device has opened into a room that has no walls.',
          },
          {
            speaker: 'reed',
            text: 'What is this.',
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
        lines: [
          {
            speaker: 'narrator',
            text: 'Stone. Lamplight. Folios in tall shelves. The faint smell of wax and cedar. A man in formal academic robes stands beside a suspended wooden diagram — a chess position frozen in mid-game.',
          },
          {
            speaker: 'alexion',
            text: 'You are not in the seed archives.',
          },
          {
            speaker: 'reed',
            text: 'Then where am I?',
          },
          {
            speaker: 'alexion',
            text: 'The History Lab. We use chess because it is the most compressed record of how conflict, order, and time actually move. Every era of chess reveals something about the people who played it.',
          },
          {
            speaker: 'reed',
            text: 'And me? I clicked "train."',
          },
          {
            speaker: 'alexion',
            text: 'The interface accepted you. That is not nothing. I am Alexion Demaratos-Serapis — curator of these simulations. You should not be here. And yet here we are.',
          },
          {
            speaker: 'alexion',
            text: 'The first chamber is ancient. Ceremonial chess — played as duty, not sport. Scholarly, patient, unforgiving of sloppiness. Learn its laws, and we will speak of what comes after.',
          },
          {
            speaker: 'reed',
            text: 'And if I refuse?',
          },
          {
            speaker: 'alexion',
            text: 'The door to the vestibule remains behind you. But you have already begun to think. Refusing now would be dishonest.',
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
        lines: [
          {
            speaker: 'alexion',
            text: 'You have studied the principles. Now prove them. The court ladder begins here — with Amara, the newest initiate. She knows the rules. She does not yet know how to think.',
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
        playerColor: 'w',
        aiDepth: 3,
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
            text: 'The court is watching your progress. Word reaches the senior scholars.',
          },
        ],
      },

      /* ────────────────────────────────────────────────────────────
         LADDER RUNG 4 — The Veteran
         ─────────────────────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-before-marius',
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
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        playerColor: 'w',
        aiDepth: 5,
        aiStyle: 'apotheosis',
        scriptedBlackSans: ['Nc6', 'Nf6', 'Bc5', 'O-O', 'd6', 'Be6', 'Qd7', 'Rad8'],
        ladderTier: 'counterpart',
        difficulty: 5,
      },

      /* ── Reflection ───────────────────────────────────────────── */
      {
        type: 'dialogue',
        id: 'c1-reflection',
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
            text: 'Chapter I is sealed. The door to the next age lies beyond a locked threshold — romantic gambits, classical precision, hypermodern paradox, the Soviet machine. Each is built on what you learned here. The archive waits.',
          },
        ],
      },

      /* ── Freeplay ─────────────────────────────────────────────── */
      {
        type: 'freeplay',
        id: 'c1-freeplay',
        title: 'Free board — open rehearsal',
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
]
