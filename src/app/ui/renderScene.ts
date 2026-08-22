import type { Chapter, MatchScene, Scene } from '../../types'
import { escapeHtml } from '../htmlEscape'
import {
  aiTraitBars,
  diffStars,
  labelForSpeaker,
  speakerCadenceMs,
  speakerSigilFor,
  speakerVoiceFor,
  spokenLineDurationMs,
  spokenLineText,
  storyBeatBlock,
  teachingBlock,
  tierLabel,
  showsEvalHud,
  syncEvalBarScale,
} from '../mainUiFormatters'
import { buildChapterRail, buildLadderTrack } from '../play/chapterRail'
import { prosePeekSkipIndex } from '../play/skipAhead'
import { resolveProfileByMatchId } from '../../chess/aiProfiles'
import type { GameFlow } from '../gameFlow'
import type { MountDomRefs, MountPlayState } from '../mountContext'
import { syncPhoneDossierFolds, syncPhoneHitTarget, syncPhonePuzzleLesson } from '../labModal'

export type RenderSceneCallbacks = {
  setBoardVisible: (on: boolean) => void
  updateAdvance: (flow: GameFlow) => void
  syncNarrativeFade: () => void
  revealBoardScene: () => void
}

export function renderScene(
  chapter: Chapter,
  scene: Scene,
  sceneIndex: number,
  dom: MountDomRefs,
  play: MountPlayState,
  flow: GameFlow,
  callbacks: RenderSceneCallbacks,
): void {
  dom.app.querySelector('#play-chapter-label')!.textContent = `${chapter.title} · ${chapter.era}`
  dom.app.querySelector('#play-chapter-title')!.textContent = chapter.subtitle
  dom.app.querySelector('#play-chapter-sub')!.textContent = chapter.title
  dom.app.querySelector('#play-philosophy')!.textContent = chapter.philosophy
  dom.playScreen.setAttribute('data-theme', chapter.themeClass)
  
  const total = chapter.scenes.length
  dom.sceneProgress.textContent = `Passage ${sceneIndex + 1} · ${total}`
  
  dom.lessonNote.textContent = ''
  dom.coachTipEl.classList.add('hidden')
  play.prevSanLen = 0
  play.lastLedgerKey = ''
  play.lastCapturedFen = ''
  play.lastCalKey = ''
  play.lastEvalScore = Number.NaN
  play.lastAdvanceSig = ''
  play.advanceWasReady = false
  dom.narrativeBody.classList.remove('narrative-body--no-fade')
  dom.narrativeBody.scrollTop = 0
  play.announcedOutcomeKey = ''
  play.recapShownForKey = ''
  dom.btnReset.disabled = true
  dom.btnNext.classList.remove('hidden')
  dom.btnNextHint.textContent = ''
  const showBoard = flow.sceneUsesBoard(scene)
  dom.playScreen.classList.toggle('screen-play--board-scene', showBoard)
  play.pendingBoardReveal = showBoard
  /* Onboarding accelerator: in the opening prologue only, let a reader who
     knows the rules collapse a run of pure prose and reach the first board
     in one tap. Never offered past the prologue (the story stays intact),
     and never skips a puzzle/calibration/match (prosePeekSkipIndex lands
     ON the board, not past it). */
  const skipTarget = flow.chapterIndex === 0 ? prosePeekSkipIndex(chapter.scenes, sceneIndex) : null
  if (skipTarget !== null) {
    dom.btnSkipAhead.dataset.target = String(skipTarget)
    dom.btnSkipAhead.classList.remove('hidden')
  } else {
    delete dom.btnSkipAhead.dataset.target
    dom.btnSkipAhead.classList.add('hidden')
  }
  syncPhoneHitTarget(dom.btnSkipAhead, skipTarget !== null)
  dom.app.querySelector('#play-atelier')?.classList.toggle('play-atelier--solo', !showBoard)
  callbacks.setBoardVisible(showBoard)
  dom.narrativeBody.classList.toggle('narrative-body--dialogue', scene.type === 'dialogue')
  const showRail = scene.type === 'match'
  dom.chapterRail.classList.toggle('hidden', !showRail)
  dom.manuscriptPanel.classList.toggle('manuscript-panel--with-rail', showRail)
  if (showRail) {
    dom.chapterRail.innerHTML = buildChapterRail(chapter, scene.id, flow.completedSceneIds)
  } else {
    dom.chapterRail.innerHTML = ''
  }
  
  /* Teaching puzzles keep command + marble + take-back. Phone calibration
     docks Prove the same way. The chapter crawl, empty ledger, sound row,
     and duplicate lesson line are match chrome. */
  const teachingPuzzle = scene.type === 'puzzle'
  dom.app.querySelector('.play-crawl')?.classList.toggle('hidden', teachingPuzzle)
  dom.moveLedger.closest('.move-ledger-wrap')?.classList.toggle('hidden', teachingPuzzle)
  const togglesHidden = teachingPuzzle
  dom.app.querySelector('.instrument-toggles')?.classList.toggle('hidden', togglesHidden)
  syncPhoneHitTarget(dom.app.querySelector('#btn-sfx'), !togglesHidden)
  syncPhoneHitTarget(dom.app.querySelector('#btn-move-guard'), !togglesHidden)
  dom.lessonNote.classList.toggle('hidden', teachingPuzzle)
  if (teachingPuzzle) {
    dom.narrativeBody.setAttribute('data-puzzle-lesson', '')
  } else {
    dom.narrativeBody.removeAttribute('data-puzzle-lesson')
  }
  if (scene.type === 'calibration') {
    dom.narrativeBody.setAttribute('data-calibration-lesson', '')
  } else {
    dom.narrativeBody.removeAttribute('data-calibration-lesson')
  }

  /* Hide eval bar and captured rows outside rated / rehearsal boards */
  play.showEvalBar = showsEvalHud(scene.type)
  dom.evalBarWrap.classList.toggle('hidden', !play.showEvalBar)
  syncEvalBarScale(dom.evalBarWrap, dom.evalBarScore, play.showEvalBar)
  dom.capturedTop.classList.toggle('hidden', !play.showEvalBar)
  dom.capturedBot.classList.toggle('hidden', !play.showEvalBar)
  if (!play.showEvalBar) {
    dom.capturedTop.innerHTML = ''
    dom.capturedBot.innerHTML = ''
    dom.evalBarScore.textContent = '0.0'
    dom.evalBarFill.style.height = '50%'
    play.lastCapturedFen = ''
    play.lastEvalScore = Number.NaN
  }
  
  dom.boardStage.classList.remove('board-stage--victory', 'board-stage--loss')
  
  if (!showBoard) {
    dom.boardStatus.textContent = ''
    dom.turnPulseEl.textContent = ''
    dom.moveCounterEl.textContent = ''
    dom.moveLedger.innerHTML = ''
    play.lastLedgerKey = ''
    dom.calibrationRail.classList.add('hidden')
    flow.board?.setCheckSquare(null)
  }
  
  if (scene.type === 'dialogue') {
    dom.sceneTag.textContent = 'Dialogue'
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    let lineDelayMs = 90
    dom.narrativeBody.innerHTML = storyBeatBlock(scene.storyBeat) + scene.lines
      .map((l, i) => {
        const delayMs = lineDelayMs
        const durationMs = spokenLineDurationMs(l.text, l.speaker, delayMs)
        const talkMs = Math.max(420, durationMs - delayMs)
        lineDelayMs += Math.min(1600, talkMs + 170)
        return `<div class="line line--stagger" data-voice="${escapeHtml(speakerVoiceFor(l.speaker))}" data-spoken-duration-ms="${durationMs}" style="--d:${i}; --line-delay:${delayMs}ms; --line-talk-ms:${talkMs}ms">
          <span class="speaker-seal" aria-hidden="true">${escapeHtml(speakerSigilFor(l.speaker))}</span>
          <span class="who" data-speaker="${escapeHtml(l.speaker)}">${escapeHtml(labelForSpeaker(l.speaker))}</span>
          <p class="said">${spokenLineText(l.text, speakerCadenceMs(l.speaker))}</p>
        </div>`
      })
      .join('')
  } else if (scene.type === 'interlude') {
    dom.sceneTag.textContent = 'Interlude'
    dom.narrativeBody.classList.add('narrative-body--interlude')
    dom.narrativeBody.innerHTML = storyBeatBlock(scene.storyBeat) + scene.lines
      .map(
        (t, i) =>
          `<p class="interlude-line interlude-line--stagger" style="--d:${i}">${escapeHtml(t)}</p>`,
      )
      .join('')
  } else if (scene.type === 'codex') {
    dom.sceneTag.textContent = scene.heading
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = storyBeatBlock(scene.storyBeat) + scene.entries
      .map(
        (e, i) =>
          `<div class="codex-entry" style="animation:line-in 0.5s var(--ease-out) ${i * 0.07}s both"><h4>${escapeHtml(e.term)}</h4><p>${escapeHtml(e.body)}</p></div>`,
      )
      .join('')
  } else if (scene.type === 'puzzle') {
    dom.sceneTag.textContent = scene.title
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `${storyBeatBlock(scene.storyBeat)}<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
      scene.teaching ? teachingBlock(scene.teaching) : ''
    }${scene.hint ? `<p class="hint-block"><span class="hint-label">Hint</span> ${escapeHtml(scene.hint)}</p>` : ''}`
    dom.lessonNote.textContent = 'Solve the board objective. Take back to retry; Advance unlocks when the proof is clean.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = 'Requires objective met'
  } else if (scene.type === 'match') {
    const tier = scene.ladderTier ? tierLabel(scene.ladderTier) : ''
    const tierClass = scene.ladderTier ?? ''
    const ladderTrack = buildLadderTrack(chapter, scene.id, flow.completedSceneIds)
    const aiProfile = resolveProfileByMatchId(scene.id)
    dom.sceneTag.textContent = scene.title
  
    /* Count match number and total */
    const matchScenes = chapter.scenes.filter(s => s.type === 'match') as MatchScene[]
    const matchIdx = matchScenes.findIndex(m => m.id === scene.id)
    const matchNum = matchIdx >= 0 ? matchIdx + 1 : 1
    const matchTotal = matchScenes.length
  
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `
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
        ${storyBeatBlock(scene.storyBeat)}
        <p class="opponent-note">${escapeHtml(scene.opponentNote)}</p>
        ${aiTraitBars(aiProfile)}
        <p class="match-mandate">No move cap. Play until checkmate or a true dead draw. You command the White pieces.</p>
      </div>`
    dom.lessonNote.textContent =
      scene.aiStyle === 'romantic'
        ? 'Weather the first wave: castle, finish development, make every sacrifice prove its debt.'
        : scene.aiStyle === 'classical'
          ? 'Stop their idea early: watch weak squares, contest outposts, convert without inventing drama.'
          : scene.aiStyle === 'hypermodern'
            ? 'Occupy only what you can defend: finish development, contest the long diagonal, punish overextension.'
            : scene.aiStyle === 'alexandrine' || scene.aiStyle === 'apotheosis'
              ? 'Quiet moves decide this: keep structure, deny loose pieces, convert without drift.'
              : 'Use the ancient laws: develop, castle early, keep every piece defended.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = 'Requires victory'
  } else if (scene.type === 'calibration') {
    dom.sceneTag.textContent = scene.title
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `${
      scene.teaching ? teachingBlock(scene.teaching) : ''
    }<p class="hint-block"><span class="hint-label">Target</span> ${scene.minMovesByPlayer} moves as White. The Archive answers at random.</p><p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${storyBeatBlock(scene.storyBeat)}`
    dom.lessonNote.textContent = 'White moves are tallied on the rail; the Lab is listening.'
    dom.btnReset.disabled = false
    const left = scene.minMovesByPlayer
    dom.btnNextHint.textContent = left === 1 ? '1 remaining' : `${left} remaining`
  } else if (scene.type === 'freeplay') {
    dom.sceneTag.textContent = scene.title
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `${storyBeatBlock(scene.storyBeat)}<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
      scene.teaching ? teachingBlock(scene.teaching) : ''
    }`
    dom.lessonNote.textContent = 'Use either side freely. Advance returns to the vestibule.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = 'Leave when ready'
  }
  
  /* Dock/restore Prove on every scene so leaving a phone puzzle or the
     opening calibration unhides the manuscript and puts Advance back. */
  syncPhonePuzzleLesson(dom.narrativeBody)
  syncPhoneDossierFolds(dom.narrativeBody)
  callbacks.updateAdvance(flow)
  window.requestAnimationFrame(callbacks.syncNarrativeFade)
  if (showBoard) callbacks.revealBoardScene()
}
