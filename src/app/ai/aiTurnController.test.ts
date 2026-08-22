import { describe, expect, it } from 'vitest'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { computeAiPaceDelay, shouldHonorMatchScript, shouldScheduleAi } from './aiTurnController'

describe('aiTurnController scheduling', () => {
  it('computeAiPaceDelay increases under loss pressure', () => {
    expect(computeAiPaceDelay(0)).toBe(300)
    expect(computeAiPaceDelay(3)).toBeGreaterThan(computeAiPaceDelay(0))
    expect(computeAiPaceDelay(6)).toBe(540)
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

  it('always honors the first authored match reply', () => {
    expect(
      shouldHonorMatchScript({
        scriptLength: 6,
        scriptIndex: 0,
        plyCount: 1,
        openingDiscipline: 0.32,
        roll: 1,
      }),
    ).toBe(true)
  })

  it('lets later scripted book moves drift by opening discipline', () => {
    expect(
      shouldHonorMatchScript({
        scriptLength: 6,
        scriptIndex: 1,
        plyCount: 3,
        openingDiscipline: 0.86,
        roll: 0.95,
      }),
    ).toBe(false)
    expect(
      shouldHonorMatchScript({
        scriptLength: 6,
        scriptIndex: 1,
        plyCount: 3,
        openingDiscipline: 0.86,
        roll: 0.1,
      }),
    ).toBe(true)
    expect(
      shouldHonorMatchScript({
        scriptLength: 0,
        scriptIndex: 0,
        plyCount: 1,
        openingDiscipline: 0.99,
        roll: 0,
      }),
    ).toBe(false)
  })
})
