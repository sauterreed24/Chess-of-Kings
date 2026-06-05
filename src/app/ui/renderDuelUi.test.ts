import { describe, expect, it, beforeEach, vi } from 'vitest'
import { GameFlow } from '../gameFlow'
import { PLAYABLE_CHAPTERS } from '../../data/chapters'
import { renderDuelUi } from './renderDuelUi'
import { getShellMarkup } from '../shellMarkup'

describe('renderDuelUi', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('includes Alexion doctrine lines in an open dossier panel', () => {
    const app = document.createElement('div')
    app.innerHTML = getShellMarkup()
    document.body.appendChild(app)
    const flow = new GameFlow(PLAYABLE_CHAPTERS, {
      onSceneChange: vi.fn(),
      onChessUpdate: vi.fn(),
      onChapterComplete: vi.fn(),
      onCampaignFinished: vi.fn(),
    })
    flow.newGame()
    const duelList = app.querySelector<HTMLDivElement>('#duel-list')!
    const duelPanel = app.querySelector<HTMLDivElement>('#duel-panel')!
    renderDuelUi({
      flow,
      duelList,
      duelPanel,
      rewardOverlayCtl: {
        isOpen: () => false,
        open: () => {},
        close: () => {},
        replaceInner: () => {},
        reveal: () => {},
        setCleanup: () => {},
      },
      closeRewardOverlay: () => {},
      openRewardOverlay: () => {},
      openLab: () => {},
      updateAdvance: () => {},
      renderDuelLabBrief: () => {},
    })
    const alexion = [...duelList.querySelectorAll<HTMLButtonElement>('.duel-row')].find(
      (row) => row.dataset.op === 'alexion',
    )
    expect(alexion?.getAttribute('aria-current')).toBe('true')
    const panelText = duelPanel.textContent ?? ''
    expect(panelText).toContain('Synthesis')
    expect(panelText).toContain('Do not mistake the mentor mask for mercy')
    expect(panelText).toContain('Rival Trait Profile')
    expect(panelText).toContain('AI Doctrine')
    expect(panelText).toContain('King safety')
  })
})
