import type { Chapter, Scene } from '../../types'
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
} from '../mainUiFormatters'
import { buildChapterRail, buildLadderTrack } from '../play/chapterRail'
import { resolveProfileByMatchId } from '../../chess/aiProfiles'
import type { GameFlow } from '../gameFlow'
import type { MountDomRefs, MountPlayState } from '../mountContext'
import type { MatchScene } from '../../types'

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
  dom.btnReset.disabled = true
  dom.btnNext.classList.remove('hidden')
  dom.btnNextHint.textContent = ''
  const showBoard = flow.sceneUsesBoard(scene)
  dom.playScreen.classList.toggle('screen-play--board-scene', showBoard)
  play.pendingBoardReveal = showBoard
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
  
  /* Hide eval bar and captured rows outside match mode */
  play.showEvalBar = scene.type === 'match'
  dom.evalBarWrap.classList.toggle('hidden', !play.showEvalBar)
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
    dom.narrativeBody.innerHTML = storyBeatBlock(scene.storyBeat) + scene.lines
      .map((l, i) => {
        const lineDelayMs = i * 190 + 90
        const durationMs = spokenLineDurationMs(l.text, l.speaker, lineDelayMs)
        const talkMs = Math.max(420, durationMs - lineDelayMs)
        return `<div class="line line--stagger" data-voice="${escapeHtml(speakerVoiceFor(l.speaker))}" data-spoken-duration-ms="${durationMs}" style="--d:${i}; --line-delay:${lineDelayMs}ms; --line-talk-ms:${talkMs}ms">
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
    dom.lessonNote.textContent =
      'Meet the objective on the board. Use Take back to retry. Seal with Advance when the goal is met.'
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
        ? 'Survive the first wave: shelter the king, finish development, then make the sacrifice prove itself.'
        : scene.aiStyle === 'alexandrine' || scene.aiStyle === 'apotheosis'
          ? 'Every quiet move matters here: keep structure, deny loose pieces, and convert without drift.'
          : 'Apply the ancient laws — develop, castle early, avoid loose pieces.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = 'Requires victory'
  } else if (scene.type === 'calibration') {
    dom.sceneTag.textContent = scene.title
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `${storyBeatBlock(scene.storyBeat)}<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
      scene.teaching ? teachingBlock(scene.teaching) : ''
    }<p class="hint-block"><span class="hint-label">Target</span> ${scene.minMovesByPlayer} moves as White. The trainer answers at random.</p>`
    dom.lessonNote.textContent = 'Each of your moves is tallied on the right — the Lab is listening.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = `${scene.minMovesByPlayer} White moves`
  } else if (scene.type === 'freeplay') {
    dom.sceneTag.textContent = scene.title
    dom.narrativeBody.classList.remove('narrative-body--interlude')
    dom.narrativeBody.innerHTML = `${storyBeatBlock(scene.storyBeat)}<p class="lesson-lead">${escapeHtml(scene.lesson)}</p>${
      scene.teaching ? teachingBlock(scene.teaching) : ''
    }`
    dom.lessonNote.textContent = 'Alternate sides as in a living game. Advance returns to the vestibule.'
    dom.btnReset.disabled = false
    dom.btnNextHint.textContent = 'Leave when ready'
  }
  
  callbacks.updateAdvance(flow)
  window.requestAnimationFrame(callbacks.syncNarrativeFade)
  if (showBoard) callbacks.revealBoardScene()
}
