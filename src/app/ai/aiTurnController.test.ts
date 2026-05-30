import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { computeAiPaceDelay, shouldScheduleAi } from './aiTurnController'

describe('aiTurnController scheduling', () => {
  it('computeAiPaceDelay increases under loss pressure', () => {
    expect(computeAiPaceDelay(0)).toBe(380)
    expect(computeAiPaceDelay(3)).toBeGreaterThan(computeAiPaceDelay(0))
  })

  it('shouldScheduleAi blocks freeplay and player turn', () => {
    const scene = PLAYABLE_CHAPTERS[0]!.scenes[0]!
    expect(
      shouldScheduleAi({
        mode: 'match',
        scene,
        chessTurn: 'w',
        playerColor: 'w',
        terminal: false,
        aiThinking: false,
        aiTimer: 0,
      }),
    ).toBe(false)
    expect(
      shouldScheduleAi({
        mode: 'freeplay',
        scene: { ...scene, type: 'freeplay' },
        chessTurn: 'b',
        playerColor: 'w',
        terminal: false,
        aiThinking: false,
        aiTimer: 0,
      }),
    ).toBe(false)
  })
})
