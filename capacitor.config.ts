import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Native shells load the Vite `dist/` output. After `npm run build`, run `npx cap sync`.
 * Change `appId` once to your final reverse-DNS id (must match store listings).
 */
const config: CapacitorConfig = {
  appId: 'games.calculusofkings.app',
  appName: 'Calculus of Kings',
  webDir: 'dist',
  server: {
    /** Required for secure context features some browsers expect in WebView */
    androidScheme: 'https',
  },
}

export default config
