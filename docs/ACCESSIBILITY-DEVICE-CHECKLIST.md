# Native Accessibility Verification Checklist

Use this checklist before release candidates that touch input handling, overlays, focus, or board rendering.

## Scope

- Web deployment: `https://sauterreed24.github.io/Chess-of-Kings/`
- iOS standalone install (Add to Home Screen)
- Android WebView/Capacitor shell when available

## Keyboard and Focus

- From title screen, keyboard-only users can:
  - Reach all primary actions (`Resume`, `New chronicle`, `Enter the Archive`)
  - Open chapters, duel dossier, and return controls without focus traps
- Opening lab/overlay moves focus into the active surface.
- Closing overlay restores focus to a logical trigger/control.
- Inactive top-level surfaces are not tabbable while lab is active.

## Screen Reader (VoiceOver/NVDA)

- Title/chapter/duel transitions do not announce hidden/inactive screens.
- Board squares announce piece + state context (selected/check/legal target) correctly.
- Match outcome and reward announcements fire once per resolution.
- Promotion picker options are announced with role/name and keyboard navigation cues.

## Reduced Motion and Visual Stability

- With reduced motion enabled at OS level, transitions are effectively disabled.
- No severe layout jumps when opening duel dossier, reward overlay, or chapter list.
- CLS remains near zero in Lighthouse mobile report.

## Mobile / PWA

- App installs with expected icon on iOS and Android.
- Launch from home screen opens the app shell (`start_url`/`scope` behavior).
- Privacy link and "Back to game" link resolve correctly under `/Chess-of-Kings/`.
- After first load online, a follow-up launch with network disabled still shows app shell.

## Evidence to capture in PRs

- Lighthouse JSON artifact path
- At least one screenshot per platform surface touched
- Notes on any speculative or unverified accessibility behavior
