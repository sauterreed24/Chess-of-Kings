import { Chess } from 'chess.js'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { findBestMoveWithProfile } from './ai'
import { resolveProfileByMatchId } from './aiProfiles'

describe('AI opening book bias', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('prefers on-book replies when the engine would wander off-book', () => {
    const chess = new Chess()
    chess.move('e4')
    const profile = resolveProfileByMatchId('lukas_intro')
    vi.spyOn(Math, 'random').mockReturnValue(0.99)

    const withoutBook = findBestMoveWithProfile(chess, profile)
    const withBook = findBestMoveWithProfile(chess, profile, {
      openingBook: { profileId: profile.id, plyIndex: 1 },
    })

    expect(withBook?.san).toBe('e5')
    expect(withoutBook?.san).toBeTruthy()
  })
})
