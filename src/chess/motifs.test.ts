import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { detectTacticalMotifs } from './motifs'

describe('tactical motif detection', () => {
  it('detects forks against king plus major target', () => {
    const c = new Chess('4k3/5q2/8/8/4N3/8/8/4K3 w - - 0 1')
    const mv = c.move({ from: 'e4', to: 'd6' })
    const motifs = detectTacticalMotifs(c, mv, 'w')
    expect(motifs.fork).toBe(true)
  })

  it('detects pins and skewers for line pieces', () => {
    const pinBoard = new Chess('4k3/4n3/8/8/8/8/4R3/4K3 w - - 0 1')
    const pinMove = pinBoard.move({ from: 'e2', to: 'e4' })
    expect(detectTacticalMotifs(pinBoard, pinMove, 'w').pin).toBe(true)

    const skewerBoard = new Chess('4q3/4k3/8/8/8/8/8/4R1K1 w - - 0 1')
    const skewerMove = skewerBoard.move({ from: 'e1', to: 'e6' })
    expect(detectTacticalMotifs(skewerBoard, skewerMove, 'w').skewer).toBe(true)
  })
})
