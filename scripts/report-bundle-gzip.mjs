import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

/** Documented release budgets (see README / CHANGELOG). JS budget is
 *  per-file: 99 KiB. The campaign narrative/data (chapters, roadmap,
 *  rivals) is split into a `game-data` chunk via vite manualChunks, so the
 *  `index` chunk (engine + app shell) carries ~18 KiB of headroom under the
 *  cap; `game-data` (~18 KiB gzip) and the AI worker also sit well under it.
 *  CSS measured ~16 KiB gzip on v0.2.14+ builds. */
const JS_GZIP_MAX = 101376 // 99 KiB (per file)
const CSS_GZIP_MAX = 17800 // ~17.4 KiB — base + Alexandrine Imperial + classical chapter skin

const dir = path.join(process.cwd(), 'dist', 'assets')
let failed = false

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js') && !f.endsWith('.css')) continue
  const buf = fs.readFileSync(path.join(dir, f))
  const gz = zlib.gzipSync(buf)
  console.log(`${f}\traw_bytes\t${buf.length}\tgzip_bytes\t${gz.length}`)
  if (f.endsWith('.js') && gz.length > JS_GZIP_MAX) {
    console.error(`FAIL: ${f} gzip ${gz.length} exceeds JS budget ${JS_GZIP_MAX}`)
    failed = true
  }
  if (f.endsWith('.css') && gz.length > CSS_GZIP_MAX) {
    console.error(`FAIL: ${f} gzip ${gz.length} exceeds CSS budget ${CSS_GZIP_MAX}`)
    failed = true
  }
}

if (failed) process.exit(1)
