import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

/** Documented release budgets (see README / CHANGELOG). JS: 96 KiB since
 *  Crown Engine v2 (in-house 0x88 search core, ~4.8 KiB gzip net after the
 *  legacy chess.js-walking search left the app bundle). CSS measured
 *  ~16 KiB gzip on v0.2.14+ builds. */
const JS_GZIP_MAX = 98304 // 96 KiB
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
