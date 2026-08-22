---
name: Pass 32 — Phone lab nav
overview: "v0.5.24 wave: narrow phones hide the duplicate Title / Chapters / Duel bar while the lab is open so the hanging-knight command sits under one exit, not two."
---

# Pass 32 — Phone lab nav (v0.5.24)

Phone playtest of the hanging knight still stacked **TITLE / CHAPTERS / DUEL** above the lab's **← Chapters**. That second nav row is the way out on a wide screen; on a 390px phone it is duplicate chrome.

## Shipped

1. **Phone lab hides `.top-bar`** — only when the viewport is `max-width: 700px` and the lab is open. Hide with `.hidden` (`display:none`), not `inert` (inert left the buttons looking enabled while swallowing clicks).
2. **Overlay sheet fills to the top** — inline `top: 0` and `max-height: 100svh` so CSS `top: 50px` does not leave a hole. No stylesheet edits (gzip budget is full).
3. **Wide / short-landscape labs keep the nav** — the 1280×500 short-lab lock still shows Title / Chapters / Duel.
4. **Playwright** — hanging-knight phone hides `.top-bar` and keeps `#btn-vestibule`.

## Out of scope

- CSS budget changes
- New chapter authorship
- Native store
