/**
 * FNV-1a over SAN log + quality tags — pairs with position `fen` in `ChessUiPayload`
 * so the shell can skip rebuilding move-ledger HTML when RAF emits an identical snapshot.
 */
export function ledgerContentFingerprint(
  sanLog: readonly string[],
  sanQuality: readonly (string | null)[],
): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < sanLog.length; i++) {
    const s = sanLog[i]!
    for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0
    h = Math.imul(h ^ (i + 1), 16777619) >>> 0
  }
  for (let i = 0; i < sanQuality.length; i++) {
    const q = sanQuality[i]
    h = Math.imul(h ^ (q ? q.charCodeAt(0) + (i << 8) : i), 16777619) >>> 0
  }
  return h >>> 0
}
