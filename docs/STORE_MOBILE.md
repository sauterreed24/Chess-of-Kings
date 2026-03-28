# App Store & Google Play

The game is a **Vite + TypeScript** web app wrapped with **[Capacitor](https://capacitorjs.com/)** (`android/`, `ios/`). The native shell loads the built site from `dist/` after **`npm run cap:sync`**.

## Quick commands

| Command | Purpose |
|---------|---------|
| `npm run cap:sync` | `npm run build` + copy web assets into Android / iOS projects |
| `npm run cap:open:android` | Open **Android Studio** (signing, AAB, device testing) |
| `npm run cap:open:ios` | Open **Xcode** on macOS (archive, TestFlight, App Store) |

## Configure once

- **`capacitor.config.ts`** — set **`appId`** to your final reverse-DNS id (must match App Store / Play app id). Current placeholder: `games.calculusofkings.app`.
- **Versioning** — keep `package.json` `version` aligned with store-facing versions; bump Android `versionCode` / iOS **Build** for each store upload.

## Google Play (Android)

1. Install [Android Studio](https://developer.android.com/studio), accept SDK licenses.
2. `npm run cap:sync` → `npm run cap:open:android`.
3. **Signing:** create an upload keystore; never lose passwords.
4. **Build → Generate Signed Bundle** → **.aab** for Play Console.
5. **Play Console:** internal testing → closed → production. Complete **Data safety**, **content rating**, **privacy policy** URL.
6. **Icons:** Play requires a **512×512** PNG feature graphic / high-res icon — generate from `public/favicon.svg` or use `@capacitor/assets`.

### Alternative: Trusted Web Activity (TWA)

If you prefer loading a **hosted HTTPS URL** instead of bundling `dist/`, use a separate TWA project; this repo optimizes for **offline-capable** bundled assets after install.

## Apple App Store (iOS)

1. **Mac + Xcode** required to compile and upload.
2. `npm run cap:sync` → `npm run cap:open:ios`.
3. **Signing & Capabilities:** set your **Team**; bundle id must match `appId`.
4. **Archive** → **Distribute App** → App Store Connect.
5. **Privacy nutrition labels** — for this build, progress is **localStorage** on device; disclose accurately.

## Privacy policy

The repo ships a static page at **`public/privacy.html`** (served as **`/privacy.html`** after build). Deploy the same site you use for the game, or host that file on GitHub Pages, and use that URL in **Play Console** and **App Store Connect**. The title screen links to it for players.

Regenerate store listing text from that page if you change data practices; keep contact info aligned with your store listing.

## In-app purchases

Selling digital goods requires **Play Billing** / **StoreKit** (or Capacitor plugins). Web-only checkout inside the WebView is often rejected for digital content.

## PWA note

`public/manifest.webmanifest` helps “Add to Home Screen”; it does **not** replace a store binary. The manifest includes a stable **`id`** (`/`) so updates replace the same installed app where supported.

## Accessibility

The web shell includes a **skip link** to `#shell`, reward overlays **restore focus** on close, and narrative/dialogue copy is **HTML-escaped** when injected. The chess grid supports **roving tabindex** (one square in tab order, default **e4**), **arrow keys**, **Home/End**, and richer **square labels** for assistive tech. The board `region` references the narrative keyboard hint via **`aria-describedby`**. Keep that pattern when adding UI.

## WebView lifecycle

Saves are debounced; **`flushDeferredIO()`** runs on tab hide / unload so the latest position persists — verify on real devices after wrapping.
