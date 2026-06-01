import { Chess } from 'chess.js'
import type { PieceSkinId } from '../../types'
import { PIECE_SKIN_LABEL } from '../../chess/skins'
import { getBookTopLines } from '../../chess/openings'
import { escapeHtml } from '../htmlEscape'
import { buildReplayFens, formatEchoTimeline, renderEchoBoardFen } from '../chronicleReplay'
import { createEchoReplayTimer } from '../chronicleEchoTimer'
import { deriveCalibrationLens } from '../duel/calibrationLens'
import { formatRivalCalibrationLabel } from '../duel/rivalCalibration'
import { getRivalProfile } from '../../data/rivals'
import type { GameFlow } from '../gameFlow'
import type { RewardOverlayController } from '../rewardOverlayController'
import type { DuelRosterEntry, DuelVariant } from '../../types'

export type RenderDuelUiHost = {
  flow: GameFlow
  duelList: HTMLDivElement
  duelPanel: HTMLDivElement
  rewardOverlayCtl: RewardOverlayController
  closeRewardOverlay: () => void
  openRewardOverlay: (html: string, setup?: (root: HTMLDivElement) => void, cleanup?: () => void) => void
  openLab: () => void
  updateAdvance: (flow: GameFlow) => void
  renderDuelLabBrief: (
    rival: DuelRosterEntry,
    variant: DuelVariant,
    playerColor: 'w' | 'b',
    difficulty: 'novice' | 'balanced' | 'relentless',
  ) => void
}

export function renderDuelUi(host: RenderDuelUiHost): void {
  const { flow, duelList, duelPanel, rewardOverlayCtl, closeRewardOverlay, openLab, updateAdvance, renderDuelLabBrief } = host
  const roster = [...flow.getDuelArchiveRoster()].sort((a, b) => Number(b.isOpen) - Number(a.isOpen))
  duelList.innerHTML = roster.map((entry) => {
  const r = entry.rival
  const stamp = entry.isOpen ? `${entry.unlockedVariantCount}/${entry.totalVariantCount} files` : 'sealed'
  const label = entry.isOpen
    ? `Open dossier for ${r.opponentName}`
    : `Sealed dossier for ${r.opponentName}. ${entry.unlockHint}`
  return `<button type="button" class="chapter-btn duel-row ${entry.isOpen ? '' : 'duel-row--sealed'}" data-op="${escapeHtml(r.opponentId)}" aria-label="${escapeHtml(label)}">
    <span class="chapter-btn__main">
      <span class="ch-idx">${escapeHtml(r.era)}</span>
      <span class="ch-name">${escapeHtml(r.opponentName)}</span>
      <span class="ch-era">${escapeHtml(r.styleTags.join(' / '))}</span>
      ${entry.isOpen ? '' : `<span class="duel-row__hint">${escapeHtml(entry.unlockHint)}</span>`}
    </span>
    <span class="duel-row__stamp ${entry.isOpen ? '' : 'duel-row__stamp--sealed'}">${escapeHtml(stamp)}</span>
  </button>`
}).join('')

for (const btn of [...duelList.querySelectorAll<HTMLButtonElement>('.duel-row')]) {
  btn.addEventListener('click', () => {
    const op = btn.dataset.op
    if (!op) return
    const archiveEntry = roster.find((r) => r.rival.opponentId === op)
    if (!archiveEntry) return
    const rival = archiveEntry.rival
    for (const row of [...duelList.querySelectorAll<HTMLButtonElement>('.duel-row')]) {
      const active = row === btn
      row.classList.toggle('duel-row--active', active)
      if (active) row.setAttribute('aria-current', 'true')
      else row.removeAttribute('aria-current')
    }
    const rivalProfile = getRivalProfile(rival.opponentId)
    if (!archiveEntry.isOpen) {
      const schoolPreview = rivalProfile
        ? `<div class="rival-school rival-school--sealed" aria-label="Sealed doctrinal preview">
            <span class="rival-school__primary">${escapeHtml(rivalProfile.blend.primary.school)}</span>
            <span class="rival-school__weight">${rivalProfile.blend.primary.weight}%</span>
            ${rivalProfile.blend.secondary
              ? `<span class="rival-school__plus" aria-hidden="true">+</span>
                 <span class="rival-school__secondary">${escapeHtml(rivalProfile.blend.secondary.school)}</span>
                 <span class="rival-school__weight">${rivalProfile.blend.secondary.weight}%</span>`
              : ''}
            <p class="rival-school__sig">${escapeHtml(rivalProfile.signature)}</p>
          </div>`
        : ''
      duelPanel.innerHTML = `
        <div class="match-card sealed-dossier">
          <div class="match-card__top">
            <div class="match-card__header">
              <span class="match-card__vs">Sealed dossier</span>
              <strong class="match-card__name">${escapeHtml(rival.opponentName)}</strong>
            </div>
            <span class="duel-row__stamp duel-row__stamp--sealed">${archiveEntry.totalVariantCount} sealed files</span>
          </div>
          <p class="opponent-note dossier-quote">"${escapeHtml(rival.quote)}"</p>
          <div class="sealed-dossier__notice">
            <span class="teach-label">Unlock path</span>
            <p>${escapeHtml(archiveEntry.unlockHint)}</p>
          </div>
          ${schoolPreview}
          <div class="reward-card">
            <h4>Preview Intelligence</h4>
            <ul>
              <li><strong>Era:</strong> ${escapeHtml(rival.era)}</li>
              <li><strong>Style:</strong> ${escapeHtml(rival.styleTags.join(' / '))}</li>
              <li><strong>Known strength:</strong> ${escapeHtml(rival.strengths)}</li>
              <li><strong>Likely pressure point:</strong> ${escapeHtml(rival.weaknesses)}</li>
            </ul>
          </div>
        </div>`
      return
    }
    const history = flow
      .getMatchHistory()
      .filter((h) => h.opponentId === rival.opponentId)
      .slice(-20)
    const tendencies = flow.getTendencies()
    const rivalMem = flow.getRivalMemory()[rival.opponentId]
    const wins = history.filter((h) => h.outcome === 'win').length
    const losses = history.filter((h) => h.outcome === 'loss').length
    const draws = history.filter((h) => h.outcome === 'draw').length
    const avgMoves = history.length
      ? (history.reduce((a, h) => a + h.moves, 0) / history.length).toFixed(1)
      : '0.0'
    const gradeCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 }
    for (const h of history) gradeCounts[h.styleGrade] = (gradeCounts[h.styleGrade] ?? 0) + 1
    const gradeOrder: Array<'S' | 'A' | 'B' | 'C' | 'D'> = ['S', 'A', 'B', 'C', 'D']
    const dominantGrade = gradeOrder.sort(
      (a: 'S' | 'A' | 'B' | 'C' | 'D', b: 'S' | 'A' | 'B' | 'C' | 'D') =>
        (gradeCounts[b] ?? 0) - (gradeCounts[a] ?? 0),
    )[0]
    const weaknessMap =
      tendencies.flankPawnPushes >= 8
        ? 'Flank overextension detected — prioritize center before wing pawn storms.'
        : tendencies.earlyQueenMoves >= 4
          ? 'Early queen drift detected — develop minors before queen sorties.'
          : tendencies.repeatedChecksWithoutGain >= 3
            ? 'Check-spam tendency detected — pair checks with material/position gains.'
            : 'Balanced profile — keep applying tempo-aware development.'
    const recommendedDifficultyId = flow.recommendDuelDifficulty(rival.opponentId)
    const recommendedDifficulty =
      recommendedDifficultyId === 'relentless'
        ? 'Relentless'
        : recommendedDifficultyId === 'novice'
          ? 'Novice'
          : 'Balanced'
    const unlockedVariants = rival.variants.filter((v) =>
      flow.isDuelVariantUnlocked(v.id) && flow.highestUnlockedChapter >= v.minChapterUnlock,
    )
    if (!unlockedVariants.length) {
      duelPanel.innerHTML = `<p class="ledger-empty">No unlocked variants yet for ${escapeHtml(rival.opponentName)}.</p>`
      return
    }
    const skinOptions = flow.getUnlockedPieceSkins()
      .map((s) => `<option value="${s}" ${s === flow.getSelectedPieceSkin() ? 'selected' : ''}>${escapeHtml(PIECE_SKIN_LABEL[s])}</option>`)
      .join('')
    const variantOptions = unlockedVariants
      .map((v) => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.label)}</option>`)
      .join('')
    const primaryVariant = unlockedVariants[0]
    const echoes = history
      .filter((h) => h.outcome === 'win')
      .slice(-3)
      .reverse()
    const echoCards = echoes.length
      ? echoes.map((e) => `<button type="button" class="ghost duel-echo-btn" data-echo-id="${escapeHtml(e.id)}">
          Echo ${new Date(e.timestamp).toLocaleDateString()} · ${e.styleGrade} · ${e.turningPointSan}
        </button>`).join('')
      : '<p class="ledger-empty">Defeat this rival to inscribe chronicle echoes.</p>'
    const prepLines = (() => {
      /* Prefer the curated counter-prep when we have a known rival;
       * fall back to the heuristic-driven bullets for unknown ids
       * (composite scenes, future content). */
      if (rivalProfile) return rivalProfile.counterPrep.slice(0, 3)
      const lines: string[] = []
      if (rival.styleTags.some((t) => /tactic|attack|sac/i.test(t))) {
        lines.push('Prioritize king safety by move 10; avoid speculative pawn grabs near your king.')
      }
      if (rival.styleTags.some((t) => /positional|control|structure/i.test(t))) {
        lines.push('Break symmetry with purposeful pawn breaks; do not allow quiet squeezes.')
      }
      if (tendencies.earlyQueenMoves >= 4) {
        lines.push('Delay queen development unless it wins material immediately.')
      }
      if (tendencies.flankPawnPushes >= 8) {
        lines.push('Anchor center first before wing pawn storms.')
      }
      if ((rivalMem?.punishedCheckSpam ?? 0) >= 4) {
        lines.push('Only give checks that gain material, space, or force clear concessions.')
      }
      if (!lines.length) lines.push('Play principled development: center control, king safety, then dynamic expansion.')
      return lines.slice(0, 3)
    })()
    const schoolBlendHtml = rivalProfile
      ? `<div class="rival-school" aria-label="Doctrinal school blend">
          <span class="rival-school__primary">${escapeHtml(rivalProfile.blend.primary.school)}</span>
          <span class="rival-school__weight">${rivalProfile.blend.primary.weight}%</span>
          ${rivalProfile.blend.secondary
            ? `<span class="rival-school__plus" aria-hidden="true">+</span>
               <span class="rival-school__secondary">${escapeHtml(rivalProfile.blend.secondary.school)}</span>
               <span class="rival-school__weight">${rivalProfile.blend.secondary.weight}%</span>`
            : ''}
          <p class="rival-school__sig">${escapeHtml(rivalProfile.signature)}</p>
        </div>`
      : ''
    const trainingPlan = flow.getAdaptiveTrainingPlan(rival.opponentId)
    const lens = deriveCalibrationLens(history, rivalMem)
    const lensTicks = ['Forgiving', 'Measured', 'Equilibrium', 'Sharpened', 'Relentless']
    const lensTickHtml = lensTicks
      .map((t, i) => {
        const fillIdx = Math.round(lens.dialPosition * 4)
        const cls = i === fillIdx ? 'cal-lens__tick cal-lens__tick--current'
          : i < fillIdx ? 'cal-lens__tick cal-lens__tick--filled'
          : 'cal-lens__tick'
        return `<span class="${cls}" aria-hidden="true" title="${escapeHtml(t)}"></span>`
      })
      .join('')
    const openingWatch = (variantId: string) => {
      const variant = unlockedVariants.find((v) => v.id === variantId) ?? unlockedVariants[0]
      if (!variant) return []
      return getBookTopLines(variant.profileId, 9)
        .slice(0, 4)
        .map((x) => `Ply ${x.ply}: ${x.san}`)
    }
    duelPanel.innerHTML = `
      <div class="match-card">
        <div class="match-card__top">
          <div class="match-card__header">
            <span class="match-card__vs">Dossier</span>
            <strong class="match-card__name">${escapeHtml(rival.opponentName)}</strong>
          </div>
          <span class="duel-row__stamp">Difficulty hint: ${recommendedDifficulty}</span>
        </div>
        <p class="opponent-note dossier-quote">"${escapeHtml(rival.quote)}"</p>
        ${primaryVariant ? `<p class="opponent-note">${escapeHtml(primaryVariant.bio)}</p>` : ''}
        <div class="duel-launch" aria-label="Duel setup">
          <div class="duel-launch__grid">
            <div class="duel-launch__field">
              <label class="teach-label" for="duel-variant">Variant</label>
              <select id="duel-variant" class="duel-select">${variantOptions}</select>
            </div>
            <div class="duel-launch__field">
              <label class="teach-label" for="duel-color">Color</label>
              <select id="duel-color" class="duel-select">
                <option value="w">White</option>
                <option value="b">Black</option>
              </select>
            </div>
            <div class="duel-launch__field">
              <label class="teach-label" for="duel-difficulty">Difficulty Profile</label>
              <select id="duel-difficulty" class="duel-select">
                <option value="novice">Novice (forgiving)</option>
                <option value="balanced" selected>Balanced (default)</option>
                <option value="relentless">Relentless (boss-like)</option>
              </select>
            </div>
            <div class="duel-launch__field">
              <label class="teach-label" for="duel-skin">Piece Skin</label>
              <select id="duel-skin" class="duel-select">${skinOptions}</select>
            </div>
          </div>
          <div class="duel-launch__actions">
            <button type="button" class="ghost" id="btn-auto-duel">Auto-Calibrate Duel</button>
            <button type="button" class="ghost" id="btn-preview-skin">Preview Skin</button>
            <button type="button" class="primary" id="btn-start-duel">Start Duel</button>
            <button type="button" class="secondary" id="btn-mastery-trial"
              aria-label="Begin a Mastery Trial against ${escapeHtml(rival.opponentName)} at ceiling difficulty">
              Mastery Trial
            </button>
          </div>
          <p class="mastery-trial-hint opponent-note">Mastery Trial locks Relentless difficulty for one match and the highest-tier skin unlock path.</p>
        </div>
        <div class="dossier-stat-grid" aria-label="Duel history">
          <span><strong>${wins}</strong><small>Wins</small></span>
          <span><strong>${losses}</strong><small>Losses</small></span>
          <span><strong>${draws}</strong><small>Draws</small></span>
          <span><strong>${dominantGrade}</strong><small>Common grade</small></span>
        </div>
        <div class="cal-lens" role="group" aria-label="Calibration Lens for ${escapeHtml(rival.opponentName)}">
          <div class="cal-lens__head">
            <span class="cal-lens__label">Calibration Lens</span>
            <strong class="cal-lens__level">${escapeHtml(lens.level)}</strong>
          </div>
          <div class="cal-lens__dial" aria-hidden="true">${lensTickHtml}</div>
          <p class="cal-lens__hint">${escapeHtml(lens.hint)}</p>
        </div>
        <p class="opponent-note"><strong>Strengths:</strong> ${escapeHtml(rival.strengths)}</p>
        <p class="opponent-note"><strong>Weaknesses:</strong> ${escapeHtml(rival.weaknesses)}</p>
        <div class="reward-card">
          <h4>Duel Analytics</h4>
          <ul>
            <li><strong>Record:</strong> ${wins}W · ${losses}L · ${draws}D</li>
            <li><strong>Average length:</strong> ${avgMoves} ply</li>
            <li><strong>Common style grade:</strong> ${dominantGrade}</li>
            <li><strong>Weakness map:</strong> ${escapeHtml(weaknessMap)}</li>
            <li><strong>Recommended next difficulty:</strong> ${recommendedDifficulty}</li>
            ${rivalMem ? `<li><strong>Rival memory:</strong> ${rivalMem.games} logged games · adaptation intensity ${(Math.min(100, (rivalMem.punishedFlankPushes + rivalMem.punishedEarlyQueen + rivalMem.punishedCheckSpam) * 3)).toFixed(0)}%</li>` : ''}
            ${rivalMem?.games ? `<li><strong>Archive calibration:</strong> ${rivalMem.calibrationRating} (${formatRivalCalibrationLabel(rivalMem.calibrationRating)})</li>` : ''}
          </ul>
        </div>
        <div class="reward-card">
          <h4>Chronicle Echoes</h4>
          ${echoCards}
        </div>
        ${schoolBlendHtml}
        <div class="reward-card">
          <h4>Counter-Prep Briefing</h4>
          <ul>${prepLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
        </div>
        <div class="reward-card">
          <h4>Adaptive Training Missions</h4>
          <ul>${trainingPlan.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
        </div>
        <div class="reward-card">
          <h4>Opening Watchlist</h4>
          <ul id="duel-opening-watch">${openingWatch(unlockedVariants[0]!.id).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
        </div>
      </div>`
    duelPanel.querySelector<HTMLButtonElement>('#btn-preview-skin')?.addEventListener('click', () => {
      const val = (duelPanel.querySelector<HTMLSelectElement>('#duel-skin')?.value ?? 'classic-royal') as PieceSkinId
      flow.setPieceSkin(val)
    })
    const diffSelect = duelPanel.querySelector<HTMLSelectElement>('#duel-difficulty')
    if (diffSelect) diffSelect.value = recommendedDifficultyId
    const variantSelect = duelPanel.querySelector<HTMLSelectElement>('#duel-variant')
    const openingWatchEl = duelPanel.querySelector<HTMLUListElement>('#duel-opening-watch')
    const updateOpeningWatch = () => {
      if (!openingWatchEl || !variantSelect) return
      const lines = openingWatch(variantSelect.value)
      openingWatchEl.innerHTML = lines.length
        ? lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')
        : '<li>No opening book lines for this variant; expect improvised play.</li>'
    }
    variantSelect?.addEventListener('change', updateOpeningWatch)
    duelPanel.querySelector<HTMLButtonElement>('#btn-auto-duel')?.addEventListener('click', () => {
      const diff = duelPanel.querySelector<HTMLSelectElement>('#duel-difficulty')
      if (diff) diff.value = recommendedDifficultyId
      const variantSel = duelPanel.querySelector<HTMLSelectElement>('#duel-variant')
      if (variantSel) {
        const candidate =
          recommendedDifficultyId === 'relentless'
            ? unlockedVariants[unlockedVariants.length - 1]
            : recommendedDifficultyId === 'novice'
              ? unlockedVariants[0]
              : unlockedVariants[Math.floor(unlockedVariants.length / 2)]
        if (candidate) variantSel.value = candidate.id
      }
      const colorSel = duelPanel.querySelector<HTMLSelectElement>('#duel-color')
      if (colorSel) colorSel.value = recommendedDifficultyId === 'novice' ? 'w' : 'b'
      updateOpeningWatch()
    })
    for (const btnEcho of [...duelPanel.querySelectorAll<HTMLButtonElement>('.duel-echo-btn')]) {
      btnEcho.addEventListener('click', () => {
        const id = btnEcho.dataset.echoId
        if (!id) return
        const entry = history.find((h) => h.id === id)
        if (!entry) return
        const replayFens = buildReplayFens(entry)
        let idx = 0
        const echoTimer = createEchoReplayTimer(window)
        const stopReplayTimer = () => {
          echoTimer.stop()
        }
        closeRewardOverlay()
        rewardOverlayCtl.setCleanup(stopReplayTimer)
        const drawEcho = () => {
          const html = `
            <div class="reward-sheet">
              <p class="section-heading">Chronicle Echo: ${escapeHtml(rival.opponentName)}</p>
              <div class="reward-card">
                <h4>Annotated Turning Point</h4>
                <ul>
                  <li><strong>Outcome:</strong> ${entry.outcome.toUpperCase()}</li>
                  <li><strong>Style grade:</strong> ${entry.styleGrade}</li>
                  <li><strong>Turning move:</strong> ${escapeHtml(entry.turningPointSan)}</li>
                  <li><strong>Length:</strong> ${entry.moves} ply</li>
                </ul>
                <p class="opponent-note"><strong>Replay step:</strong> ${idx}/${Math.max(0, replayFens.length - 1)}</p>
                ${renderEchoBoardFen(replayFens[idx] ?? replayFens[0] ?? new Chess().fen(), flow.getSelectedPieceSkin())}
                ${formatEchoTimeline(entry, Math.max(0, idx - 1))}
                <div class="echo-controls">
                  <button type="button" class="ghost" id="btn-echo-prev" ${idx <= 0 ? 'disabled' : ''}>Previous</button>
                  <button type="button" class="ghost" id="btn-echo-turn">Jump Turning Point</button>
                  <button type="button" class="ghost" id="btn-echo-play">${echoTimer.isRunning ? 'Pause' : 'Play'}</button>
                  <button type="button" class="ghost" id="btn-echo-next" ${idx >= replayFens.length - 1 ? 'disabled' : ''}>Next</button>
                </div>
              </div>
              <button type="button" class="primary" id="btn-reward-close">Close Echo</button>
            </div>`
          rewardOverlayCtl.replaceInner(html, (root) => {
            root.querySelector<HTMLButtonElement>('#btn-echo-prev')?.addEventListener('click', () => {
              stopReplayTimer()
              idx = Math.max(0, idx - 1)
              drawEcho()
            })
            root.querySelector<HTMLButtonElement>('#btn-echo-next')?.addEventListener('click', () => {
              stopReplayTimer()
              idx = Math.min(replayFens.length - 1, idx + 1)
              drawEcho()
            })
            root.querySelector<HTMLButtonElement>('#btn-echo-turn')?.addEventListener('click', () => {
              stopReplayTimer()
              const target = (entry.replaySans ?? []).findIndex((s) => s === entry.turningPointSan)
              idx = target >= 0 ? Math.min(replayFens.length - 1, target + 1) : idx
              drawEcho()
            })
            root.querySelector<HTMLButtonElement>('#btn-echo-play')?.addEventListener('click', () => {
              if (echoTimer.isRunning) {
                stopReplayTimer()
                drawEcho()
                return
              }
              echoTimer.start(700, () => {
                if (idx >= replayFens.length - 1) {
                  stopReplayTimer()
                  drawEcho()
                  return
                }
                idx++
                drawEcho()
              })
              drawEcho()
            })
            root.querySelector<HTMLButtonElement>('#btn-reward-close')?.addEventListener('click', () => {
              closeRewardOverlay()
            })
          })
          rewardOverlayCtl.reveal()
        }
        drawEcho()
      })
    }
    duelPanel.querySelector<HTMLButtonElement>('#btn-start-duel')?.addEventListener('click', () => {
      const variantId = duelPanel.querySelector<HTMLSelectElement>('#duel-variant')?.value ?? unlockedVariants[0]!.id
      const color = (duelPanel.querySelector<HTMLSelectElement>('#duel-color')?.value ?? 'w') as 'w' | 'b'
      const difficulty =
        (duelPanel.querySelector<HTMLSelectElement>('#duel-difficulty')?.value ?? 'balanced') as
          | 'novice'
          | 'balanced'
          | 'relentless'
      const skin = (duelPanel.querySelector<HTMLSelectElement>('#duel-skin')?.value ?? flow.getSelectedPieceSkin()) as PieceSkinId
      flow.setPieceSkin(skin)
      const ok = flow.startDuel(rival.opponentId, variantId, color, undefined, difficulty)
      if (ok) {
        const variant = unlockedVariants.find((v) => v.id === variantId) ?? unlockedVariants[0]!
        renderDuelLabBrief(rival, variant, color, difficulty)
        openLab()
        updateAdvance(flow)
      }
    })
    duelPanel.querySelector<HTMLButtonElement>('#btn-mastery-trial')?.addEventListener('click', () => {
      /* Mastery Trial: lock to ceiling, pick the highest-tier
       * unlocked variant, hand them the player's chosen color from
       * the dropdown if any, otherwise White. */
      const variantId = unlockedVariants[unlockedVariants.length - 1]!.id
      const color = (duelPanel.querySelector<HTMLSelectElement>('#duel-color')?.value ?? 'w') as 'w' | 'b'
      const skin = (duelPanel.querySelector<HTMLSelectElement>('#duel-skin')?.value ?? flow.getSelectedPieceSkin()) as PieceSkinId
      flow.setPieceSkin(skin)
      const ok = flow.startDuel(rival.opponentId, variantId, color, undefined, 'relentless')
      if (ok) {
        renderDuelLabBrief(rival, unlockedVariants[unlockedVariants.length - 1]!, color, 'relentless')
        openLab()
        updateAdvance(flow)
      }
    })
  })
  }
}
