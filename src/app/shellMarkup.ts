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
          <span class="mark-sub">Alexandrine Archive · Historia Lapidea</span>
        </div>
        <nav class="top-nav">
          <button type="button" class="ghost ghost--nav" id="btn-title">Title</button>
          <button type="button" class="ghost ghost--nav" id="btn-chapters">Chapters</button>
          <button type="button" class="ghost ghost--nav" id="btn-duel">Duel</button>
        </nav>
      </header>

      <section id="screen-title" class="screen screen--title">
        <div class="title-hero">
          <div class="title-hero__plate">
            <div class="title-ornament" aria-hidden="true"><span class="title-ornament__glyph">⚔</span></div>
            <p class="kicker">A narrative chess odyssey</p>
            <h1 class="display-title">The Calculus of Kings</h1>
            <p class="title-tagline">An ancient royal archive running on impossible future technology.</p>
            <p class="lede">Play story chapters, unlock rival dossiers, learn from adaptive AI, and preserve every triumph in a persistent chronicle.</p>
            <div class="title-stats" aria-label="Game highlights">
              <span><strong>Campaign</strong><small>chapter trials</small></span>
              <span><strong>Duel Archive</strong><small>rival dossiers</small></span>
              <span><strong>Accessible</strong><small>keyboard board</small></span>
            </div>
            <div class="title-actions" id="title-actions-save">
              <button type="button" class="primary" id="btn-resume">Resume expedition</button>
              <button type="button" class="secondary" id="btn-new">New chronicle</button>
            </div>
            <div class="title-actions title-actions--solo hidden" id="title-actions-fresh">
              <button type="button" class="primary" id="btn-enter-archive">Enter the Archive</button>
            </div>
            <p class="mvp-note" id="mvp-flag"></p>
            <div class="daily-ribbon hidden" id="daily-ribbon" aria-live="polite"></div>
            <p class="title-privacy">
              <a class="title-privacy__link" href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy policy</a>
            </p>
          </div>
        </div>
      </section>

      <section id="screen-chapters" class="screen screen--chapters hidden">
        <div class="chapters-wrap">
          <button type="button" class="ghost chapters-back hidden" id="btn-chapters-back">← Return to title</button>
          <h2 class="section-heading">Chronicle index</h2>
          <p class="chapters-lede">Jump to an open passage — you will enter the simulation layer.</p>
          <div class="chapter-quick-actions" id="chapter-quick-actions"></div>
          <ul id="chapter-list" class="chapter-list"></ul>
        </div>
      </section>

      <section id="screen-duel" class="screen screen--chapters hidden">
        <div class="chapters-wrap">
          <h2 class="section-heading">Archive of Rivals</h2>
          <p class="chapters-lede">Replay defeated rivals, configure variants, and duel in the archive.</p>
          <div class="duel-wrap">
            <div class="duel-list" id="duel-list"></div>
            <div class="duel-panel" id="duel-panel">
              <p class="ledger-empty">Select a rival to inspect dossiers and start a duel.</p>
            </div>
          </div>
        </div>
      </section>

      <div id="lab-overlay" class="lab-overlay">
        <div class="lab-overlay__scrim" aria-hidden="true"></div>
        <div class="lab-overlay__sheet">
          <div class="lab-overlay__bar">
            <button type="button" class="ghost lab-overlay__vestibule" id="btn-vestibule">← Chapters</button>
            <span class="lab-overlay__label" id="lab-era-label">Archive simulation · Alexandrine era</span>
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
                  <p class="narrative-kbd-hint" id="narrative-kbd-hint">Enter or Space advances when focus is not on the board. The board uses one square in the tab order at a time (starts at e4); arrow keys move, Home and End jump to the near corners; Enter or Space activates the focused square.</p>
                </div>
              </article>
              <aside class="instrument-column" id="board-panel">
                <div class="instrument-frame">
                  <div class="instrument-header">
                    <span class="instrument-eyebrow">Simulation surface</span>
                    <div class="status-pill-wrap">
                      <span class="status-pill" id="board-status" role="status" aria-live="polite"></span>
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
                      <button type="button" class="ghost ghost--sound" id="btn-sfx">Sound: On</button>
                      <button type="button" class="ghost ghost--sound" id="btn-move-guard">Move Guard: Off</button>
                    </div>
                  </div>
                  <div class="calibration-rail hidden" id="calibration-rail" aria-label="Calibration progress">
                    <span class="calibration-rail__label">White moves inscribed</span>
                    <div class="calibration-rail__track" id="calibration-track"></div>
                  </div>
                  <p class="board-guide" id="board-guide">Select a piece to illuminate legal targets. Captures are framed in bronze; check is marked in crimson.</p>
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

      <div id="reward-overlay" class="reward-overlay hidden" role="dialog" aria-modal="true" aria-live="polite" aria-label="Rewards and unlocks" aria-hidden="true"></div>
      <div id="live-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    </main>
  `
}
