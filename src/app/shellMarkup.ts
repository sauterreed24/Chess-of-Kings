/** Static application shell markup injected into `#app` on boot. */
export function getShellMarkup(): string {
  return `
    <div class="ambient" aria-hidden="true">
      <div class="ambient__bloom ambient__bloom--a"></div>
      <div class="ambient__bloom ambient__bloom--b"></div>
      <div class="ambient__bloom ambient__bloom--c"></div>
      <div class="ambient__grid"></div>
      <div class="ambient__grain"></div>
      <div class="ambient__vignette"></div>
    </div>

    <main id="shell" tabindex="-1" aria-label="The Calculus of Kings">
      <header class="top-bar">
        <div class="top-bar__brand">
          <span class="mark">The Calculus of Kings</span>
          <span class="mark-sub">Long Reign Commonwealth · Historia Lapidea</span>
        </div>
        <nav class="top-nav" aria-label="Primary navigation">
          <button type="button" class="ghost ghost--nav" id="btn-title" aria-current="page">Title</button>
          <button type="button" class="ghost ghost--nav" id="btn-chapters">Chapters</button>
          <button type="button" class="ghost ghost--nav" id="btn-duel">Duel</button>
        </nav>
      </header>

      <section id="screen-title" class="screen screen--title">
        <div class="title-hero">
          <div class="title-hero__plate">
            <div class="title-ornament" aria-hidden="true">
              <svg class="title-ornament__map" viewBox="0 0 220 34" focusable="false" style="width:min(100%,15.5rem);height:1.85rem;color:#c9a96a">
                <path d="M4 17h46l22-12 36 25 34-22 28 12h46" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".62"/>
                <path d="M72 5l36 25 34-22" fill="none" stroke="#2a6094" stroke-width="1" opacity=".5"/>
                <g fill="currentColor">
                  <circle cx="4" cy="17" r="2.5"/><circle cx="50" cy="17" r="3"/><circle cx="72" cy="5" r="3.4"/><circle cx="108" cy="30" r="3.4"/><circle cx="142" cy="8" r="3.4"/><circle cx="170" cy="20" r="3"/><circle cx="216" cy="17" r="2.5"/>
                </g>
                <path d="M110 11l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#e8c97e" opacity=".78"/>
              </svg>
            </div>
            <p class="kicker">A civic proof from the Long Reign</p>
            <h1 class="display-title">The Calculus of Kings</h1>
            <p class="title-tagline">In Reed's modern commonwealth, chess proves who can rule.</p>
            <p class="lede">Enter an archive-university where Alexander III's Long Reign made chaturanga the public language of judgment, law, and rival doctrine.</p>
            <div class="title-stats" aria-label="Game highlights">
              <span><strong>Campaign</strong><small>doctrinal trials</small></span>
              <span><strong>Duel Archive</strong><small>living rivals</small></span>
              <span><strong>Stratarchia</strong><small>rated judgment</small></span>
            </div>
            <div class="title-stats title-world-panel" aria-label="Modern Alexandrine world markers">
              <span><strong>Alexandrine Reckoning</strong><small>2341 A.S.</small></span>
              <span><strong>Commonwealth Terminal</strong><small>brass civic mesh</small></span>
              <span><strong>Archive University</strong><small>seed access pending</small></span>
            </div>
            <div class="title-actions" id="title-actions-save">
              <button type="button" class="primary" id="btn-resume">Resume expedition</button>
              <button type="button" class="secondary" id="btn-new">New chronicle</button>
            </div>
            <div class="title-actions hidden" id="title-actions-fresh">
              <button type="button" class="primary" id="btn-enter-archive">Enter the Archive</button>
            </div>
            <p class="mvp-note" id="mvp-flag"></p>
            <p class="title-rating hidden" id="title-rating" aria-live="polite"></p>
            <div class="daily-ribbon hidden" id="daily-ribbon" aria-live="polite"></div>
            <section class="title-settings" id="title-settings" aria-label="Settings">
              <h2 class="title-settings__heading">Settings</h2>
              <div class="title-settings__grid">
                <button type="button" class="ghost ghost--sound" id="btn-title-sfx" aria-pressed="true">Sound: On</button>
                <button type="button" class="ghost ghost--sound" id="btn-title-move-guard" aria-pressed="false">Move Guard: Off</button>
                <label class="title-settings__field hidden" id="title-skin-field">
                  <span class="title-settings__label">Piece skin</span>
                  <select id="title-skin" class="title-settings__select"></select>
                </label>
                <button type="button" class="ghost ghost--sound" id="btn-title-motion" aria-pressed="false">Motion: System</button>
              </div>
            </section>
            <p class="title-privacy">
              <a class="title-privacy__link" href="./privacy.html" target="_blank" rel="noopener noreferrer">Privacy policy</a>
              <span aria-hidden="true"> · </span>
              <a class="title-privacy__link" href="./accessibility.html" target="_blank" rel="noopener noreferrer">Accessibility</a>
              <span aria-hidden="true"> · </span>
              <button type="button" class="title-privacy__link title-privacy__kbd" id="btn-title-kbdhelp">Keyboard atlas</button>
            </p>
          </div>
        </div>
      </section>

      <section id="screen-chapters" class="screen screen--chapters hidden">
        <div class="chapters-wrap">
          <button type="button" class="ghost chapters-back hidden" id="btn-chapters-back">← Return to title</button>
          <h2 class="section-heading">Chronicle index</h2>
          <div id="chapter-progress-slot"></div>
          <p class="chapters-lede">Choose an open passage. Each chamber is a school of rule: ancient duty, Romantic fire, and the later doctrines Alexander's surviving commonwealth taught the modern world to inherit.</p>
          <div class="title-stats chronicle-index-codex" aria-label="Long Reign thread">
            <span><strong>Long Reign</strong><small>Alexander lives into his eighties; succession stabilizes instead of shattering.</small></span>
            <span><strong>Civic Chess</strong><small>Chaturanga travels west early and becomes the calculus of public judgment.</small></span>
            <span><strong>Reed's Present</strong><small>A normal apartment in a world of archive schools, stratarchic ratings, and brass public tech.</small></span>
          </div>
          <div class="chapter-quick-actions" id="chapter-quick-actions"></div>
          <ul id="chapter-list" class="chapter-list"></ul>
        </div>
      </section>

      <section id="screen-duel" class="screen screen--chapters hidden">
        <div class="chapters-wrap">
          <h2 class="section-heading">Archive of Rivals</h2>
          <p class="chapters-lede">Replay defeated rivals as living doctrines. The dossier is not a difficulty menu: it is a counter-plan against a mind the archive can still summon.</p>
          <div class="duel-wrap">
            <div class="duel-list" id="duel-list"></div>
            <div class="duel-panel" id="duel-panel">
              <div class="match-card">
                <div class="match-card__top">
                  <div class="match-card__header">
                    <span class="match-card__vs">Dossier vestibule</span>
                    <strong class="match-card__name">Choose a living doctrine</strong>
                  </div>
                </div>
                <p class="opponent-note">Select a rival to inspect archive files, opening watchlists, trait pressure, and counter-prep before entering a duel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="lab-overlay" class="lab-overlay" aria-hidden="true">
        <div class="lab-overlay__scrim" aria-hidden="true"></div>
        <div class="lab-overlay__sheet">
          <div class="lab-overlay__bar">
            <button type="button" class="ghost lab-overlay__vestibule" id="btn-vestibule">← Chapters</button>
            <span class="lab-overlay__label" id="lab-era-label">Archive simulation · Alexandrine civic layer</span>
            <button type="button" class="ghost lab-overlay__kbd" id="btn-lab-kbdhelp" aria-label="Keyboard shortcuts">?</button>
          </div>
          <section id="screen-play" class="screen--play-inner">
            <header class="play-crawl">
              <p class="chapter-label" id="play-chapter-label"></p>
              <div class="play-crawl__row">
                <h2 class="chapter-title" id="play-chapter-title"></h2>
                <span class="scene-progress" id="scene-progress"></span>
              </div>
              <p class="chapter-sub" id="play-chapter-sub"></p>
              <p class="philosophy" id="play-philosophy"></p>
            </header>
            <div class="play-atelier" id="play-atelier">
              <article class="panel manuscript-panel" id="manuscript-panel">
                <div class="manuscript-edge" aria-hidden="true"></div>
                <aside class="chapter-rail hidden" id="chapter-rail"></aside>
                <div class="scene-tag" id="scene-tag"></div>
                <div id="narrative-body" class="narrative-body narrative-body--dialogue"></div>
                <div class="narrative-actions">
                  <button type="button" class="primary primary--advance" id="btn-next" disabled>
                    <span class="btn-advance-label">Advance</span>
                    <span class="btn-advance-hint" id="btn-next-hint"></span>
                  </button>
                  <p class="narrative-kbd-hint" id="narrative-kbd-hint">Enter or Space advances off-board; arrows move board focus, Home/End jump corners, Enter or Space selects.</p>
                </div>
              </article>
              <aside class="instrument-column" id="board-panel">
                <div class="instrument-frame">
                  <div class="instrument-header">
                    <span class="instrument-eyebrow">Brass-lapis simulation surface</span>
                    <div class="play-state-strip" aria-label="Current simulation state">
                      <div class="status-pill-wrap">
                        <span class="status-pill" id="board-status" role="status" aria-live="polite"></span>
                      </div>
                      <div class="play-state-readouts" aria-label="Move and turn readouts">
                        <span class="play-chip" id="turn-pulse" aria-live="polite"></span>
                        <span class="play-chip play-chip--quiet" id="move-counter"></span>
                      </div>
                    </div>
                    <p class="ai-persona hidden" id="ai-persona"></p>
                    <p class="ai-flavor hidden" id="ai-flavor"></p>
                    <p class="tactical-pulse hidden" id="tactical-pulse"></p>
                    <div class="recovery-controls hidden" id="recovery-controls">
                      <span class="recovery-badge">Recovered Session</span>
                      <button type="button" class="ghost ghost--sound" id="btn-recovery-restore">Restore Stable</button>
                      <button type="button" class="ghost ghost--sound" id="btn-recovery-dismiss">Dismiss</button>
                    </div>
                    <div class="instrument-toggles">
                      <button type="button" class="ghost ghost--sound" id="btn-sfx" aria-pressed="true">Sound: On</button>
                      <button type="button" class="ghost ghost--sound" id="btn-move-guard" aria-pressed="false">Move Guard: Off</button>
                    </div>
                  </div>
                  <div class="calibration-rail hidden" id="calibration-rail" aria-label="Calibration progress">
                    <span class="calibration-rail__label">White moves inscribed</span>
                    <div class="calibration-rail__track" id="calibration-track"></div>
                  </div>
                  <p class="board-guide" id="board-guide">Select a piece. Legal targets light; captures frame in bronze, check in crimson.</p>
                  <details class="mobile-tips" id="mobile-tips">
                    <summary class="mobile-tips__summary">Board tips</summary>
                    <p class="mobile-tips__body" id="mobile-board-guide"></p>
                  </details>
                  <div class="board-stage" id="board-stage">
                    <div class="captured-row captured-row--top" id="captured-top" aria-label="Pieces captured by White"></div>
                    <div class="board-stage__inner">
                      <div class="eval-bar-wrap" id="eval-bar-wrap">
                        <div class="eval-bar" id="eval-bar" aria-label="Position evaluation">
                          <div class="eval-bar__fill" id="eval-bar-fill"></div>
                          <span class="eval-bar__score" id="eval-bar-score">0.0</span>
                        </div>
                      </div>
                      <div class="board-brass">
                        <div class="board-brass__corner board-brass__corner--tl"></div>
                        <div class="board-brass__corner board-brass__corner--tr"></div>
                        <div class="board-brass__corner board-brass__corner--bl"></div>
                        <div class="board-brass__corner board-brass__corner--br"></div>
                        <div id="chess-root" class="board-wrap" role="region" aria-label="Chess board" aria-describedby="narrative-kbd-hint board-guide"></div>
                      </div>
                    </div>
                    <div class="captured-row captured-row--bot" id="captured-bot" aria-label="Pieces captured by Black"></div>
                  </div>
                  <div class="move-ledger-wrap">
                    <span class="ledger-heading" id="move-ledger-label">Move ledger</span>
                    <div class="move-ledger" id="move-ledger" role="region" aria-labelledby="move-ledger-label"></div>
                  </div>
                  <div class="board-tools">
                    <button type="button" class="ghost ghost--tool" id="btn-undo" disabled>Take back</button>
                    <button type="button" class="ghost ghost--tool" id="btn-reset" disabled>Reset</button>
                  </div>
                  <p class="lesson-note" id="lesson-note"></p>
                  <p class="coach-tip hidden" id="coach-tip" aria-live="polite"></p>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>

      <div id="reward-overlay" class="reward-overlay hidden" role="dialog" aria-modal="true" aria-label="Rewards and unlocks" aria-hidden="true"></div>
      <div id="confirm-overlay" class="reward-overlay confirm-overlay hidden" aria-hidden="true"></div>
      <div id="storage-failure-banner" class="storage-failure-banner hidden" role="status">
        <p class="storage-failure-banner__text">Progress could not be saved in this browser. Check storage settings or exit private mode.</p>
        <button type="button" class="ghost storage-failure-banner__dismiss" id="btn-storage-banner-dismiss">Dismiss</button>
      </div>
      <div id="live-announcer" class="sr-only" aria-live="polite" aria-atomic="false"></div>
    </main>
  `
}
