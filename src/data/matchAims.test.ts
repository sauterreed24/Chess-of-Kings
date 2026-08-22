import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from './chapters'
import { DUEL_ROSTER } from './duelRoster'
import {
  DEFAULT_MATCH_AIM,
  DUEL_AIM_BY_OPPONENT_ID,
  MATCH_AIM_BY_SCENE_ID,
  duelAimForOpponentId,
  matchAimForSceneId,
} from './matchAims'

describe('matchAims', () => {
  it('covers every campaign match with a short command', () => {
    const matches = PLAYABLE_CHAPTERS.flatMap((chapter) =>
      chapter.scenes.filter((scene) => scene.type === 'match'),
    )
    expect(matches.length).toBeGreaterThan(0)
    for (const scene of matches) {
      const aim = MATCH_AIM_BY_SCENE_ID[scene.id]
      expect(aim, `${scene.id} has an authored aim`).toBeTruthy()
      expect(aim!.length).toBeLessThan(80)
      expect(aim).not.toMatch(/Targets glow/)
    }
  })

  it('covers every duel rival with a short command', () => {
    for (const rival of DUEL_ROSTER) {
      const aim = DUEL_AIM_BY_OPPONENT_ID[rival.opponentId]
      expect(aim, `${rival.opponentId} has an authored aim`).toBeTruthy()
      expect(aim!.length).toBeLessThan(80)
    }
  })

  it('falls back to the default opening command', () => {
    expect(matchAimForSceneId('unknown-match')).toBe(DEFAULT_MATCH_AIM)
    expect(duelAimForOpponentId('unknown-rival')).toBe(DEFAULT_MATCH_AIM)
  })
})
