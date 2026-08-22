import type { Color, PieceSymbol } from 'chess.js'
import { glyphForSkin, thickenOutline } from '../../chess/skins'
import { isPhoneLabNav } from '../labModal'

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

const PHONE_HONOR_PX = '2.4rem'

/** Phone title plate: two ranks of five so carved detail reads. */
export function syncTitleHonorScale(root: HTMLElement | null | undefined): void {
  if (!root) return
  const phone = isPhoneLabNav()
  const row = root.querySelector<HTMLElement>('.title-honor__row')
  if (row) {
    row.style.display = 'flex'
    row.style.flexWrap = phone ? 'wrap' : 'nowrap'
    row.style.justifyContent = 'center'
    row.style.alignItems = 'center'
    row.style.gap = phone ? '0.18rem' : ''
    row.style.width = phone ? '13.2rem' : ''
  }
  for (const el of root.querySelectorAll<HTMLElement>('.title-honor__piece')) {
    if (phone) {
      el.style.width = PHONE_HONOR_PX
      el.style.height = PHONE_HONOR_PX
    } else {
      el.style.width = ''
      el.style.height = ''
    }
  }
}

/** Carved ivory/lapis honor guard on the title plate. */
export function paintTitleHonor(root: HTMLElement | null): void {
  if (!root) return
  if (root.dataset.painted !== '1') {
    root.innerHTML = `<span class="title-honor__row">${HONOR_ROW.map(
      ([color, piece]) =>
        `<span class="title-honor__piece piece piece--${color}">${thickenOutline(glyphForSkin('classic-royal', color, piece))}</span>`,
    ).join('')}</span>`
    root.dataset.painted = '1'
  }
  syncTitleHonorScale(root)
}
