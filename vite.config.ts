import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    /** Expose on LAN for mobile / device smoke testing (store prep). */
    host: true,
  },
  build: {
    /** Skip gzip size reporting — small win for CI and local builds. */
    reportCompressedSize: false,
    /** Main bundle is intentionally monolithic; avoid noisy warnings on ~180kB JS. */
    chunkSizeWarningLimit: 600,
  },
})
