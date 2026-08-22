import { PLAYABLE_CHAPTERS } from '../data/chapters'
import { LOCKED_ROADMAP } from '../data/roadmap'
import { GameFlow } from './gameFlow'
import type { ChessUiPayload } from './gameFlow'
import { clearSave, hasSave } from './storage'
import type { Chapter, DuelRosterEntry, DuelVariant, Scene, PieceSkinId, RewardBundle } from '../types'
import { PIECE_SKIN_LABEL } from '../chess/skins'
import { paintTitleHonor } from './ui/titleHonor'
import { AI_PROFILES } from '../chess/aiProfiles'
import { escapeHtml } from './htmlEscape'
import { createRewardOverlayController } from './rewardOverlayController'
import { createConfirmDialogController } from './overlays/confirmDialogController'
import { createScreenController } from './screenController'
import { applyLabOverlayCaption, clearPhoneLessonMarkers, setTopBarInertForLab, syncLabOverlayCaption, syncPhonePuzzleLesson } from './labModal'
import { renderChapterProgressHtml } from './play/chapterProgress'
import { aiTraitBars, sceneTypeLabel } from './mainUiFormatters'
import { getShellMarkup } from './shellMarkup'
import { createSfxController } from './audio/sfx'
import { attachGlobalShortcuts } from './keyboard/globalShortcuts'
import { recordToday as recordStreakToday, readStreak } from './session/streak'
import { pickDailyCalculus } from './session/dailyCalculus'
import { createAnnouncer } from './a11y/announcer'
import {
  CONFIRM_COPY,
  confirmCopyForLabExit,
  type LabExitDest,
  KEYBOARD_HELP_HEADING,
  MACHINE_OPENED_COPY,
  PARADOX_OPENED_COPY,
  PLATEAU_COPY,
  PLATEAU_PENDING_CH4_COPY,
  PLATEAU_PENDING_CH5_COPY,
  PLATEAU_PENDING_CH6_COPY,
  PLATEAU_PENDING_CH7_COPY,
  PLATEAU_PENDING_CH8_COPY,
  PLATEAU_PENDING_CH9_COPY,
  PLATEAU_PENDING_COPY,
  SILICON_OPENED_COPY,
  SYNTHESIS_OPENED_COPY,
  ALEXANDRINE_OPENED_COPY,
  APOTHEOSIS_OPENED_COPY,
  RIBBON_LABELS,
  STORAGE_FAILURE_MESSAGE,
} from '../data/strings'
import { syncTitleActionGroups } from './titleActions'
import { createMountPlayState, type MountDomRefs, type MountRuntime } from './mountContext'
import { applyChessUi as applyChessUiImpl } from './ui/applyChessUi'
import { renderScene as renderSceneUi } from './ui/renderScene'
import { showRewardBundles as showRewardBundlesUi } from './ui/showRewardBundles'
import { renderDuelUi as renderDuelUiUi } from './ui/renderDuelUi'
import { COMPACT_MEDIA_QUERY, createMobileBoardFitController } from './mobileBoardFit'
import {
  cycleAiSearchSurfacePreference,
  getAiSearchSurfacePreference,
} from '../chess/aiAsync'
import {
  cycleVisualQualityPreference,
  getVisualQualityPreference,
  refreshDocumentUiProfile,
} from './runtimeUiProfile'

const SFX_PREF_KEY = 'cok-sfx-enabled'
const MOVE_GUARD_PREF_KEY = 'cok-move-guard'
const MOTION_PREF_KEY = 'cok-reduce-motion'

function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Preference toggles should still work for the current session when storage is unavailable.
  }
}

export function mountApp(app: HTMLDivElement) {
  app.innerHTML = getShellMarkup()
  paintTitleHonor(app.querySelector('#title-honor'))

  const shell = app.querySelector<HTMLElement>('#shell')!
  const topBar = app.querySelector<HTMLElement>('.top-bar')!
  const labOverlay = app.querySelector<HTMLDivElement>('#lab-overlay')!
  const playScreen = app.querySelector<HTMLElement>('#screen-play')!
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
  const btnNextLabel = app.querySelector<HTMLSpanElement>('.btn-advance-label')!
  const btnNextHint = app.querySelector<HTMLSpanElement>('#btn-next-hint')!
  const btnSkipAhead = app.querySelector<HTMLButtonElement>('#btn-skip-ahead')!
  const btnUndo = app.querySelector<HTMLButtonElement>('#btn-undo')!
  const btnRunBack = app.querySelector<HTMLButtonElement>('#btn-run-back')!
  const btnReset = app.querySelector<HTMLButtonElement>('#btn-reset')!
  const btnHint = app.querySelector<HTMLButtonElement>('#btn-hint')!
  const narrativeBody = app.querySelector<HTMLDivElement>('#narrative-body')!
  const sceneTag = app.querySelector<HTMLParagraphElement>('#scene-tag')!
  const chapterRail = app.querySelector<HTMLDivElement>('#chapter-rail')!
  const sceneProgress = app.querySelector<HTMLSpanElement>('#scene-progress')!
  const boardStatus = app.querySelector<HTMLSpanElement>('#board-status')!
  const turnPulseEl = app.querySelector<HTMLSpanElement>('#turn-pulse')!
  const moveCounterEl = app.querySelector<HTMLSpanElement>('#move-counter')!
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
  const titleRating = app.querySelector<HTMLParagraphElement>('#title-rating')!
  const dailyRibbon = app.querySelector<HTMLDivElement>('#daily-ribbon')!
  const announcer = createAnnouncer(app.querySelector<HTMLDivElement>('#live-announcer')!)
  const boardGuide = app.querySelector<HTMLParagraphElement>('#board-guide')!
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
  const confirmOverlay = app.querySelector<HTMLDivElement>('#confirm-overlay')!
  const storageFailureBanner = app.querySelector<HTMLDivElement>('#storage-failure-banner')!
  const btnStorageBannerDismiss = app.querySelector<HTMLButtonElement>('#btn-storage-banner-dismiss')!
  const chapterProgressSlot = app.querySelector<HTMLDivElement>('#chapter-progress-slot')!
  const mobileBoardGuide = app.querySelector<HTMLParagraphElement>('#mobile-board-guide')!
  const btnTitleSfx = app.querySelector<HTMLButtonElement>('#btn-title-sfx')!
  const btnTitleMoveGuard = app.querySelector<HTMLButtonElement>('#btn-title-move-guard')!
  const btnTitleMotion = app.querySelector<HTMLButtonElement>('#btn-title-motion')!
  const btnTitleAiWorker = app.querySelector<HTMLButtonElement>('#btn-title-ai-worker')!
  const btnTitleVisual = app.querySelector<HTMLButtonElement>('#btn-title-visual')!
  const titleSkinField = app.querySelector<HTMLLabelElement>('#title-skin-field')!
  const titleSkinSelect = app.querySelector<HTMLSelectElement>('#title-skin')!
  const btnTitleKbdhelp = app.querySelector<HTMLButtonElement>('#btn-title-kbdhelp')!
  const btnLabKbdhelp = app.querySelector<HTMLButtonElement>('#btn-lab-kbdhelp')!
  const liveAnnouncer = app.querySelector<HTMLDivElement>('#live-announcer')!
  const rewardInertRestore: HTMLElement[] = []
  const confirmInertRestore: HTMLElement[] = []
  const screenCtl = createScreenController({
    shell,
    screens: {
      title: screenTitle as HTMLElement,
      chapters: screenChapters as HTMLElement,
      duel: screenDuel as HTMLElement,
    },
    topBar,
    labOverlay,
    modalExempt: [rewardOverlay, confirmOverlay, liveAnnouncer],
  })
  const rewardOverlayCtl = createRewardOverlayController(rewardOverlay, {
    onOpenChange(open) {
      screenCtl.setShellBackdropInert(rewardInertRestore, open, [
        rewardOverlay,
        confirmOverlay,
        liveAnnouncer,
      ])
    },
  })
  const confirmDialogCtl = createConfirmDialogController(confirmOverlay, {
    onOpenChange(open) {
      screenCtl.setShellBackdropInert(confirmInertRestore, open, [confirmOverlay, liveAnnouncer])
    },
  })
  const mobileBoardFit = createMobileBoardFitController({
    playScreen,
    boardStage,
    labOverlay,
    syncLabNav: (open) => {
      setTopBarInertForLab(topBar, open)
      syncLabOverlayCaption(labEraLabel)
      syncPhonePuzzleLesson(narrativeBody)
    },
  })
  mobileBoardFit.attach()
  let storageFailureAnnounced = false
  function showStorageFailureBanner() {
    storageFailureBanner.classList.remove('hidden')
    if (!storageFailureAnnounced) {
      storageFailureAnnounced = true
      announcer.say(STORAGE_FAILURE_MESSAGE)
    }
  }
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
  let dialogueRevealDone = true
  let dialogueRevealTimer = 0
  const play = createMountPlayState()
  const mountDom: MountDomRefs = {
    app,
    playScreen,
    boardPanel,
    manuscriptPanel,
    boardStage,
    narrativeBody,
    sceneTag,
    chapterRail,
    sceneProgress,
    lessonNote,
    coachTipEl,
    btnReset,
    btnHint,
    btnNext,
    btnNextHint,
    btnSkipAhead,
    boardStatus,
    turnPulseEl,
    moveCounterEl,
    aiPersonaEl,
    aiFlavorEl,
    tacticalPulseEl,
    boardGuide,
    mobileBoardGuide,
    recoveryControls,
    btnRecoveryRestore,
    btnUndo,
    btnRunBack,
    moveLedger,
    calibrationRail,
    calibrationTrack,
    evalBarWrap,
    evalBarFill,
    evalBarScore,
    capturedTop,
    capturedBot,
    duelList,
    duelPanel,
    labEraLabel,
  }
  let pendingChapterPrompt: { completedTitle: string; nextTitle: string | null } | null = null
  let moveGuardEnabled = readPreference(MOVE_GUARD_PREF_KEY) === '1'
  let focusBeforeLab: HTMLElement | null = null
  const sfx = createSfxController({
    enabled: readPreference(SFX_PREF_KEY) !== '0',
  })
  const mountRuntime: MountRuntime = {
    dom: mountDom,
    play,
    getFlow: () => flowRef,
    sfx,
    announcer,
  }
  const unlockSfxFromUserGesture = (event: Event) => {
    if (!event.isTrusted) return
    if (sfx.enabled) sfx.unlock()
  }
  window.addEventListener('pointerdown', unlockSfxFromUserGesture, { once: true, capture: true })
  window.addEventListener('keydown', unlockSfxFromUserGesture, { once: true, capture: true })
  window.addEventListener('click', unlockSfxFromUserGesture, { once: true, capture: true })

  function focusWithoutScroll(el: HTMLElement | null | undefined) {
    if (!el) return
    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }

  function syncPreferenceButtons() {
    const sfxLabel = sfx.enabled ? 'On' : 'Off'
    const guardLabel = moveGuardEnabled ? 'On' : 'Off'
    btnSfx.textContent = `Sound: ${sfxLabel}`
    btnSfx.setAttribute('aria-pressed', sfx.enabled ? 'true' : 'false')
    btnSfx.setAttribute('aria-label', sfx.enabled ? 'Sound on' : 'Sound off')
    btnMoveGuard.textContent = `Move Guard: ${guardLabel}`
    btnMoveGuard.setAttribute('aria-pressed', moveGuardEnabled ? 'true' : 'false')
    btnMoveGuard.setAttribute(
      'aria-label',
      moveGuardEnabled ? 'Move Guard on' : 'Move Guard off',
    )
    btnTitleSfx.textContent = `Sound: ${sfxLabel}`
    btnTitleSfx.setAttribute('aria-pressed', sfx.enabled ? 'true' : 'false')
    btnTitleMoveGuard.textContent = `Move Guard: ${guardLabel}`
    btnTitleMoveGuard.setAttribute('aria-pressed', moveGuardEnabled ? 'true' : 'false')
    const motionForced = readPreference(MOTION_PREF_KEY) === '1'
    btnTitleMotion.textContent = motionForced ? 'Motion: Reduced' : 'Motion: System'
    btnTitleMotion.setAttribute('aria-pressed', motionForced ? 'true' : 'false')
    const aiPref = getAiSearchSurfacePreference()
    const aiLabel = aiPref === 'worker' ? 'Worker' : aiPref === 'main' ? 'Main' : 'Auto'
    btnTitleAiWorker.textContent = `AI Thread: ${aiLabel}`
    btnTitleAiWorker.setAttribute('aria-pressed', aiPref === 'auto' ? 'false' : 'true')
    btnTitleAiWorker.setAttribute(
      'aria-label',
      aiPref === 'worker'
        ? 'AI search off main thread'
        : aiPref === 'main'
          ? 'AI search on main thread'
          : 'AI search auto',
    )
    const visualPref = getVisualQualityPreference()
    const visualLabel = visualPref === 'full' ? 'Full' : visualPref === 'lean' ? 'Lean' : 'Auto'
    btnTitleVisual.textContent = `Visual: ${visualLabel}`
    btnTitleVisual.setAttribute('aria-pressed', visualPref === 'auto' ? 'false' : 'true')
    btnTitleVisual.setAttribute(
      'aria-label',
      visualPref === 'full'
        ? 'Visual quality full'
        : visualPref === 'lean'
          ? 'Visual quality lean'
          : 'Visual quality auto',
    )
  }

  function applyMotionPreference() {
    const forced = readPreference(MOTION_PREF_KEY) === '1'
    document.documentElement.classList.toggle('force-reduced-motion', forced)
  }

  function syncTitleSkinSelect() {
    const skins = flowRef?.getUnlockedPieceSkins() ?? ['classic-royal']
    if (skins.length <= 1) {
      titleSkinField.classList.add('hidden')
      return
    }
    titleSkinField.classList.remove('hidden')
    const selected = flowRef?.getSelectedPieceSkin() ?? 'classic-royal'
    titleSkinSelect.innerHTML = skins
      .map(
        (s) =>
          `<option value="${s}" ${s === selected ? 'selected' : ''}>${escapeHtml(PIECE_SKIN_LABEL[s])}</option>`,
      )
      .join('')
  }

  /* ─── Chess UI updater ────────────────────────────────────────── */

  function applyChessUi(p: ChessUiPayload) {
    applyChessUiImpl(p, mountRuntime, {
      showRewardBundles,
      maybeShowPendingChapterPrompt,
      revealBoardScene,
    })
  }

  /* ─── GameFlow setup ──────────────────────────────────────────── */

  const flow = new GameFlow(PLAYABLE_CHAPTERS, {
    onSceneChange(chapter, scene, sceneIndex) {
      flowRef = flow
      currentSceneType = scene.type
      renderScene(chapter, scene, sceneIndex)
      applyLabOverlayCaption(labEraLabel, `${chapter.title} · ${chapter.era}`, chapter.title)
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
      const pending = flow.consumePendingRewards()
      const msg = flow.chapter9Complete
        ? 'Chapters I–IX are sealed. Daily Calculus and the Duel Archive remain open — mastery is the plateau, not a wall.'
        : flow.chapter8Complete
          ? 'Chapters I–VIII are sealed. The Apotheosis Engine should have opened — resume the chronicle if the vestibule stalled.'
          : flow.chapter7Complete
          ? 'Chapters I–VII are sealed. The Alexandrine Board should have opened — resume the chronicle if the vestibule stalled.'
          : flow.chapter6Complete
          ? 'Chapters I–VI are sealed. The Human Synthesis should have opened — resume the chronicle if the vestibule stalled.'
          : flow.chapter5Complete
          ? 'Chapters I–V are sealed. The Silicon Threshold should have opened — resume the chronicle if the vestibule stalled.'
          : flow.chapter4Complete
            ? 'Chapters I–IV are sealed. The Machine of Discipline should have opened — resume the chronicle if the vestibule stalled.'
            : flow.chapter3Complete
              ? 'Chapters I–III are sealed. The Paradox Masters should have opened — resume the chronicle if the vestibule stalled.'
              : flow.chapter2Complete
                ? 'Chapters I and II are sealed. Further ages are not yet compiled for this build — your chronicle is marked.'
                : flow.chapter1Complete === true
                  ? 'Chapter I sealed. Further ages are not built into this version — your chronicle is marked.'
                  : 'Bookmark updated.'
      pendingChapterPrompt = { completedTitle: msg, nextTitle: null }
      closeLab()
      showTitle()
      if (pending.length) showRewardBundles(pending)
      maybeShowPendingChapterPrompt()
      syncMvpFlag()
    },
    onPersistFailure: () => showStorageFailureBanner(),
  })
  flowRef = flow

  function syncTitleButtons() {
    const saved = hasSave()
    syncTitleActionGroups(saved, {
      saveGroup: titleActionsSave,
      freshGroup: titleActionsFresh,
      resumeButton: btnResume,
      newButton: btnNew,
      enterButton: btnEnterArchive,
    })
  }

  function syncMvpFlag() {
    mvpFlag.textContent = flow.chapter9Complete
      ? 'Chapters I–IX are inscribed. Daily Calculus and the Duel Archive remain open.'
      : flow.chapter9ReflectionComplete
        ? 'Chapter IX reflection is inscribed. Finish the rehearsal to claim the last seal.'
        : flow.chapter8Complete
          ? 'Chapters I–VIII are inscribed. Chapter IX — The Apotheosis Engine — is open.'
          : flow.chapter8ReflectionComplete
        ? 'Chapter VIII reflection is inscribed. Finish the rehearsal to claim the stratarchic seal.'
        : flow.chapter7Complete
          ? 'Chapters I–VII are inscribed. Chapter VIII — The Alexandrine Board — is open.'
          : flow.chapter7ReflectionComplete
        ? 'Chapter VII reflection is inscribed. Finish the rehearsal to claim the synthesis seal.'
        : flow.chapter6Complete
          ? 'Chapters I–VI are inscribed. Chapter VII — The Human Synthesis — is open.'
          : flow.chapter6ReflectionComplete
        ? 'Chapter VI reflection is inscribed. Finish the rehearsal to claim the ledger seal.'
        : flow.chapter5Complete
          ? 'Chapters I–V are inscribed. Chapter VI — The Silicon Threshold — is open.'
          : flow.chapter5ReflectionComplete
            ? 'Chapter V reflection is inscribed. Finish the rehearsal to claim the discipline seal.'
            : flow.chapter4Complete
              ? 'Chapters I–IV are inscribed. Chapter V — The Machine of Discipline — is open.'
              : flow.chapter4ReflectionComplete
                ? 'Chapter IV reflection is inscribed. Finish the rehearsal to claim the paradox seal.'
                : flow.chapter3Complete
                  ? 'Chapters I–III are inscribed. Chapter IV — The Paradox Masters — is open.'
                  : flow.chapter3ReflectionComplete
                    ? 'Chapter III reflection is inscribed. Finish the rehearsal to claim the classical seal.'
                    : flow.chapter2Complete
                      ? 'Chapters I and II are inscribed in your save. Resume reopens the chronicle.'
                      : flow.chapter1Complete
                        ? 'Chapter I is inscribed in your save. Resume opens your chapter ledger.'
                        : ''
  }

  function syncTitleRating() {
    const ladder = flow.getLadderRating()
    if (ladder.rated <= 0) {
      titleRating.textContent = ''
      titleRating.classList.add('hidden')
      return
    }
    const peak = ladder.peak > ladder.rating ? ` · peak ${ladder.peak}` : ''
    titleRating.textContent = `Stratarch Rating ${ladder.rating}${peak}`
    titleRating.classList.remove('hidden')
  }

  /* ─── Session streak + Daily Calculus ribbon ─────────────────── */
  /* Recorded once per local day on app boot. The streak / daily pick
   * are stored in dedicated localStorage keys to keep them orthogonal
   * to the versioned SaveData and free of migrations. The daily pick
   * is only shown when the player has the chapter unlocked, so the
   * call-to-action never appears as a button that does nothing. */
  const streakBoot = recordStreakToday()
  function syncDailyRibbon() {
    const streak = readStreak()
    const dailyRaw = pickDailyCalculus(PLAYABLE_CHAPTERS)
    const daily =
      dailyRaw && dailyRaw.chapterIndex <= flow.highestUnlockedChapter ? dailyRaw : null
    const persistNote =
      streakBoot.persistOk === false
        ? `<span class="daily-ribbon__warn" role="status">Streak could not be saved in this browser (private mode or storage full).</span>`
        : ''
    const streakBadge =
      streak.count > 1
        ? `<span class="daily-ribbon__streak"><strong>${streak.count}</strong> ${RIBBON_LABELS.dayStreakSuffix}</span>${persistNote}`
        : streak.count === 1
          ? `<span class="daily-ribbon__streak"><strong>${RIBBON_LABELS.newStreak}</strong></span>${persistNote}`
          : persistNote
    const dailyBlock = daily
      ? `<button type="button" class="ghost daily-ribbon__cta" id="btn-daily-calculus"
            aria-label="Play Daily Calculus: ${escapeHtml(daily.title)}">
            <span class="daily-ribbon__label">${RIBBON_LABELS.dailyCalculus}</span>
            <span class="daily-ribbon__title">${escapeHtml(daily.title)}</span>
            <span class="daily-ribbon__chapter">${escapeHtml(daily.chapterTitle)} · ${escapeHtml(daily.dayKey)}</span>
          </button>`
      : ''
    if (!streakBadge && !dailyBlock) {
      dailyRibbon.classList.add('hidden')
      dailyRibbon.innerHTML = ''
      return
    }
    dailyRibbon.innerHTML = `${streakBadge}${dailyBlock}`
    dailyRibbon.classList.remove('hidden')
    if (daily) {
      dailyRibbon.querySelector<HTMLButtonElement>('#btn-daily-calculus')?.addEventListener('click', async () => {
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.dailyCalculus)
          if (!ok) return
        }
        flow.jumpToScene(daily.chapterIndex, daily.sceneIndex)
        openLab()
      })
    }
  }

  function openLab() {
    closeRewardOverlay()
    flow.setLastScreen('play')
    focusBeforeLab = document.activeElement instanceof HTMLElement ? document.activeElement : null
    screenCtl.setLabOpen(true)
    setNavActive(null)
    shell.classList.add('shell--lab')
    labOverlay.classList.add('lab-overlay--active')
    labOverlay.setAttribute('aria-hidden', 'false')
    labOverlay.setAttribute('role', 'dialog')
    labOverlay.setAttribute('aria-modal', 'true')
    labOverlay.setAttribute('aria-label', 'Archive simulation')
    const chessRoot = app.querySelector<HTMLDivElement>('#chess-root')!
    if (!flow.board) flow.mountBoard(chessRoot)
    else if (!flow.isInDuelMode()) flow.refreshScene()
    renderActiveDuelLabBrief()
    flow.board?.setMoveGuard(moveGuardEnabled)
    syncTitleButtons()
    focusWithoutScroll(btnVestibule)
    window.requestAnimationFrame(() => mobileBoardFit.apply())
  }

  function closeLab() {
    closeRewardOverlay()
    screenCtl.setLabOpen(false)
    labOverlay.classList.remove('lab-overlay--active')
    labOverlay.setAttribute('aria-hidden', 'true')
    labOverlay.removeAttribute('aria-modal')
    labOverlay.removeAttribute('role')
    labOverlay.removeAttribute('aria-label')
    shell.classList.remove('shell--lab')
    flow.stopDuel()
    flow.setLastScreen('chapters')
    mobileBoardFit.apply()
  }

  /**
   * Returns a boolean immediately when no dialog is needed so top-nav / vestibule
   * stay synchronous. Only returns a Promise when a confirm dialog is open.
   */
  function confirmLeaveLabIfNeeded(dest: LabExitDest): boolean | Promise<boolean> {
    const labOpen = labOverlay.classList.contains('lab-overlay--active')
    if (!labOpen) return true
    const mustConfirm =
      flow.isInDuelMode() || flow.hasUnsavedPassageProgress() || flow.hasRecoverableSession()
    if (!mustConfirm) return true
    return confirmDialogCtl.open(confirmCopyForLabExit(dest, flow.isInDuelMode()))
  }

  function closeLabIfActive(dest: LabExitDest): boolean | Promise<boolean> {
    if (!labOverlay.classList.contains('lab-overlay--active')) return true
    const ok = confirmLeaveLabIfNeeded(dest)
    if (ok === false) return false
    if (ok === true) {
      closeLab()
      return true
    }
    return ok.then((confirmed) => {
      if (!confirmed) return false
      closeLab()
      return true
    })
  }

  function afterLeaveLab(next: () => void, dest: LabExitDest = 'chapters'): void {
    const result = closeLabIfActive(dest)
    if (typeof result === 'boolean') {
      if (result) next()
      return
    }
    void result.then((ok) => {
      if (ok) next()
    })
  }

  function setNavActive(active: 'title' | 'chapters' | 'duel' | null) {
    const nav = [
      { key: 'title' as const, el: btnTitle },
      { key: 'chapters' as const, el: btnChapters },
      { key: 'duel' as const, el: btnDuel },
    ]
    for (const item of nav) {
      const on = active === item.key
      item.el.classList.toggle('ghost--nav-active', on)
      if (on) item.el.setAttribute('aria-current', 'page')
      else item.el.removeAttribute('aria-current')
    }
  }

  function focusTitleEntry() {
    if (
      focusBeforeLab &&
      document.contains(focusBeforeLab) &&
      !focusBeforeLab.closest('[aria-hidden="true"], .hidden')
    ) {
      focusWithoutScroll(focusBeforeLab)
      focusBeforeLab = null
      return
    }
    focusBeforeLab = null
    if (!btnResume.disabled) focusWithoutScroll(btnResume)
    else focusWithoutScroll(btnEnterArchive)
  }

  function showTitle() {
    closeRewardOverlay()
    if (hasSave()) flow.setLastScreen('title')
    screenCtl.setLabOpen(false)
    labOverlay.classList.remove('lab-overlay--active')
    labOverlay.setAttribute('aria-hidden', 'true')
    labOverlay.removeAttribute('aria-modal')
    labOverlay.removeAttribute('role')
    labOverlay.removeAttribute('aria-label')
    shell.classList.remove('shell--lab')
    screenCtl.setTopLevelScreen('title')
    setNavActive('title')
    syncTitleButtons()
    syncMvpFlag()
    syncTitleRating()
    syncDailyRibbon()
    syncTitleSkinSelect()
    syncPreferenceButtons()
    focusTitleEntry()
  }

  function showChapters() {
    closeRewardOverlay()
    screenCtl.setLabOpen(false)
    flow.setLastScreen('chapters')
    screenCtl.setTopLevelScreen('chapters')
    setNavActive('chapters')
    btnChaptersBack.classList.remove('hidden')
    btnChaptersBack.textContent = '← Return to title'
    chapterProgressSlot.innerHTML = renderChapterProgressHtml(flow.highestUnlockedChapter)
    chapterList.innerHTML = ''

    const plateau = flow.chapter9Complete
    const plateauPendingCh3 = !flow.chapter3Complete && flow.chapter3ReflectionComplete
    const plateauPendingCh4 = flow.chapter3Complete && !flow.chapter4Complete && flow.chapter4ReflectionComplete
    const plateauPendingCh5 = flow.chapter4Complete && !flow.chapter5Complete && flow.chapter5ReflectionComplete
    const plateauPendingCh6 = flow.chapter5Complete && !flow.chapter6Complete && flow.chapter6ReflectionComplete
    const plateauPendingCh7 = flow.chapter6Complete && !flow.chapter7Complete && flow.chapter7ReflectionComplete
    const plateauPendingCh8 = flow.chapter7Complete && !flow.chapter8Complete && flow.chapter8ReflectionComplete
    const plateauPendingCh9 = flow.chapter8Complete && !plateau && flow.chapter9ReflectionComplete
    const paradoxOpened = flow.chapter3Complete && !flow.chapter4Complete && !flow.chapter4ReflectionComplete
    const machineOpened = flow.chapter4Complete && !flow.chapter5Complete && !flow.chapter5ReflectionComplete
    const siliconOpened = flow.chapter5Complete && !flow.chapter6Complete && !flow.chapter6ReflectionComplete
    const synthesisOpened = flow.chapter6Complete && !flow.chapter7Complete && !flow.chapter7ReflectionComplete
    const alexandrineOpened = flow.chapter7Complete && !flow.chapter8Complete && !flow.chapter8ReflectionComplete
    const apotheosisOpened = flow.chapter8Complete && !plateau && !flow.chapter9ReflectionComplete
    const plateauPending = plateauPendingCh3 || plateauPendingCh4 || plateauPendingCh5 || plateauPendingCh6 || plateauPendingCh7 || plateauPendingCh8 || plateauPendingCh9
    const recoverable = flow.hasRecoverableSession()
    const dailyRaw = pickDailyCalculus(PLAYABLE_CHAPTERS)
    const daily =
      dailyRaw && dailyRaw.chapterIndex <= flow.highestUnlockedChapter ? dailyRaw : null
    const ch4Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch4')
    const ch5Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch5')
    const ch6Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch6')
    const ch7Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch7')
    const ch8Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch8')
    const ch9Index = PLAYABLE_CHAPTERS.findIndex((chapter) => chapter.id === 'ch9')

    if (plateau || plateauPending || paradoxOpened || machineOpened || siliconOpened || synthesisOpened || alexandrineOpened || apotheosisOpened || recoverable) {
      const resumeBtn = recoverable
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-resume-recovered">
            ${escapeHtml(PLATEAU_COPY.resumeCta)}
          </button>`
        : ''
      const pendingCopy = plateauPendingCh9
        ? PLATEAU_PENDING_CH9_COPY
        : plateauPendingCh8
        ? PLATEAU_PENDING_CH8_COPY
        : plateauPendingCh7
        ? PLATEAU_PENDING_CH7_COPY
        : plateauPendingCh6
          ? PLATEAU_PENDING_CH6_COPY
          : plateauPendingCh5
          ? PLATEAU_PENDING_CH5_COPY
          : plateauPendingCh4
            ? PLATEAU_PENDING_CH4_COPY
            : PLATEAU_PENDING_COPY
      const hubHeading = plateau
        ? PLATEAU_COPY.heading
        : apotheosisOpened
          ? APOTHEOSIS_OPENED_COPY.heading
          : alexandrineOpened
          ? ALEXANDRINE_OPENED_COPY.heading
          : synthesisOpened
          ? SYNTHESIS_OPENED_COPY.heading
          : siliconOpened
          ? SILICON_OPENED_COPY.heading
          : machineOpened
            ? MACHINE_OPENED_COPY.heading
            : paradoxOpened
              ? PARADOX_OPENED_COPY.heading
              : pendingCopy.heading
      const hubLede = plateau
        ? PLATEAU_COPY.lede
        : apotheosisOpened
          ? APOTHEOSIS_OPENED_COPY.lede
          : alexandrineOpened
          ? ALEXANDRINE_OPENED_COPY.lede
          : synthesisOpened
          ? SYNTHESIS_OPENED_COPY.lede
          : siliconOpened
          ? SILICON_OPENED_COPY.lede
          : machineOpened
            ? MACHINE_OPENED_COPY.lede
            : paradoxOpened
              ? PARADOX_OPENED_COPY.lede
              : pendingCopy.lede
      const paradoxBtn = paradoxOpened && ch4Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-paradox">
            ${escapeHtml(PARADOX_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const machineBtn = machineOpened && ch5Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-machine">
            ${escapeHtml(MACHINE_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const siliconBtn = siliconOpened && ch6Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-silicon">
            ${escapeHtml(SILICON_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const synthesisBtn = synthesisOpened && ch7Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-synthesis">
            ${escapeHtml(SYNTHESIS_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const alexandrineBtn = alexandrineOpened && ch8Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-alexandrine">
            ${escapeHtml(ALEXANDRINE_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const apotheosisBtn = apotheosisOpened && ch9Index >= 0
        ? `<button type="button" class="primary chapter-quick-actions__btn" id="btn-plateau-apotheosis">
            ${escapeHtml(APOTHEOSIS_OPENED_COPY.enterCta)}
          </button>`
        : ''
      const plateauBlock = (plateau || plateauPending || paradoxOpened || machineOpened || siliconOpened || synthesisOpened || alexandrineOpened || apotheosisOpened)
        ? `<div class="plateau-hub" role="region" aria-label="${escapeHtml(hubHeading)}">
            <p class="plateau-hub__eyebrow">${escapeHtml(hubHeading)}</p>
            <p class="plateau-hub__lede">${escapeHtml(hubLede)}</p>
            <div class="plateau-hub__actions">
              ${paradoxBtn}
              ${machineBtn}
              ${siliconBtn}
              ${synthesisBtn}
              ${alexandrineBtn}
              ${apotheosisBtn}
              ${daily
                ? `<button type="button" class="secondary chapter-quick-actions__btn" id="btn-plateau-daily"
                    aria-label="${escapeHtml(PLATEAU_COPY.dailyCta)}: ${escapeHtml(daily.title)}">
                    ${escapeHtml(PLATEAU_COPY.dailyCta)}
                    <span class="plateau-hub__meta">${escapeHtml(daily.title)}</span>
                  </button>`
                : ''}
              <button type="button" class="secondary chapter-quick-actions__btn" id="btn-plateau-duel">
                ${escapeHtml(PLATEAU_COPY.duelCta)}
              </button>
            </div>
          </div>`
        : ''
      chapterQuickActions.innerHTML = `${resumeBtn}${plateauBlock}`
      chapterQuickActions.classList.remove('hidden')
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-resume-recovered')?.addEventListener('click', () => {
        const ok = flow.resumeRecoverableSession()
        if (ok) {
          openLab()
          updateAdvance(flow)
        }
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-daily')?.addEventListener('click', async () => {
        if (!daily) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.dailyCalculus)
          if (!ok) return
        }
        flow.jumpToScene(daily.chapterIndex, daily.sceneIndex)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-duel')?.addEventListener('click', () => {
        showDuel()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-paradox')?.addEventListener('click', async () => {
        if (ch4Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch4Index)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-machine')?.addEventListener('click', async () => {
        if (ch5Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch5Index)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-silicon')?.addEventListener('click', async () => {
        if (ch6Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch6Index)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-synthesis')?.addEventListener('click', async () => {
        if (ch7Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch7Index)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-alexandrine')?.addEventListener('click', async () => {
        if (ch8Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch8Index)
        openLab()
      })
      chapterQuickActions.querySelector<HTMLButtonElement>('#btn-plateau-apotheosis')?.addEventListener('click', async () => {
        if (ch9Index < 0) return
        const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
        if (mustConfirm) {
          const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
          if (!ok) return
        }
        flow.jumpToChapter(ch9Index)
        openLab()
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
        li.querySelector('button')?.addEventListener('click', async () => {
          const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
          if (mustConfirm) {
            const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
            if (!ok) return
          }
          flow.jumpToChapter(i)
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
    focusWithoutScroll(btnChaptersBack)
  }

  function showRewardBundles(bundles: RewardBundle[]) {
    showRewardBundlesUi(bundles, flow, play.latestResolvedForRecap, sfx, announcer, {
      openRewardOverlay,
      closeRewardOverlay,
      openLab,
      updateAdvance,
      maybeShowPendingChapterPrompt,
      clearLatestRecap: () => {
        play.latestResolvedForRecap = null
      },
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
    renderDuelUiUi({
      flow,
      duelList,
      duelPanel,
      rewardOverlayCtl,
      closeRewardOverlay,
      openRewardOverlay,
      openLab,
      updateAdvance,
      confirmReplaceSession: (copy) => confirmDialogCtl.open(copy),
      renderDuelLabBrief,
    })
  }

  function showDuel() {
    closeRewardOverlay()
    screenCtl.setLabOpen(false)
    flow.setLastScreen('chapters')
    screenCtl.setTopLevelScreen('duel')
    setNavActive('duel')
    renderDuelUi()
    focusWithoutScroll(duelList.querySelector<HTMLButtonElement>('.duel-row'))
  }

  function setBoardVisible(on: boolean) {
    boardPanel.classList.toggle('instrument-column--hidden', !on)
  }

  function renderActiveDuelLabBrief() {
    const active = flow.getActiveDuelBrief()
    if (!active) return
    renderDuelLabBrief(active.rival, active.variant, active.playerColor, active.difficulty)
    updateAdvance(flow)
  }

  function renderDuelLabBrief(
    rival: DuelRosterEntry,
    variant: DuelVariant,
    playerColor: 'w' | 'b',
    difficulty: 'novice' | 'balanced' | 'relentless',
  ) {
    const colorLabel = playerColor === 'w' ? 'White' : 'Black'
    const difficultyLabel =
      difficulty === 'novice'
        ? 'Novice'
        : difficulty === 'relentless'
          ? 'Relentless'
          : 'Balanced'
    const variantProfile = AI_PROFILES[variant.profileId]
    currentSceneType = null
    play.lastAdvanceSig = ''
    play.advanceWasReady = false
    play.lastLedgerKey = ''
    play.lastCalKey = ''
    play.lastCapturedFen = ''
    play.lastEvalScore = Number.NaN
    play.announcedOutcomeKey = ''
  play.recapShownForKey = ''

    app.querySelector('#play-chapter-label')!.textContent = `Duel Archive · ${rival.era}`
    app.querySelector('#play-chapter-title')!.textContent = rival.opponentName
    app.querySelector('#play-chapter-sub')!.textContent = variant.label
    app.querySelector('#play-philosophy')!.textContent = rival.quote
    applyLabOverlayCaption(labEraLabel, `Duel Archive · ${rival.era}`, 'Duel Archive')
    playScreen.setAttribute('data-theme', 'theme-ancient')
    playScreen.classList.add('screen-play--board-scene')
    document.getElementById('play-atelier')?.classList.toggle('play-atelier--solo', false)
    sceneProgress.textContent = `Duel · ${colorLabel}`
    sceneTag.textContent = `${variant.label} duel`

    narrativeBody.classList.remove('narrative-body--dialogue', 'narrative-body--interlude', 'narrative-body--no-fade')
    narrativeBody.scrollTop = 0
    clearPhoneLessonMarkers(narrativeBody)
    syncPhonePuzzleLesson(narrativeBody)
    chapterRail.classList.add('hidden')
    chapterRail.innerHTML = ''
    manuscriptPanel.classList.remove('manuscript-panel--with-rail')
    /* A duel is a full rated game vs a rival, same as a campaign match —
       show the engine-truthful eval bar and captured material so the
       learning feedback is consistent across both. */
    play.showEvalBar = true
    evalBarWrap.classList.remove('hidden')
    capturedTop.classList.remove('hidden')
    capturedBot.classList.remove('hidden')
    capturedTop.innerHTML = ''
    capturedBot.innerHTML = ''
    calibrationRail.classList.add('hidden')
    moveLedger.innerHTML = ''
    boardStage.classList.remove('board-stage--victory', 'board-stage--loss')
    setBoardVisible(true)
    play.pendingBoardReveal = true
    btnReset.disabled = false
    btnNext.disabled = true
    btnNext.classList.remove('primary--ready')
    btnNext.classList.add('hidden')
    btnNextHint.textContent = ''
    lessonNote.textContent = 'Duel results are recorded in the archive and shape future rival memory.'

    narrativeBody.innerHTML = `
      <div class="match-card">
        <div class="match-card__top">
          <div class="match-card__header">
            <span class="match-card__vs">Duel</span>
            <strong class="match-card__name">${escapeHtml(rival.opponentName)}</strong>
          </div>
          <div class="match-card__meta">
            <span>${escapeHtml(difficultyLabel)}</span>
            <span>${escapeHtml(colorLabel)} pieces</span>
          </div>
        </div>
        <p class="opponent-note dossier-quote">"${escapeHtml(rival.quote)}"</p>
        <p class="opponent-note">${escapeHtml(variant.bio)}</p>
        ${variantProfile ? aiTraitBars(variantProfile) : ''}
        <p class="match-mandate">No move cap. Play until checkmate or a true dead draw.</p>
        <div class="reward-card">
          <h4>Counter-Prep Briefing</h4>
          <ul>
            <li><strong>Strengths:</strong> ${escapeHtml(rival.strengths)}</li>
            <li><strong>Weaknesses:</strong> ${escapeHtml(rival.weaknesses)}</li>
            <li><strong>Style:</strong> ${rival.styleTags.map((tag) => escapeHtml(tag)).join(' · ')}</li>
          </ul>
        </div>
      </div>`
    window.requestAnimationFrame(syncNarrativeFade)
    revealBoardScene()
  }

  /* ─── renderScene ─────────────────────────────────────────────── */
  function renderScene(chapter: Chapter, scene: Scene, sceneIndex: number) {
    renderSceneUi(chapter, scene, sceneIndex, mountDom, play, flow, {
      setBoardVisible,
      updateAdvance,
      syncNarrativeFade,
      revealBoardScene,
    })
    scheduleDialogueReveal(scene)
  }

  function clearDialogueRevealTimer() {
    if (!dialogueRevealTimer) return
    window.clearTimeout(dialogueRevealTimer)
    dialogueRevealTimer = 0
  }

  function prefersInstantDialogue(): boolean {
    const html = document.documentElement
    return (
      html.classList.contains('force-reduced-motion') ||
      html.classList.contains('perf-lean') ||
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    )
  }

  function msFromStyle(value: string): number {
    const n = Number(value.trim().replace(/ms$/i, ''))
    return Number.isFinite(n) ? n : 0
  }

  function currentDialogueRevealMs(): number {
    let longest = 0
    for (const line of [...narrativeBody.querySelectorAll<HTMLElement>('.line')]) {
      const authoredDuration = Number(line.dataset.spokenDurationMs)
      if (Number.isFinite(authoredDuration) && authoredDuration > 0) {
        longest = Math.max(longest, authoredDuration)
        continue
      }
      const lineDelay = msFromStyle(line.style.getPropertyValue('--line-delay'))
      const charCount = line.querySelectorAll('.spoken-char').length
      if (charCount <= 0) continue
      longest = Math.max(longest, lineDelay + Math.max(0, charCount - 1) * 6 + 220)
    }
    return Math.min(6000, Math.max(0, longest))
  }

  function scheduleDialogueReveal(scene: Scene) {
    clearDialogueRevealTimer()
    narrativeBody.classList.remove('narrative-body--revealed')
    const hasAnimatedText = scene.type === 'dialogue' && narrativeBody.querySelector('.spoken-char') !== null
    dialogueRevealDone = !hasAnimatedText || prefersInstantDialogue()
    narrativeBody.classList.toggle('narrative-body--revealed', dialogueRevealDone)
    if (!dialogueRevealDone) {
      dialogueRevealTimer = window.setTimeout(() => {
        dialogueRevealTimer = 0
        revealDialogueNow(false)
      }, currentDialogueRevealMs())
    }
    updateAdvance(flow)
  }

  function revealDialogueNow(announce = true) {
    clearDialogueRevealTimer()
    dialogueRevealDone = true
    narrativeBody.classList.add('narrative-body--revealed')
    for (const el of [...narrativeBody.querySelectorAll<HTMLElement>('.spoken-char, .line--stagger')]) {
      el.style.animation = 'none'
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
    updateAdvance(flow)
    if (announce) announcer.say('Passage fully revealed. Advance when ready.')
  }

  function advanceOrReveal() {
    if (!flow.canAdvance()) return
    if (currentSceneType === 'dialogue' && !dialogueRevealDone) {
      revealDialogueNow()
      return
    }
    sfx.playEventSfx('advance')
    flow.advanceScene()
    updateAdvance(flow)
  }

  function revealBoardScene() {
    window.requestAnimationFrame(() => {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const compact = window.matchMedia?.(COMPACT_MEDIA_QUERY).matches
      if (!compact) playScreen.scrollTop = 0
      const target = compact ? boardStage : moveLedger
      if (!target || typeof target.scrollIntoView !== 'function') return
      try {
        target.scrollIntoView({ block: compact ? 'nearest' : 'end', behavior: reduce ? 'auto' : 'smooth' })
      } catch {
        target.scrollIntoView(true)
      }
      window.requestAnimationFrame(() => mobileBoardFit.apply())
    })
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

  function isNarrativeScene() {
    return (
      currentSceneType === 'dialogue' ||
      currentSceneType === 'interlude' ||
      currentSceneType === 'codex'
    )
  }

  function updateAdvance(g: GameFlow) {
    const ok = g.canAdvance()
    const narrative = isNarrativeScene()
    const revealPending = ok && currentSceneType === 'dialogue' && !dialogueRevealDone
    const hint = ok && !narrative ? nextSceneHint() : ''
    const sig = `${ok}|${currentSceneType ?? ''}|${hint}|${revealPending}`
    if (sig === play.lastAdvanceSig) return
    const becameReady = ok && !play.advanceWasReady
    play.advanceWasReady = ok
    play.lastAdvanceSig = sig
    btnNext.disabled = !ok
    btnNext.classList.toggle('primary--ready', ok)
    if (ok || narrative) btnNextHint.textContent = ok && !narrative && hint ? `→ ${hint}` : ''
    const blockedProof = !ok && !narrative
    btnNextLabel.textContent = revealPending ? 'Reveal' : blockedProof ? 'Prove' : 'Advance'
    btnNext.setAttribute('aria-label', revealPending ? 'Reveal dialogue' : blockedProof ? 'Finish proof' : 'Advance')
    if (revealPending) btnNextHint.textContent = 'then Advance'
    /* On board scenes the Advance button lives below the board, ledger and
     * tools. When the objective is met mid-play (checkmate, puzzle solved,
     * calibration target reached), pull the now-enabled button into view so
     * it is reachable without hunting — critical on small phone screens. */
    if (becameReady && !narrative) {
      window.requestAnimationFrame(() => {
        if (typeof btnNext.scrollIntoView !== 'function') return
        try {
          const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          btnNext.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
        } catch {
          btnNext.scrollIntoView(false)
        }
      })
    }
  }

  /* Toggles the bottom scroll-fade on the bounded narrative body so players
   * can tell when dialogue continues below the fold (mobile no-board scenes). */
  function syncNarrativeFade() {
    if (!isNarrativeScene()) return
    const overflowing = narrativeBody.scrollHeight > narrativeBody.clientHeight + 4
    const atBottom =
      narrativeBody.scrollTop + narrativeBody.clientHeight >= narrativeBody.scrollHeight - 4
    narrativeBody.classList.toggle('narrative-body--no-fade', !overflowing || atBottom)
  }
  narrativeBody.addEventListener('scroll', syncNarrativeFade, { passive: true })
  window.addEventListener('resize', () => window.requestAnimationFrame(syncNarrativeFade), {
    passive: true,
  })

  /* ─── Keyboard shortcuts ─────────────────────────────────────── */
  let keyboardHelpOpen = false
  function showKeyboardHelp() {
    keyboardHelpOpen = true
    openRewardOverlay(
      `<div class="reward-sheet reward-sheet--kbdhelp">
         <div class="reward-hero">
           <span class="reward-hero__sigil" aria-hidden="true">⌨</span>
           <div>
             <p class="section-heading">${escapeHtml(KEYBOARD_HELP_HEADING)}</p>
             <p class="reward-hero__copy">Every shortcut available without leaving the keyboard.</p>
           </div>
         </div>
         <div class="kbd-help-grid" aria-label="Keyboard shortcuts">
           <dl>
             <dt><kbd>Enter</kbd> · <kbd>Space</kbd></dt>
             <dd>Advance the current scene (when not focused on the board).</dd>
             <dt><kbd>Esc</kbd></dt>
             <dd>Close this overlay; otherwise exit the lab to the chapters index.</dd>
             <dt><kbd>?</kbd></dt>
             <dd>Open or close this help overlay.</dd>
           </dl>
           <dl>
             <dt><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></dt>
             <dd>Move focus on the chess board, one square at a time.</dd>
             <dt><kbd>Home</kbd> · <kbd>End</kbd></dt>
             <dd>Jump to the near corners (a8 / h1).</dd>
             <dt><kbd>Enter</kbd> · <kbd>Space</kbd></dt>
             <dd>Activate the focused square (select piece, then a target).</dd>
           </dl>
           <dl>
             <dt>Promotion: <kbd>←</kbd> <kbd>→</kbd></dt>
             <dd>Cycle Queen → Rook → Bishop → Knight.</dd>
             <dt><kbd>Enter</kbd></dt>
             <dd>Confirm the focused promotion piece.</dd>
             <dt><kbd>Esc</kbd></dt>
             <dd>Cancel the promotion (no move is made).</dd>
           </dl>
         </div>
         <div class="echo-controls">
           <button type="button" class="primary" id="btn-kbdhelp-close">Close</button>
         </div>
       </div>`,
      (root) => {
        root.querySelector<HTMLButtonElement>('#btn-kbdhelp-close')?.addEventListener('click', () => {
          keyboardHelpOpen = false
          closeRewardOverlay()
        })
      },
      () => {
        keyboardHelpOpen = false
      },
    )
  }
  function toggleKeyboardHelp() {
    if (keyboardHelpOpen) {
      keyboardHelpOpen = false
      closeRewardOverlay()
    } else if (!rewardOverlayCtl.isOpen()) {
      showKeyboardHelp()
    }
  }

  attachGlobalShortcuts(window, {
    isConfirmOpen: () => confirmDialogCtl.isOpen(),
    closeConfirm: () => confirmDialogCtl.close(),
    isRewardOverlayOpen: () => rewardOverlayCtl.isOpen(),
    isLabActive: () => labOverlay.classList.contains('lab-overlay--active'),
    closeRewardOverlay,
    exitLab: () => {
      afterLeaveLab(showChapters, 'chapters')
    },
    canAdvance: () => flow.canAdvance(),
    advance: advanceOrReveal,
    toggleKeyboardHelp,
  })

  /* ─── Event listeners ────────────────────────────────────────── */
  btnResume.addEventListener('click', () => {
    if (!hasSave()) return
    showChapters()
  })
  btnEnterArchive.addEventListener('click', () => { showChapters() })
  btnNew.addEventListener('click', async () => {
    if (hasSave()) {
      const ok = await confirmDialogCtl.open(CONFIRM_COPY.newChronicle)
      if (!ok) return
    }
    clearSave()
    flow.newGame()
    syncTitleSkinSelect()
    syncTitleRating()
    showChapters()
  })
  btnTitle.addEventListener('click', () => {
    afterLeaveLab(showTitle, 'title')
  })
  btnChapters.addEventListener('click', () => {
    afterLeaveLab(showChapters, 'chapters')
  })
  btnDuel.addEventListener('click', () => {
    afterLeaveLab(showDuel, 'duel')
  })
  btnChaptersBack.addEventListener('click', () => {
    showTitle()
  })
  btnVestibule.addEventListener('click', () => {
    afterLeaveLab(showChapters, 'chapters')
  })
  btnSfx.addEventListener('click', () => {
    sfx.setEnabled(!sfx.enabled)
    writePreference(SFX_PREF_KEY, sfx.enabled ? '1' : '0')
    syncPreferenceButtons()
    if (sfx.enabled) sfx.unlock()
  })
  btnMoveGuard.addEventListener('click', () => {
    moveGuardEnabled = !moveGuardEnabled
    writePreference(MOVE_GUARD_PREF_KEY, moveGuardEnabled ? '1' : '0')
    syncPreferenceButtons()
    flow.board?.setMoveGuard(moveGuardEnabled)
  })
  btnTitleSfx.addEventListener('click', () => {
    sfx.setEnabled(!sfx.enabled)
    writePreference(SFX_PREF_KEY, sfx.enabled ? '1' : '0')
    syncPreferenceButtons()
    if (sfx.enabled) sfx.unlock()
  })
  btnTitleMoveGuard.addEventListener('click', () => {
    moveGuardEnabled = !moveGuardEnabled
    writePreference(MOVE_GUARD_PREF_KEY, moveGuardEnabled ? '1' : '0')
    syncPreferenceButtons()
    flow.board?.setMoveGuard(moveGuardEnabled)
  })
  btnTitleMotion.addEventListener('click', () => {
    const forced = readPreference(MOTION_PREF_KEY) === '1'
    writePreference(MOTION_PREF_KEY, forced ? '0' : '1')
    applyMotionPreference()
    refreshDocumentUiProfile()
    syncPreferenceButtons()
  })
  btnTitleAiWorker.addEventListener('click', () => {
    cycleAiSearchSurfacePreference()
    syncPreferenceButtons()
  })
  btnTitleVisual.addEventListener('click', () => {
    cycleVisualQualityPreference()
    refreshDocumentUiProfile()
    syncPreferenceButtons()
  })
  titleSkinSelect.addEventListener('change', () => {
    const val = (titleSkinSelect.value ?? 'classic-royal') as PieceSkinId
    flow.setPieceSkin(val)
  })
  btnTitleKbdhelp.addEventListener('click', () => showKeyboardHelp())
  btnLabKbdhelp.addEventListener('click', () => showKeyboardHelp())
  btnStorageBannerDismiss.addEventListener('click', () => {
    storageFailureBanner.classList.add('hidden')
  })
  if (streakBoot.persistOk === false) showStorageFailureBanner()
  btnRecoveryDismiss.addEventListener('click', () => {
    flow.dismissSessionRecoveredNotice()
  })
  btnRecoveryRestore.addEventListener('click', () => {
    flow.restoreStablePosition()
    updateAdvance(flow)
  })
  btnNext.addEventListener('click', advanceOrReveal)
  btnSkipAhead.addEventListener('click', async () => {
    const target = Number(btnSkipAhead.dataset.target)
    if (!Number.isInteger(target)) return
    const mustConfirm = flow.hasRecoverableSession() || flow.hasUnsavedPassageProgress()
    if (mustConfirm) {
      const ok = await confirmDialogCtl.open(CONFIRM_COPY.replaceRecoveredSession)
      if (!ok) return
    }
    sfx.playEventSfx('advance')
    flow.jumpToScene(flow.chapterIndex, target)
    window.requestAnimationFrame(() => mobileBoardFit.apply())
  })
  btnUndo.addEventListener('click', () => { sfx.playEventSfx('undo'); flow.undo(); updateAdvance(flow) })
  btnRunBack.addEventListener('click', () => {
    sfx.playEventSfx('advance')
    if (flow.retryCurrentBattle()) updateAdvance(flow)
  })
  btnReset.addEventListener('click', () => { flow.resetChessScene(); updateAdvance(flow) })
  btnHint.addEventListener('click', () => { sfx.playEventSfx('undo'); flow.requestHint() })

  let advanceTicker = 0
  const scheduleAdvanceTick = () => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return
    if (advanceTicker) window.clearTimeout(advanceTicker)
    const delay = document.hidden ? 2500 : 350
    advanceTicker = window.setTimeout(runAdvanceTick, delay)
  }
  const runAdvanceTick = () => {
    advanceTicker = 0
    if (typeof document === 'undefined') return
    if (!document.hidden) updateAdvance(flow)
    scheduleAdvanceTick()
  }
  runAdvanceTick()
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flow.flushDeferredIO()
    else updateAdvance(flow)
  })
  window.addEventListener('beforeunload', () => {
    clearDialogueRevealTimer()
    if (advanceTicker) window.clearTimeout(advanceTicker)
    closeRewardOverlay()
    flow.flushDeferredIO()
  })
  window.addEventListener('pagehide', () => {
    flow.flushDeferredIO()
  })
  syncPreferenceButtons()
  applyMotionPreference()

  syncTitleButtons()
  syncMvpFlag()
  syncTitleRating()
  syncDailyRibbon()

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
