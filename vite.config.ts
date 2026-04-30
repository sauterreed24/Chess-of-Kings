import { defineConfig, type Plugin } from 'vite'

/**
 * GitHub Pages project sites are served from `/<repo>/` (not `/`).
 * `GITHUB_REPOSITORY` is set in GitHub Actions as `owner/repo`.
 */
function pagesBase(command: 'build' | 'serve'): string {
  if (command === 'serve') return '/'
  if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
    if (repo) return `/${repo}/`
  }
  return '/Chess-of-Kings/'
}

/**
 * Mobile WebViews and some browsers resolve `./favicon.svg` etc. against the
 * wrong path when the document URL lacks a trailing slash. `<base href>`
 * pins resolution to the deployed app root so CSS-adjacent public assets,
 * manifest, and SW registration stay under `/repo/` on GitHub Pages.
 * Injected only for production builds (not `vite dev`, to avoid HMR quirks).
 */
function injectHtmlBaseHref(base: string): Plugin {
  return {
    name: 'inject-html-base-href',
    transformIndexHtml(html) {
      if (/<base[\s>/]/i.test(html)) return html
      return html.replace(
        '  <head>\n    <meta charset="UTF-8" />',
        `  <head>\n    <meta charset="UTF-8" />\n    <base href="${base}" />`,
      )
    },
  }
}

export default defineConfig(({ command }) => ({
  base: pagesBase(command),
  plugins: command === 'build' ? [injectHtmlBaseHref(pagesBase('build'))] : [],
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
}))
