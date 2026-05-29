import { spawnSync } from 'node:child_process'

const steps = [
  ['lint', ['run', 'lint']],
  ['typecheck', ['run', 'typecheck']],
  ['deterministic tests', ['run', 'test:deterministic']],
  ['ui smoke', ['run', 'test:ui-smoke']],
  ['production build', ['run', 'build']],
  ['pages build assertions', ['run', 'assert:pages-build']],
  ['bundle gzip report', ['run', 'report:bundle-gzip']],
]

function runNpm(args) {
  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', ['npm', ...args].join(' ')], {
      stdio: 'inherit',
    })
  }
  return spawnSync('npm', args, { stdio: 'inherit' })
}

for (const [label, args] of steps) {
  console.log(`\n==> ${label}`)
  const result = runNpm(args)
  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
