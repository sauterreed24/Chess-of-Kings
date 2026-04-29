import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const dir = path.join(process.cwd(), 'dist', 'assets')
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js') && !f.endsWith('.css')) continue
  const buf = fs.readFileSync(path.join(dir, f))
  const gz = zlib.gzipSync(buf)
  console.log(`${f}\traw_bytes\t${buf.length}\tgzip_bytes\t${gz.length}`)
}
