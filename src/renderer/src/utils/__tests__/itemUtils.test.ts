import { describe, it, expect } from 'vitest'
import { remapIds, applyNudgeDelta, clampHistory, MAX_HISTORY } from '../itemUtils'
import type { StageItem } from '../../../../shared/types'

function makeItem(overrides: Partial<StageItem> = {}): StageItem {
  return {
    id: 'a',
    project_id: 'proj',
    type: 'microphone',
    label: 'Mic',
    x: 0,
    y: 0,
    rotation: 0,
    width: 60,
    height: 60,
    color: '#fff',
    extra: null,
    sort_order: 0,
    ...overrides
  }
}

function makeCable(overrides: Partial<StageItem> = {}): StageItem {
  return makeItem({
    type: 'cable_xlr',
    extra: { fromId: null, toId: null, x2: 100, y2: 100 },
    ...overrides
  })
}

// ── remapIds ──────────────────────────────────────────────────────────────────

describe('remapIds', () => {
  it('returns empty array for empty input', () => {
    expect(remapIds([], new Map(), 'new-proj')).toEqual([])
  })

  it('remaps a non-cable item id and project_id', () => {
    const item = makeItem({ id: 'old-1' })
    const idMap = new Map([['old-1', 'new-1']])
    const [result] = remapIds([item], idMap, 'new-proj')
    expect(result.id).toBe('new-1')
    expect(result.project_id).toBe('new-proj')
    expect(result.extra).toBeNull()
  })

  it('remaps cable fromId and toId through idMap', () => {
    const cable = makeCable({
      id: 'c1',
      extra: { fromId: 'a1', toId: 'b1', x2: 50, y2: 60 }
    })
    const idMap = new Map([['c1', 'c1-new'], ['a1', 'a1-new'], ['b1', 'b1-new']])
    const [result] = remapIds([cable], idMap, 'proj2')
    const ex = result.extra as { fromId: string | null; toId: string | null }
    expect(ex.fromId).toBe('a1-new')
    expect(ex.toId).toBe('b1-new')
  })

  it('sets cable fromId to null when old id is not in map', () => {
    const cable = makeCable({
      id: 'c1',
      extra: { fromId: 'missing', toId: null, x2: 10, y2: 10 }
    })
    const idMap = new Map([['c1', 'c1-new']])
    const [result] = remapIds([cable], idMap, 'p')
    const ex = result.extra as { fromId: string | null }
    expect(ex.fromId).toBeNull()
  })

  it('leaves already-null fromId as null', () => {
    const cable = makeCable({ id: 'c1', extra: { fromId: null, toId: null, x2: 0, y2: 0 } })
    const idMap = new Map([['c1', 'c1-new']])
    const [result] = remapIds([cable], idMap, 'p')
    const ex = result.extra as { fromId: string | null }
    expect(ex.fromId).toBeNull()
  })
})

// ── applyNudgeDelta ───────────────────────────────────────────────────────────

describe('applyNudgeDelta', () => {
  it('leaves unselected items unchanged', () => {
    const item = makeItem({ id: 'a', x: 10, y: 20 })
    const result = applyNudgeDelta([item], ['b'], 5, 5)
    expect(result[0].x).toBe(10)
    expect(result[0].y).toBe(20)
  })

  it('moves a non-cable item by dx/dy', () => {
    const item = makeItem({ id: 'a', x: 10, y: 20 })
    const [result] = applyNudgeDelta([item], ['a'], 3, -7)
    expect(result.x).toBe(13)
    expect(result.y).toBe(13)
  })

  it('moves a cable item x/y and x2/y2', () => {
    const cable = makeCable({ id: 'c', x: 0, y: 0, extra: { fromId: null, toId: null, x2: 50, y2: 60 } })
    const [result] = applyNudgeDelta([cable], ['c'], 10, 5)
    expect(result.x).toBe(10)
    expect(result.y).toBe(5)
    const ex = result.extra as { x2: number; y2: number }
    expect(ex.x2).toBe(60)
    expect(ex.y2).toBe(65)
  })

  it('only moves selected items in a multi-item list', () => {
    const a = makeItem({ id: 'a', x: 0, y: 0 })
    const b = makeItem({ id: 'b', x: 100, y: 100 })
    const [ra, rb] = applyNudgeDelta([a, b], ['a'], 5, 5)
    expect(ra.x).toBe(5)
    expect(rb.x).toBe(100)
  })

  it('applies zero delta without mutation', () => {
    const item = makeItem({ id: 'a', x: 42, y: 17 })
    const [result] = applyNudgeDelta([item], ['a'], 0, 0)
    expect(result.x).toBe(42)
    expect(result.y).toBe(17)
  })
})

// ── clampHistory ──────────────────────────────────────────────────────────────

describe('clampHistory', () => {
  it('appends snapshot to empty stack', () => {
    const snap = [makeItem()]
    const { undoStack, redoStack } = clampHistory([], snap)
    expect(undoStack).toHaveLength(1)
    expect(undoStack[0]).toBe(snap)
    expect(redoStack).toEqual([])
  })

  it('appends snapshot when below limit', () => {
    const existing = [[makeItem()], [makeItem()]]
    const snap = [makeItem({ id: 'new' })]
    const { undoStack } = clampHistory(existing, snap)
    expect(undoStack).toHaveLength(3)
    expect(undoStack[2]).toBe(snap)
  })

  it('drops oldest entry when at MAX_HISTORY limit', () => {
    const full: StageItem[][] = Array.from({ length: MAX_HISTORY }, (_, i) => [makeItem({ id: `i${i}` })])
    const snap = [makeItem({ id: 'newest' })]
    const { undoStack } = clampHistory(full, snap)
    expect(undoStack).toHaveLength(MAX_HISTORY)
    expect(undoStack[undoStack.length - 1]).toBe(snap)
    expect(undoStack[0][0].id).toBe('i1')
  })

  it('always resets redoStack to empty', () => {
    const existing = [[makeItem()]]
    const snap = [makeItem()]
    const { redoStack } = clampHistory(existing, snap)
    expect(redoStack).toEqual([])
  })
})
