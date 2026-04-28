/**
 * Live-region announcer for screen readers.
 *
 * Wraps a single visually-hidden `aria-live="polite"` element. Each call
 * to {@link Announcer.say} replaces the region's text content so the AT
 * speaks the new line. The pattern of writing -> brief delay -> writing
 * is required by some screen readers to register repeat announcements;
 * we clear the region with a microtask before writing so back-to-back
 * identical messages still announce.
 *
 * Used to tell the player about match outcomes, rewards inscribed, and
 * chapter-threshold crossings without yanking visual focus.
 */
export interface Announcer {
  say(message: string): void
  clear(): void
}

export function createAnnouncer(el: HTMLElement): Announcer {
  return {
    say(message: string) {
      if (!message) return
      /* Force a re-render of the live region content so identical
       * back-to-back messages are still picked up by AT. */
      el.textContent = ''
      queueMicrotask(() => {
        el.textContent = message
      })
    },
    clear() {
      el.textContent = ''
    },
  }
}
