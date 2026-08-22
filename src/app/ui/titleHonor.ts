import type { Color, PieceSymbol } from 'chess.js'
import { glyphForSkin } from '../../chess/skins'

const HONOR_ROW: Array<[Color, PieceSymbol]> = [
  ['b', 'r'],
  ['b', 'n'],
  ['b', 'b'],
  ['b', 'q'],
  ['b', 'k'],
  ['w', 'k'],
  ['w', 'q'],
  ['w', 'b'],
  ['w', 'n'],
  ['w', 'r'],
]

/** Carved ivory/lapis honor guard on the title plate. */
export function paintTitleHonor(root: HTMLElement | null): void {
  if (!root || root.dataset.painted === '1') return
  root.innerHTML = HONOR_ROW.map(
    ([color, piece]) =>
      `<span class="title-honor__piece piece piece--${color}">${glyphForSkin('classic-royal', color, piece)}</span>`,
  ).join('')
  root.dataset.painted = '1'
}
