import type React from 'react'
import type { StageItem, PortSide } from '../../../shared/types'
import { getCableExtra, isCableType } from '../../../shared/itemExtras'
import { getPortPosition } from '../utils/cableUtils'
import { useProjectStore } from '../store/useProjectStore'

const SNAP_DIST = 40

interface SnapTarget {
  id: string
  side: PortSide
}

interface UseCableHandlersConfig {
  items: StageItem[]
  snapTarget: SnapTarget | null
  setSnapTarget: React.Dispatch<React.SetStateAction<SnapTarget | null>>
  snapTargetRef: React.MutableRefObject<SnapTarget | null>
}

interface CableHandlers {
  handleCableBodyDragEnd: (cable: StageItem, dx: number, dy: number) => void
  handleEndpointDragMove: (cable: StageItem, endpoint: 'from' | 'to', x: number, y: number) => void
  handleEndpointDragEnd: (cable: StageItem, endpoint: 'from' | 'to', x: number, y: number) => void
}

export function useCableHandlers({
  items,
  snapTarget,
  setSnapTarget,
  snapTargetRef
}: UseCableHandlersConfig): CableHandlers {
  function handleCableBodyDragEnd(cable: StageItem, dx: number, dy: number): void {
    const ex = getCableExtra(cable)!
    const updated: StageItem = {
      ...cable,
      x: cable.x + dx,
      y: cable.y + dy,
      extra: {
        fromId: null,
        toId: null,
        fromSide: null,
        toSide: null,
        x2: ex.x2 + dx,
        y2: ex.y2 + dy
      }
    }
    useProjectStore.getState().pushHistory()
    window.api.items.save(updated)
    useProjectStore.setState((s) => ({
      items: s.items.map((i) => (i.id === updated.id ? updated : i))
    }))
  }

  function handleEndpointDragMove(
    _cable: StageItem,
    _endpoint: 'from' | 'to',
    x: number,
    y: number
  ): void {
    let nearestItemId: string | null = null
    let nearestSide: PortSide | null = null
    let nearestDist = Infinity

    for (const it of items) {
      if (isCableType(it.type)) continue
      const ports: Array<{ side: PortSide; px: number; py: number }> = [
        { side: 'top',    px: it.x + it.width / 2, py: it.y },
        { side: 'right',  px: it.x + it.width,     py: it.y + it.height / 2 },
        { side: 'bottom', px: it.x + it.width / 2, py: it.y + it.height },
        { side: 'left',   px: it.x,                py: it.y + it.height / 2 }
      ]
      for (const port of ports) {
        const d = Math.hypot(port.px - x, port.py - y)
        if (d < SNAP_DIST && d < nearestDist) {
          nearestDist = d
          nearestItemId = it.id
          nearestSide = port.side
        }
      }
    }

    const newSnap = nearestItemId && nearestSide ? { id: nearestItemId, side: nearestSide } : null
    snapTargetRef.current = newSnap
    if (newSnap?.id !== snapTarget?.id || newSnap?.side !== snapTarget?.side) {
      setSnapTarget(newSnap)
    }
  }

  function handleEndpointDragEnd(
    cable: StageItem,
    endpoint: 'from' | 'to',
    x: number,
    y: number
  ): void {
    const snap = snapTargetRef.current
    const ex = getCableExtra(cable)!
    const snapItem = snap ? items.find((i) => i.id === snap.id) : null
    const snapPos  = snapItem && snap ? getPortPosition(snapItem, snap.side) : null

    let updated: StageItem
    if (endpoint === 'from') {
      updated = {
        ...cable,
        x: snapPos ? snapPos.x : x,
        y: snapPos ? snapPos.y : y,
        extra: { ...ex, fromId: snap?.id ?? null, fromSide: snap?.side ?? null }
      }
    } else {
      updated = {
        ...cable,
        extra: {
          ...ex,
          toId:   snap?.id   ?? null,
          toSide: snap?.side ?? null,
          x2: snapPos ? snapPos.x : x,
          y2: snapPos ? snapPos.y : y
        }
      }
    }
    useProjectStore.getState().pushHistory()
    window.api.items.save(updated)
    useProjectStore.setState((s) => ({
      items: s.items.map((i) => (i.id === updated.id ? updated : i))
    }))
    snapTargetRef.current = null
    setSnapTarget(null)
  }

  return { handleCableBodyDragEnd, handleEndpointDragMove, handleEndpointDragEnd }
}
