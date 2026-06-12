import type { ChessUiPayload } from '../gameFlow'
import type { GameFlow } from '../gameFlow'
import type { RewardBundle } from '../../types'
import { ANNOUNCE_TEMPLATES } from '../../data/strings'
import { escapeHtml } from '../htmlEscape'
import {
  dynamicTrainingTitle,
  performanceDeltaLines,
} from '../mainUiFormatters'
import { styleGradeFromPayload, turningPointLine } from '../recap/styleGrade'
import { rankLabel, nextRankThreshold } from '../recap/rankLabels'
import { ratingDeltaLabel } from '../../game/rating'
import type { Announcer } from '../a11y/announcer'
import type { SfxController } from '../audio/sfx'

export function buildRatingSummaryLine(flow: GameFlow): string {
  const ladder = flow.getLadderRating()
  if (ladder.rated <= 0) return ''
  const delta = flow.getLastRatingDelta()
  const peak = ladder.peak > ladder.rating ? ` · peak ${ladder.peak}` : ''
  return `<p class="chapters-lede reward-rating">Stratarch Rating: <strong>${ladder.rating}</strong> <span class="reward-rating__delta reward-rating__delta--${delta >= 0 ? 'up' : 'down'}">${escapeHtml(ratingDeltaLabel(delta))}</span>${peak}</p>`
}

export function buildRewardOverlayHtml(
  flow: GameFlow,
  bundles: RewardBundle[],
  latestResolvedForRecap: ChessUiPayload | null,
): string {
  const rp = flow.getRankPoints()
  const next = nextRankThreshold(rp)
  const rpToNext = Math.max(0, next.next - rp)
  const progress = Math.max(0, Math.min(100, ((rp - next.currentFloor) / (next.next - next.currentFloor)) * 100))
  const html = bundles
    .map((b) => {
      const rows = b.rewards
        .map((r) => `<li><strong>${escapeHtml(r.label)}</strong> — ${escapeHtml(r.description)}</li>`)
        .join('')
      return `<div class="reward-card"><h4>${escapeHtml(b.sourceLabel)}</h4><ul>${rows}</ul></div>`
    })
    .join('')
  const recap = latestResolvedForRecap
    ? `<div class="reward-card">
          <h4>Verdict Recap</h4>
          <ul>
            <li><strong>Style grade:</strong> ${styleGradeFromPayload(latestResolvedForRecap)}</li>
            <li><strong>Turning point:</strong> ${escapeHtml(turningPointLine(latestResolvedForRecap))}</li>
            <li><strong>Result:</strong> ${escapeHtml(latestResolvedForRecap.status)}</li>
            ${flow.getLastRivalRemark() ? `<li><strong>Rival:</strong> ${escapeHtml(flow.getLastRivalRemark()!)}</li>` : ''}
          </ul>
        </div>`
    : ''
  const trainingFocus = flow.getAdaptiveTrainingPlan().map((line) => `<li>${escapeHtml(line)}</li>`).join('')
  const last = flow.getLatestMatchHistoryEntry()
  const canQuickRematch = last?.mode === 'duel' && last.outcome === 'win'
  const hist = flow.getMatchHistory()
  const deltaLines = last
    ? performanceDeltaLines(hist, last).map((line) => `<li>${escapeHtml(line)}</li>`).join('')
    : '<li>Play one more rated simulation to reveal your risk, tempo, and finish pattern.</li>'
  const trainingTitle = dynamicTrainingTitle(last?.timestamp ?? Date.now())
  const cards = html
    .split('</div>')
    .filter(Boolean)
    .map((card, i) =>
      `${card}</div>`.replace('reward-card"', `reward-card reward-card--stagger" style="--stagger:${i}"`),
    )
    .join('')
  return `
      <div class="reward-sheet reward-sheet--inscribed">
        <div class="reward-hero">
          <span class="reward-hero__sigil" aria-hidden="true">✦</span>
          <div>
            <p class="section-heading">Rewards Inscribed</p>
            <p class="reward-hero__copy">New files, the hinge of the match, and the next seal.</p>
          </div>
        </div>
        ${recap}
        ${cards}
        <div class="reward-card">
          <h4>${escapeHtml(trainingTitle)}</h4>
          <ul>${trainingFocus}</ul>
        </div>
        <div class="reward-card reward-card--stagger" style="--stagger:6">
          <h4>Why It Mattered</h4>
          <ul>${deltaLines}</ul>
        </div>
        <p class="chapters-lede">Rank: ${rankLabel(rp)} · ${rp} RP</p>
        <p class="chapters-lede reward-rating">Next seal: <strong>${escapeHtml(next.nextLabel)}</strong> in ${rpToNext} RP.</p>
        ${buildRatingSummaryLine(flow)}
        <div class="reward-progress">
          <div class="reward-progress__label">Next seal: ${escapeHtml(next.nextLabel)} at ${next.next} RP</div>
          <div class="reward-progress__bar"><div class="reward-progress__fill" style="width:${progress.toFixed(1)}%"></div></div>
        </div>
        <div class="echo-controls">
          ${canQuickRematch ? '<button type="button" class="ghost" id="btn-reward-rematch">Quick Rematch</button>' : ''}
          <button type="button" class="primary" id="btn-reward-close">Advance</button>
        </div>
      </div>`
}

export type ShowRewardBundlesCallbacks = {
  openRewardOverlay: (html: string, setup?: (root: HTMLDivElement) => void) => void
  closeRewardOverlay: () => void
  openLab: () => void
  updateAdvance: (flow: GameFlow) => void
  maybeShowPendingChapterPrompt: () => void
  clearLatestRecap: () => void
}

export function showRewardBundles(
  bundles: RewardBundle[],
  flow: GameFlow,
  latestResolvedForRecap: ChessUiPayload | null,
  sfx: SfxController,
  announcer: Announcer,
  callbacks: ShowRewardBundlesCallbacks,
): void {
  if (!bundles.length) return
  sfx.playEventSfx('reward')
  announcer.say(ANNOUNCE_TEMPLATES.rewardsInscribed)
  const overlayHtml = buildRewardOverlayHtml(flow, bundles, latestResolvedForRecap)
  callbacks.openRewardOverlay(overlayHtml, (root) => {
    root.querySelector<HTMLButtonElement>('#btn-reward-rematch')?.addEventListener('click', () => {
      const ok = flow.rematchLastDuel()
      if (ok) {
        callbacks.closeRewardOverlay()
        callbacks.clearLatestRecap()
        callbacks.openLab()
        callbacks.updateAdvance(flow)
      }
    })
    root.querySelector<HTMLButtonElement>('#btn-reward-close')?.addEventListener('click', () => {
      callbacks.closeRewardOverlay()
      callbacks.clearLatestRecap()
      callbacks.maybeShowPendingChapterPrompt()
    })
  })
}
