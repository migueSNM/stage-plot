import type { StageItem, PortSide } from '../../../shared/types'
import { getCableExtra } from '../../../shared/itemExtras'

export function getPortPosition(it: StageItem, side: PortSide): { x: number; y: number } {
  switch (side) {
    case 'top':    return { x: it.x + it.width / 2, y: it.y }
    case 'right':  return { x: it.x + it.width,     y: it.y + it.height / 2 }
    case 'bottom': return { x: it.x + it.width / 2, y: it.y + it.height }
    case 'left':   return { x: it.x,                y: it.y + it.height / 2 }
  }
}

export function getCablePositions(
  item: StageItem,
  items: StageItem[]
): { fromPos: { x: number; y: number }; toPos: { x: number; y: number } } {
  const ex = getCableExtra(item)!

  let fromPos: { x: number; y: number }
  if (ex.fromId) {
    const fromItem = items.find((i) => i.id === ex.fromId)
    fromPos = fromItem
      ? ex.fromSide
        ? getPortPosition(fromItem, ex.fromSide)
        : { x: fromItem.x + fromItem.width / 2, y: fromItem.y + fromItem.height / 2 }
      : { x: item.x, y: item.y }
  } else {
    fromPos = { x: item.x, y: item.y }
  }

  let toPos: { x: number; y: number }
  if (ex.toId) {
    const toItem = items.find((i) => i.id === ex.toId)
    toPos = toItem
      ? ex.toSide
        ? getPortPosition(toItem, ex.toSide)
        : { x: toItem.x + toItem.width / 2, y: toItem.y + toItem.height / 2 }
      : { x: ex.x2, y: ex.y2 }
  } else {
    toPos = { x: ex.x2, y: ex.y2 }
  }

  return { fromPos, toPos }
}
