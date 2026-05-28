import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
}

describe('release quality gate contract', () => {
  it('keeps the package release gate wired to deterministic checks', () => {
    const pkg = JSON.parse(readProjectFile('package.json')) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts['quality:gate']).toBe('node scripts/quality-gate.mjs')
    expect(pkg.scripts['test:deterministic']).toContain('--no-file-parallelism')
    expect(pkg.scripts['test:deterministic']).toContain('--maxWorkers=1')
    expect(pkg.scripts['test:deterministic']).toContain('--sequence.shuffle=false')

    const gate = readProjectFile('scripts/quality-gate.mjs')
    for (const script of [
      'lint',
      'typecheck',
      'test:deterministic',
      'test:ui-smoke',
      'build',
      'report:bundle-gzip',
    ]) {
      expect(gate).toContain(`'${script}'`)
    }

    const bundleReport = readProjectFile('scripts/report-bundle-gzip.mjs')
    expect(bundleReport).toContain('JS_GZIP_MAX')
    expect(bundleReport).toContain('CSS_GZIP_MAX')
    expect(bundleReport).toContain('process.exit(1)')
  })

  it('requires CI and Pages deploys to run the same gate', () => {
    expect(readProjectFile('.github/workflows/ci.yml')).toContain('npm run quality:gate')
    expect(readProjectFile('.github/workflows/pages.yml')).toContain('npm run quality:gate')
  })

  it('keeps Vitest seeded and serialized for suite stability', () => {
    const config = readProjectFile('vitest.config.ts')
    expect(config).toContain("setupFiles: ['./vitest.setup.ts']")
    expect(config).toContain("pool: 'forks'")
    expect(config).toContain('fileParallelism: false')
    expect(config).toContain('shuffle: false')

    const setup = readProjectFile('vitest.setup.ts')
    expect(setup).toContain('BASE_RANDOM_SEED')
    expect(setup).toContain('beforeEach')
    expect(setup).toContain('afterEach')
    expect(setup).toContain('Math.random = mulberry32(seed)')
  })
})
