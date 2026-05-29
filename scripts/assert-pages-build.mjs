import fs from 'node:fs'
import path from 'node:path'

const distDir = path.join(process.cwd(), 'dist')
const indexPath = path.join(distDir, 'index.html')
const manifestPath = path.join(distDir, 'manifest.webmanifest')

let failed = false

function fail(msg) {
  console.error(`FAIL: ${msg}`)
  failed = true
}

if (!fs.existsSync(indexPath)) {
  fail('dist/index.html missing — run vite build first')
  process.exit(1)
}

const indexHtml = fs.readFileSync(indexPath, 'utf8')

if (/href="\/favicon/i.test(indexHtml)) {
  fail('dist/index.html uses absolute /favicon href (expected relative ./ paths for GitHub Pages)')
}

if (/start_url"\s*:\s*"\/"/.test(indexHtml)) {
  fail('dist/index.html embeds manifest start_url "/" (expected ./ in built output)')
}

const requiredMeta = [
  ['property="og:title"', 'og:title'],
  ['property="og:description"', 'og:description'],
  ['property="og:image"', 'og:image'],
  ['name="twitter:card"', 'twitter:card'],
  ['name="twitter:title"', 'twitter:title'],
  ['name="twitter:description"', 'twitter:description'],
  ['name="twitter:image"', 'twitter:image'],
]

for (const [needle, label] of requiredMeta) {
  if (!indexHtml.includes(needle)) {
    fail(`dist/index.html missing ${label}`)
  }
}

if (!fs.existsSync(manifestPath)) {
  fail('dist/manifest.webmanifest missing')
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.start_url !== './') {
    fail(`manifest start_url is "${manifest.start_url}" (expected "./")`)
  }
}

if (failed) {
  process.exit(1)
}

console.log('assert-pages-build: dist/index.html and manifest.webmanifest OK for GitHub Pages')
