/**
 * Renders public/favicon.svg to assets/icon.png (1024×1024) for @capacitor/assets easy mode.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'favicon.svg')
const outPath = join(root, 'assets', 'icon.png')

await mkdir(dirname(outPath), { recursive: true })
await sharp(svgPath).resize(1024, 1024, { fit: 'contain', background: { r: 10, g: 9, b: 8, alpha: 1 } }).png().toFile(outPath)
console.log('Wrote', outPath)
