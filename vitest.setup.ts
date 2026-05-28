import { afterEach, beforeEach } from 'vitest'

const BASE_RANDOM_SEED = 0xc0ffee

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function testSeed(testName: string): number {
  return hashString(`${BASE_RANDOM_SEED}:${testName}`)
}

function installRandom(seed: number) {
  Math.random = mulberry32(seed)
}

installRandom(BASE_RANDOM_SEED)

beforeEach((context) => {
  const fileName = context.task.file?.name ?? 'unknown-file'
  const taskName = context.task.name ?? 'unknown-test'
  installRandom(testSeed(`${fileName}:${taskName}`))
})

afterEach(() => {
  installRandom(BASE_RANDOM_SEED)
})
