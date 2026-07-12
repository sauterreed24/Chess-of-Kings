import { describe, expect, it } from 'vitest'
import { RIVAL_PROFILES, getRivalProfile, selectTalkLine, inferRivalIdFromSceneId, type RivalProfile } from './rivals'
import { DUEL_ROSTER } from './duelRoster'

describe('RIVAL_PROFILES data', () => {
  const expectedIds = ['amara', 'lukas', 'edred', 'marius', 'demetrios', 'alexion', 'rowan', 'vega', 'kallistos']

  it('contains every named campaign and Duel Archive rival', () => {
    for (const id of expectedIds) {
      expect(RIVAL_PROFILES[id], `missing rival ${id}`).toBeDefined()
    }
  })

  it('profiles every visible Duel Archive opponent', () => {
    for (const rival of DUEL_ROSTER) {
      expect(RIVAL_PROFILES[rival.opponentId], `missing duel profile ${rival.opponentId}`).toBeDefined()
    }
  })

  it.each(expectedIds)('rival %s has a fully populated profile', (id) => {
    const r = RIVAL_PROFILES[id]!
    expect(r.opponentId).toBe(id)
    expect(r.displayName.length).toBeGreaterThan(0)
    expect(r.counterPrep).toHaveLength(3)
    for (const bullet of r.counterPrep) expect(bullet.length).toBeGreaterThan(20)
    expect(r.whiteOpenings.length).toBeGreaterThanOrEqual(2)
    expect(r.blackOpenings.length).toBeGreaterThanOrEqual(2)
    expect(r.signature.length).toBeGreaterThan(0)
    expect(r.talk.opening.length).toBeGreaterThanOrEqual(1)
    expect(r.talk.punished.length).toBeGreaterThanOrEqual(1)
    expect(r.talk.rattled.length).toBeGreaterThanOrEqual(1)
    expect(r.talk.audacious.length).toBeGreaterThanOrEqual(1)
    expect(r.talk.draw.length).toBeGreaterThanOrEqual(1)
  })

  it.each(expectedIds)('rival %s school blend weights sum to 100', (id) => {
    const r = RIVAL_PROFILES[id]!
    const total = r.blend.primary.weight + (r.blend.secondary?.weight ?? 0)
    expect(total).toBe(100)
  })

  it('counter-prep bullets do not contain raw HTML', () => {
    for (const r of Object.values(RIVAL_PROFILES)) {
      for (const b of r.counterPrep) {
        expect(b).not.toMatch(/<script|<\/?\w+>/)
      }
      for (const bucket of Object.values(r.talk)) {
        for (const line of bucket) {
          expect(line).not.toMatch(/<script|<\/?\w+>/)
        }
      }
    }
  })
})

describe('getRivalProfile', () => {
  it('returns the profile when known', () => {
    expect(getRivalProfile('amara')?.displayName).toBe('Amara')
    expect(getRivalProfile('alexion')?.displayName).toBe('Alexion Demaratos-Serapis')
  })

  it('returns null when unknown', () => {
    expect(getRivalProfile('not-a-rival')).toBeNull()
  })
})

describe('selectTalkLine', () => {
  const profile: RivalProfile = RIVAL_PROFILES.amara!

  it('uses opening lines by default', () => {
    const line = selectTalkLine(profile, 0, 0, 0)
    expect(profile.talk.opening).toContain(line)
  })

  it('switches to rattled lines when recent losses dominate', () => {
    const line = selectTalkLine(profile, 0, 3, 0)
    expect(profile.talk.rattled).toContain(line)
  })

  it('switches to audacious lines when recent wins dominate', () => {
    const line = selectTalkLine(profile, 3, 0, 0)
    expect(profile.talk.audacious).toContain(line)
  })

  it('is deterministic (same inputs -> same line)', () => {
    expect(selectTalkLine(profile, 1, 0, 7)).toBe(selectTalkLine(profile, 1, 0, 7))
  })
})

describe('inferRivalIdFromSceneId', () => {
  it('matches a campaign scene id containing a rival key', () => {
    expect(inferRivalIdFromSceneId('c1-match-amara-intro')).toBe('amara')
    expect(inferRivalIdFromSceneId('c2-boss-demetrios-finale')).toBe('demetrios')
    expect(inferRivalIdFromSceneId('c2-match-rowan')).toBe('rowan')
    expect(inferRivalIdFromSceneId('c2-match-vega')).toBe('vega')
    expect(inferRivalIdFromSceneId('c3-match-kallistos')).toBe('kallistos')
    expect(inferRivalIdFromSceneId('c3-match-demetrios-return')).toBe('demetrios')
  })

  it('returns null when no rival substring matches', () => {
    expect(inferRivalIdFromSceneId('c0-dialogue-only')).toBeNull()
  })
})

describe('postGameTalkLine', () => {
  it('reacts in outcome-appropriate voice and stays pure', async () => {
    const { getRivalProfile, postGameTalkLine } = await import('./rivals')
    const amara = getRivalProfile('amara')!
    const punished = postGameTalkLine(amara, 'win', 0, 7)
    const rattled = postGameTalkLine(amara, 'win', 3, 7)
    const audacious = postGameTalkLine(amara, 'loss', 0, 7)
    const draw = postGameTalkLine(amara, 'draw', 0, 7)
    expect(amara.talk.punished).toContain(punished)
    expect(amara.talk.rattled).toContain(rattled)
    expect(amara.talk.audacious).toContain(audacious)
    expect(amara.talk.draw).toContain(draw)
    expect(postGameTalkLine(amara, 'win', 0, 7)).toBe(punished)
  })
})
