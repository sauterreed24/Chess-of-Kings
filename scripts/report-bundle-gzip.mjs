import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

/** Documented release budgets (see README / CHANGELOG). JS: 99 KiB — 96 KiB
 *  since Crown Engine v2 (in-house 0x88 search core), +2 KiB for the
 *  retention wave (rival voice, reply cadence, run-it-back, story hooks),
 *  +1 KiB for the post-game coach (costliest-moment review + skill ladder).
 *  CSS measured ~16 KiB gzip on v0.2.14+ builds. */
const JS_GZIP_MAX = 101376 // 99 KiB
const CSS_GZIP_MAX = 17600 // ~17.2 KiB — base Hellenistic sheet + Alexandrine Imperial polish layer

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
