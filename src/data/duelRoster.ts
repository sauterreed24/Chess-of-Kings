import type { DuelRosterEntry } from '../types'

export const DUEL_ROSTER: DuelRosterEntry[] = [
  {
    opponentId: 'amara',
    opponentName: 'Amara',
    era: 'Ancient Court',
    styleTags: ['Development', 'Cautious'],
    strengths: 'Principled opening structure',
    weaknesses: 'Slow adaptation under pressure',
    quote: 'I have studied the board for three seasons.',
    unlockedBySceneId: 'c1-match-amara',
    variants: [
      {
        id: 'amara-initiate',
        label: 'Initiate Archive',
        bio: 'Amara in her first formal court evaluation.',
        minChapterUnlock: 1,
        profileId: 'novice_court',
      },
      {
        id: 'amara-revised',
        label: 'Revised Lines',
        bio: 'Amara after learning to contest the center earlier.',
        minChapterUnlock: 1,
        profileId: 'apprentice_court',
      },
    ],
  },
  {
    opponentId: 'edred',
    opponentName: 'Edred',
    era: 'Ancient Court',
    styleTags: ['Tactical', 'Aggressive'],
    strengths: 'Kingside pressure and forcing lines',
    weaknesses: 'Over-commits if denied space',
    quote: 'I care about the king. Show me where yours is hiding.',
    unlockedBySceneId: 'c1-match-edred',
    variants: [
      {
        id: 'edred-guard',
        label: 'Archive Guard',
        bio: 'Direct attacking model derived from Edred\'s Dragon habits.',
        minChapterUnlock: 1,
        profileId: 'scholar_guard',
      },
      {
        id: 'edred-veteran',
        label: 'Veteran Patrol',
        bio: 'Sharper tactical reads and faster conversion.',
        minChapterUnlock: 1,
        profileId: 'veteran_scholar',
      },
    ],
  },
  {
    opponentId: 'alexion',
    opponentName: 'Alexion Demaratos-Serapis',
    era: 'Archive Meta-Layer',
    styleTags: ['Positional', 'Adaptive', 'Counter-play'],
    strengths: 'Principled planning and thematic counterplay',
    weaknesses: 'Invites complexity before striking',
    quote: 'The Archive does not forget. It waits.',
    variants: [
      {
        id: 'alexion-mentor',
        label: 'Early Mentor',
        bio: 'Instructional but dangerous if underestimated.',
        minChapterUnlock: 0,
        profileId: 'alexion_mentor',
      },
      {
        id: 'alexion-strategos',
        label: 'Court Strategos',
        bio: 'Balanced pressure and exact timing.',
        minChapterUnlock: 1,
        profileId: 'alexion_strategos',
      },
      {
        id: 'alexion-apex',
        label: 'Archive Apex',
        bio: 'Composite pinnacle of Alexandrine doctrine.',
        minChapterUnlock: 1,
        profileId: 'alexion_apex',
      },
    ],
  },
]
