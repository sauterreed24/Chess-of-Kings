# Mobile store packaging (Chess of Kings)

This project is a **Vite + TypeScript** web app. App stores expect a **native shell** or **Play policy–compliant Web wrapper**, not a raw URL in most cases.

## Shortest paths

### Google Play (Android)

1. **Trusted Web Activity (TWA)**  
   - Ship a minimal Android app that opens your **HTTPS** game URL in a Chrome Custom Tab–backed full-screen experience.  
   - Requires: **Digital Asset Links** (hosting `assetlinks.json` on your domain), **Play signing**, **privacy policy URL**, store listing assets.  
   - Good when the game is **hosted** (GitHub Pages, Netlify, Cloudflare Pages, etc.) with a stable domain.

2. **Capacitor (recommended if you want one codebase + plugins)**  
   - `npm install @capacitor/core @capacitor/cli` → add Android (and iOS) platforms.  
   - Point the WebView at `vite` build output or `dist` loaded from `file://` or a bundled server.  
   - Requires: Android Studio, signing keys, Play Console account, privacy policy, content rating questionnaire.

3. **PWA** (this repo has a minimal `manifest` in `public/`)  
   - Improves “Add to Home Screen” and is a **step toward** TWA; **it is not** a substitute for a full Play submission by itself.

### Apple App Store (iOS)

1. **Capacitor** or **Cordova** with `WKWebView` loading your built site.  
2. Requires: **Apple Developer Program**, **Xcode**, **icons/splash**, **App Store Connect** metadata, **privacy nutrition labels** (what data you collect).  
3. If you use only localStorage for saves, disclose “Data Not Collected” or “Data Linked to User” accurately per your implementation.

## What you will need to change or add

| Area | Notes |
|------|--------|
| **Hosting** | Public HTTPS URL for production; same origin for assets and API. |
| **Icons / splash** | Store-specific sizes; reuse `public/icons.svg` / favicon as a base. |
| **Versioning** | Align `package.json` version with store build numbers (Android `versionCode`, iOS `CFBundleShortVersionString`). |
| **Offline** | Optional Service Worker (e.g. Vite PWA plugin); current game works online-only unless you add SW. |
| **Deep links** | Optional; for `https://yourdomain/...` routes if you add routing later. |
| **Privacy** | Publish a privacy policy page (even if “no server, local storage only”). |
| **Payments** | If you sell IAP, use platform billing APIs; web billing inside WebView may violate policies. |

## Suggested order of work

1. Host static `dist/` on a stable HTTPS domain.  
2. Verify game + saves on real mobile browsers.  
3. Add Capacitor **or** TWA template, wire signing, internal testing track.  
4. Complete store listings and policy URLs.

---

*This file is documentation only; it does not change runtime behavior.*
