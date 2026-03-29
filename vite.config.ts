import { defineConfig } from 'vite'

/**
 * GitHub Pages project sites are served from `/<repo>/` (not `/`).
 * `GITHUB_REPOSITORY` is set in GitHub Actions as `owner/repo`.
 */
function pagesBase(): string {
  if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
    if (repo) return `/${repo}/`
  }
  return '/'
}

export default defineConfig({
  base: pagesBase(),
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
