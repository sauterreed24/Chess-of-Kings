import { describe, expect, it, vi } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { GameFlow } from '../gameFlow'
import { buildRatingSummaryLine, buildRewardOverlayHtml } from './showRewardBundles'

function createFlow(): GameFlow {
  return new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange: vi.fn(),
    onChessUpdate: vi.fn(),
    onChapterComplete: vi.fn(),
    onCampaignFinished: vi.fn(),
  })
}

function createRewardFlowWithoutHistory(): GameFlow {
  return {
    getRankPoints: () => 0,
    getLadderRating: () => ({ rating: 828, peak: 828, rated: 0 }),
    getLastRatingDelta: () => 0,
    getAdaptiveTrainingPlan: () => ['Drill the next file before the archive raises resistance.'],
    getLatestMatchHistoryEntry: () => null,
    getMatchHistory: () => [],
  } as unknown as GameFlow
}

describe('showRewardBundles html', () => {
  it('includes Stratarch rating line when the ladder is rated', () => {
    const flow = createFlow()
    const f = flow as unknown as {
      mode: 'match'
      matchScene: { id: string; opponentName: string; aiDepth: number } | null
      sanLog: string[]
      sanQuality: Array<'good' | null>
      recordResolvedOutcomeIfNeeded: () => void
    }
    flow.chess.load('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')
    f.mode = 'match'
    f.matchScene = { id: 'c1-match-test', opponentName: 'Test Rival', aiDepth: 3 }
    f.sanLog = ['Qg7#']
    f.sanQuality = ['good']
    f.recordResolvedOutcomeIfNeeded()

    expect(buildRatingSummaryLine(flow)).toContain('Stratarch Rating')
    const html = buildRewardOverlayHtml(flow, [], null)
    expect(html).toContain('Stratarch Rating')
  })

  it('frames the reward overlay as a verdict with clear next practice', () => {
    const flow = createRewardFlowWithoutHistory()
    const html = buildRewardOverlayHtml(flow, [], null)

    expect(html).toContain('the hinge of the match and the next seal')
    expect(html).toContain('Why It Mattered')
    expect(html).toContain('reveal your risk, tempo, and finish pattern')
    expect(html).toContain('>Advance</button>')
  })

  it('frames empty-bundle loss recaps as Result Inscribed with Quick Rematch for duels', () => {
    const flow = {
      getRankPoints: () => 40,
      getLadderRating: () => ({ rating: 820, peak: 840, rated: 2 }),
      getLastRatingDelta: () => -12,
      getAdaptiveTrainingPlan: () => ['Revisit king safety before the next file.'],
      getLatestMatchHistoryEntry: () => ({
        mode: 'duel',
        outcome: 'loss',
        timestamp: Date.now(),
        opponentId: 'amara',
      }),
      getMatchHistory: () => [],
      getLastRivalRemark: () => null,
      getCostliestMomentLine: () => null,
    } as unknown as GameFlow
    const html = buildRewardOverlayHtml(flow, [], null)
    expect(html).toContain('Result Inscribed')
    expect(html).toContain('rating movement')
    expect(html).toContain('btn-reward-rematch')
    expect(html).toContain('Quick Rematch')
  })

  it('shows the next rank seal as a concrete RP target', () => {
    const flow = createRewardFlowWithoutHistory()
    const html = buildRewardOverlayHtml(flow, [], null)

    expect(html).toContain('Next seal:')
    expect(html).toContain('Apprentice Analyst')
    expect(html).toContain('in 140 RP')
    expect(html).toContain('the next seal')
  })
})
