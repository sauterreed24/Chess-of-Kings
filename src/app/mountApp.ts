import { Chess } from 'chess.js'
import { PLAYABLE_CHAPTERS } from '../data/chapters'
import { LOCKED_ROADMAP } from '../data/roadmap'
import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'
import { clearSave, hasSave } from './storage'
import type { Chapter, MatchScene, Scene, PieceSkinId, RewardBundle } from '../types'
import { PIECE_SKIN_LABEL } from '../chess/skins'
import { getBookTopLines } from '../chess/openings'
import { escapeHtml } from './htmlEscape'
import { buildReplayFens, formatEchoTimeline, renderEchoBoardFen } from './chronicleReplay'
import { createRewardOverlayController } from './rewardOverlayController'
import { routeEscapeKey } from './escapeKeyRouting'
import { createEchoReplayTimer } from './chronicleEchoTimer'
import {
  BOSS_PROFILE_RE,
  capturedRow,
  diffStars,
  dynamicTrainingTitle,
  formatMoveLedger,
  getCaptured,
  labelForSpeaker,
  performanceDeltaLines,
  sceneTypeLabel,
  teachingBlock,
  tierLabel,
} from './mainUiFormatters'
import { getShellMarkup } from './shellMarkup'
import { styleGradeFromPayload, turningPointLine } from './recap/styleGrade'
import { rankLabel, nextRankThreshold } from './recap/rankLabels'
import { createSfxController } from './audio/sfx'
import { buildChapterRail, buildLadderTrack } from './play/chapterRail'

export function mountApp(app: HTMLDivElement) {
  app.innerHTML = getShellMarkup()

  const shell = app.querySelector<HTMLElement>('#shell')!
  const labOverlay = app.querySelector<HTMLDivElement>('#lab-overlay')!
  const screenTitle = app.querySelector('#screen-title')!
  const screenChapters = app.querySelector('#screen-chapters')!
  const screenDuel = app.querySelector('#screen-duel')!
  const boardPanel = app.querySelector<HTMLDivElement>('#board-panel')!
  const manuscriptPanel = app.querySelector<HTMLDivElement>('#manuscript-panel')!
  const boardStage = app.querySelector<HTMLDivElement>('#board-stage')!
  const btnResume = app.querySelector<HTMLButtonElement>('#btn-resume')!
  const btnNew = app.querySelector<HTMLButtonElement>('#btn-new')!
  const titleActionsSave = app.querySelector<HTMLDivElement>('#title-actions-save')!
  const titleActionsFresh = app.querySelector<HTMLDivElement>('#title-actions-fresh')!
  const btnEnterArchive = app.querySelector<HTMLButtonElement>('#btn-enter-archive')!
  const btnTitle = app.querySelector<HTMLButtonElement>('#btn-title')!
  const btnChapters = app.querySelector<HTMLButtonElement>('#btn-chapters')!
  const btnDuel = app.querySelector<HTMLButtonElement>('#btn-duel')!
  const btnChaptersBack = app.querySelector<HTMLButtonElement>('#btn-chapters-back')!
  const btnVestibule = app.querySelector<HTMLButtonElement>('#btn-vestibule')!
  const chapterList = app.querySelector<HTMLUListElement>('#chapter-list')!
  const chapterQuickActions = app.querySelector<HTMLDivElement>('#chapter-quick-actions')!
  const duelList = app.querySelector<HTMLDivElement>('#duel-list')!
  const duelPanel = app.querySelector<HTMLDivElement>('#duel-panel')!
  const btnNext = app.querySelector<HTMLButtonElement>('#btn-next')!
  const btnNextHint = app.querySelector<HTMLSpanElement>('#btn-next-hint')!
  const btnUndo = app.querySelector<HTMLButtonElement>('#btn-undo')!
  const btnReset = app.querySelector<HTMLButtonElement>('#btn-reset')!
  const narrativeBody = app.querySelector<HTMLDivElement>('#narrative-body')!
  const sceneTag = app.querySelector<HTMLParagraphElement>('#scene-tag')!
  const chapterRail = app.querySelector<HTMLDivElement>('#chapter-rail')!
  const sceneProgress = app.querySelector<HTMLSpanElement>('#scene-progress')!
  const boardStatus = app.querySelector<HTMLSpanElement>('#board-status')!
  const recoveryControls = app.querySelector<HTMLDivElement>('#recovery-controls')!
  const btnRecoveryRestore = app.querySelector<HTMLButtonElement>('#btn-recovery-restore')!
  const btnRecoveryDismiss = app.querySelector<HTMLButtonElement>('#btn-recovery-dismiss')!
  const aiPersonaEl = app.querySelector<HTMLParagraphElement>('#ai-persona')!
  const aiFlavorEl = app.querySelector<HTMLParagraphElement>('#ai-flavor')!
  const tacticalPulseEl = app.querySelector<HTMLParagraphElement>('#tactical-pulse')!
  const btnSfx = app.querySelector<HTMLButtonElement>('#btn-sfx')!
  const btnMoveGuard = app.querySelector<HTMLButtonElement>('#btn-move-guard')!
  const lessonNote = app.querySelector<HTMLParagraphElement>('#lesson-note')!
  const coachTipEl = app.querySelector<HTMLParagraphElement>('#coach-tip')!
  const mvpFlag = app.querySelector<HTMLParagraphElement>('#mvp-flag')!
  const moveLedger = app.querySelector<HTMLDivElement>('#move-ledger')!
  const calibrationRail = app.querySelector<HTMLDivElement>('#calibration-rail')!
  const calibrationTrack = app.querySelector<HTMLDivElement>('#calibration-track')!
  const labEraLabel = app.querySelector<HTMLSpanElement>('#lab-era-label')!
  const evalBarFill = app.querySelector<HTMLDivElement>('#eval-bar-fill')!
  const evalBarScore = app.querySelector<HTMLSpanElement>('#eval-bar-score')!
  const capturedTop = app.querySelector<HTMLDivElement>('#captured-top')!
  const capturedBot = app.querySelector<HTMLDivElement>('#captured-bot')!
  const evalBarWrap = app.querySelector<HTMLDivElement>('#eval-bar-wrap')!
  const rewardOverlay = app.querySelector<HTMLDivElement>('#reward-overlay')!
  const rewardOverlayCtl = createRewardOverlayController(rewardOverlay)
  const closeRewardOverlay = () => rewardOverlayCtl.close()
  const openRewardOverlay = (
    html: string,
    setup?: (root: HTMLDivElement) => void,
    cleanup?: () => void,
  ) => {
    rewardOverlayCtl.open(html, setup, cleanup)
  }

  let flowRef: GameFlow | null = null
  let currentSceneType: Scene['type'] | null = null
  let showEvalBar = false
  let prevSanLen = 0
  /** Skip redundant DOM writes when RAF batching emits the same chess snapshot. */
  let lastLedgerKey = ''
  let lastCapturedFen = ''
  let lastCalKey = ''
  let lastEvalScore = Number.NaN
  /** Invalidated in renderScene so Advance button state always refreshes on passage change. */
  let lastAdvanceSig = ''
  let prevSessionRecovered = false
  let latestResolvedForRecap: ChessUiPayload | null = null
  let pendingChapterPrompt: { completedTitle: string; nextTitle: string | null } | null = null
  let moveGuardEnabled = localStorage.getItem('cok-move-guard') === '1'
  const sfx = createSfxController({
    enabled: localStorage.getItem('cok-sfx-enabled') !== '0',
  })

  /* ─── Chess UI updater ────────────────────────────────────────── */

  function applyChessUi(p: ChessUiPayload) {
    if (p.sanLog.length > prevSanLen) {
      for (let i = prevSanLen; i < p.sanLog.length; i++) {
        sfx.playMoveSfx(p.sanLog[i] ?? '', p.sanQuality[i] ?? null)
      }
    }
    prevSanLen = p.sanLog.length

    const isGameOver = p.chess.isGameOver()

    /* Status pill */
    if (p.aiThinking) {
      boardStatus.textContent = 'Thinking…'
      boardStatus.classList.remove(
        'status-pill--check',
        'status-pill--win',
        'status-pill--loss',
        'status-pill--draw',
      )
      boardStatus.classList.add('status-pill--thinking')
    } else {
      boardStatus.textContent = p.status
      boardStatus.classList.toggle('status-pill--check', p.inCheck)
      boardStatus.classList.remove('status-pill--thinking')
      boardStatus.classList.toggle(
        'status-pill--win',
        p.matchOutcome === 'win',
      )
      boardStatus.classList.toggle('status-pill--loss', p.matchOutcome === 'loss')
      boardStatus.classList.toggle('status-pill--draw', p.matchOutcome === 'draw')
    }

    /* Board-stage outcome flash */
    boardStage.classList.toggle(
      'board-stage--victory',
      p.matchOutcome === 'win',
    )
    boardStage.classList.toggle('board-stage--loss', p.matchOutcome === 'loss')
    boardStage.classList.toggle('board-stage--finisher', p.matchOutcome === 'win')
    const gameActive = !p.matchOutcome && !isGameOver
    boardStage.classList.toggle('board-stage--white-turn', gameActive && p.chess.turn() === 'w')
    boardStage.classList.toggle('board-stage--black-turn', gameActive && p.chess.turn() === 'b')
    const bossProfile = Boolean(p.aiPersona && BOSS_PROFILE_RE.test(p.aiPersona))
    boardStage.classList.toggle('board-stage--boss', bossProfile)
    boardStage.classList.toggle(
      'board-stage--neutral',
      !p.matchOutcome || p.matchOutcome === 'draw',
    )

    if (p.aiPersona && !p.aiThinking) {
      aiPersonaEl.textContent = `Opponent intelligence profile: ${p.aiPersona}`
      aiPersonaEl.classList.remove('hidden')
    } else if (p.aiThinking && p.aiPersona) {
      aiPersonaEl.textContent = `Thinking as: ${p.aiPersona}`
      aiPersonaEl.classList.remove('hidden')
    } else {
      aiPersonaEl.classList.add('hidden')
    }
    if (p.aiFlavor) {
      aiFlavorEl.textContent = p.aiFlavor
      aiFlavorEl.classList.remove('hidden')
    } else {
      aiFlavorEl.classList.add('hidden')
    }
    if (p.tacticalPulse && !p.aiThinking) {
      tacticalPulseEl.textContent = p.tacticalPulse
      tacticalPulseEl.classList.remove('hidden')
    } else {
      tacticalPulseEl.classList.add('hidden')
    }
    if (p.sessionRecovered && !prevSessionRecovered) {
      boardStatus.classList.add('status-pill--recovered')
      sfx.playMoveSfx('O-O', 'good')
      window.setTimeout(() => boardStatus.classList.remove('status-pill--recovered'), 1800)
    }
    prevSessionRecovered = p.sessionRecovered
    if (p.sessionRecovered) {
      recoveryControls.classList.remove('hidden')
      btnRecoveryRestore.disabled = !p.canRestoreStable
    } else {
      recoveryControls.classList.add('hidden')
    }

    btnUndo.disabled = !p.canUndo
    const ledgerKey = `${p.fen}|${p.ledgerFp}`
    if (ledgerKey !== lastLedgerKey) {
      lastLedgerKey = ledgerKey
      const ledgerHtml = formatMoveLedger(p.sanLog, p.sanQuality)
      moveLedger.innerHTML = ledgerHtml
      moveLedger.scrollTop = moveLedger.scrollHeight
    }

    if (p.calibration) {
      const calKey = `${p.calibration.current}\t${p.calibration.target}`
      if (calKey !== lastCalKey) {
        lastCalKey = calKey
        const rawTarget = Math.floor(Number(p.calibration.target))
        const rawCurrent = Math.floor(Number(p.calibration.current))
        const target = Number.isFinite(rawTarget) ? Math.max(0, Math.min(120, rawTarget)) : 0
        const current = Number.isFinite(rawCurrent) ? Math.max(0, Math.min(target, rawCurrent)) : 0
        calibrationTrack.innerHTML = Array.from({ length: target }, (_, i) => {
          const filled = i < current
          return `<span class="cal-dot ${filled ? 'cal-dot--on' : ''}" aria-hidden="true"></span>`
        }).join('')
      }
      calibrationRail.classList.remove('hidden')
    } else {
      lastCalKey = ''
      calibrationRail.classList.add('hidden')
    }

    /* Check square highlight */
    const b = flowRef?.board
    if (b && p.inCheck && !p.aiThinking) {
      const k = p.chess.findPiece({ type: 'k', color: p.chess.turn() })
      b.setCheckSquare(k[0] ?? null)
    } else {
      b?.setCheckSquare(null)
    }

    /* Coach tip */
    if ((p.coachTip || p.mentorInsight) && !p.aiThinking) {
      coachTipEl.textContent = p.mentorInsight ?? p.coachTip ?? ''
      coachTipEl.classList.remove('hidden')
    } else if (!p.coachTip && !p.mentorInsight) {
      coachTipEl.classList.add('hidden')
    }

    /* Eval bar + captured material (match mode) — skip DOM when score/FEN unchanged (RAF batching). */
    if (showEvalBar) {
      if (lastEvalScore !== p.evalScore) {
        lastEvalScore = p.evalScore
        const clamped = Math.max(-600, Math.min(600, p.evalScore))
        const pct = 50 + clamped / 12
        evalBarFill.style.height = `${Math.max(3, Math.min(97, pct))}%`
        const abs = Math.abs(p.evalScore)
        if (abs < 15) {
          evalBarScore.textContent = '0.0'
        } else {
          const val = (Math.abs(p.evalScore) / 100).toFixed(1)
          evalBarScore.textContent = p.evalScore > 0 ? `+${val}` : `-${val}`
        }
      }
      const fen = p.fen
      if (fen !== lastCapturedFen) {
        lastCapturedFen = fen
        const { byWhite, byBlack } = getCaptured(p.chess)
        capturedTop.innerHTML = capturedRow(byWhite, 'b')
        capturedBot.innerHTML = capturedRow(byBlack, 'w')
      }
    }

    if (p.matchOutcome) latestResolvedForRecap = p

    const rewards = flow.consumePendingRewards()
    if (rewards.length) showRewardBundles(rewards)
    else maybeShowPendingChapterPrompt()
  }

  /* ─── GameFlow setup ──────────────────────────────────────────── */

  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange(chapter, scene, sceneIndex) {
      flowRef = flow
      currentSceneType = scene.type
      renderScene(chapter, scene, sceneIndex)
      updateAdvance(flow)
      labEraLabel.textContent = `${chapter.title} · ${chapter.era}`
    },
    onChessUpdate(p) {
      applyChessUi(p)
      updateAdvance(flow)
    },
    onChapterComplete(ch) {
      sceneTag.textContent = `${ch.title} — threshold crossed`
      const idx = PLAYABLE_CHAPTERS.findIndex((x) => x.id === ch.id)
      const next = idx >= 0 && idx < PLAYABLE_CHAPTERS.length - 1 ? PLAYABLE_CHAPTERS[idx + 1] : null
      pendingChapterPrompt = { completedTitle: ch.title, nextTitle: next?.title ?? null }
      window.setTimeout(() => maybeShowPendingChapterPrompt(), 0)
    },
    onCampaignFinished() {
      const msg =
        flow.chapter1Complete === true
          ? 'Chapter I sealed. Further ages are not built into this version — your chronicle is marked.'
          : 'Bookmark updated.'
      pendingChapterPrompt = { completedTitle: msg, nextTitle: null }
      closeLab()
      showTitle()
      maybeShowPendingChapterPrompt()
      syncMvpFlag()
    },
  })
  flowRef = flow

  function syncTitleButtons() {
    const saved = hasSave()
    titleActionsSave.classList.toggle('hidden', !saved)
    titleActionsFresh.classList.toggle('hidden', saved)
    btnResume.disabled = !saved
  }

  function syncMvpFlag() {
    mvpFlag.textContent = flow.chapter1Complete
      ? 'Chapter I is inscribed in your save. Resume opens your chapter ledger.'
      : ''
  }

  function openLab() {
    closeRewardOverlay()
    flow.setLastScreen('play')
    shell.classList.add('shell--lab')
    labOverlay.classList.add('lab-overlay--active')
    const chessRoot = app.querySelector<HTMLDivElement>('#chess-root')!
    if (!flow.board) flow.mountBoard(chessRoot)
    else if (!flow.isInDuelMode()) flow.refreshScene()
    flow.board?.setMoveGuard(moveGuardEnabled)
    syncTitleButtons()
  }

  function closeLab() {
    closeRewardOverlay()
    labOverlay.classList.remove('lab-overlay--active')
    shell.classList.remove('shell--lab')
    flow.stopDuel()
    flow.setLastScreen('chapters')
  }

  function showTitle() {
    closeRewardOverlay()
    flow.setLastScreen('title')
    labOverlay.classList.remove('lab-overlay--active')
    shell.classList.remove('shell--lab')
    screenTitle.classList.remove('hidden')
    screenChapters.classList.add('hidden')
    screenDuel.classList.add('hidden')
    syncTitleButtons()
    syncMvpFlag()
  }

  function showChapters() {
    closeRewardOverlay()
    flow.setLastScreen('chapters')
    screenTitle.classList.add('hidden')
    screenDuel.classList.add('hidden')
    screenChapters.classList.remove('hidden')
    btnChaptersBack.classList.remove('hidden')
    btnChaptersBack.textContent = '← Return to title'
    chapterList.innerHTML = ''
    if (flow.hasRecoverableSession()) {
      chapterQuickActions.innerHTML = `
        <button type="button" class="primary chapter-quick-actions__btn" id="btn-resume-recovered">
          Resume Recovered Session
        </button>`
      chapterQuickActions.classList.remove('hidden')
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-resume-recovered')?.addEventListener('click', () => {
        const ok = flow.resumeRecoverableSession()
        if (ok) {
          screenChapters.classList.add('hidden')
          openLab()
          updateAdvance(flow)
        }
      })
    } else {
      chapterQuickActions.classList.add('hidden')
      chapterQuickActions.innerHTML = ''
    }

    PLAYABLE_CHAPTERS.forEach((ch, i) => {
      const locked = i > flow.highestUnlockedChapter
      const li = document.createElement('li')
      li.className = `chapter-row ${locked ? 'chapter-row--locked' : ''}`
      li.innerHTML = locked
        ? `<div class="chapter-locked">
            <span class="ch-idx">${escapeHtml(ch.title)}</span>
            <span class="ch-name">${escapeHtml(ch.subtitle)}</span>
            <span class="ch-era">${escapeHtml(ch.era)}</span>
            <span class="lock-badge">Sealed passage</span>
          </div>`
        : `<button type="button" class="chapter-btn" data-idx="${i}" aria-label="Enter ${escapeHtml(ch.title)}: ${escapeHtml(ch.subtitle)}">
            <span class="chapter-btn__main">
              <span class="ch-idx">${escapeHtml(ch.title)}</span>
              <span class="ch-name">${escapeHtml(ch.subtitle)}</span>
              <span class="ch-era">${escapeHtml(ch.era)}</span>
            </span>
            <span class="chapter-btn__state">${i === flow.chapterIndex ? 'Current' : 'Open'}</span>
            <span class="chapter-btn__arrow" aria-hidden="true">→</span>
          </button>`
      if (!locked) {
        li.querySelector('button')?.addEventListener('click', () => {
          flow.jumpToChapter(i)
          screenChapters.classList.add('hidden')
          openLab()
        })
      }
      chapterList.appendChild(li)
    })

    LOCKED_ROADMAP.forEach((row) => {
      const li = document.createElement('li')
      li.className = 'chapter-row chapter-row--locked'
      li.innerHTML = `<div class="chapter-locked">
        <span class="ch-idx">${escapeHtml(row.listTitle)}</span>
        <span class="ch-name">${escapeHtml(row.subtitle)}</span>
        <span class="ch-era">${escapeHtml(row.era)}</span>
        <span class="roadmap-teaser">${escapeHtml(row.teaser)}</span>
        <span class="lock-badge">Future archive</span>
      </div>`
      chapterList.appendChild(li)
    })
  }

  function showRewardBundles(bundles: RewardBundle[]) {
    if (!bundles.length) return
    const rp = flow.getRankPoints()
    const next = nextRankThreshold(rp)
    const progress = Math.max(0, Math.min(100, ((rp - next.currentFloor) / (next.next - next.currentFloor)) * 100))
    const html = bundles.map((b) => {
      const rows = b.rewards.map((r) => `<li><strong>${escapeHtml(r.label)}</strong> — ${escapeHtml(r.description)}</li>`).join('')
      return `<div class="reward-card"><h4>${escapeHtml(b.sourceLabel)}</h4><ul>${rows}</ul></div>`
    }).join('')
    const recap = latestResolvedForRecap
      ? `<div class="reward-card">
          <h4>Signature Recap</h4>
          <ul>
            <li><strong>Style grade:</strong> ${styleGradeFromPayload(latestResolvedForRecap)}</li>
            <li><strong>Turning point:</strong> ${escapeHtml(turningPointLine(latestResolvedForRecap))}</li>
            <li><strong>Result:</strong> ${escapeHtml(latestResolvedForRecap.status)}</li>
          </ul>
        </div>`
      : ''
    const trainingFocus = flow.getAdaptiveTrainingPlan()
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join('')
    const last = flow.getLatestMatchHistoryEntry()
    const canQuickRematch = last?.mode === 'duel' && last.outcome === 'win'
    const hist = flow.getMatchHistory()
    const deltaLines = last
      ? performanceDeltaLines(hist, last).map((line) => `<li>${escapeHtml(line)}</li>`).join('')
      : '<li>Play one more rated simulation to unlock comparative performance deltas.</li>'
    const trainingTitle = dynamicTrainingTitle(last?.timestamp ?? Date.now())
    const cards = html
      .split('</div>')
      .filter(Boolean)
      .map((card, i) => `${card}</div>`.replace('reward-card"', `reward-card reward-card--stagger" style="--stagger:${i}"`))
      .join('')
    const overlayHtml = `
      <div class="reward-sheet reward-sheet--inscribed">
        <div class="reward-hero">
          <span class="reward-hero__sigil" aria-hidden="true">✦</span>
          <div>
            <p class="section-heading">Archive Rewards Inscribed</p>
            <p class="reward-hero__copy">The court records your result, unlocks, and next training focus.</p>
          </div>
        </div>
        ${recap}
        ${cards}
        <div class="reward-card">
          <h4>${escapeHtml(trainingTitle)}</h4>
          <ul>${trainingFocus}</ul>
        </div>
        <div class="reward-card reward-card--stagger" style="--stagger:6">
          <h4>What Changed In Your Play</h4>
          <ul>${deltaLines}</ul>
        </div>
        <p class="chapters-lede">Rank: ${rankLabel(rp)} · ${rp} RP</p>
        <div class="reward-progress">
          <div class="reward-progress__label">Next rank: ${next.nextLabel} at ${next.next} RP</div>
          <div class="reward-progress__bar"><div class="reward-progress__fill" style="width:${progress.toFixed(1)}%"></div></div>
        </div>
        <div class="echo-controls">
          ${canQuickRematch ? '<button type="button" class="ghost" id="btn-reward-rematch">Quick Rematch</button>' : ''}
          <button type="button" class="primary" id="btn-reward-close">Continue</button>
        </div>
      </div>`
    openRewardOverlay(overlayHtml, (root) => {
      root.querySelector<HTMLButtonElement>('#btn-reward-rematch')?.addEventListener('click', () => {
        const ok = flow.rematchLastDuel()
        if (ok) {
          closeRewardOverlay()
          latestResolvedForRecap = null
          openLab()
          updateAdvance(flow)
        }
      })
      root.querySelector<HTMLButtonElement>('#btn-reward-close')?.addEventListener('click', () => {
        closeRewardOverlay()
        latestResolvedForRecap = null
        maybeShowPendingChapterPrompt()
      })
    })
  }

  function maybeShowPendingChapterPrompt() {
    if (!pendingChapterPrompt || rewardOverlayCtl.isOpen()) return
    const pending = pendingChapterPrompt
    const body = pending.nextTitle
      ? `<p class="chapters-lede">You sealed <strong>${escapeHtml(pending.completedTitle)}</strong>. Advance to <strong>${escapeHtml(pending.nextTitle)}</strong>, or return to the main menu.</p>
         <div class="echo-controls">
           <button type="button" class="primary" id="btn-chapter-advance">Advance To Next Chapter</button>
           <button type="button" class="ghost" id="btn-chapter-menu">Main Menu</button>
         </div>`
      : `<p class="chapters-lede"><strong>${escapeHtml(pending.completedTitle)}</strong></p>
         <div class="echo-controls">
           <button type="button" class="primary" id="btn-chapter-menu">Main Menu</button>
         </div>`
    openRewardOverlay(
      `<div class="reward-sheet">
         <div class="reward-hero">
           <span class="reward-hero__sigil" aria-hidden="true">✦</span>
           <div>
             <p class="section-heading">Chapter Threshold Crossed</p>
             <p class="reward-hero__copy">A new seal has been added to the chronicle.</p>
           </div>
         </div>
         ${body}
       </div>`,
      (root) => {
        root.querySelector<HTMLButtonElement>('#btn-chapter-advance')?.addEventListener('click', () => {
          pendingChapterPrompt = null
          closeRewardOverlay()
          openLab()
          updateAdvance(flow)
        })
        root.querySelector<HTMLButtonElement>('#btn-chapter-menu')?.addEventListener('click', () => {
          pendingChapterPrompt = null
          closeRewardOverlay()
          closeLab()
          showTitle()
        })
      },
    )
  }

  function renderDuelUi() {
    const roster = flow.getDuelRoster()
    duelList.innerHTML = roster.map((r) =>
      `<button type="button" class="chapter-btn duel-row" data-op="${escapeHtml(r.opponentId)}" aria-label="Open dossier for ${escapeHtml(r.opponentName)}">
        <span class="chapter-btn__main">
          <span class="ch-idx">${escapeHtml(r.era)}</span>
          <span class="ch-name">${escapeHtml(r.opponentName)}</span>
          <span class="ch-era">${escapeHtml(r.styleTags.join(' / '))}</span>
        </span>
        <span class="duel-row__stamp">${r.variants.length} files</span>
      </button>`,
    ).join('')

    for (const btn of [...duelList.querySelectorAll<HTMLButtonElement>('.duel-row')]) {
      btn.addEventListener('click', () => {
        const op = btn.dataset.op
        if (!op) return
        const rival = roster.find((r) => r.opponentId === op)
        if (!rival) return
        for (const row of [...duelList.querySelectorAll<HTMLButtonElement>('.duel-row')]) {
          const active = row === btn
          row.classList.toggle('duel-row--active', active)
          if (active) row.setAttribute('aria-current', 'true')
          else row.removeAttribute('aria-current')
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
        const trainingPlan = flow.getAdaptiveTrainingPlan(rival.opponentId)
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
              <span class="duel-row__stamp">Recommended: ${recommendedDifficulty}</span>
            </div>
            <p class="opponent-note dossier-quote">"${escapeHtml(rival.quote)}"</p>
            ${primaryVariant ? `<p class="opponent-note">${escapeHtml(primaryVariant.bio)}</p>` : ''}
            <div class="dossier-stat-grid" aria-label="Duel history">
              <span><strong>${wins}</strong><small>Wins</small></span>
              <span><strong>${losses}</strong><small>Losses</small></span>
              <span><strong>${draws}</strong><small>Draws</small></span>
              <span><strong>${dominantGrade}</strong><small>Common grade</small></span>
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
                <li><strong>Recommended next duel:</strong> ${recommendedDifficulty}</li>
                ${rivalMem ? `<li><strong>Rival memory:</strong> ${rivalMem.games} logged games · adaptation intensity ${(Math.min(100, (rivalMem.punishedFlankPushes + rivalMem.punishedEarlyQueen + rivalMem.punishedCheckSpam) * 3)).toFixed(0)}%</li>` : ''}
              </ul>
            </div>
            <div class="reward-card">
              <h4>Chronicle Echoes</h4>
              ${echoCards}
            </div>
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
            <label class="teach-label">Variant</label>
            <select id="duel-variant" class="duel-select">${variantOptions}</select>
            <label class="teach-label">Color</label>
            <select id="duel-color" class="duel-select">
              <option value="w">White</option>
              <option value="b">Black</option>
            </select>
            <label class="teach-label">Difficulty Profile</label>
            <select id="duel-difficulty" class="duel-select">
              <option value="novice">Novice (forgiving)</option>
              <option value="balanced" selected>Balanced (default)</option>
              <option value="relentless">Relentless (boss-like)</option>
            </select>
            <button type="button" class="ghost" id="btn-auto-duel">Auto-Calibrate Duel</button>
            <label class="teach-label">Piece Skin</label>
            <select id="duel-skin" class="duel-select">${skinOptions}</select>
            <button type="button" class="primary" id="btn-start-duel">Start Duel</button>
            <button type="button" class="ghost" id="btn-preview-skin">Preview Skin In Board</button>
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
            openLab()
          }
        })
      })
    }
  }

  function showDuel() {
    closeRewardOverlay()
    flow.setLastScreen('chapters')
    screenTitle.classList.add('hidden')
    screenChapters.classList.add('hidden')
    screenDuel.classList.remove('hidden')
    renderDuelUi()
  }

  function setBoardVisible(on: boolean) {
    boardPanel.classList.toggle('instrument-column--hidden', !on)
  }

  /* ─── renderScene ─────────────────────────────────────────────── */
  function renderScene(chapter: Chapter, scene: Scene, sceneIndex: number) {
    app.querySelector('#play-chapter-label')!.textContent = `${chapter.title} · ${chapter.era}`
    app.querySelector('#play-chapter-title')!.textContent = chapter.subtitle
    app.querySelector('#play-chapter-sub')!.textContent = chapter.title
    app.querySelector('#play-philosophy')!.textContent = chapter.philosophy
    document.getElementById('screen-play')?.setAttribute('data-theme', chapter.themeClass)

    const total = chapter.scenes.length
    sceneProgress.textContent = `Passage ${sceneIndex + 1} · ${total}`

    lessonNote.textContent = ''
    coachTipEl.classList.add('hidden')
    prevSanLen = 0
    lastLedgerKey = ''
    lastCapturedFen = ''
    lastCalKey = ''
    lastEvalScore = Number.NaN
    lastAdvanceSig = ''
    btnReset.disabled = true
    btnNextHint.textContent = ''
    const showBoard = flow.sceneUsesBoard(scene)
    document.getElementById('play-atelier')?.classList.toggle('play-atelier--solo', !showBoard)
    setBoardVisible(showBoard)
    narrativeBody.classList.toggle('narrative-body--dialogue', scene.type === 'dialogue')
    const showRail = scene.type === 'match'
    chapterRail.classList.toggle('hidden', !showRail)
    manuscriptPanel.classList.toggle('manuscript-panel--with-rail', showRail)
    if (showRail) {
      chapterRail.innerHTML = buildChapterRail(chapter, scene.id, flow.completedSceneIds)
    } else {
      chapterRail.innerHTML = ''
    }

    /* Hide eval bar and captured rows outside match mode */
    showEvalBar = scene.type === 'match'
    evalBarWrap.classList.toggle('hidden', !showEvalBar)
    capturedTop.classList.toggle('hidden', !showEvalBar)
    capturedBot.classList.toggle('hidden', !showEvalBar)
    if (!showEvalBar) {
      capturedTop.innerHTML = ''
      capturedBot.innerHTML = ''
      evalBarScore.textContent = '0.0'
      evalBarFill.style.height = '50%'
      lastCapturedFen = ''
      lastEvalScore = Number.NaN
    }

    boardStage.classList.remove('board-stage--victory', 'board-stage--loss')

    if (!showBoard) {
      boardStatus.textContent = ''
      moveLedger.innerHTML = ''
      lastLedgerKey = ''
      calibrationRail.classList.add('hidden')
      flow.board?.setCheckSquare(null)
    }

    if (scene.type === 'dialogue') {
      sceneTag.textContent = 'Dialogue'
      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = scene.lines
        .map(
          (l, i) =>
            `<div class="line line--stagger" style="--d:${i}"><span class="who" data-speaker="${escapeHtml(l.speaker)}">${escapeHtml(labelForSpeaker(l.speaker))}</span><p class="said">${escapeHtml(l.text)}</p></div>`,
        )
        .join('')
    } else if (scene.type === 'interlude') {
      sceneTag.textContent = 'Interlude'
      narrativeBody.classList.add('narrative-body--interlude')
      narrativeBody.innerHTML = scene.lines
        .map(
          (t, i) =>
            `<p class="interlude-line interlude-line--stagger" style="--d:${i}">${escapeHtml(t)}</p>`,
        )
        .join('')
    } else if (scene.type === 'codex') {
      sceneTag.textContent = scene.heading
      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = scene.entries
        .map(
          (e, i) =>
            `<div class="codex-entry" style="animation:line-in 0.5s var(--ease-out) ${i * 0.07}s both"><h4>${escapeHtml(e.term)}</h4><p>${escapeHtml(e.body)}</p></div>`,
        )
        .join('')
    } else if (scene.type === 'puzzle') {
      sceneTag.textContent = scene.title
      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = `<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
        scene.teaching ? teachingBlock(scene.teaching) : ''
      }${scene.hint ? `<p class="hint-block"><span class="hint-label">Hint</span> ${escapeHtml(scene.hint)}</p>` : ''}`
      lessonNote.textContent =
        'Meet the objective on the board. Use Take back to retry. Seal with Advance when the goal is met.'
      btnReset.disabled = false
      btnNextHint.textContent = 'Requires objective met'
    } else if (scene.type === 'match') {
      const tier = scene.ladderTier ? tierLabel(scene.ladderTier) : ''
      const tierClass = scene.ladderTier ?? ''
      const ladderTrack = buildLadderTrack(chapter, scene.id, flow.completedSceneIds)
      sceneTag.textContent = scene.title

      /* Count match number and total */
      const matchScenes = chapter.scenes.filter(s => s.type === 'match') as MatchScene[]
      const matchIdx = matchScenes.findIndex(m => m.id === scene.id)
      const matchNum = matchIdx >= 0 ? matchIdx + 1 : 1
      const matchTotal = matchScenes.length

      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = `
        <div class="match-card">
          <div class="match-card__top">
            <div class="match-card__header">
              <span class="match-card__vs">vs.</span>
              <strong class="match-card__name">${escapeHtml(scene.opponentName)}</strong>
              ${tier ? `<span class="tier-badge tier-badge--${tierClass}">${escapeHtml(tier)}</span>` : ''}
            </div>
            <div class="match-card__meta">
              <span class="diff-stars" aria-label="Difficulty ${scene.difficulty ?? '?'} of 5">${diffStars(scene.difficulty)}</span>
              <span class="match-num">Encounter ${matchNum} of ${matchTotal}</span>
            </div>
          </div>
          ${ladderTrack}
          <p class="opponent-note">${escapeHtml(scene.opponentNote)}</p>
          <p class="match-mandate">No move cap. Play until checkmate or a true dead draw. You command the White pieces.</p>
        </div>`
      lessonNote.textContent = 'Apply the ancient laws — develop, castle early, avoid loose pieces.'
      btnReset.disabled = false
      btnNextHint.textContent = 'Requires victory'
    } else if (scene.type === 'calibration') {
      sceneTag.textContent = scene.title
      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = `<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
        scene.teaching ? teachingBlock(scene.teaching) : ''
      }<p class="hint-block"><span class="hint-label">Target</span> ${scene.minMovesByPlayer} moves as White. The trainer answers at random.</p>`
      lessonNote.textContent = 'Each of your moves is tallied on the right — the Lab is listening.'
      btnReset.disabled = false
      btnNextHint.textContent = `${scene.minMovesByPlayer} White moves`
    } else if (scene.type === 'freeplay') {
      sceneTag.textContent = scene.title
      narrativeBody.classList.remove('narrative-body--interlude')
      narrativeBody.innerHTML = `<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
        scene.teaching ? teachingBlock(scene.teaching) : ''
      }`
      lessonNote.textContent = 'Alternate sides as in a living game. Advance returns to the vestibule.'
      btnReset.disabled = false
      btnNextHint.textContent = 'Leave when ready'
    }

    updateAdvance(flow)
  }

  function nextSceneHint(): string {
    if (!flowRef) return ''
    const ch = flowRef.currentChapter()
    const nextIdx = flowRef.sceneIndex + 1
    if (nextIdx < ch.scenes.length) {
      return sceneTypeLabel(ch.scenes[nextIdx]!)
    }
    return 'Complete'
  }

  function updateAdvance(g: GameFlow) {
    const ok = g.canAdvance()
    const hint =
      ok && currentSceneType !== 'dialogue' && currentSceneType !== 'interlude' && currentSceneType !== 'codex'
        ? nextSceneHint()
        : ''
    const sig = `${ok}|${currentSceneType ?? ''}|${hint}|${g.sceneIndex}|${g.chapterIndex}`
    if (sig === lastAdvanceSig) return
    lastAdvanceSig = sig
    btnNext.disabled = !ok
    btnNext.classList.toggle('primary--ready', ok)
    if (ok && currentSceneType !== 'dialogue' && currentSceneType !== 'interlude' && currentSceneType !== 'codex') {
      btnNextHint.textContent = hint ? `→ ${hint}` : ''
    } else {
      btnNextHint.textContent = ''
    }
  }

  /* ─── Keyboard shortcuts ─────────────────────────────────────── */
  window.addEventListener('keydown', (e) => {
    const inInput =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    if (inInput) return

    if (e.key === 'Escape') {
      const escapeAction = routeEscapeKey({
        rewardOverlayOpen: rewardOverlayCtl.isOpen(),
        labActive: labOverlay.classList.contains('lab-overlay--active'),
      })
      if (escapeAction === 'close-reward-overlay') {
        e.preventDefault()
        closeRewardOverlay()
        return
      }
      if (escapeAction === 'exit-lab') {
        e.preventDefault()
        closeLab()
        showChapters()
        return
      }
    }

    if ((e.key === 'Enter' || e.key === ' ') && labOverlay.classList.contains('lab-overlay--active')) {
      const active = document.activeElement
      const onBoard = active?.closest('.chess-grid') || active?.closest('.promo-panel')
      if (onBoard) return
      e.preventDefault()
      if (flow.canAdvance()) {
        flow.advanceScene()
        updateAdvance(flow)
      }
    }
  })

  /* ─── Event listeners ────────────────────────────────────────── */
  btnResume.addEventListener('click', () => {
    if (!hasSave()) return
    showChapters()
  })
  btnEnterArchive.addEventListener('click', () => { showChapters() })
  btnNew.addEventListener('click', () => {
    clearSave()
    flow.newGame()
    showChapters()
  })
  btnTitle.addEventListener('click', showTitle)
  btnChapters.addEventListener('click', () => showChapters())
  btnDuel.addEventListener('click', showDuel)
  btnChaptersBack.addEventListener('click', () => {
    screenChapters.classList.add('hidden')
    showTitle()
  })
  btnVestibule.addEventListener('click', () => { closeLab(); showChapters() })
  btnSfx.addEventListener('click', () => {
    sfx.setEnabled(!sfx.enabled)
    localStorage.setItem('cok-sfx-enabled', sfx.enabled ? '1' : '0')
    btnSfx.textContent = `Sound: ${sfx.enabled ? 'On' : 'Off'}`
    if (sfx.enabled) sfx.unlock()
  })
  btnMoveGuard.addEventListener('click', () => {
    moveGuardEnabled = !moveGuardEnabled
    localStorage.setItem('cok-move-guard', moveGuardEnabled ? '1' : '0')
    btnMoveGuard.textContent = `Move Guard: ${moveGuardEnabled ? 'On' : 'Off'}`
    flow.board?.setMoveGuard(moveGuardEnabled)
  })
  btnRecoveryDismiss.addEventListener('click', () => {
    flow.dismissSessionRecoveredNotice()
  })
  btnRecoveryRestore.addEventListener('click', () => {
    flow.restoreStablePosition()
    updateAdvance(flow)
  })
  btnNext.addEventListener('click', () => { flow.advanceScene(); updateAdvance(flow) })
  btnUndo.addEventListener('click', () => { flow.undo(); updateAdvance(flow) })
  btnReset.addEventListener('click', () => { flow.resetChessScene(); updateAdvance(flow) })

  let advanceTicker = 0
  const scheduleAdvanceTick = () => {
    if (advanceTicker) window.clearTimeout(advanceTicker)
    const delay = document.hidden ? 2500 : 350
    advanceTicker = window.setTimeout(runAdvanceTick, delay)
  }
  const runAdvanceTick = () => {
    advanceTicker = 0
    if (!document.hidden) updateAdvance(flow)
    scheduleAdvanceTick()
  }
  runAdvanceTick()
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flow.flushDeferredIO()
    else updateAdvance(flow)
  })
  window.addEventListener('beforeunload', () => {
    if (advanceTicker) window.clearTimeout(advanceTicker)
    closeRewardOverlay()
    flow.flushDeferredIO()
  })
  window.addEventListener('pagehide', () => {
    flow.flushDeferredIO()
  })
  btnSfx.textContent = `Sound: ${sfx.enabled ? 'On' : 'Off'}`
  btnMoveGuard.textContent = `Move Guard: ${moveGuardEnabled ? 'On' : 'Off'}`

  syncTitleButtons()
  syncMvpFlag()

  if (hasSave()) {
    if (flow.lastScreen === 'play') {
      showChapters()
      openLab()
    } else if (flow.lastScreen === 'chapters') {
      showChapters()
    } else {
      showTitle()
    }
  } else {
    showTitle()
  }
}
