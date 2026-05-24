import type { StageItem } from '../../../shared/types'
import { getCableExtra } from '../../../shared/itemExtras'

export const MAX_HISTORY = 50

export function remapIds(
  items: StageItem[],
  idMap: Map<string, string>,
  newProjectId: string
): StageItem[] {
  return items.map((item, idx) => {
    const newId = idMap.get(item.id)!
    let extra = item.extra
    const cableEx = getCableExtra(item)
    if (cableEx) {
      extra = {
        ...cableEx,
        fromId: cableEx.fromId ? (idMap.get(cableEx.fromId) ?? null) : null,
        toId: cableEx.toId ? (idMap.get(cableEx.toId) ?? null) : null
      }
    }
    return { ...item, id: newId, project_id: newProjectId, extra, sort_order: idx }
  })
}

export function applyNudgeDelta(
  items: StageItem[],
  ids: string[],
  dx: number,
  dy: number
): StageItem[] {
  return items.map((i) => {
    if (!ids.includes(i.id)) return i
    const base = { ...i, x: i.x + dx, y: i.y + dy }
    const cableEx = getCableExtra(i)
    if (cableEx) {
      return { ...base, extra: { ...cableEx, x2: cableEx.x2 + dx, y2: cableEx.y2 + dy } }
    }
    return base
  })
}

export function clampHistory(
  undoStack: StageItem[][],
  newSnapshot: StageItem[]
): { undoStack: StageItem[][]; redoStack: StageItem[][] } {
  return {
    undoStack: [...undoStack.slice(-(MAX_HISTORY - 1)), newSnapshot],
    redoStack: []
  }
}
