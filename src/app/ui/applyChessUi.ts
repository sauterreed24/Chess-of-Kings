import type { ChessUiPayload } from '../gameFlow'
import type { RewardBundle } from '../../types'
import { ANNOUNCE_TEMPLATES, STATUS_LABELS } from '../../data/strings'
import {
  BOSS_PROFILE_RE,
  capturedRow,
  formatMoveLedger,
  getCaptured,
} from '../mainUiFormatters'
import type { MountRuntime } from '../mountContext'

export type ApplyChessUiCallbacks = {
  showRewardBundles: (bundles: RewardBundle[]) => void
  maybeShowPendingChapterPrompt: () => void
  revealBoardScene: () => void
}

export function applyChessUi(
  p: ChessUiPayload,
  rt: MountRuntime,
  callbacks: ApplyChessUiCallbacks,
): void {
  const { dom, play, getFlow, sfx, announcer } = rt
  const flowRef = getFlow()
  if (p.sanLog.length > play.prevSanLen) {
    for (let i = play.prevSanLen; i < p.sanLog.length; i++) {
      sfx.playMoveSfx(p.sanLog[i] ?? '', p.sanQuality[i] ?? null)
    }
  }
  play.prevSanLen = p.sanLog.length

  const isGameOver = p.chess.isGameOver()
  const sideToMove = p.chess.turn() === 'w' ? 'White' : 'Black'
  const fullMove = Math.max(1, Math.floor(p.sanLog.length / 2) + 1)
  const calibration = p.calibration
  const calibrationComplete = !!calibration && calibration.current >= calibration.target

  dom.turnPulseEl.textContent = p.matchOutcome
    ? p.matchOutcome === 'win'
      ? 'Victory sealed'
      : p.matchOutcome === 'loss'
        ? 'Defeat recorded'
        : 'Draw recorded'
    : p.aiThinking
      ? 'Rival pondering'
      : calibrationComplete
        ? 'Sealed'
      : `${sideToMove} turn`
  dom.turnPulseEl.classList.toggle('play-chip--white', !p.aiThinking && !p.matchOutcome && !calibrationComplete && p.chess.turn() === 'w')
  dom.turnPulseEl.classList.toggle('play-chip--black', !p.aiThinking && !p.matchOutcome && !calibrationComplete && p.chess.turn() === 'b')
  dom.turnPulseEl.classList.toggle('play-chip--thinking', p.aiThinking)
  dom.turnPulseEl.classList.toggle('play-chip--done', Boolean(p.matchOutcome) || calibrationComplete)
  dom.moveCounterEl.textContent = calibration
    ? `${Math.min(calibration.current, calibration.target)}/${calibration.target} White moves`
    : `Move ${fullMove} · ${p.sanLog.length} ply`

  /* Status pill */
  if (p.aiThinking) {
    dom.boardStatus.textContent = STATUS_LABELS.thinking
    dom.boardStatus.classList.remove(
      'status-pill--check',
      'status-pill--win',
      'status-pill--loss',
      'status-pill--draw',
    )
    dom.boardStatus.classList.add('status-pill--thinking')
  } else if (p.matchOutcome === 'win') {
    dom.boardStatus.textContent = STATUS_LABELS.win
    dom.boardStatus.classList.remove('status-pill--check', 'status-pill--thinking')
    dom.boardStatus.classList.add('status-pill--win')
    dom.boardStatus.classList.remove('status-pill--loss', 'status-pill--draw')
  } else if (p.matchOutcome === 'loss') {
    dom.boardStatus.textContent = STATUS_LABELS.loss
    dom.boardStatus.classList.remove('status-pill--check', 'status-pill--thinking')
    dom.boardStatus.classList.add('status-pill--loss')
    dom.boardStatus.classList.remove('status-pill--win', 'status-pill--draw')
  } else if (p.matchOutcome === 'draw') {
    dom.boardStatus.textContent = STATUS_LABELS.draw
    dom.boardStatus.classList.remove('status-pill--check', 'status-pill--thinking')
    dom.boardStatus.classList.add('status-pill--draw')
    dom.boardStatus.classList.remove('status-pill--win', 'status-pill--loss')
  } else {
    dom.boardStatus.textContent = calibrationComplete ? 'Proof sealed.' : p.status
    dom.boardStatus.classList.toggle('status-pill--check', p.inCheck)
    dom.boardStatus.classList.remove('status-pill--thinking', 'status-pill--win', 'status-pill--loss', 'status-pill--draw')
  }

  /* Board-stage outcome flash */
  dom.boardStage.classList.toggle(
    'board-stage--victory',
    p.matchOutcome === 'win',
  )
  dom.boardStage.classList.toggle('board-stage--loss', p.matchOutcome === 'loss')
  dom.boardStage.classList.toggle('board-stage--finisher', p.matchOutcome === 'win')
  const gameActive = !p.matchOutcome && !isGameOver && !calibrationComplete
  dom.boardStage.classList.toggle('board-stage--white-turn', gameActive && p.chess.turn() === 'w')
  dom.boardStage.classList.toggle('board-stage--black-turn', gameActive && p.chess.turn() === 'b')
  const bossProfile = Boolean(p.aiPersona && BOSS_PROFILE_RE.test(p.aiPersona))
  dom.boardStage.classList.toggle('board-stage--boss', bossProfile)
  dom.boardStage.classList.toggle(
    'board-stage--neutral',
    !p.matchOutcome || p.matchOutcome === 'draw',
  )

  if (p.aiPersona && !p.aiThinking) {
    dom.aiPersonaEl.textContent = `Court dossier — ${p.aiPersona}`
    dom.aiPersonaEl.classList.remove('hidden')
  } else if (p.aiThinking && p.aiPersona) {
    dom.aiPersonaEl.textContent = `${p.aiPersona} is reading the board…`
    dom.aiPersonaEl.classList.remove('hidden')
  } else {
    dom.aiPersonaEl.classList.add('hidden')
  }
  if (p.aiFlavor) {
    dom.aiFlavorEl.textContent = p.aiFlavor
    dom.aiFlavorEl.classList.remove('hidden')
  } else {
    dom.aiFlavorEl.classList.add('hidden')
  }
  if (p.tacticalPulse && !p.aiThinking) {
    dom.tacticalPulseEl.textContent = p.tacticalPulse
    dom.tacticalPulseEl.classList.remove('hidden')
  } else {
    dom.tacticalPulseEl.classList.add('hidden')
  }
  if (p.sessionRecovered && !play.prevSessionRecovered) {
    dom.boardStatus.classList.add('status-pill--recovered')
    sfx.playMoveSfx('O-O', 'good')
    window.setTimeout(() => dom.boardStatus.classList.remove('status-pill--recovered'), 1800)
  }
  play.prevSessionRecovered = p.sessionRecovered
  dom.boardGuide.textContent = p.boardGuide
  dom.mobileBoardGuide.textContent = p.boardGuide
  if (p.sessionRecovered) {
    dom.recoveryControls.classList.remove('hidden')
    dom.btnRecoveryRestore.disabled = !p.canRestoreStable
  } else {
    dom.recoveryControls.classList.add('hidden')
  }

  dom.btnUndo.disabled = !p.canUndo
  dom.btnRunBack.hidden = !p.canRetry
  dom.btnHint.hidden = !p.canHint
  const ledgerKey = `${p.sanLog.length}|${p.ledgerFp}`
  if (ledgerKey !== play.lastLedgerKey) {
    play.lastLedgerKey = ledgerKey
    const ledgerHtml = formatMoveLedger(p.sanLog, p.sanQuality)
    dom.moveLedger.innerHTML = ledgerHtml
    dom.moveLedger.scrollTop = dom.moveLedger.scrollHeight
  }

  if (calibration) {
    const calKey = `${calibration.current}\t${calibration.target}`
    if (calKey !== play.lastCalKey) {
      play.lastCalKey = calKey
      const rawTarget = Math.floor(Number(calibration.target))
      const rawCurrent = Math.floor(Number(calibration.current))
      const target = Number.isFinite(rawTarget) ? Math.max(0, Math.min(120, rawTarget)) : 0
      const current = Number.isFinite(rawCurrent) ? Math.max(0, Math.min(target, rawCurrent)) : 0
      if (dom.btnNext.disabled) {
        const left = target - current
        dom.btnNextHint.textContent = left === 1 ? '1 remaining' : `${left} remaining`
      }
      dom.calibrationTrack.innerHTML = Array.from({ length: target }, (_, i) => {
        const filled = i < current
        return `<span class="cal-dot ${filled ? 'cal-dot--on' : ''}" aria-hidden="true"></span>`
      }).join('')
    }
    dom.calibrationRail.classList.remove('hidden')
  } else {
    play.lastCalKey = ''
    dom.calibrationRail.classList.add('hidden')
  }

  /* Check square highlight */
  const b = flowRef?.board
  if (b && p.inCheck && !p.aiThinking) {
    const k = p.chess.findPiece({ type: 'k', color: p.chess.turn() })
    b.setCheckSquare(k[0] ?? null)
  } else {
    b?.setCheckSquare(null)
  }

  /* Coach tip — your move's feedback stays up while the rival ponders
     (that's your reading window); GameFlow clears it when the rival
     replies, so it never lingers as stale advice. */
  if (p.coachTip || p.mentorInsight) {
    dom.coachTipEl.textContent = p.mentorInsight ?? p.coachTip ?? ''
    dom.coachTipEl.classList.remove('hidden')
  } else {
    dom.coachTipEl.classList.add('hidden')
  }

  /* Eval bar + captured material (match mode) — skip DOM when score/FEN unchanged (RAF batching). */
  if (play.showEvalBar) {
    if (play.lastEvalScore !== p.evalScore) {
      play.lastEvalScore = p.evalScore
      const clamped = Math.max(-600, Math.min(600, p.evalScore))
      const pct = 50 + clamped / 12
      dom.evalBarFill.style.height = `${Math.max(3, Math.min(97, pct))}%`
      const abs = Math.abs(p.evalScore)
      if (abs < 15) {
        dom.evalBarScore.textContent = '0.0'
      } else {
        const val = (Math.abs(p.evalScore) / 100).toFixed(1)
        dom.evalBarScore.textContent = p.evalScore > 0 ? `+${val}` : `-${val}`
      }
    }
    const fen = p.fen
    if (fen !== play.lastCapturedFen) {
      play.lastCapturedFen = fen
      const { byWhite, byBlack } = getCaptured(p.chess)
      const skin = flowRef?.getSelectedPieceSkin() ?? 'classic-royal'
      dom.capturedTop.innerHTML = capturedRow(byWhite, 'b', skin)
      dom.capturedBot.innerHTML = capturedRow(byBlack, 'w', skin)
    }
  }

  if (p.matchOutcome) play.latestResolvedForRecap = p

  /* Announce a terminal outcome at most once per scene. The key
   * combines outcome + ledger fingerprint so a new game on the same
   * scene reannounces. Rival name comes from the AI persona when
   * available, falling back to "the rival" for narrative scenes. */
  if (p.matchOutcome) {
    const key = `${p.matchOutcome}|${p.ledgerFp}`
    if (key !== play.announcedOutcomeKey) {
      play.announcedOutcomeKey = key
      const rival = p.aiPersona?.replace(/\s*\(.*\)\s*$/, '').trim() || 'the rival'
      const tmpl =
        p.matchOutcome === 'win'
          ? ANNOUNCE_TEMPLATES.matchWin
          : p.matchOutcome === 'loss'
            ? ANNOUNCE_TEMPLATES.matchLoss
            : ANNOUNCE_TEMPLATES.matchDraw
      announcer.say(`${tmpl} ${rival}.`)
    }
  } else if (!p.matchOutcome && play.announcedOutcomeKey) {
    play.announcedOutcomeKey = ''
  }

  const rewards = flowRef?.consumePendingRewards() ?? []
  if (rewards.length) {
    const key = p.matchOutcome ? `${p.matchOutcome}|${p.ledgerFp}` : `reward|${p.ledgerFp}`
    play.recapShownForKey = key
    callbacks.showRewardBundles(rewards)
  } else if (p.matchOutcome && play.latestResolvedForRecap) {
    const key = `${p.matchOutcome}|${p.ledgerFp}`
    if (key !== play.recapShownForKey) {
      play.recapShownForKey = key
      /* Losses and draws still earn a Verdict Recap — rating delta, study line, rematch. */
      callbacks.showRewardBundles([])
    }
  } else {
    if (!p.matchOutcome) play.recapShownForKey = ''
    callbacks.maybeShowPendingChapterPrompt()
  }

  if (play.pendingBoardReveal) {
    play.pendingBoardReveal = false
    callbacks.revealBoardScene()
  }
}
